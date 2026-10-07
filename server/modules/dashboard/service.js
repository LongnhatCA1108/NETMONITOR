// ponytail: dashboard service computing operational health and device/service statistics
const { dashboardRepo } = require('./repo');
const { settingsService } = require('../settings/service');

class DashboardService {
  async getSummary() {
    const devices = dashboardRepo.getDevicesSummary();
    const services = dashboardRepo.getServicesSummary();

    const monitorNode = devices.find(d => d.node_type === 'monitor') || null;
    const serverNodes = devices.filter(d => d.node_type === 'server');
    const endpointNodes = devices.filter(d => d.node_type === 'endpoint');

    const totalServices = services.length;
    const downServices = services.filter(s => s.last_status === 'DOWN').length;
    const storageCount = services.filter(s => s.category === 'storage').length;
    const dbCount = services.filter(s => s.category === 'database').length;
    const appCount = services.filter(s => s.category === 'application').length;

    const { apiKey, tailnet } = settingsService.getCredentials();

    const activeLatencies = services
      .filter(s => s.last_status === 'UP' && Number(s.last_latency_ms) > 0)
      .map(s => Number(s.last_latency_ms));

    const avgLatency = activeLatencies.length > 0
      ? Math.round(activeLatencies.reduce((a, b) => a + b, 0) / activeLatencies.length)
      : 0;

    return {
      monitor_node: monitorNode,
      total_devices: devices.length,
      online_devices: devices.filter(d => Number(d.is_online) === 1).length,
      server_count: serverNodes.length,
      server_online: serverNodes.filter(s => Number(s.is_online) === 1).length,
      endpoint_count: endpointNodes.length,
      endpoint_online: endpointNodes.filter(e => Number(e.is_online) === 1).length,
      total_services: totalServices,
      down_services: downServices,
      storage_count: storageCount,
      db_count: dbCount,
      app_count: appCount,
      avg_latency_ms: avgLatency,
      is_tailscale_connected: !!(apiKey && tailnet),
      last_sync: new Date().toISOString(),
    };
  }
}

const dashboardService = new DashboardService();
module.exports = { DashboardService, dashboardService };
