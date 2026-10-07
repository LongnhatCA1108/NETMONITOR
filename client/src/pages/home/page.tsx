import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Device } from '@/modules/devices'
import type { MonitoredService } from '@/modules/services'
import type { DashboardSummary } from '@/modules/dashboard'
import { useHomePage } from './hooks/useHomePage'
import { MetricsGrid } from './components/MetricsGrid'
import { DeviceSpotlight } from './components/DeviceSpotlight'
import { ServiceHealthList } from './components/ServiceHealthList'

export interface HomePageProps {
  summary: DashboardSummary | null
  devices: Device[]
  services: MonitoredService[]
  onNavigate: (tab: string) => void
  onSelectDevice?: (dev: Device) => void
  onSelectService?: (srv: MonitoredService) => void
}

export const HomePage: React.FC<HomePageProps> = ({
  summary,
  devices,
  services,
  onNavigate,
  onSelectDevice,
  onSelectService,
}) => {
  const {
    upServices,
    downServices,
    onlineDevices,
    topDevices,
    topServices,
    onlinePercent,
    upPercent,
    avgLatency,
  } = useHomePage(devices, services, summary)

  return (
    <div className="space-y-8">
      {/* 1. Welcome / Mesh Overview Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-50/50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-7 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Trung Tâm Giám Sát Mạng MeshGuard SOC
              </h1>
              <Badge variant="blue" className="text-xs">
                MESH VIRTUAL
              </Badge>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Hệ thống theo dõi liên tục trạng thái các máy chủ, thiết bị đầu cuối và tiến trình dịch vụ
              chạy trên mạng Tailscale Mesh bảo mật.{' '}
              {summary?.monitor_node && (
                <span className="font-mono text-zinc-500 dark:text-zinc-400 block mt-1.5 text-xs font-semibold">
                  Node điều phối: {summary.monitor_node.hostname} ({summary.monitor_node.ip}) • Cập nhật:{' '}
                  {new Date(summary.last_sync).toLocaleTimeString('vi-VN')}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="default"
              onClick={() => onNavigate('devices')}
              variant="outline"
              className="text-sm font-semibold"
            >
              Thiết Bị ({devices.length})
            </Button>
            <Button
              size="default"
              onClick={() => onNavigate('services')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm"
            >
              Dịch Vụ ({services.length}) <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Metrics Grid */}
      <MetricsGrid
        totalDevices={devices.length}
        onlineCount={onlineDevices.length}
        onlinePercent={onlinePercent}
        totalServices={services.length}
        upCount={upServices.length}
        upPercent={upPercent}
        downCount={downServices.length}
        avgLatency={avgLatency}
      />

      {/* 3. Two Columns: Device Spotlight & Monitored Services Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <DeviceSpotlight
          devices={topDevices}
          onNavigateDevices={() => onNavigate('devices')}
          onSelectDevice={onSelectDevice}
        />
        <ServiceHealthList
          services={topServices}
          onNavigate={onNavigate}
          onSelectService={onSelectService}
        />
      </div>
    </div>
  )
}
