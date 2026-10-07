// ponytail: services service coordinating business logic and checker probing
const { servicesRepo } = require('./repo');
const checker = require('../../checker');

class ServicesService {
  async getServices() {
    return servicesRepo.findAll();
  }

  async getServiceById(id) {
    return servicesRepo.findById(id);
  }

  async createService(payload) {
    if (!payload.device_id || !payload.name || !payload.port) {
      const err = new Error('device_id, name, and port are required');
      err.status = 400;
      throw err;
    }

    const created = servicesRepo.create(payload);

    // Kích hoạt ngay một lần probe thật để lấy độ trễ và trạng thái lập tức
    checker.probeService(created)
      .then(res => {
        servicesRepo.recordProbeResult(created.id, res.ok, res.latency, res.error);
      })
      .catch(() => {});

    return created;
  }

  async updateService(id, payload) {
    const updated = servicesRepo.update(id, payload);
    if (!updated) {
      const err = new Error('Không tìm thấy dịch vụ');
      err.status = 404;
      throw err;
    }

    // Kích hoạt probe kiểm tra ngay nếu dịch vụ đang bật
    if (updated.enabled) {
      checker.probeService(updated)
        .then(res => {
          servicesRepo.recordProbeResult(updated.id, res.ok, res.latency, res.error);
        })
        .catch(() => {});
    }

    return updated;
  }

  async deleteService(id) {
    return servicesRepo.delete(id);
  }

  async getServiceHistory(id, limit = 20, mode = 'recent') {
    return servicesRepo.getHistory(id, limit, mode);
  }

  async getServiceIncidents(id) {
    return servicesRepo.getIncidents(id);
  }

  async getServiceDailyUptime(id, days = 30) {
    return servicesRepo.getDailyUptime(id, days);
  }

  async pingService(id) {
    const svc = servicesRepo.findById(id);
    if (!svc) {
      const err = new Error('Dịch vụ không tồn tại');
      err.status = 404;
      throw err;
    }

    const result = await checker.probeService(svc);
    servicesRepo.recordProbeResult(svc.id, result.ok, result.latency, result.error);

    return {
      ok: result.ok,
      latency: result.latency,
      status: result.status,
      error: result.error,
      checked_at: new Date().toISOString(),
    };
  }
}

const servicesService = new ServicesService();
module.exports = { ServicesService, servicesService };
