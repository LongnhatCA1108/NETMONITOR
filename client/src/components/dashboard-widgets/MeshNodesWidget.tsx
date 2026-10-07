// ponytail: mesh nodes card grid showing tailscale node details, ip and running service count
import { Laptop, Smartphone, Server, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Device } from '@/modules/devices/types'

export function MeshNodesWidget({
  devices = [],
  slotSize: _slotSize = '4×3',
}: {
  devices?: Device[]
  slotSize?: string
}) {
  const [copiedIp, setCopiedIp] = useState<string | null>(null)

  const copyIp = (ip: string) => {
    navigator.clipboard.writeText(ip)
    setCopiedIp(ip)
    setTimeout(() => setCopiedIp(null), 2000)
  }

  const getOsIcon = (os?: string) => {
    const o = (os || '').toLowerCase()
    if (o.includes('android')) return <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
    if (o.includes('windows')) return <Laptop className="h-3.5 w-3.5 text-blue-500" />
    return <Server className="h-3.5 w-3.5 text-amber-500" />
  }

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Server className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Thiết Bị Tailnet ({devices.length})
          </div>
        </div>
      </div>

      {/* Nodes list */}
      <div className="space-y-1.5 overflow-y-auto max-h-52 pr-1">
        {devices.slice(0, 5).map(d => {
          const isOnline = !!d.is_online
          return (
            <div
              key={d.node_id}
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs font-mono hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2 w-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                {getOsIcon(d.os)}
                <div className="min-w-0">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {d.alias || d.hostname}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <span>{d.ip}</span>
                    <button
                      onClick={() => copyIp(d.ip)}
                      className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                      title="Sao chép IP"
                    >
                      {copiedIp === d.ip ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {d.services_count !== undefined && d.services_count > 0 && (
                  <Badge variant="blue" className="text-[10px] px-1.5 py-0">
                    {d.services_count} dịch vụ
                  </Badge>
                )}
                <Badge variant={isOnline ? 'success' : 'outline'} className="text-[10px] px-1.5 py-0">
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        <span>Tổng cộng: {devices.filter(d => d.is_online).length} Trực tuyến</span>
        <span>Hỗ trợ gán nhãn tùy biến</span>
      </div>
    </Card>
  )
}
