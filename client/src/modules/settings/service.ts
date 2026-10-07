// ponytail: settings service helpers and api orchestration
import { settingsApi } from './api'
import { devicesApi } from '../devices/api'
import type { SystemSettings, SocSettings, SaveSettingsPayload, SaveSettingsResult } from './types'
import type { SyncTailscaleResult } from '../devices/types'

export class SettingsService {
  getSettings(): Promise<SystemSettings> {
    return settingsApi.fetchSettings()
  }

  saveSettings(payload: SaveSettingsPayload): Promise<SaveSettingsResult> {
    return settingsApi.saveSettings(payload)
  }

  syncTailscaleDevices(): Promise<SyncTailscaleResult> {
    return devicesApi.syncTailscale()
  }

  static formatApiKeyMask(apiKey: string): string {
    if (!apiKey) return ''
    if (apiKey.length <= 14) return '********'
    return `${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`
  }

  static parseSocSettings(data: any): SocSettings {
    return {
      latencyWarningMs: data?.latencyWarningMs || '50',
      timeoutMs: data?.timeoutMs || '2000',
      retryCount: data?.retryCount || '3',
      discordWebhook: data?.discordWebhook || '',
      telegramChatId: data?.telegramChatId || '',
      soundAlert: data?.soundAlert === 'true' || data?.soundAlert === true,
      zeroScroll: data?.zeroScroll !== undefined ? (data.zeroScroll === 'true' || data.zeroScroll === true) : true,
    }
  }
}

export const settingsService = new SettingsService()
