// ponytail: interactive uptime bars with compact range selection (7/14/30 days) and zero horizontal overflow
import { useState, useMemo } from 'react'

export interface UptimeDay {
  date: string
  fullDate?: string
  uptime: number
  status: 'UP' | 'DEGRADED' | 'DOWN' | 'NO_DATA'
  latency: number
}

interface UptimeGridProps {
  days?: number
  defaultDays?: 7 | 14 | 30
  overallUptime?: number
  daysData?: UptimeDay[]
  showRangeSelector?: boolean
}

export function UptimeGrid({
  days,
  defaultDays = 7,
  overallUptime,
  daysData = [],
  showRangeSelector = true,
}: UptimeGridProps) {
  const [selectedDays, setSelectedDays] = useState<number>(days || defaultDays)
  const [hoveredDay, setHoveredDay] = useState<UptimeDay | null>(null)

  // Slices or generates exactly `selectedDays` points
  const dayList: UptimeDay[] = useMemo(() => {
    if (daysData && daysData.length > 0) {
      return daysData.slice(-selectedDays)
    }
    return Array.from({ length: selectedDays }).map((_, index) => {
      const daysAgo = selectedDays - 1 - index
      const dateObj = new Date()
      dateObj.setDate(dateObj.getDate() - daysAgo)
      const dateStr = dateObj.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      })
      return {
        date: dateStr,
        uptime: 100.0,
        status: 'NO_DATA',
        latency: 0,
      }
    })
  }, [daysData, selectedDays])

  // Calculated uptime for the active slice
  const activeUptime = useMemo(() => {
    if (overallUptime !== undefined && selectedDays === 30) return overallUptime
    const valid = dayList.filter((d) => d.status !== 'NO_DATA')
    if (valid.length === 0) return overallUptime !== undefined ? overallUptime : 100.0
    const sum = valid.reduce((acc, d) => acc + d.uptime, 0)
    return Math.round((sum / valid.length) * 10) / 10
  }, [dayList, overallUptime, selectedDays])

  return (
    <div className="space-y-2.5 w-full max-w-full overflow-hidden">
      {/* Header: Title, Range Pills, and Tooltip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            Lịch sử Uptime ({selectedDays} ngày qua)
          </span>

          {showRangeSelector && (
            <div className="flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-900 p-0.5 border border-zinc-200/80 dark:border-zinc-800 text-[11px] font-semibold">
              {([7, 14, 30] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedDays(r)}
                  className={`px-2 py-0.5 rounded-[5px] transition-all cursor-pointer ${
                    selectedDays === r
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="font-mono text-xs shrink-0">
          {hoveredDay ? (
            <span className="text-zinc-800 dark:text-zinc-200">
              <strong className="text-blue-600 dark:text-blue-400">{hoveredDay.date}</strong>:{' '}
              {hoveredDay.status === 'NO_DATA'
                ? 'Chưa có lượt kiểm tra'
                : `${hoveredDay.uptime}% (${hoveredDay.status === 'DOWN' ? 'Sự cố' : `${hoveredDay.latency}ms`})`}
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {activeUptime.toFixed(1)}% Hoạt động
            </span>
          )}
        </div>
      </div>

      {/* Grid of Squares/Bars with strict min-w-0 for ZERO horizontal overflow */}
      <div className="flex items-center gap-1 py-1 w-full max-w-full min-w-0">
        {dayList.map((day, idx) => {
          const bgClass =
            day.status === 'DOWN'
              ? 'bg-rose-500 hover:bg-rose-600'
              : day.status === 'DEGRADED'
              ? 'bg-amber-400 hover:bg-amber-500'
              : day.status === 'NO_DATA'
              ? 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              : 'bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400'

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`flex-1 min-w-0 h-7 rounded-[3px] transition-all cursor-pointer ${bgClass} opacity-90 hover:opacity-100 hover:scale-y-110`}
              title={`${day.date}: ${day.status === 'NO_DATA' ? 'Chưa có kiểm tra' : `${day.uptime}% uptime`}`}
            />
          )
        })}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-0.5">
        <span>{selectedDays} ngày trước</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Hoạt động
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" /> Chưa có log
          </span>
        </div>
        <span>Hôm nay</span>
      </div>
    </div>
  )
}
