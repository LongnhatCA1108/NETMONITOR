import { useState, useEffect } from 'react'
import { Clock, RefreshCw, Radio } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface SocClockWidgetProps {
  isTailscaleConnected?: boolean
  onSync?: () => Promise<void> | void
  slotSize?: string
}

export function SocClockWidget({
  isTailscaleConnected = true,
  onSync,
  slotSize: _slotSize = '3×1',
}: SocClockWidgetProps) {
  const [time, setTime] = useState(new Date())
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSyncClick = async () => {
    if (!onSync || syncing) return
    setSyncing(true)
    try {
      await onSync()
    } finally {
      setTimeout(() => setSyncing(false), 800)
    }
  }

  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')
  const dateStr = time.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
            Hệ Thống SOC
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center">
            <span>{hours}</span>
            <span className="animate-pulse text-blue-500">:</span>
            <span>{minutes}</span>
            <span className="text-zinc-400 dark:text-zinc-600 text-lg ml-0.5">:</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-lg">{seconds}</span>
          </div>
          <div className="text-xs text-zinc-400 font-mono mt-0.5">
            {dateStr} • GMT+7
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>{isTailscaleConnected ? 'Tailnet Live' : 'Offline'}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[11px] font-mono gap-1 border-zinc-200 dark:border-zinc-700"
            onClick={handleSyncClick}
            disabled={syncing}
          >
            <RefreshCw className={`h-2.5 w-2.5 ${syncing ? 'animate-spin text-blue-500' : ''}`} />
            {syncing ? 'Syncing' : 'Sync'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
