// ponytail: quick actions pad with vertically scrollable action grid, fixed header/footer, and 1-click telemetry triggers
import { useState } from 'react'
import {
  Zap,
  RefreshCw,
  Radio,
  PlayCircle,
  Trash2,
  Check,
  Maximize,
  Copy,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface QuickActionPadWidgetProps {
  slotSize?: string
  className?: string
  onSyncTailscale?: () => Promise<void> | void
  onProbeAll?: () => Promise<void> | void
  onRefreshData?: () => Promise<void> | void
  onShowToast?: (msg: string) => void
}

export function QuickActionPadWidget({
  slotSize: _slotSize = '3×2',
  className = '',
  onSyncTailscale,
  onProbeAll,
  onRefreshData,
  onShowToast,
}: QuickActionPadWidgetProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [successAction, setSuccessAction] = useState<string | null>(null)

  const handleAction = async (name: string, fn?: () => Promise<void> | void, successMsg?: string) => {
    if (loadingAction) return
    setLoadingAction(name)
    try {
      if (fn) await fn()
      setSuccessAction(name)
      if (successMsg && onShowToast) onShowToast(successMsg)
      setTimeout(() => setSuccessAction(null), 1500)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCopyIP = async () => {
    try {
      await navigator.clipboard.writeText('100.64.0.1')
      setSuccessAction('copy_ip')
      if (onShowToast) onShowToast('Đã sao chép IP Hub 100.64.0.1 vào bộ nhớ tạm!')
      setTimeout(() => setSuccessAction(null), 1500)
    } catch {
      // fallback
    }
  }

  const handleToggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      } else {
        document.exitFullscreen().catch(() => {})
      }
      setSuccessAction('fullscreen')
      setTimeout(() => setSuccessAction(null), 1500)
    } catch {
      // fallback
    }
  }

  return (
    <Card
      className={`relative overflow-hidden p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full select-none ${className}`}
    >
      {/* Fixed Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            Điều Khiển Nhanh
          </div>
        </div>
      </div>

      {/* Vertically Scrollable Action Buttons Container */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 my-1">
        <div className="grid grid-cols-2 gap-1.5">
          {/* Action 1: Sync Tailscale */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 text-xs font-mono justify-start gap-1.5 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 truncate"
            onClick={() => handleAction('sync', onSyncTailscale, 'Đã kích hoạt đồng bộ Tailscale!')}
            disabled={loadingAction === 'sync'}
          >
            {loadingAction === 'sync' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500 shrink-0" />
            ) : successAction === 'sync' ? (
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Radio className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            )}
            <span className="truncate">Sync Tailscale</span>
          </Button>

          {/* Action 2: Probe All */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 text-xs font-mono justify-start gap-1.5 border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 truncate"
            onClick={() => handleAction('probe', onProbeAll, 'Đã kích hoạt kiểm tra toàn bộ cổng mạng!')}
            disabled={loadingAction === 'probe'}
          >
            {loadingAction === 'probe' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500 shrink-0" />
            ) : successAction === 'probe' ? (
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <PlayCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            )}
            <span className="truncate">Probe All TCP</span>
          </Button>

          {/* Action 3: Tải Lại UI */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 text-xs font-mono justify-start gap-1.5 border-zinc-200 dark:border-zinc-800 hover:border-purple-400 truncate"
            onClick={() => handleAction('refresh', onRefreshData, 'Đã làm mới dữ liệu hệ thống!')}
            disabled={loadingAction === 'refresh'}
          >
            {loadingAction === 'refresh' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-500 shrink-0" />
            ) : successAction === 'refresh' ? (
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-purple-500 shrink-0" />
            )}
            <span className="truncate">Tải Lại UI</span>
          </Button>

          {/* Action 4: Toàn Màn Hình (Kiosk) */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 text-xs font-mono justify-start gap-1.5 border-zinc-200 dark:border-zinc-800 hover:border-amber-400 truncate text-zinc-700 dark:text-zinc-300"
            onClick={handleToggleFullscreen}
          >
            {successAction === 'fullscreen' ? (
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Maximize className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            )}
            <span className="truncate">F11 Toàn Màn</span>
          </Button>

          {/* Action 5: Copy IP Hub */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 text-xs font-mono justify-start gap-1.5 border-zinc-200 dark:border-zinc-800 hover:border-teal-400 truncate text-zinc-700 dark:text-zinc-300"
            onClick={handleCopyIP}
          >
            {successAction === 'copy_ip' ? (
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-teal-500 shrink-0" />
            )}
            <span className="truncate">Copy IP Hub</span>
          </Button>

          {/* Action 6: Xóa Mock / Reset Safe */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 text-xs font-mono justify-start gap-1.5 border-zinc-200 dark:border-zinc-800 hover:border-rose-400 text-zinc-600 dark:text-zinc-400 truncate"
            onClick={() => {
              if (onShowToast) {
                onShowToast('Chế độ bảo vệ an toàn: Dữ liệu đang hoạt động ở chế độ Live.')
              } else {
                alert('Chức năng bảo vệ an toàn: Dữ liệu đang hoạt động ở chế độ Live.')
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Reset Mock</span>
          </Button>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono border-t border-zinc-100 dark:border-zinc-800/60 pt-1.5 shrink-0">
        <span className="truncate">Phím tắt F5 / F11 Kiosk</span>
        <span className="text-emerald-500 font-semibold shrink-0">Sẵn sàng</span>
      </div>
    </Card>
  )
}
