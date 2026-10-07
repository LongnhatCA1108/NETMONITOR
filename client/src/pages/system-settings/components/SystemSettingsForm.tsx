import React from 'react'
import { Key, Globe, Save, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SystemSettingsFormProps {
  tailnetName: string
  setTailnetName: (val: string) => void
  apiKey: string
  setApiKey: (val: string) => void
  hasApiKey: boolean
  apiKeyMasked: string
  pollingInterval: string
  setPollingInterval: (val: string) => void
  hubIp: string
  setHubIp: (val: string) => void
  backendPort: string
  setBackendPort: (val: string) => void
  autoSync: boolean
  setAutoSync: (val: boolean) => void
  saving: boolean
  testing: boolean
  saved: boolean
  onSave: (e: React.FormEvent) => void
  onTestSync: () => void
}

export const SystemSettingsForm: React.FC<SystemSettingsFormProps> = ({
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
  onSave,
  onTestSync,
}) => {
  return (
    <form onSubmit={onSave} className="space-y-6">
      {/* Tailscale API Config */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Key className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Xác Thực Tailscale API & Tailnet
              </CardTitle>
            </div>
            {hasApiKey && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Đã có API Key
              </span>
            )}
          </div>
          <CardDescription className="text-xs text-zinc-500">
            Khóa API cá nhân (Personal API Key) hoặc OAuth Client để lấy danh sách máy từ Tailscale Control Plane
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Tên Tổ Chức (Tailnet) <span className="text-rose-500">*</span>
              </label>
              <Input
                value={tailnetName}
                onChange={(e) => setTailnetName(e.target.value)}
                className="text-sm font-mono h-11"
                placeholder="ví dụ: user@gmail.com hoặc example.ts.net hoặc -"
                required
              />
              <p className="text-[11px] text-zinc-500">
                Thường là email tài khoản Tailscale hoặc tên miền `tailnet-name.ts.net` (hoặc `-` nếu dùng tài khoản cá nhân).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Tailscale API Access Token <span className="text-rose-500">*</span>
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="text-sm font-mono h-11"
                placeholder={hasApiKey ? `Đã lưu: ${apiKeyMasked} (Nhập mới để đổi)` : 'tskey-api-kXXXXX...'}
              />
              <p className="text-[11px] text-zinc-500">
                Tạo tại:{' '}
                <a
                  href="https://login.tailscale.com/admin/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  tailscale.com/admin/settings/keys
                </a>{' '}
                (Personal API Key).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                  Tự động đồng bộ node trong nền (Poller)
                </span>
                <p className="text-xs text-zinc-500">Định kỳ cập nhật trạng thái online/offline và node mới vào SQLite</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="h-5 w-5 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-blue-600 focus:ring-0 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hub Daemon Parameters */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <Globe className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Thông Số Mesh Agent Daemon & SQLite
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-zinc-500">
            Cơ chế lưu trữ SQLite 30 ngày và tần suất polling hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Hub IP (Tailscale)</label>
              <Input
                value={hubIp}
                onChange={(e) => setHubIp(e.target.value)}
                className="text-sm font-mono h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Cổng Backend API (Port)</label>
              <Input
                value={backendPort}
                onChange={(e) => setBackendPort(e.target.value)}
                className="text-sm font-mono h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Chu Kỳ Polling</label>
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(e.target.value)}
                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="1">1 phút (Nhanh)</option>
                <option value="3">3 phút (Khuyến nghị)</option>
                <option value="5">5 phút (Tiết kiệm băng thông)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onTestSync}
          disabled={testing || (!hasApiKey && !apiKey)}
          className="border-zinc-300 dark:border-zinc-700 text-sm font-semibold px-5 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${testing ? 'animate-spin text-blue-500' : ''}`} />
          <span>{testing ? 'Đang kiểm tra kết nối...' : 'Kiểm tra & Đồng bộ ngay'}</span>
        </Button>

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
          <span>{saving ? 'Đang lưu...' : saved ? 'Đã lưu thiết lập!' : 'Lưu thiết lập hệ thống'}</span>
        </Button>
      </div>
    </form>
  )
}
