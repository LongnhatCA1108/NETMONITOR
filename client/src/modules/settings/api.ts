// ponytail: settings API client inheriting BaseApi
import { BaseApi } from '@/https/baseApi'
import type { SystemSettings, SaveSettingsPayload, SaveSettingsResult } from './types'

export class SettingsApi extends BaseApi {
  constructor() {
    super('/api')
  }

  fetchSettings(): Promise<SystemSettings> {
    return this.get<SystemSettings>('/settings')
  }

  saveSettings(payload: SaveSettingsPayload): Promise<SaveSettingsResult> {
    return this.post<SaveSettingsResult, SaveSettingsPayload>('/settings', payload)
  }
}

export const settingsApi = new SettingsApi()
