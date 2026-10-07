import { Smartphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function NodeDetailInspectorWidget({ slotSize: _slotSize = '4×3' }: { slotSize?: string }) {
  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Termux Galaxy Note10+</span>
              <Badge variant="success" className="text-[9px] px-1 py-0">LIVE</Badge>
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              100.112.82.77 • Android 12 (OneUI)
            </div>
          </div>
        </div>
      </div>

      {/* System Specs */}
      <div className="grid grid-cols-2 gap-2 my-1 text-xs font-mono">
        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 block">TAILSCALE CLIENT</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">v1.96.4</span>
        </div>
        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 block">NODE TYPE</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">Server Node</span>
        </div>
      </div>

      {/* Running Services on this Node */}
      <div className="my-1">
        <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
          Dịch vụ hoạt động trên máy này (2)
        </div>
        <div className="space-y-1.5">
          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">MobileNas</span>
              <span className="text-zinc-400 text-[10px]">HTTP:8080</span>
            </div>
            <span className="text-emerald-500 font-bold text-xs">41ms</span>
          </div>

          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">RDP Proxy</span>
              <span className="text-zinc-400 text-[10px]">TCP:3389</span>
            </div>
            <span className="text-emerald-500 font-bold text-xs">10ms</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
        <span>Uptime 24h: 100%</span>
        <span className="text-emerald-500">Ghim trên Dashboard</span>
      </div>
    </Card>
  )
}
