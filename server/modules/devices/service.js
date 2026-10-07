// ponytail: devices service handling business logic and sync orchestration
const { devicesRepo } = require('./repo');
const { settingsService } = require('../settings/service');
const tailscale = require('../../tailscale');

class DevicesService {
  async getDevices() {
    const devices = devicesRepo.findAll();
    // Lazy require servicesRepo to enrich devices with services
    const { servicesRepo } = require('../services/repo');
    const services = servicesRepo.findAll();

    return devices.map(d => ({
      ...d,
      services: services.filter(s => s.device_id === d.node_id),
      services_count: services.filter(s => s.device_id === d.node_id).length,
    }));
  }

  async updateDevice(nodeId, payload) {
    if (!nodeId) {
      const err = new Error('Thiếu nodeId');
      err.status = 400;
      throw err;
    }
    const updated = devicesRepo.update(nodeId, payload);
    if (!updated) {
      const err = new Error('Không tìm thấy thiết bị');
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async getDailyUptime(nodeId, days = 30) {
    if (!nodeId) {
      const err = new Error('Thiếu nodeId');
      err.status = 400;
      throw err;
    }
    return devicesRepo.getDailyUptime(nodeId, days);
  }

  async syncTailscale() {
    const { apiKey, tailnet } = settingsService.getCredentials();

    if (apiKey && tailnet) {
      try {
        const realDevices = await tailscale.fetchTailscaleDevices(apiKey, tailnet);
        const count = devicesRepo.upsertRealDevices(realDevices);
        return {
          message: `Đồng bộ thành công ${realDevices.length} thiết bị từ Tailscale!`,
          count,
          isReal: true,
        };
      } catch (err) {
        const error = new Error(`Lỗi kết nối Tailscale API: ${err.message}`);
        error.status = 502;
        error.isReal = false;
        throw error;
      }
    }

    const count = devicesRepo.syncTimestamps();
    return {
      message: 'Đã cập nhật timestamp (Chưa nhập Tailscale API Key và Tailnet)',
      count,
      isReal: false,
    };
  }

  async resetDatabase() {
    devicesRepo.clearAllMockData();
    return { success: true, message: 'Đã xóa toàn bộ dữ liệu mock!' };
  }
}

const devicesService = new DevicesService();
module.exports = { DevicesService, devicesService };
