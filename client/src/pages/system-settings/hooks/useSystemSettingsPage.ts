// ponytail: hook managing system settings loading, saving and testing Tailscale sync
import { useState, useEffect, useCallback } from 'react'
import { settingsService } from '@/modules/settings'

export function useSystemSettingsPage(onShowToast: (msg: string) => void) {
  const [tailnetName, setTailnetName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [apiKeyMasked, setApiKeyMasked] = useState('')
  const [pollingInterval, setPollingInterval] = useState('3')
  const [hubIp, setHubIp] = useState('100.64.0.50')
  const [backendPort, setBackendPort] = useState('3001')
  const [autoSync, setAutoSync] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      const cfg = await settingsService.getSettings()
      setTailnetName(cfg.tailnetName || '')
      setHasApiKey(cfg.hasApiKey)
      setApiKeyMasked(cfg.apiKeyMasked || '')
      setAutoSync(cfg.autoSync)
      setPollingInterval(cfg.pollingInterval || '3')
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: {
        tailnetName: string
        apiKey?: string
        autoSync: boolean
        pollingInterval: string
      } = {
        tailnetName,
        autoSync,
        pollingInterval,
      }
      if (apiKey && apiKey.trim().length > 0) {
        payload.apiKey = apiKey.trim()
      }

      const res = await settingsService.saveSettings(payload)
      setSaved(true)
      if (res.syncResult) {
        onShowToast(res.syncResult)
      } else {
        onShowToast(res.message || 'Đã lưu thiết lập hệ thống thành công!')
      }

      const updated = await settingsService.getSettings()
      setHasApiKey(updated.hasApiKey)
      setApiKeyMasked(updated.apiKeyMasked || '')
      setApiKey('')
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      onShowToast(`Lỗi: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleTestSync = async () => {
    setTesting(true)
    try {
      const res = await settingsService.syncTailscaleDevices()
      if (res.isReal) {
        onShowToast(`Kết nối Tailscale thành công! Đã đồng bộ ${res.count} thiết bị.`)
      } else {
        onShowToast(res.message)
      }
    } catch (err: any) {
      onShowToast(`Lỗi kết nối Tailscale: ${err.message}`)
    } finally {
      setTesting(false)
    }
  }

  return {
    tailnetName,
    setTailnetName,
    apiKey,
    setApiKey,
    hasApiKey,
    apiKeyMasked,
    pollingInterval,
    setPollingInterval,
    hubIp,
    setHubIp,
    backendPort,
    setBackendPort,
    autoSync,
    setAutoSync,
    saving,
    testing,
    saved,
    handleSave,
    handleTestSync,
  }
}
