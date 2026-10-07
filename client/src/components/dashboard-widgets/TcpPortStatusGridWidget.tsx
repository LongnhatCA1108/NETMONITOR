// ponytail: service status matrix widget prioritizing service names over port numbers with live health, latency, and host metadata
import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  XCircle,
  Database,
  HardDrive,
  Globe,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { MonitoredService } from '@/modules'

export interface ServiceMatrixItem {
  id: string | number
  name: string
  port: number
  proto: 'tcp' | 'http'
  category?: 'storage' | 'database' | 'application'
  isOpen: boolean
  latency: number
  hostname?: string
}

export interface TcpPortStatusGridWidgetProps {
  services?: MonitoredService[]
  slotSize?: string
  className?: string
  onSelectService?: (serviceName: string) => void
}

const DEFAULT_SAMPLE_SERVICES: ServiceMatrixItem[] = [
  { id: 1, name: 'MobileNas', port: 8080, proto: 'http', category: 'storage', isOpen: true, latency: 41, hostname: 'Note10+' },
  { id: 2, name: 'RDP Proxy', port: 3389, proto: 'tcp', category: 'application', isOpen: true, latency: 10, hostname: 'PC Chính' },
  { id: 3, name: 'API LLM vLLM', port: 20128, proto: 'http', category: 'application', isOpen: true, latency: 1209, hostname: 'AWS Tokyo' },
  { id: 4, name: 'SSH Termux', port: 22, proto: 'tcp', category: 'application', isOpen: true, latency: 5, hostname: 'Note10+' },
  { id: 5, name: 'Tailscale DERP', port: 443, proto: 'tcp', category: 'application', isOpen: true, latency: 28, hostname: 'Relay SG' },
  { id: 6, name: 'Relay Backup NAS', port: 14616, proto: 'http', category: 'storage', isOpen: false, latency: 0, hostname: 'EU Server' },
]

export function TcpPortStatusGridWidget({
  services,
  slotSize: _slotSize = '6×2',
  className = '',
  onSelectService,
}: TcpPortStatusGridWidgetProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'alert'>('all')

  // Map real services if provided, else use rich mock items
  const items: ServiceMatrixItem[] = useMemo(() => {
    if (services && services.length > 0) {
      return services.map(s => ({
        id: s.id,
        name: s.name,
        port: s.port,
        proto: s.type,
        category: s.category,
        isOpen: s.last_status === 'UP',
        latency: s.last_latency_ms || 0,
        hostname: s.hostname || undefined,
      }))
    }
    return DEFAULT_SAMPLE_SERVICES
  }, [services])

  const upCount = items.filter(i => i.isOpen).length
  const downCount = items.filter(i => !i.isOpen).length

  const filteredItems = useMemo(() => {
    if (filterMode === 'alert') return items.filter(i => !i.isOpen)
    return items
  }, [items, filterMode])

  const getServiceIcon = (category?: string, proto?: string) => {
    if (category === 'database') {
      return <Database className="h-3.5 w-3.5 text-amber-500 shrink-0" />
    }
    if (category === 'storage') {
      return <HardDrive className="h-3.5 w-3.5 text-blue-500 shrink-0" />
    }
    if (proto === 'tcp') {
      return <Terminal className="h-3.5 w-3.5 text-purple-500 shrink-0" />
    }
    return <Globe className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
  }

  return (
    <Card
      className={`relative overflow-hidden p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full select-none ${className}`}
    >
      {/* Header with Title & Live Filter */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div className="truncate">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              Trạng Thái Dịch Vụ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {downCount > 0 && (
            <button
              onClick={() => setFilterMode(filterMode === 'alert' ? 'all' : 'alert')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                filterMode === 'alert'
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              {filterMode === 'alert' ? 'Tất Cả' : `${downCount} Lỗi`}
            </button>
          )}
        </div>
      </div>

      {/* Grid of Service Chips (Primary = Service Name) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-1 overflow-y-auto max-h-[140px] pr-0.5">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => onSelectService?.(item.name)}
            className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between transition-all cursor-pointer hover:shadow-xs ${
              item.isOpen
                ? 'bg-zinc-50/80 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600'
                : 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900/50 hover:border-rose-400'
            }`}
          >
            <div className="min-w-0 flex-1 pr-1.5">
              {/* PRIMARY: Service Name */}
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate text-[12px]">
                {getServiceIcon(item.category, item.proto)}
                <span className="truncate">{item.name}</span>
              </div>

              {/* SECONDARY: Protocol & Port (Cổng là thông tin phụ) */}
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                <span className="uppercase font-medium text-zinc-600 dark:text-zinc-300">
                  {item.proto}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500">:{item.port}</span>
                {item.hostname && (
                  <span className="text-zinc-400 truncate max-w-[55px]">
                    &bull; {item.hostname}
                  </span>
                )}
              </div>
            </div>

            {/* Status & Latency Badge */}
            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1">
                {item.isOpen ? (
                  <>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {item.latency}ms
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      DOWN
                    </span>
                    <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Summary */}
      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
          {upCount}/{items.length} Dịch Vụ Sẵn Sàng
        </span>
        <div className="flex items-center gap-1.5 text-emerald-500 text-[11px]">
          <Activity className="h-3 w-3 animate-pulse" />
          <span>Realtime Health Probe</span>
        </div>
      </div>
    </Card>
  )
}

// ponytail: Alias export for semantic clarity
export const ServiceStatusMatrixWidget = TcpPortStatusGridWidget
