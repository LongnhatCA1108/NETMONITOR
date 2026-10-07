// ponytail: services repository managing database operations for monitored services
const { db } = require('../../db');

class ServicesRepository {
  findAll() {
    const rows = db.prepare(`
      SELECT s.*, d.hostname, d.alias, d.ip, d.is_online as device_online, d.node_type
      FROM services s
      LEFT JOIN devices d ON s.device_id = d.node_id
      ORDER BY s.id DESC
    `).all();

    return rows.map(r => ({
      ...r,
      enabled: Number(r.enabled),
      device_online: !!r.device_online,
      last_latency_ms: Number(r.last_latency_ms),
      uptime_24h: Number(r.uptime_24h),
    }));
  }

  findById(id) {
    const rows = db.prepare(`
      SELECT s.*, d.hostname, d.alias, d.ip, d.is_online as device_online, d.node_type
      FROM services s
      LEFT JOIN devices d ON s.device_id = d.node_id
      WHERE s.id = ?
    `).all(Number(id));

    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      enabled: Number(r.enabled),
      device_online: !!r.device_online,
      last_latency_ms: Number(r.last_latency_ms),
      uptime_24h: Number(r.uptime_24h),
    };
  }

  create(payload) {
    const insert = db.prepare(`
      INSERT INTO services (device_id, name, category, port, type, path, interval_sec, enabled, last_status, last_latency_ms, uptime_24h, last_check, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'PENDING', 0, 100.0, null, ?)
    `);

    const res = insert.run(
      payload.device_id,
      payload.name.trim(),
      ['storage', 'database', 'application'].includes(payload.category) ? payload.category : 'application',
      Number(payload.port),
      payload.type === 'http' ? 'http' : 'tcp',
      payload.type === 'http' ? (payload.path || '/') : '',
      Number(payload.interval_sec) || 60,
      payload.description || ''
    );

    const newId = Number(res.lastInsertRowid);

    db.prepare(`
      INSERT INTO service_incidents (service_id, event_type, message)
      VALUES (?, 'CONFIG_EVENT', 'Dịch vụ được tạo và đưa vào danh sách giám sát')
    `).run(newId);

    return this.findById(newId);
  }

  update(id, payload) {
    const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(Number(id));
    if (!existing) return null;

    const newDeviceId = payload.device_id !== undefined ? String(payload.device_id) : existing.device_id;
    const newName = payload.name !== undefined ? payload.name.trim() : existing.name;
    const newCategory = payload.category !== undefined && ['storage', 'database', 'application'].includes(payload.category)
      ? payload.category
      : existing.category;
    const newPort = payload.port !== undefined ? Number(payload.port) : existing.port;
    const newType = payload.type !== undefined ? (payload.type === 'http' ? 'http' : 'tcp') : existing.type;
    const newPath = payload.path !== undefined ? (newType === 'http' ? (payload.path || '/') : '') : existing.path;
    const newInterval = payload.interval_sec !== undefined ? Number(payload.interval_sec) : existing.interval_sec;
    const newDesc = payload.description !== undefined ? payload.description.trim() : existing.description;
    const newEnabled = payload.enabled !== undefined ? (payload.enabled ? 1 : 0) : existing.enabled;

    db.prepare(`
      UPDATE services
      SET device_id = ?, name = ?, category = ?, port = ?, type = ?, path = ?, interval_sec = ?, description = ?, enabled = ?
      WHERE id = ?
    `).run(newDeviceId, newName, newCategory, newPort, newType, newPath, newInterval, newDesc, newEnabled, Number(id));

    if (existing.enabled !== newEnabled) {
      db.prepare(`
        INSERT INTO service_incidents (service_id, event_type, message)
        VALUES (?, 'POWER_TOGGLE', ?)
      `).run(Number(id), newEnabled ? 'Đã bật lại tiến trình giám sát dịch vụ' : 'Đã tạm dừng tiến trình giám sát dịch vụ');
    } else {
      db.prepare(`
        INSERT INTO service_incidents (service_id, event_type, message)
        VALUES (?, 'CONFIG_UPDATE', 'Cập nhật thông số cấu hình dịch vụ')
      `).run(Number(id));
    }

    return this.findById(Number(id));
  }

  delete(id) {
    db.prepare('DELETE FROM services WHERE id = ?').run(Number(id));
    db.prepare('DELETE FROM service_metrics WHERE service_id = ?').run(Number(id));
    db.prepare('DELETE FROM service_incidents WHERE service_id = ?').run(Number(id));
    return { success: true, id: Number(id) };
  }

  getHistory(serviceId, limit = 20, mode = 'recent') {
    if (mode === 'hourly') {
      const rows = db.prepare(`
        SELECT strftime('%H:00', recorded_at) as time,
               round(avg(case when is_up = 1 then latency_ms else null end)) as latency,
               min(is_up) as is_up,
               max(recorded_at) as recorded_at
        FROM service_metrics
        WHERE service_id = ? AND recorded_at >= datetime('now', '-24 hours')
        GROUP BY strftime('%Y-%m-%d %H', recorded_at)
        ORDER BY recorded_at ASC
      `).all(Number(serviceId));

      return rows.map(r => ({
        time: r.time,
        latency: r.latency !== null ? Number(r.latency) : 0,
        status: r.is_up ? 'UP' : 'DOWN',
      }));
    }

    const safeLimit = Math.max(5, Math.min(60, Number(limit) || 20));
    const rows = db.prepare(`
      SELECT latency, is_up, recorded_at, time
      FROM (
        SELECT latency_ms as latency, is_up, recorded_at,
               strftime('%H:%M:%S', recorded_at) as time
        FROM service_metrics
        WHERE service_id = ?
        ORDER BY id DESC LIMIT ?
      )
      ORDER BY recorded_at ASC
    `).all(Number(serviceId), safeLimit);

    return rows.map(r => ({
      time: r.time,
      latency: Number(r.latency),
      status: r.is_up ? 'UP' : 'DOWN',
    }));
  }

  getIncidents(serviceId) {
    return db.prepare(`
      SELECT id, service_id, event_type, message, created_at,
             strftime('%Y-%m-%d %H:%M:%S', created_at) as formatted_time
      FROM service_incidents
      WHERE service_id = ?
      ORDER BY id DESC LIMIT 50
    `).all(Number(serviceId));
  }

  recordProbeResult(serviceId, isUp, latencyMs, errorMsg = null) {
    const svc = db.prepare('SELECT * FROM services WHERE id = ?').get(Number(serviceId));
    if (!svc) return;

    const prevStatus = svc.last_status;
    const newStatus = isUp ? 'UP' : 'DOWN';

    db.prepare(`
      INSERT INTO service_metrics (service_id, latency_ms, is_up, recorded_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(Number(serviceId), Number(latencyMs), isUp ? 1 : 0);

    if (prevStatus !== newStatus && prevStatus !== 'PENDING') {
      const msg = isUp
        ? `Dịch vụ phục hồi hoạt động bình thường (UP) - Phản hồi: ${latencyMs}ms`
        : `Dịch vụ gặp sự cố (DOWN) - Lỗi: ${errorMsg || 'Không phản hồi kết nối'}`;
      db.prepare(`
        INSERT INTO service_incidents (service_id, event_type, message)
        VALUES (?, 'STATUS_CHANGE', ?)
      `).run(Number(serviceId), msg);
    }

    const stats = db.prepare(`
      SELECT count(*) as total, sum(is_up) as up_count
      FROM service_metrics
      WHERE service_id = ? AND recorded_at >= datetime('now', '-24 hours')
    `).get(Number(serviceId));

    const total = stats && stats.total ? Number(stats.total) : 1;
    const upCount = stats && stats.up_count ? Number(stats.up_count) : (isUp ? 1 : 0);
    const uptime24h = Math.round((upCount / total) * 1000) / 10;

    db.prepare(`
      UPDATE services
      SET last_status = ?, last_latency_ms = ?, uptime_24h = ?, last_check = datetime('now'), error_msg = ?
      WHERE id = ?
    `).run(newStatus, Number(latencyMs), uptime24h, errorMsg || null, Number(serviceId));
  }

  getDailyUptime(serviceId, days = 30) {
    const rows = db.prepare(`
      SELECT date(recorded_at) as day_date,
             count(*) as total_checks,
             sum(is_up) as up_checks,
             round(avg(case when is_up = 1 then latency_ms else null end)) as avg_latency
      FROM service_metrics
      WHERE service_id = ? AND recorded_at >= date('now', ?)
      GROUP BY date(recorded_at)
      ORDER BY day_date ASC
    `).all(Number(serviceId), `-${days} days`);

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

const servicesRepo = new ServicesRepository();
module.exports = { ServicesRepository, servicesRepo };
