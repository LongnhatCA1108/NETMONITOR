// ponytail: emergency alert widget highlighting downed services or displaying operational calm state
import { AlertTriangle, ShieldCheck, RefreshCw, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MonitoredService } from '@/modules/services/types'

export function EmergencyDownWidget({
  services = [],
  slotSize: _slotSize = '4×2',
  onRetry,
}: {
  services?: MonitoredService[]
  slotSize?: string
  onRetry?: () => void
}) {
  const downServices = services.filter(s => s.last_status === 'DOWN')
  const hasOutage = downServices.length > 0

  return (
    <Card className={`relative overflow-hidden p-4 border shadow-sm flex flex-col justify-between h-full ${
      hasOutage
        ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
        : 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10'
    }`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            hasOutage
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}>
            {hasOutage ? <AlertTriangle className="h-4 w-4 animate-bounce" /> : <ShieldCheck className="h-4 w-4" />}
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>{hasOutage ? 'Cảnh Báo Sự Cố' : 'Hạ Tầng An Toàn'}</span>
            <Badge variant={hasOutage ? 'danger' : 'success'} className="text-[10px] px-1.5 py-0">
              {hasOutage ? `${downServices.length} DOWN` : '100% OK'}
            </Badge>
          </div>
        </div>
      </div>

      {hasOutage ? (
        <div className="my-2 space-y-1.5">
          {downServices.slice(0, 2).map(s => (
            <div
              key={s.id}
              className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/40 text-xs font-mono"
            >
              <div className="flex items-center gap-2 truncate">
                <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{s.name}</span>
                <span className="text-zinc-400 text-[11px]">({s.hostname || s.ip}:{s.port})</span>
              </div>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 truncate max-w-[150px]">
                {s.error_msg || 'Connection timeout'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="my-3 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-medium">Tất cả các cổng giám sát đều đang phản hồi bình thường</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs font-mono text-zinc-400">
        <span>Tự động kiểm tra lại sau 30s</span>
        {hasOutage && onRetry && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[11px] font-mono gap-1 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400"
            onClick={onRetry}
          >
            <RefreshCw className="h-2.5 w-2.5" />
            Kiểm tra ngay
          </Button>
        )}
      </div>
    </Card>
  )
}
