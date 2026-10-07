// ponytail: histogram measuring latency distribution frequencies across recent probe cycles
import { BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export interface HistogramBucket {
  label: string
  range: string
  count: number
  percentage: number
  color: string
}

export function HistogramLatencyWidget({ slotSize: _slotSize = '6×3' }: { slotSize?: string }) {
  const buckets: HistogramBucket[] = [
    { label: '< 20ms', range: 'Nội bộ Mesh', count: 48, percentage: 48, color: 'bg-emerald-500' },
    { label: '20-50ms', range: 'Tối ưu', count: 32, percentage: 32, color: 'bg-blue-500' },
    { label: '50-150ms', range: 'Bình thường', count: 12, percentage: 12, color: 'bg-indigo-500' },
    { label: '150-500ms', range: 'Độ trễ cao', count: 5, percentage: 5, color: 'bg-amber-500' },
    { label: '> 500ms', range: 'Nguy cơ timeout', count: 3, percentage: 3, color: 'bg-rose-500' },
  ]

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Phân Phối Độ Trễ
          </div>
        </div>
      </div>

      {/* Horizontal Bar Histogram */}
      <div className="space-y-2.5 my-1">
        {buckets.map(b => (
          <div key={b.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {b.label} <span className="text-zinc-400 font-normal text-[11px]">({b.range})</span>
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {b.count} lần ({b.percentage}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${b.color} transition-all duration-500`}
                style={{ width: `${b.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
        <span>80% gói tin dưới 50ms</span>
        <span className="text-emerald-500">Đạt chuẩn kết nối nhanh</span>
      </div>
    </Card>
  )
}
