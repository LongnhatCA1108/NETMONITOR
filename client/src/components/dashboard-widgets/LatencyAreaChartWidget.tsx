// ponytail: lightweight native SVG latency area chart supporting multiple slot sizes (sm 4x2, md 6x3, lg 8x4)
import { useState, useMemo } from 'react'
import { Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'

export interface LatencyDataPoint {
  time: string
  latency: number
  status?: string
}

export interface LatencyAreaChartWidgetProps {
  title?: string
  serviceName?: string
  data?: LatencyDataPoint[]
  slotSize?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LatencyAreaChartWidget({
  title = 'Độ Trễ API LLM',
  serviceName,
  data,
  slotSize: _slotSize = '6×3',
  size = 'md',
}: LatencyAreaChartWidgetProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const chartData = useMemo(() => {
    if (data && data.length > 0) return data
    return [
      { time: '09:00', latency: 42 },
      { time: '09:05', latency: 45 },
      { time: '09:10', latency: 38 },
      { time: '09:15', latency: 50 },
      { time: '09:20', latency: 85 },
      { time: '09:25', latency: 62 },
      { time: '09:30', latency: 40 },
      { time: '09:35', latency: 35 },
      { time: '09:40', latency: 120 },
      { time: '09:45', latency: 95 },
      { time: '09:50', latency: 45 },
      { time: '09:55', latency: 42 },
      { time: '10:00', latency: 40 },
    ]
  }, [data])

  const svgHeight = size === 'sm' ? 90 : size === 'lg' ? 200 : 130

  const { min, max, avg, points, pathString, areaString } = useMemo(() => {
    if (chartData.length === 0) {
      return { min: 0, max: 0, avg: 0, points: [], pathString: '', areaString: '' }
    }
    const latencies = chartData.map(d => d.latency)
    const minVal = Math.min(...latencies)
    const maxVal = Math.max(...latencies)
    const avgVal = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)

    const width = 500
    const padding = 12

    const range = maxVal - minVal || 1
    const pts = chartData.map((d, i) => {
      const x = padding + (i / (chartData.length - 1)) * (width - 2 * padding)
      const y = svgHeight - padding - ((d.latency - minVal) / range) * (svgHeight - 2 * padding)
      return { x, y, ...d }
    })

    const pStr = pts.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`
    }, '')

    const aStr = `${pStr} L ${pts[pts.length - 1].x} ${svgHeight} L ${pts[0].x} ${svgHeight} Z`

    return {
      min: minVal,
      max: maxVal,
      avg: avgVal,
      points: pts,
      pathString: pStr,
      areaString: aStr,
    }
  }, [chartData, svgHeight])

  const hoveredPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
              <span className="truncate">{title}</span>
              {serviceName && <span className="text-xs text-blue-500 font-mono font-medium shrink-0">({serviceName})</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-blue-500 font-bold">{avg}ms</span>
            <span className="text-zinc-500 text-[10px] hidden sm:inline">(Max: {max}ms)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full flex-1 my-1 select-none flex items-center">
        <svg
          viewBox={`0 0 500 ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={`latGrad-${serviceName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="12" y1={svgHeight * 0.2} x2="488" y2={svgHeight * 0.2} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/60" strokeDasharray="3 3" />
          <line x1="12" y1={svgHeight * 0.5} x2="488" y2={svgHeight * 0.5} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/60" strokeDasharray="3 3" />
          <line x1="12" y1={svgHeight * 0.8} x2="488" y2={svgHeight * 0.8} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800/60" strokeDasharray="3 3" />

          {/* Area */}
          {areaString && <path d={areaString} fill={`url(#latGrad-${serviceName})`} />}

          {/* Line */}
          {pathString && (
            <path
              d={pathString}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points */}
          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoverIndex(idx)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 5 : 2.5}
                className={
                  p.latency > 100
                    ? 'fill-amber-500 stroke-white dark:stroke-zinc-900 stroke-2'
                    : 'fill-blue-600 stroke-white dark:stroke-zinc-900 stroke-2'
                }
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute -top-7 pointer-events-none transform -translate-x-1/2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2 py-0.5 rounded text-[11px] font-mono shadow-md z-10 flex items-center gap-1.5"
            style={{ left: `${(hoveredPoint.x / 500) * 100}%` }}
          >
            <span>{hoveredPoint.time}:</span>
            <span className="font-bold text-blue-400 dark:text-blue-600">{hoveredPoint.latency}ms</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
        <span className="text-emerald-500 font-medium">Min: {min}ms</span>
        <div className="flex items-center gap-2">
          <span>{chartData[0]?.time}</span>
          <span>→</span>
          <span>{chartData[chartData.length - 1]?.time}</span>
        </div>
      </div>
    </Card>
  )
}
