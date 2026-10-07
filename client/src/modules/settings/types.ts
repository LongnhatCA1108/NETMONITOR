// ponytail: settings module domain types
export interface SystemSettings {
  tailnetName: string
  hasApiKey: boolean
  apiKeyMasked: string
  autoSync: boolean
  pollingInterval: string
  hubIp?: string
  backendPort?: string
}

export interface SocSettings {
  latencyWarningMs: string
  timeoutMs: string
  retryCount: string
  discordWebhook: string
  telegramChatId: string
  soundAlert: boolean
  zeroScroll: boolean
}

export interface SaveSettingsPayload {
  tailnetName?: string
  apiKey?: string
  autoSync?: boolean
  pollingInterval?: string
  latencyWarningMs?: string
  timeoutMs?: string
  retryCount?: string
  discordWebhook?: string
  telegramChatId?: string
  soundAlert?: boolean | string
  zeroScroll?: boolean | string
  [key: string]: any
}

export interface SaveSettingsResult {
  success: boolean
  message: string
  syncResult?: string
}
