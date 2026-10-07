// ponytail: services routes registration
const { servicesController } = require('./controller');

function registerServicesRoutes(router) {
  router.get('/api/services', (req, res) => servicesController.getServices(req, res));
  router.post('/api/services', (req, res) => servicesController.createService(req, res));
  router.patch('/api/services/:id', (req, res) => servicesController.updateService(req, res));
  router.put('/api/services/:id', (req, res) => servicesController.updateService(req, res));
  router.delete('/api/services/:id', (req, res) => servicesController.deleteService(req, res));
  router.get('/api/services/:id/history', (req, res) => servicesController.getServiceHistory(req, res));
  router.get('/api/services/:id/incidents', (req, res) => servicesController.getServiceIncidents(req, res));
  router.get('/api/services/:id/uptime', (req, res) => servicesController.getServiceUptime(req, res));
  router.post('/api/services/:id/ping', (req, res) => servicesController.pingService(req, res));
}

module.exports = { registerServicesRoutes };
