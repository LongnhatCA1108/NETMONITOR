import { Radio, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function PortScannerStatWidget({
  activePorts = [8080, 3389, 20128, 14616],
  slotSize: _slotSize = '3×1',
}: {
  activePorts?: number[]
  slotSize?: string
}) {
  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase truncate">
          Cổng Dịch Vụ Mở
        </span>
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Radio className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono flex items-center gap-2">
            <span>{activePorts.length} Ports</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xs text-zinc-400 font-mono mt-0.5 truncate max-w-[190px]">
            {activePorts.map(p => `:${p}`).join(', ')}
          </div>
        </div>

        <div className="text-right">
          <Badge variant="blue" className="text-[10px] px-1.5 py-0 font-mono">
            TCP/HTTP
          </Badge>
          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
            Giám sát 24/7
          </div>
        </div>
      </div>
    </Card>
  )
}
