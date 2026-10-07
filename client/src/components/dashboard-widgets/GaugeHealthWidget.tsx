import { HeartHandshake } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function GaugeHealthWidget({
  score = 96,
  slotSize: _slotSize = '3×2',
}: {
  score?: number
  slotSize?: string
}) {
  const clamped = Math.max(0, Math.min(100, score))

  const getStatus = (val: number) => {
    if (val >= 95) return { label: 'TỐI ƯU', color: 'text-emerald-500', stroke: '#10b981' }
    if (val >= 80) return { label: 'KHÁ', color: 'text-blue-500', stroke: '#3b82f6' }
    if (val >= 60) return { label: 'CẢNH BÁO', color: 'text-amber-500', stroke: '#f59e0b' }
    return { label: 'NGUY CẤP', color: 'text-rose-500', stroke: '#f43f5e' }
  }

  const status = getStatus(clamped)

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <HeartHandshake className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Chỉ Số Sức Khỏe
          </div>
        </div>
      </div>

      {/* Semi-circle Gauge Canvas */}
      <div className="relative w-full h-32 flex items-center justify-center select-none mt-1">
        <svg viewBox="0 0 200 120" className="w-48 h-32 overflow-visible">
          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
            className="text-zinc-100 dark:text-zinc-800"
          />

          {/* Active Colored Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={status.stroke}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (clamped / 100) * 251.2}
            className="transition-all duration-1000 ease-out"
          />

          {/* Center value text */}
          <text x="100" y="85" textAnchor="middle" className="font-mono text-3xl font-bold fill-zinc-900 dark:fill-zinc-100">
            {clamped}%
          </text>
          <text x="100" y="105" textAnchor="middle" className={`font-mono text-[10px] font-bold ${status.color}`}>
            {status.label}
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
        <span>Mục tiêu SLA: 99.0%</span>
        <span className="text-emerald-500 font-semibold">Đạt chuẩn ISO-SOC</span>
      </div>
    </Card>
  )
}
