// ponytail: settings controller handling HTTP requests and delegating to SettingsService
const { settingsService } = require('./service');

class SettingsController {
  async getSettings(req, res) {
    const data = await settingsService.getSettings();
    res.json(data);
  }

  async saveSettings(req, res) {
    const data = await settingsService.saveSettings(req.body);
    res.json(data);
  }
}

const settingsController = new SettingsController();
module.exports = { SettingsController, settingsController };
