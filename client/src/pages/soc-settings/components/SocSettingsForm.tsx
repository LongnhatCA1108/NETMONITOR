import React from 'react'
import { Bell, Sliders, Save, CheckCircle2, Volume2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SocSettingsFormProps {
  latencyWarningMs: string
  setLatencyWarningMs: (val: string) => void
  timeoutMs: string
  setTimeoutMs: (val: string) => void
  retryCount: string
  setRetryCount: (val: string) => void
  discordWebhook: string
  setDiscordWebhook: (val: string) => void
  telegramChatId: string
  setTelegramChatId: (val: string) => void
  soundAlert: boolean
  setSoundAlert: (val: boolean) => void
  zeroScroll: boolean
  setZeroScroll: (val: boolean) => void
  saved: boolean
  saving: boolean
  onSave: (e: React.FormEvent) => void
}

export const SocSettingsForm: React.FC<SocSettingsFormProps> = ({
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
  onSave,
}) => {
  return (
    <form onSubmit={onSave} className="space-y-6">
      {/* Ngưỡng cảnh báo sự cố */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Ngưỡng Cảnh Báo Sự Cố & Ping
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-zinc-500">
            Quy định điều kiện để hệ thống chuyển trạng thái sang Cảnh báo hoặc DOWN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Cảnh báo Độ trễ (&gt; ms)
              </label>
              <Input
                type="number"
                value={latencyWarningMs}
                onChange={(e) => setLatencyWarningMs(e.target.value)}
                className="text-sm font-mono h-11"
                placeholder="50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Timeout Ngắt Kết Nối (ms)
              </label>
              <Input
                type="number"
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(e.target.value)}
                className="text-sm font-mono h-11"
                placeholder="2000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Số lần thử lại (Retries)
              </label>
              <Input
                type="number"
                value={retryCount}
                onChange={(e) => setRetryCount(e.target.value)}
                className="text-sm font-mono h-11"
                placeholder="3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kênh thông báo Webhook */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Kênh Gửi Thông Báo Tức Thời
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-zinc-500">
            Nhận thông báo khi dịch vụ bị DOWN hoặc node Tailscale mất kết nối
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-1">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Discord Webhook URL</label>
            <Input
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              className="text-sm font-mono h-11"
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Telegram Chat ID / Bot Token</label>
            <Input
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="text-sm font-mono h-11"
              placeholder="@chat_id hoặc Bot Token"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm">
              <div className="flex items-center gap-2.5">
                <Volume2 className="h-5 w-5 text-amber-500" />
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">Phát âm thanh cảnh báo khi có node DOWN</span>
              </div>
              <input
                type="checkbox"
                checked={soundAlert}
                onChange={(e) => setSoundAlert(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm">
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">Chế độ tối ưu toàn màn hình (Zero-scroll)</span>
              <input
                type="checkbox"
                checked={zeroScroll}
                onChange={(e) => setZeroScroll(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 shadow-md shadow-blue-500/20 cursor-pointer"
        >
          {saved ? (
            <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-300" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          <span>{saving ? 'Đang lưu...' : saved ? 'Đã lưu cấu hình!' : 'Lưu cấu hình SOC'}</span>
        </Button>
      </div>
    </form>
  )
}
