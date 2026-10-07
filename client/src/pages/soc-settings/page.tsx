// ponytail: soc settings page connecting hooks and presentation form
import React from 'react'
import { ShieldAlert } from 'lucide-react'
import { useSocSettingsPage } from './hooks/useSocSettingsPage'
import { SocSettingsForm } from './components/SocSettingsForm'

export interface SocSettingsPageProps {
  onShowToast: (msg: string) => void
}

export const SocSettingsPage: React.FC<SocSettingsPageProps> = ({ onShowToast }) => {
  const {
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
  } = useSocSettingsPage(onShowToast)

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <ShieldAlert className="h-6 w-6 text-rose-500" />
          Thiết Lập SOC Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Cấu hình ngưỡng cảnh báo độ trễ, cảnh báo sự cố tức thời và tích hợp kênh webhook thông báo.
        </p>
      </div>

      <SocSettingsForm
        latencyWarningMs={latencyWarningMs}
        setLatencyWarningMs={setLatencyWarningMs}
        timeoutMs={timeoutMs}
        setTimeoutMs={setTimeoutMs}
        retryCount={retryCount}
        setRetryCount={setRetryCount}
        discordWebhook={discordWebhook}
        setDiscordWebhook={setDiscordWebhook}
        telegramChatId={telegramChatId}
        setTelegramChatId={setTelegramChatId}
        soundAlert={soundAlert}
        setSoundAlert={setSoundAlert}
        zeroScroll={zeroScroll}
        setZeroScroll={setZeroScroll}
        saved={saved}
        saving={saving}
        onSave={handleSave}
      />
    </div>
  )
}
