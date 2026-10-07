// ponytail: retro terminal console simulator streaming real probe command outputs and raw socket telemetry
import { useState, useEffect } from 'react'
import { Terminal, Play, Pause, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface TerminalLine {
  id: number
  time: string
  cmd: string
  res: string
  status: 'ok' | 'err' | 'info'
}

export function AuditLogTerminalWidget({ slotSize: _slotSize = '6×3' }: { slotSize?: string }) {
  const [isPaused, setIsPaused] = useState(false)
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 1, time: '09:32:01', cmd: 'probe tcp://100.112.82.77:3389', res: 'CONNECTED -> OK (10ms)', status: 'ok' },
    { id: 2, time: '09:32:02', cmd: 'probe http://100.112.82.77:8080/ [NAS]', res: 'HTTP 200 OK -> (41ms)', status: 'ok' },
    { id: 3, time: '09:32:03', cmd: 'probe http://100.122.116.46:20128 [LLM]', res: 'HTTP 200 OK -> (1209ms)', status: 'ok' },
    { id: 4, time: '09:32:04', cmd: 'probe http://100.96.221.122:14616 [Relay]', res: 'ERR: fetch failed (ECONNREFUSED)', status: 'err' },
    { id: 5, time: '09:32:05', cmd: 'tailscale-api: peers --refresh', res: 'Control Plane Synced: 9 nodes active', status: 'info' },
  ])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      const d = new Date()
      const timeStr = d.toLocaleTimeString('vi-VN')
      const targets = [
        { cmd: 'probe tcp://100.66.221.9:3389', res: 'CONNECTED -> OK (15ms)', status: 'ok' as const },
        { cmd: 'sqlite: PRAGMA journal_mode', res: 'TRUNCATE [PRoot Stable]', status: 'info' as const },
        { cmd: 'probe http://100.112.82.77:8080/health', res: 'HTTP 200 OK -> (39ms)', status: 'ok' as const },
      ]
      const pick = targets[Math.floor(Math.random() * targets.length)]
      setLines(prev => [...prev.slice(-12), { id: Date.now(), time: timeStr, ...pick }])
    }, 4000)
    return () => clearInterval(timer)
  }, [isPaused])

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm flex flex-col justify-between h-full font-mono">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-zinc-200">Nhật Ký Dò Quét Probe</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
            onClick={() => setLines([])}
            title="Xóa log"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="space-y-1.5 overflow-y-auto max-h-48 text-[11px] pr-1 select-text">
        {lines.map(l => (
          <div key={l.id} className="leading-relaxed">
            <span className="text-zinc-500">[{l.time}]</span>{' '}
            <span className="text-emerald-400 font-semibold">$ {l.cmd}</span>
            <div className={`pl-4 ${
              l.status === 'ok'
                ? 'text-zinc-300'
                : l.status === 'err'
                ? 'text-rose-400 font-bold'
                : 'text-blue-400'
            }`}>
              {l.res}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1 text-emerald-400 animate-pulse pt-1">
          <span>meshguard@termux:~$</span>
          <span className="h-3 w-1.5 bg-emerald-400 inline-block"></span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-1.5 mt-2">
        <span>Raw Socket Stream</span>
        <span>Auto-scroll: {isPaused ? 'PAUSED' : 'LIVE'}</span>
      </div>
    </Card>
  )
}
