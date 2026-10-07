// ponytail: comparative multi-line latency chart comparing multiple servers / services simultaneously
import { useState } from 'react'
import { LineChart, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'

export interface ComparativeSeries {
  id: string
  name: string
  color: string
  strokeColor: string
  latencies: number[]
}

export function ComparativeLatencyChartWidget({ slotSize: _slotSize = '6×3' }: { slotSize?: string }) {
  const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>({
    aws: true,
    termux: true,
    pc: true,
  })

  const series: ComparativeSeries[] = [
    {
      id: 'aws',
      name: 'AWS Cloud API',
      color: 'text-blue-500',
      strokeColor: '#3b82f6',
      latencies: [120, 115, 130, 125, 140, 135, 128, 122, 130, 125],
    },
    {
      id: 'termux',
      name: 'Termux Note10+',
      color: 'text-emerald-500',
      strokeColor: '#10b981',
      latencies: [35, 40, 42, 38, 45, 41, 39, 43, 40, 38],
    },
    {
      id: 'pc',
      name: 'PC Chính Relay',
      color: 'text-purple-500',
      strokeColor: '#a855f7',
      latencies: [15, 18, 16, 20, 19, 17, 18, 22, 16, 17],
    },
  ]

  const toggleSeries = (id: string) => {
    setActiveSeries(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Find max latency for scaling
  const allValues = series.flatMap(s => activeSeries[s.id] ? s.latencies : [])
  const maxVal = allValues.length > 0 ? Math.max(...allValues, 100) : 150
  const width = 500
  const height = 140
  const padding = 15

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <LineChart className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            So Sánh Độ Trễ Đa Điểm
          </div>
        </div>
      </div>

      {/* Series Toggle Buttons */}
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        {series.map(s => {
          const active = activeSeries[s.id]
          return (
            <button
              key={s.id}
              onClick={() => toggleSeries(s.id)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono transition-all border ${
                active
                  ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 font-semibold'
                  : 'opacity-40 border-transparent hover:opacity-75'
              }`}
            >
              <span className={`h-2 w-2 rounded-full`} style={{ backgroundColor: s.strokeColor }} />
              <span className="text-zinc-800 dark:text-zinc-200">{s.name}</span>
              {active && <Check className="h-3 w-3 text-zinc-400" />}
            </button>
          )
        })}
      </div>

      {/* SVG Multi-line Canvas */}
      <div className="relative w-full h-32 select-none">
        <svg viewBox="0 0 500 140" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <line x1="15" y1="20" x2="485" y2="20" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/80" strokeDasharray="3 3" />
          <line x1="15" y1="70" x2="485" y2="70" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/80" strokeDasharray="3 3" />
          <line x1="15" y1="120" x2="485" y2="120" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/80" strokeDasharray="3 3" />

          {series.map(s => {
            if (!activeSeries[s.id]) return null
            const pts = s.latencies.map((val, idx) => {
              const x = padding + (idx / (s.latencies.length - 1)) * (width - 2 * padding)
              const y = height - padding - (val / maxVal) * (height - 2 * padding)
              return { x, y, val }
            })
            const d = pts.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '')
            return (
              <g key={s.id}>
                <path d={d} fill="none" stroke={s.strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, pIdx) => (
                  <circle key={pIdx} cx={p.x} cy={p.y} r="3" fill={s.strokeColor} className="stroke-white dark:stroke-zinc-900 stroke-1.5" />
                ))}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-1 border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
        <span>T1 (Khởi động)</span>
        <span className="text-zinc-500">Mốc thời gian 10 chu kỳ đo liên tiếp</span>
        <span>T10 (Gần nhất)</span>
      </div>
    </Card>
  )
}
