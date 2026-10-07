// ponytail: devices routes registration
const { devicesController } = require('./controller');

function registerDevicesRoutes(router) {
  router.get('/api/devices', (req, res) => devicesController.getDevices(req, res));
  router.patch('/api/devices/:nodeId', (req, res) => devicesController.updateDevice(req, res));
  router.put('/api/devices/:nodeId', (req, res) => devicesController.updateDevice(req, res));
  router.get('/api/devices/:nodeId/uptime', (req, res) => devicesController.getDeviceUptime(req, res));
  router.post('/api/devices/sync', (req, res) => devicesController.syncDevices(req, res));
  router.post('/api/database/reset', (req, res) => devicesController.resetDatabase(req, res));
}

module.exports = { registerDevicesRoutes };
