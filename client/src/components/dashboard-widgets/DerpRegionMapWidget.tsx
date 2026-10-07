import { Globe } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface DerpRegion {
  code: string
  name: string
  latency: number
  isPreferred: boolean
}

export function DerpRegionMapWidget({ slotSize: _slotSize = '6×2' }: { slotSize?: string }) {
  const regions: DerpRegion[] = [
    { code: 'sin', name: 'Singapore (DERP 9)', latency: 32, isPreferred: true },
    { code: 'hkg', name: 'Hong Kong (DERP 8)', latency: 48, isPreferred: false },
    { code: 'tyo', name: 'Tokyo (DERP 7)', latency: 74, isPreferred: false },
    { code: 'syd', name: 'Sydney (DERP 19)', latency: 135, isPreferred: false },
  ]

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Globe className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Trạm Trung Chuyển DERP
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-1">
        {regions.map(r => (
          <div
            key={r.code}
            className={`p-2 rounded-lg border text-xs font-mono ${
              r.isPreferred
                ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase">{r.code}</span>
              {r.isPreferred && <Badge variant="blue" className="text-[9px] px-1 py-0">ACTIVE</Badge>}
            </div>
            <div className="text-[10px] text-zinc-500 truncate mt-0.5">{r.name}</div>
            <div className="mt-1 font-bold text-sm text-emerald-500">
              {r.latency}ms
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
        <span>Giao thức: WireGuard UDP</span>
        <span className="text-emerald-500">Tối ưu qua Singapore</span>
      </div>
    </Card>
  )
}
