// ponytail: devices controller handling HTTP requests and delegating to DevicesService
const { devicesService } = require('./service');

class DevicesController {
  async getDevices(req, res) {
    const data = await devicesService.getDevices();
    res.json(data);
  }

  async updateDevice(req, res) {
    const nodeId = req.params.nodeId;
    const data = await devicesService.updateDevice(nodeId, req.body);
    res.json(data);
  }

  async getDeviceUptime(req, res) {
    const nodeId = req.params.nodeId;
    const days = Number(req.query.days) || 30;
    const data = await devicesService.getDailyUptime(nodeId, days);
    res.json(data);
  }

  async syncDevices(req, res) {
    const data = await devicesService.syncTailscale();
    res.json(data);
  }

  async resetDatabase(req, res) {
    const data = await devicesService.resetDatabase();
    res.json(data);
  }
}

const devicesController = new DevicesController();
module.exports = { DevicesController, devicesController };
