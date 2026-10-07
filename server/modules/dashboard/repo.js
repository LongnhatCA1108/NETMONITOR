// ponytail: dashboard repository querying aggregated metrics and device/service state
const { db } = require('../../db');

class DashboardRepository {
  getDevicesSummary() {
    return db.prepare('SELECT node_id, hostname, alias, ip, os, is_online, node_type FROM devices').all();
  }

  getServicesSummary() {
    return db.prepare('SELECT id, category, last_status, last_latency_ms FROM services').all();
  }
}

const dashboardRepo = new DashboardRepository();
module.exports = { DashboardRepository, dashboardRepo };
