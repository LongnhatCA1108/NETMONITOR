// ponytail: host resource widget showing termux environment, node:sqlite truncate mode and background workers
import { Database, Cpu, HardDrive, Terminal } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function HostResourceWidget({ slotSize: _slotSize = '3×2' }: { slotSize?: string }) {
  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Host Agent Termux
          </div>
        </div>
      </div>

      <div className="space-y-2 my-2 text-xs font-mono">
        <div className="flex items-center justify-between p-1.5 rounded bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Database className="h-3.5 w-3.5 text-blue-500" />
            <span>SQLite Engine:</span>
          </div>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            node:sqlite (TRUNCATE)
          </span>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Cpu className="h-3.5 w-3.5 text-emerald-500" />
            <span>Probe Worker:</span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Chu kỳ 30s (Active)
          </span>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <HardDrive className="h-3.5 w-3.5 text-amber-500" />
            <span>Rolling Log:</span>
          </div>
          <span className="text-zinc-800 dark:text-zinc-200">
            30 Ngày Tự Động Xoá
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
        <span>Zero NPM dependencies</span>
        <span className="text-blue-500 font-medium">Uptime: 99.98%</span>
      </div>
    </Card>
  )
}
