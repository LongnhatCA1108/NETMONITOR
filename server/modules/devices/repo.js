// ponytail: devices repository managing database access for tailnet devices
const { db } = require('../../db');

class DevicesRepository {
  findAll() {
    const rows = db.prepare('SELECT * FROM devices ORDER BY node_type ASC, hostname ASC').all();
    return rows.map(row => {
      const connLogs = db.prepare(`
        SELECT event, time_label as time, note, created_at 
        FROM connection_logs 
        WHERE node_id = ? 
        ORDER BY id DESC LIMIT 20
      `).all(row.node_id);

      return {
        ...row,
        alias: row.alias || '',
        is_online: Number(row.is_online),
        tags: JSON.parse(row.tags || '[]'),
        connection_log: connLogs.map(l => ({
          event: l.event,
          time: l.time || new Date(l.created_at).toLocaleTimeString('vi-VN'),
          note: l.note,
        })),
      };
    });
  }

  findByNodeId(nodeId) {
    const row = db.prepare('SELECT * FROM devices WHERE node_id = ?').get(nodeId);
    if (!row) return null;
    return {
      ...row,
      alias: row.alias || '',
      is_online: Number(row.is_online),
      tags: JSON.parse(row.tags || '[]'),
    };
  }

  update(nodeId, updates) {
    const existing = db.prepare('SELECT * FROM devices WHERE node_id = ?').get(nodeId);
    if (!existing) return null;

    const newAlias = updates.alias !== undefined ? updates.alias.trim() : existing.alias;
    const newType = updates.node_type !== undefined ? updates.node_type : existing.node_type;

    db.prepare(`
      UPDATE devices 
      SET alias = ?, node_type = ?
      WHERE node_id = ?
    `).run(newAlias, newType, nodeId);

    const updated = db.prepare('SELECT * FROM devices WHERE node_id = ?').get(nodeId);
    return {
      ...updated,
      alias: updated.alias || '',
      is_online: Number(updated.is_online),
      tags: JSON.parse(updated.tags || '[]'),
    };
  }

  upsertRealDevices(realDevices) {
    if (!Array.isArray(realDevices) || realDevices.length === 0) return 0;

    const getExisting = db.prepare('SELECT * FROM devices WHERE node_id = ?');
    const insertDevice = db.prepare(`
      INSERT INTO devices (node_id, hostname, alias, ip, os, client_version, last_seen, is_online, node_type, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const updateDeviceStmt = db.prepare(`
      UPDATE devices 
      SET hostname = ?, ip = ?, os = ?, client_version = ?, last_seen = ?, is_online = ?, tags = ?
      WHERE node_id = ?
    `);
    const insertConnLog = db.prepare(`
      INSERT INTO connection_logs (node_id, event, time_label, note, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);

    let count = 0;
    for (const d of realDevices) {
      const existing = getExisting.get(d.node_id);
      const isOnline = d.is_online ? 1 : 0;
      const tagsJson = JSON.stringify(d.tags || []);

      if (!existing) {
        insertDevice.run(
          d.node_id,
          d.hostname,
          d.alias || null,
          d.ip,
          d.os || '',
          d.client_version || 'v1.78.0',
          d.last_seen || new Date().toISOString(),
          isOnline,
          d.node_type || 'endpoint',
          tagsJson
        );
        insertConnLog.run(
          d.node_id,
          'connected',
          new Date().toLocaleTimeString('vi-VN'),
          'Thiết bị mới phát hiện từ Tailscale Control Plane'
        );
        count++;
      } else {
        if (Number(existing.is_online) !== isOnline) {
          insertConnLog.run(
            d.node_id,
            isOnline ? 'connected' : 'disconnected',
            new Date().toLocaleTimeString('vi-VN'),
            isOnline ? 'Thiết bị hoạt động trở lại (Live)' : 'Mất tín hiệu kết nối (Offline)'
          );
        }
        updateDeviceStmt.run(
          d.hostname,
          d.ip,
          d.os || existing.os,
          d.client_version || existing.client_version,
          d.last_seen || new Date().toISOString(),
          isOnline,
          tagsJson,
          d.node_id
        );
        count++;
      }
    }
    return count;
  }

  syncTimestamps() {
    db.prepare("UPDATE devices SET last_seen = datetime('now') WHERE is_online = 1").run();
    return db.prepare('SELECT COUNT(*) as count FROM devices').get().count;
  }

  clearAllMockData() {
    db.exec(`
      DELETE FROM devices;
      DELETE FROM connection_logs;
      DELETE FROM service_metrics;
      DELETE FROM service_incidents;
      DELETE FROM services;
    `);
  }

  getDailyUptime(nodeId, days = 30) {
    const rows = db.prepare(`
      SELECT date(sm.recorded_at) as day_date,
             count(*) as total_checks,
             sum(sm.is_up) as up_checks,
             round(avg(case when sm.is_up = 1 then sm.latency_ms else null end)) as avg_latency
      FROM service_metrics sm
      JOIN services s ON sm.service_id = s.id
      WHERE s.device_id = ? AND sm.recorded_at >= date('now', ?)
      GROUP BY date(sm.recorded_at)
      ORDER BY day_date ASC
    `).all(String(nodeId), `-${days} days`);

    const dayMap = {};
    for (const r of rows) {
      dayMap[r.day_date] = {
        total: Number(r.total_checks),
        up: Number(r.up_checks || 0),
        avgLatency: Number(r.avg_latency || 0),
      };
    }

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

      if (dayMap[dateStr] && dayMap[dateStr].total > 0) {
        const { total, up, avgLatency } = dayMap[dateStr];
        const pct = Math.round((up / total) * 1000) / 10;
        result.push({
          date: displayDate,
          fullDate: dateStr,
          uptime: pct,
          status: pct === 100 ? 'UP' : pct > 90 ? 'DEGRADED' : 'DOWN',
          latency: avgLatency,
        });
      } else {
        result.push({
          date: displayDate,
          fullDate: dateStr,
          uptime: 100,
          status: 'NO_DATA',
          latency: 0,
        });
      }
    }
    return result;
  }
}

const devicesRepo = new DevicesRepository();
module.exports = { DevicesRepository, devicesRepo };
