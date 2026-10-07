// ponytail: settings routes registration
const { settingsController } = require('./controller');

function registerSettingsRoutes(router) {
  router.get('/api/settings', (req, res) => settingsController.getSettings(req, res));
  router.post('/api/settings', (req, res) => settingsController.saveSettings(req, res));
}

module.exports = { registerSettingsRoutes };
