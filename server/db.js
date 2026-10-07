// ponytail: Simple SQLite persistence using Node.js built-in node:sqlite (zero external dependencies)
// Perfectly compatible with Termux/PRoot on Android (uses PRAGMA journal_mode = TRUNCATE to prevent lock errors)
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'meshguard.db');
const db = new DatabaseSync(DB_PATH);

// ponytail: Use TRUNCATE mode for rock-solid stability in PRoot/Termux emulated environments
db.exec(`
  PRAGMA journal_mode = TRUNCATE;
  PRAGMA synchronous = NORMAL;

  -- 1. Devices (Nodes trong Tailscale mesh)
  CREATE TABLE IF NOT EXISTS devices (
    node_id TEXT PRIMARY KEY,
    hostname TEXT NOT NULL,
    alias TEXT,                       -- Tên nhãn hiển thị tùy chỉnh (khác với hostname trên Tailscale)
    ip TEXT NOT NULL,
    os TEXT,
    client_version TEXT,
    last_seen TEXT,
    is_online INTEGER DEFAULT 1,
    node_type TEXT DEFAULT 'server',  -- 'monitor' | 'server' | 'endpoint'
    tags TEXT DEFAULT '[]'            -- JSON array
  );

  -- 2. Services (Dịch vụ mạng cần giám sát)
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'application', -- 'storage' | 'database' | 'application'
    port INTEGER NOT NULL,
    type TEXT DEFAULT 'tcp',             -- 'http' | 'tcp'
    path TEXT DEFAULT '',
    interval_sec INTEGER DEFAULT 60,
    enabled INTEGER DEFAULT 1,
    last_status TEXT DEFAULT 'UP',       -- 'UP' | 'DOWN'
    last_latency_ms INTEGER DEFAULT 0,
    uptime_24h REAL DEFAULT 100.0,
    last_check TEXT,
    error_msg TEXT,
    description TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(node_id) ON DELETE CASCADE
  );

  -- 3. Connection Logs (Lịch sử truy cập Client / Endpoint - Giữ 30 ngày)
  CREATE TABLE IF NOT EXISTS connection_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT NOT NULL,
    event TEXT NOT NULL,                 -- 'connected', 'disconnected', 'roaming'
    time_label TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_conn_node ON connection_logs(node_id, created_at);

  -- 4. Service Metrics (Độ trễ & Uptime theo chu kỳ - Giữ 30 ngày)
  CREATE TABLE IF NOT EXISTS service_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    is_up INTEGER NOT NULL,              -- 1: UP, 0: DOWN
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_svc_metrics ON service_metrics(service_id, recorded_at);

  -- 5. Service Incidents (Sự kiện bật/tắt & sự cố - Giữ 30 ngày)
  CREATE TABLE IF NOT EXISTS service_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,            -- 'STATUS_CHANGE', 'POWER_TOGGLE'
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_svc_incidents ON service_incidents(service_id, created_at);

  -- 6. Settings (Cấu hình hệ thống, API keys, Tailnet)
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Safe migration: ensure 'alias' column exists if db was created earlier
try {
  db.exec('ALTER TABLE devices ADD COLUMN alias TEXT;');
} catch (e) {
  // column already exists
}

// ponytail: Tự động xóa sạch log cũ hơn 30 ngày (Rolling 30-day window)
function purgeOldLogs() {
  try {
    const purgeConn = db.prepare("DELETE FROM connection_logs WHERE created_at < datetime('now', '-30 days')").run();
    const purgeMetrics = db.prepare("DELETE FROM service_metrics WHERE recorded_at < datetime('now', '-30 days')").run();
    const purgeIncidents = db.prepare("DELETE FROM service_incidents WHERE created_at < datetime('now', '-30 days')").run();
    const total = purgeConn.changes + purgeMetrics.changes + purgeIncidents.changes;
    if (total > 0) {
      console.log(`[MeshGuard DB] Purged ${total} log entries older than 30 days.`);
    }
  } catch (err) {
    console.error('[MeshGuard DB] Error purging old logs:', err);
  }
}

// Chạy dọn dẹp khi khởi động và lặp lại mỗi 24 giờ
purgeOldLogs();
const purgeTimer = setInterval(purgeOldLogs, 24 * 60 * 60 * 1000);
if (purgeTimer && purgeTimer.unref) {
  purgeTimer.unref();
}

// ponytail: Xóa sạch toàn bộ dữ liệu mock (giữ lại cấu hình settings)
function clearAllMockData() {
  db.exec(`
    DELETE FROM devices;
    DELETE FROM services;
    DELETE FROM connection_logs;
    DELETE FROM service_metrics;
    DELETE FROM service_incidents;
  `);
  console.log('[MeshGuard DB] Đã xóa toàn bộ mock data. Sẵn sàng nhận dữ liệu thật!');
}

// --- SETTINGS HELPERS ---
function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

function getAllSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const res = {};
  for (const r of rows) res[r.key] = r.value;
  return res;
}

// --- DEVICES HELPERS ---
function getDevices() {
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
        note: l.note
      }))
    };
  });
}

// ponytail: Cập nhật Tên gợi nhớ (Alias) hoặc Loại node (node_type)
function updateDevice(nodeId, updates) {
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
    tags: JSON.parse(updated.tags || '[]')
  };
}

// ponytail: Đồng bộ danh sách thiết bị thật từ Tailscale API vào SQLite
// Bảo toàn tuyệt đối alias và node_type mà người dùng đã tùy chỉnh
function upsertRealDevices(realDevices) {
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
      // Không ghi đè alias hay node_type của người dùng
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

function syncDevices() {
  const updateStmt = db.prepare(`
    UPDATE devices SET last_seen = datetime('now') WHERE is_online = 1
  `);
  updateStmt.run();
  return db.prepare('SELECT COUNT(*) as count FROM devices').get().count;
}

// --- SERVICES HELPERS ---
function getServices() {
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
    uptime_24h: Number(r.uptime_24h)
  }));
}

function addService(payload) {
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

  return db.prepare('SELECT * FROM services WHERE id = ?').get(newId);
}

function deleteService(id) {
  db.prepare('DELETE FROM services WHERE id = ?').run(Number(id));
  db.prepare('DELETE FROM service_metrics WHERE service_id = ?').run(Number(id));
  db.prepare('DELETE FROM service_incidents WHERE service_id = ?').run(Number(id));
  return { success: true, id: Number(id) };
}

// ponytail: Cập nhật thông số cấu hình hoặc bật/tắt dịch vụ giám sát
function updateService(id, payload) {
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

  // Ghi nhật ký sự kiện
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

  const rows = db.prepare(`
    SELECT s.*, d.hostname, d.ip, d.is_online as device_online, d.node_type
    FROM services s
    JOIN devices d ON s.device_id = d.node_id
    WHERE s.id = ?
  `).all(Number(id));

  if (rows.length > 0) {
    const r = rows[0];
    return {
      ...r,
      enabled: Number(r.enabled),
      device_online: !!Number(r.device_online),
      uptime_24h: Number(r.uptime_24h)
    };
  }

  return db.prepare('SELECT * FROM services WHERE id = ?').get(Number(id));
}

// ponytail: Giới hạn số mốc đo độ trễ hiển thị (mặc định 20 mốc gần nhất để không bị dài/tràn màn hình)
function getServiceHistory(serviceId, limit = 20, mode = 'recent') {
  if (mode === 'hourly') {
    // 24 mốc trung bình theo từng giờ trong 24h qua
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
      status: r.is_up ? 'UP' : 'DOWN'
    }));
  }

  // Mặc định: N lượt kiểm tra gần nhất (mặc định 20 lượt), sắp xếp theo thứ tự thời gian tăng dần
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
    status: r.is_up ? 'UP' : 'DOWN'
  }));
}

function getServiceIncidents(serviceId) {
  return db.prepare(`
    SELECT id, service_id, event_type, message, created_at,
           strftime('%Y-%m-%d %H:%M:%S', created_at) as formatted_time
    FROM service_incidents
    WHERE service_id = ?
    ORDER BY id DESC LIMIT 50
  `).all(Number(serviceId));
}

// ponytail: Ghi nhận kết quả kiểm tra thật từ TCP/HTTP probe
function recordServiceProbeResult(serviceId, isUp, latencyMs, errorMsg = null) {
  const svc = db.prepare('SELECT * FROM services WHERE id = ?').get(Number(serviceId));
  if (!svc) return;

  const prevStatus = svc.last_status;
  const newStatus = isUp ? 'UP' : 'DOWN';

  // 1. Ghi metric thô
  db.prepare(`
    INSERT INTO service_metrics (service_id, latency_ms, is_up, recorded_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(Number(serviceId), Number(latencyMs), isUp ? 1 : 0);

  // 2. Ghi sự cố khi trạng thái thay đổi
  if (prevStatus !== newStatus && prevStatus !== 'PENDING') {
    const msg = isUp
      ? `Dịch vụ phục hồi hoạt động bình thường (UP) - Phản hồi: ${latencyMs}ms`
      : `Dịch vụ gặp sự cố (DOWN) - Lỗi: ${errorMsg || 'Không phản hồi kết nối'}`;
    db.prepare(`
      INSERT INTO service_incidents (service_id, event_type, message)
      VALUES (?, 'STATUS_CHANGE', ?)
    `).run(Number(serviceId), msg);
  }

  // 3. Tính toán tỷ lệ Uptime 24h thực tế
  const stats = db.prepare(`
    SELECT count(*) as total, sum(is_up) as up_count
    FROM service_metrics
    WHERE service_id = ? AND recorded_at >= datetime('now', '-24 hours')
  `).get(Number(serviceId));

  const total = stats && stats.total ? Number(stats.total) : 1;
  const upCount = stats && stats.up_count ? Number(stats.up_count) : (isUp ? 1 : 0);
  const uptime24h = Math.round((upCount / total) * 1000) / 10;

  // 4. Cập nhật bảng dịch vụ
  db.prepare(`
    UPDATE services
    SET last_status = ?, last_latency_ms = ?, uptime_24h = ?, last_check = datetime('now'), error_msg = ?
    WHERE id = ?
  `).run(newStatus, Number(latencyMs), uptime24h, errorMsg || null, Number(serviceId));
}

// ponytail: Lấy lịch sử Uptime 30 ngày thực tế cho dải ô vuông
function getServiceDailyUptime(serviceId, days = 30) {
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
      avgLatency: Number(r.avg_latency || 0)
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
        latency: avgLatency
      });
    } else {
      result.push({
        date: displayDate,
        fullDate: dateStr,
        uptime: 100,
        status: 'NO_DATA',
        latency: 0
      });
    }
  }
  return result;
}

// ponytail: Lấy lịch sử Uptime 30 ngày cho thiết bị máy chủ (tổng hợp từ các dịch vụ trên thiết bị)
function getDeviceDailyUptime(nodeId, days = 30) {
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
      avgLatency: Number(r.avg_latency || 0)
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
        latency: avgLatency
      });
    } else {
      result.push({
        date: displayDate,
        fullDate: dateStr,
        uptime: 100,
        status: 'NO_DATA',
        latency: 0
      });
    }
  }
  return result;
}

module.exports = {
  db,
  clearAllMockData,
  getDevices,
  updateDevice,
  syncDevices,
  upsertRealDevices,
  getServices,
  addService,
  updateService,
  deleteService,
  getServiceHistory,
  getServiceIncidents,
  recordServiceProbeResult,
  getServiceDailyUptime,
  getDeviceDailyUptime,
  purgeOldLogs,
  getSetting,
  setSetting,
  getAllSettings
};
