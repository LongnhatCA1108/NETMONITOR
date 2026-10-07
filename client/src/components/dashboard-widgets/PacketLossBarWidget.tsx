// ponytail: packet loss bar widget visualizing connection degradation and drop percentages
import { WifiOff, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'

export interface NodeLoss {
  name: string
  lossRate: number
  isCritical: boolean
}

export function PacketLossBarWidget({ slotSize: _slotSize = '6×2' }: { slotSize?: string }) {
  const nodes: NodeLoss[] = [
    { name: 'PC Chính', lossRate: 0.0, isCritical: false },
    { name: 'Termux Note10+', lossRate: 0.0, isCritical: false },
    { name: 'AWS Instance', lossRate: 0.1, isCritical: false },
    { name: 'POCO C40', lossRate: 0.4, isCritical: false },
    { name: 'Z Flip3 (Sleep)', lossRate: 3.5, isCritical: false },
    { name: 'Relay (Offline)', lossRate: 100.0, isCritical: true },
  ]

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <WifiOff className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Tỷ Lệ Mất Gói Tin
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-1">
        {nodes.map(n => (
          <div
            key={n.name}
            className={`p-2 rounded-lg border text-xs font-mono ${
              n.isCritical
                ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {n.name}
              </span>
              {n.lossRate > 0 && <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />}
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className={`text-base font-bold ${n.lossRate === 0 ? 'text-emerald-500' : n.isCritical ? 'text-rose-500' : 'text-amber-500'}`}>
                {n.lossRate.toFixed(1)}%
              </span>
              <span className="text-[10px] text-zinc-400">Loss</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
        <span>ICMP &amp; Socket Ping stats</span>
        <span className="text-emerald-500">Toàn mạng: 0.05% Avg Loss</span>
      </div>
    </Card>
  )
}
