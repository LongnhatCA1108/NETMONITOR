// ponytail: system settings page connecting hooks and presentation form
import React from 'react'
import { Settings } from 'lucide-react'
import { useSystemSettingsPage } from './hooks/useSystemSettingsPage'
import { SystemSettingsForm } from './components/SystemSettingsForm'

export interface SystemSettingsPageProps {
  onShowToast: (msg: string) => void
}

export const SystemSettingsPage: React.FC<SystemSettingsPageProps> = ({ onShowToast }) => {
  const {
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
  } = useSystemSettingsPage(onShowToast)

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-blue-500" />
          Thiết Lập Hệ Thống
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Cấu hình kết nối Tailscale API (v2), lưu trữ SQLite và chế độ đồng bộ tự động.
        </p>
      </div>

      <SystemSettingsForm
        tailnetName={tailnetName}
        setTailnetName={setTailnetName}
        apiKey={apiKey}
        setApiKey={setApiKey}
        hasApiKey={hasApiKey}
        apiKeyMasked={apiKeyMasked}
        pollingInterval={pollingInterval}
        setPollingInterval={setPollingInterval}
        hubIp={hubIp}
        setHubIp={setHubIp}
        backendPort={backendPort}
        setBackendPort={setBackendPort}
        autoSync={autoSync}
        setAutoSync={setAutoSync}
        saving={saving}
        testing={testing}
        saved={saved}
        onSave={handleSave}
        onTestSync={handleTestSync}
      />
    </div>
  )
}
