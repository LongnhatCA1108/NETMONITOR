// ponytail: hook managing soc settings loading and saving
import { useState, useEffect, useCallback } from 'react'
import { settingsService } from '@/modules/settings'

export function useSocSettingsPage(onShowToast: (msg: string) => void) {
  const [latencyWarningMs, setLatencyWarningMs] = useState('50')
  const [timeoutMs, setTimeoutMs] = useState('2000')
  const [retryCount, setRetryCount] = useState('3')
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')
  const [soundAlert, setSoundAlert] = useState(false)
  const [zeroScroll, setZeroScroll] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      const cfg = (await settingsService.getSettings()) as any
      if (cfg.latencyWarningMs) setLatencyWarningMs(cfg.latencyWarningMs)
      if (cfg.timeoutMs) setTimeoutMs(cfg.timeoutMs)
      if (cfg.retryCount) setRetryCount(cfg.retryCount)
      if (cfg.discordWebhook) setDiscordWebhook(cfg.discordWebhook)
      if (cfg.telegramChatId) setTelegramChatId(cfg.telegramChatId)
      if (cfg.soundAlert !== undefined)
        setSoundAlert(cfg.soundAlert === 'true' || cfg.soundAlert === true)
      if (cfg.zeroScroll !== undefined)
        setZeroScroll(cfg.zeroScroll === 'true' || cfg.zeroScroll === true)
    } catch {
      // ignore load errors
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsService.saveSettings({
        latencyWarningMs,
        timeoutMs,
        retryCount,
        discordWebhook,
        telegramChatId,
        soundAlert,
        zeroScroll,
      } as any)
      setSaved(true)
      onShowToast('Đã lưu cấu hình SOC Dashboard vào SQLite thành công!')
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      onShowToast(`Lỗi lưu cấu hình: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return {
    latencyWarningMs,
    setLatencyWarningMs,
    timeoutMs,
    setTimeoutMs,
    retryCount,
    setRetryCount,
    discordWebhook,
    setDiscordWebhook,
    telegramChatId,
    setTelegramChatId,
    soundAlert,
    setSoundAlert,
    zeroScroll,
    setZeroScroll,
    saved,
    saving,
    handleSave,
  }
}
