// ponytail: services controller handling HTTP requests and delegating to ServicesService
const { servicesService } = require('./service');

class ServicesController {
  async getServices(req, res) {
    const data = await servicesService.getServices();
    res.json(data);
  }

  async createService(req, res) {
    const created = await servicesService.createService(req.body);
    res.json(created, 201);
  }

  async updateService(req, res) {
    const id = Number(req.params.id);
    const updated = await servicesService.updateService(id, req.body);
    res.json(updated);
  }

  async deleteService(req, res) {
    const id = Number(req.params.id);
    const result = await servicesService.deleteService(id);
    res.json(result);
  }

  async getServiceHistory(req, res) {
    const id = Number(req.params.id);
    const limit = Number(req.query.limit) || 20;
    const mode = req.query.mode || 'recent';
    const data = await servicesService.getServiceHistory(id, limit, mode);
    res.json(data);
  }

  async getServiceIncidents(req, res) {
    const id = Number(req.params.id);
    const data = await servicesService.getServiceIncidents(id);
    res.json(data);
  }

  async getServiceUptime(req, res) {
    const id = Number(req.params.id);
    const days = Number(req.query.days) || 30;
    const data = await servicesService.getServiceDailyUptime(id, days);
    res.json(data);
  }

  async pingService(req, res) {
    const id = Number(req.params.id);
    const data = await servicesService.pingService(id);
    res.json(data);
  }
}

const servicesController = new ServicesController();
module.exports = { ServicesController, servicesController };
