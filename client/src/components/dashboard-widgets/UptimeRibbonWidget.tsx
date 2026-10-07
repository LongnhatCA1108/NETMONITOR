// ponytail: horizontal 30-day uptime ribbon matrix running full width or half width with tooltips
import { useState } from 'react'
import { ShieldCheck, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'

export interface DailyUptimeItem {
  date: string
  fullDate: string
  uptime: number
  status: 'UP' | 'DEGRADED' | 'DOWN' | 'NO_DATA'
  latency: number
}

export function UptimeRibbonWidget({
  title = 'Lịch Sử Hoạt Động 30 Ngày',
  slotSize: _slotSize = '12×1',
}: {
  title?: string
  slotSize?: string
}) {
  const [hoveredDay, setHoveredDay] = useState<DailyUptimeItem | null>(null)

  // Generate 30 days mock/live data
  const days: DailyUptimeItem[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const dateStr = d.toISOString().split('T')[0]
    const displayDate = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

    // Simulate occasional degraded day
    if (i === 12) {
      return { date: displayDate, fullDate: dateStr, uptime: 88.5, status: 'DOWN', latency: 420 }
    }
    if (i === 22) {
      return { date: displayDate, fullDate: dateStr, uptime: 96.2, status: 'DEGRADED', latency: 180 }
    }
    return { date: displayDate, fullDate: dateStr, uptime: 100, status: 'UP', latency: 38 + (i % 5) }
  })

  return (
    <Card className="relative overflow-hidden p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </span>
            <span className="text-[11px] text-zinc-400 ml-2 font-mono">
              99.85% SLA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hoveredDay ? (
            <div className="text-xs font-mono flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              <Calendar className="h-3 w-3 text-zinc-400" />
              <span>{hoveredDay.fullDate}:</span>
              <span className={`font-bold ${
                hoveredDay.status === 'UP'
                  ? 'text-emerald-500'
                  : hoveredDay.status === 'DEGRADED'
                  ? 'text-amber-500'
                  : 'text-rose-500'
              }`}>
                {hoveredDay.uptime}% ({hoveredDay.latency}ms)
              </span>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              100% Hôm Nay
            </div>
          )}
        </div>
      </div>

      {/* Grid of 30 blocks */}
      <div className="flex items-center gap-1 w-full pt-1">
        {days.map((item, idx) => {
          let bg = 'bg-emerald-500 hover:bg-emerald-400'
          if (item.status === 'DEGRADED') bg = 'bg-amber-500 hover:bg-amber-400'
          if (item.status === 'DOWN') bg = 'bg-rose-500 hover:bg-rose-400'
          if (item.status === 'NO_DATA') bg = 'bg-zinc-300 dark:bg-zinc-700'

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredDay(item)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`flex-1 h-7 rounded-[3px] transition-all cursor-pointer ${bg} opacity-90 hover:opacity-100 hover:scale-105`}
              title={`${item.fullDate}: ${item.uptime}% (${item.latency}ms)`}
            />
          )
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1">
        <span>30 ngày trước</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-xs bg-emerald-500 inline-block"></span> 100%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-xs bg-amber-500 inline-block"></span> &gt;90%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-xs bg-rose-500 inline-block"></span> Sự cố
          </span>
        </div>
        <span>Hôm nay</span>
      </div>
    </Card>
  )
}
