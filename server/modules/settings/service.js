// ponytail: settings service orchestrating config persistence and tailscale credentials
const { settingsRepo } = require('./repo');
const tailscale = require('../../tailscale');

class SettingsService {
  getCredentials() {
    const apiKey = settingsRepo.getSetting('apiKey') || process.env.TAILSCALE_API_KEY || '';
    const tailnet = settingsRepo.getSetting('tailnetName') || process.env.TAILSCALE_TAILNET || '';
    return { apiKey, tailnet };
  }

  async getSettings() {
    const allSettings = settingsRepo.getAllSettings();
    const apiKey = allSettings.apiKey || process.env.TAILSCALE_API_KEY || '';
    const maskedKey = apiKey ? `${apiKey.substring(0, 10)}...${apiKey.slice(-4)}` : '';

    return {
      ...allSettings,
      tailnetName: allSettings.tailnetName || process.env.TAILSCALE_TAILNET || '',
      hasApiKey: !!apiKey,
      apiKeyMasked: maskedKey,
      autoSync: allSettings.autoSync !== undefined ? allSettings.autoSync === 'true' : true,
      pollingInterval: allSettings.pollingInterval || '3',
    };
  }

  async saveSettings(payload, devicesRepo = null) {
    if (!payload || typeof payload !== 'object') {
      const err = new Error('Invalid settings payload');
      err.status = 400;
      throw err;
    }

    for (const [k, v] of Object.entries(payload)) {
      if (k === 'apiKey') {
        if (v && typeof v === 'string' && !v.includes('...')) {
          settingsRepo.setSetting('apiKey', v.trim());
        }
      } else {
        settingsRepo.setSetting(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      }
    }

    // Tự động trigger đồng bộ ngay nếu có đủ thông tin
    let syncResult = null;
    const { apiKey, tailnet } = this.getCredentials();
    if (apiKey && tailnet && (payload.apiKey || payload.tailnetName)) {
      try {
        const realDevices = await tailscale.fetchTailscaleDevices(apiKey, tailnet);
        if (devicesRepo) {
          devicesRepo.upsertRealDevices(realDevices);
        } else {
          // Lazy require to avoid circular dependency
          const { devicesRepo: dRepo } = require('../devices/repo');
          dRepo.upsertRealDevices(realDevices);
        }
        syncResult = `Đồng bộ thành công ${realDevices.length} thiết bị thật từ Tailscale!`;
      } catch (syncErr) {
        syncResult = `Lưu thành công, nhưng sync Tailscale báo lỗi: ${syncErr.message}`;
      }
    }

    return {
      success: true,
      message: 'Đã lưu thiết lập hệ thống!',
      syncResult,
    };
  }
}

const settingsService = new SettingsService();
module.exports = { SettingsService, settingsService };
