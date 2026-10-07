// ponytail: stat kpi widget supporting various sizes (sm 3x1, md 3x2, lg 4x2) with breathable layout
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'

export interface StatCardProps {
  title: string
  value: string | number
  subValue?: string
  icon: LucideIcon
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple'
  trend?: 'up' | 'down' | 'neutral'
  trendText?: string
  slotSize?: string
  size?: 'sm' | 'md' | 'lg'
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200/80 dark:border-blue-900/40',
    accent: 'bg-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/80 dark:border-emerald-900/40',
    accent: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200/80 dark:border-amber-900/40',
    accent: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-900/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200/80 dark:border-rose-900/40',
    accent: 'bg-rose-500',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200/80 dark:border-purple-900/40',
    accent: 'bg-purple-500',
  },
}

export function StatCardWidget({
  title,
  value,
  subValue,
  icon: Icon,
  color = 'blue',
  trend,
  trendText,
  slotSize: _slotSize = '3×1',
  size = 'sm',
}: StatCardProps) {
  const current = colorStyles[color]

  return (
    <Card className={`relative overflow-hidden p-4 border ${current.border} bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full transition-all`}>
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase truncate">
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`p-1.5 rounded-lg ${current.bg} ${current.text}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-1 flex items-baseline justify-between gap-2">
        <div>
          <div className={`${size === 'lg' ? 'text-3xl' : 'text-2xl'} font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono`}>
            {value}
          </div>
          {subValue && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium truncate max-w-[200px]">
              {subValue}
            </div>
          )}
        </div>

        {trendText && (
          <div className="flex items-center gap-1 text-xs font-medium shrink-0">
            {trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />}
            {trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />}
            {trend === 'neutral' && <Minus className="h-3.5 w-3.5 text-zinc-400" />}
            <span
              className={
                trend === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trend === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-zinc-500'
              }
            >
              {trendText}
            </span>
          </div>
        )}
      </div>

      {/* Optional Sparkline / Bottom accent for larger sizes */}
      {size !== 'sm' && (
        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>Chu kỳ đo: Realtime</span>
          <div className="flex items-center gap-1">
            <span className={`h-1.5 w-8 rounded-full ${current.accent} opacity-80`} />
            <span className={`h-1.5 w-4 rounded-full ${current.accent} opacity-50`} />
          </div>
        </div>
      )}
    </Card>
  )
}
