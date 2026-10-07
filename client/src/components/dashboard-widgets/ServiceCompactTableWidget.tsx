// ponytail: compact & full service health table with breathable rows, latency gauge and 1-click test ping
import { useState } from 'react'
import { Server, Play, Loader2, HardDrive, Database, Cpu, Globe, Laptop } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MonitoredService } from '@/modules/services/types'
import { servicesService } from '@/modules/services/service'

export interface ServiceCompactTableWidgetProps {
  services?: MonitoredService[]
  slotSize?: string
  size?: 'compact' | 'full'
  onRefresh?: () => void
}

export function ServiceCompactTableWidget({
  services = [],
  slotSize: _slotSize = '6×3',
  size = 'compact',
  onRefresh,
}: ServiceCompactTableWidgetProps) {
  const [pingingId, setPingingId] = useState<number | null>(null)

  const displayServices = services.length > 0 ? services : [
    {
      id: 10,
      name: 'MobileNas',
      device_id: 'node-8098796109209546',
      hostname: 'Galaxy Note10+',
      ip: '100.112.82.77',
      port: 8080,
      type: 'http' as const,
      category: 'storage' as const,
      last_status: 'UP' as const,
      last_latency_ms: 41,
      uptime_24h: 100,
      last_check: '2026-10-07 09:30:00',
      enabled: 1,
    },
    {
      id: 11,
      name: 'RDP Proxy',
      device_id: 'node-8098796109209546',
      hostname: 'Galaxy Note10+',
      ip: '100.112.82.77',
      port: 3389,
      type: 'tcp' as const,
      category: 'application' as const,
      last_status: 'UP' as const,
      last_latency_ms: 10,
      uptime_24h: 100,
      last_check: '2026-10-07 09:30:00',
      enabled: 1,
    },
    {
      id: 12,
      name: 'API LLM',
      device_id: 'node-8259425017155160',
      hostname: 'AWS Instance',
      ip: '100.122.116.46',
      port: 20128,
      type: 'http' as const,
      category: 'application' as const,
      last_status: 'UP' as const,
      last_latency_ms: 1209,
      uptime_24h: 99.9,
      last_check: '2026-10-07 09:30:00',
      enabled: 1,
    },
    {
      id: 13,
      name: 'Relay',
      device_id: 'node-7106339494086002',
      hostname: 'Máy chủ điều phối',
      ip: '100.96.221.122',
      port: 14616,
      type: 'http' as const,
      category: 'application' as const,
      last_status: 'DOWN' as const,
      last_latency_ms: 0,
      uptime_24h: 1.0,
      last_check: '2026-10-07 09:30:00',
      enabled: 1,
    },
  ]

  const getServiceIcon = (name: string, category: string) => {
    const n = name.toLowerCase()
    if (category === 'storage' || n.includes('nas')) return <HardDrive className="h-3.5 w-3.5 text-amber-500" />
    if (category === 'database' || n.includes('db')) return <Database className="h-3.5 w-3.5 text-purple-500" />
    if (n.includes('rdp')) return <Laptop className="h-3.5 w-3.5 text-blue-500" />
    if (n.includes('llm')) return <Cpu className="h-3.5 w-3.5 text-rose-500" />
    return <Globe className="h-3.5 w-3.5 text-emerald-500" />
  }

  const handlePing = async (serviceId: number) => {
    setPingingId(serviceId)
    try {
      await servicesService.testPingService(serviceId)
      if (onRefresh) onRefresh()
    } catch {
      // ignore
    } finally {
      setPingingId(null)
    }
  }

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      {/* Title */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Server className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Dịch Vụ Mạng ({displayServices.length})
          </div>
        </div>
      </div>

      {/* Spacious Rows */}
      <div className="overflow-x-auto w-full my-1">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-200/60 dark:border-zinc-800 text-zinc-400 text-[10px] uppercase">
              <th className="pb-1.5 font-medium">DỊCH VỤ</th>
              <th className="pb-1.5 font-medium">CỔNG</th>
              <th className="pb-1.5 font-medium">TRẠNG THÁI</th>
              <th className="pb-1.5 font-medium">ĐỘ TRỄ</th>
              {size === 'full' && <th className="pb-1.5 font-medium">UPTIME 24H</th>}
              <th className="pb-1.5 text-right font-medium">PING</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {displayServices.slice(0, 5).map(s => {
              const isUp = s.last_status === 'UP'
              const isPinging = pingingId === s.id
              return (
                <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2.5 font-medium text-zinc-800 dark:text-zinc-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        {getServiceIcon(s.name, s.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate max-w-[130px]">{s.name}</div>
                        <div className="text-[10px] text-zinc-400 truncate max-w-[130px]">{s.hostname || s.ip}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      :{s.port}
                    </span>
                  </td>

                  <td className="py-2.5">
                    <Badge variant={isUp ? 'success' : 'danger'} className="text-[10px] px-1.5 py-0">
                      {isUp ? 'LIVE' : 'DOWN'}
                    </Badge>
                  </td>

                  <td className="py-2.5">
                    <span className={`font-semibold ${
                      !isUp
                        ? 'text-zinc-400'
                        : s.last_latency_ms < 50
                        ? 'text-emerald-500'
                        : s.last_latency_ms < 200
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }`}>
                      {isUp ? `${s.last_latency_ms}ms` : '--'}
                    </span>
                  </td>

                  {size === 'full' && (
                    <td className="py-2.5 text-zinc-600 dark:text-zinc-300 font-medium">
                      {s.uptime_24h ?? 100}%
                    </td>
                  )}

                  <td className="py-2.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0 border-zinc-200 dark:border-zinc-700 hover:text-blue-500"
                      onClick={() => handlePing(s.id)}
                      disabled={isPinging}
                      title="Test probe ngay"
                    >
                      {isPinging ? (
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                      ) : (
                        <Play className="h-3 w-3 text-zinc-400 fill-zinc-400" />
                      )}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        <span>Tự động quét mỗi 30s</span>
        <span className="text-emerald-500">Chu kỳ kiểm tra Live</span>
      </div>
    </Card>
  )
}
