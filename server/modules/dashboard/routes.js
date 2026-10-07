// ponytail: dashboard routes registration
const { dashboardController } = require('./controller');

function registerDashboardRoutes(router) {
  router.get('/api/dashboard/summary', (req, res) => dashboardController.getSummary(req, res));
}

module.exports = { registerDashboardRoutes };
