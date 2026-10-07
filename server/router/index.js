// ponytail: centralized router mounting global middlewares and module routes
const { Router } = require('./router');
const { authMiddleware } = require('../middlewares/auth');
const { registerDashboardRoutes } = require('../modules/dashboard/routes');
const { registerDevicesRoutes } = require('../modules/devices/routes');
const { registerServicesRoutes } = require('../modules/services/routes');
const { registerSettingsRoutes } = require('../modules/settings/routes');

function createAppRouter() {
  const router = new Router();

  // 1. Mount auth middleware (pass-through 100% requests without filtering for now)
  router.use(authMiddleware);

  // 2. Register module routes
  registerDashboardRoutes(router);
  registerDevicesRoutes(router);
  registerServicesRoutes(router);
  registerSettingsRoutes(router);

  return router;
}

const appRouter = createAppRouter();

module.exports = { createAppRouter, appRouter };
