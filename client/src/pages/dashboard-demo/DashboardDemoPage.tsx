// ponytail: comprehensive dashboard widgets catalog with 23 specialized tiles and multi-template 12x6 live showcase
import { useState } from 'react'
import {
  LayoutGrid,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Server,
  Activity,
  Wifi,
  Network,
  Terminal,
  ShieldCheck,
  Radio,
  BarChart2,
  Tv,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DashboardSummary, Device, MonitoredService } from '@/modules'

import {
  DedicatedTopologyWidget,
  StatCardWidget,
  SocClockWidget,
  PortScannerStatWidget,
  LatencyAreaChartWidget,
  ComparativeLatencyChartWidget,
  HistogramLatencyWidget,
  PacketLossBarWidget,
  TcpPortStatusGridWidget,
  UptimeRibbonWidget,
  ServiceUptimeMatrixWidget,
  ServiceCompactTableWidget,
  EmergencyDownWidget,
  ServiceCategoryTabsWidget,
  MeshNodesWidget,
  NodeDetailInspectorWidget,
  DerpRegionMapWidget,
  MeshTopologyRadarWidget,
  LiveIncidentFeedWidget,
  AuditLogTerminalWidget,
  GaugeHealthWidget,
  HostResourceWidget,
  QuickActionPadWidget,
} from '@/components/dashboard-widgets'

export interface DashboardDemoPageProps {
  summary: DashboardSummary | null
  devices: Device[]
  services: MonitoredService[]
  onRefresh?: () => void
  onShowToast?: (msg: string) => void
  onSyncTailscale?: () => Promise<void> | void
  onOpenSocFullscreen?: () => void
}

type CategoryFilter = 'all' | 'topology' | 'kpis' | 'charts' | 'health' | 'ports' | 'controls'
type DemoTemplate = 'soc_overview' | 'server_topology' | 'deep_telemetry'

export function DashboardDemoPage({
  summary,
  devices,
  services,
  onRefresh,
  onShowToast,
  onSyncTailscale,
  onOpenSocFullscreen,
}: DashboardDemoPageProps) {
  const [viewMode, setViewMode] = useState<'catalog' | 'grid12x6'>('catalog')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [demoTemplate, setDemoTemplate] = useState<DemoTemplate>('server_topology')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  const onlineCount = devices.filter(d => d.is_online).length
  const totalCount = devices.length || 9
  const totalServices = services.length || 4
  const downServices = services.filter(s => s.last_status === 'DOWN').length
  const avgLatency = summary?.avg_latency_ms || 42

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Kho Các Loại Ô Dashboard
                <Badge variant="blue" className="text-xs font-mono">
                  23 Loại Ô Chuyên Dụng
                </Badge>
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Kho linh kiện giao diện phong phú bao gồm sơ đồ máy chủ nét đứt, ma trận cổng, telemetry và biểu đồ hiệu năng
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Fullscreen */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSocFullscreen && (
            <Button
              variant="default"
              size="sm"
              onClick={onOpenSocFullscreen}
              className="h-8 gap-1.5 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold"
              title="Mở màn hình SOC toàn màn hình không có thanh bên hoặc cuộn trang"
            >
              <Tv className="h-3.5 w-3.5" />
              <span>Mở Màn Hình SOC (12×6)</span>
            </Button>
          )}

          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-0.5">
            <button
              onClick={() => setViewMode('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'catalog'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Xem Danh Mục (23 Loại)</span>
            </button>
            <button
              onClick={() => setViewMode('grid12x6')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'grid12x6'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>Mô Phỏng Lưới 12×6</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 gap-1.5 text-xs font-mono border-zinc-200 dark:border-zinc-800 cursor-pointer"
            title="Bật/Tắt Toàn Màn Hình F11"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </Button>
        </div>
      </div>

      {/* ========================================================
          VIEW MODE 1: CATALOG VIEW (DANH MỤC TỪNG LOẠI Ô)
          ======================================================== */}
      {viewMode === 'catalog' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setCategory('all')}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                category === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Tất cả (23)
            </button>
            <button
              onClick={() => setCategory('topology')}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                category === 'topology'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Sơ Đồ Máy Chủ Nét Đứt & Radar
            </button>
            <button
              onClick={() => setCategory('ports')}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                category === 'ports'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Ma Trận Cổng &amp; Rớt Gói
            </button>
            <button
              onClick={() => setCategory('charts')}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                category === 'charts'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Biểu Đồ Sóng &amp; Phân Phối
            </button>
            <button
              onClick={() => setCategory('kpis')}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                category === 'kpis'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Thẻ Số &amp; Đồng Hồ
            </button>
            <button
              onClick={() => setCategory('health')}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                category === 'health'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Uptime &amp; Bảng Dịch Vụ
            </button>
            <button
              onClick={() => setCategory('controls')}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                category === 'controls'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Terminal &amp; Tác Vụ
            </button>
          </div>

          {/* Section 1: TOPOLOGY & RADAR (HIGHLIGHT) */}
          {(category === 'all' || category === 'topology') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Network className="h-4 w-4 text-blue-500" />
                  <span>1. Sơ Đồ Máy Chủ &amp; Radar</span>
                </h3>
              </div>

              {/* Dedicated Big Server Topology Widget (React Flow) */}
              <DedicatedTopologyWidget
                devices={devices}
                services={services}
                slotSize="12×4"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                <div className="h-80">
                  <MeshTopologyRadarWidget devices={devices} slotSize="6×3" />
                </div>
                <div className="h-80">
                  <NodeDetailInspectorWidget slotSize="6×3" />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: PORTS, PACKET LOSS & DERP RELAY */}
          {(category === 'all' || category === 'ports') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Radio className="h-4 w-4 text-indigo-500" />
                  <span>2. Trạng Thái Dịch Vụ, Mất Gói &amp; Trạm Tiếp Vận</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="h-56">
                  <TcpPortStatusGridWidget services={services} slotSize="6×2" />
                </div>
                <div className="h-56">
                  <PacketLossBarWidget slotSize="6×2" />
                </div>
                <div className="h-56">
                  <DerpRegionMapWidget slotSize="6×2" />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: CHARTS & HISTOGRAMS */}
          {(category === 'all' || category === 'charts') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-emerald-500" />
                  <span>3. Biểu Đồ Độ Trễ &amp; Phân Phối Tần Suất</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="h-64">
                  <LatencyAreaChartWidget
                    title="Độ Trễ Dịch Vụ API LLM"
                    serviceName="AWS EC2"
                    slotSize="6×3"
                  />
                </div>
                <div className="h-64">
                  <ComparativeLatencyChartWidget slotSize="6×3" />
                </div>
                <div className="h-64">
                  <HistogramLatencyWidget slotSize="6×3" />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: STAT KPIS & CLOCKS */}
          {(category === 'all' || category === 'kpis') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500" />
                  <span>4. Thẻ Đo Lường &amp; Đồng Hồ</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div className="h-32">
                  <StatCardWidget
                    title="Nút Mạng Hoạt Động"
                    value={`${onlineCount} / ${totalCount}`}
                    subValue="Tailscale Mesh Live"
                    icon={Server}
                    color="emerald"
                    trend="up"
                    trendText="+1 vừa online"
                    slotSize="3×1"
                  />
                </div>
                <div className="h-32">
                  <StatCardWidget
                    title="Dịch Vụ Cần Giám Sát"
                    value={`${totalServices - downServices} / ${totalServices}`}
                    subValue={`${downServices > 0 ? `${downServices} dịch vụ DOWN` : '100% UP'}`}
                    icon={Activity}
                    color={downServices > 0 ? 'rose' : 'emerald'}
                    trend={downServices > 0 ? 'down' : 'neutral'}
                    trendText={downServices > 0 ? '1 Down' : 'Ổn định'}
                    slotSize="3×1"
                  />
                </div>
                <div className="h-32">
                  <StatCardWidget
                    title="Độ Trễ Trung Bình"
                    value={`${avgLatency}ms`}
                    subValue="Phản hồi nhanh dưới 50ms"
                    icon={Wifi}
                    color="blue"
                    trend="neutral"
                    trendText="Tối ưu"
                    slotSize="3×1"
                  />
                </div>
                <div className="h-32">
                  <PortScannerStatWidget
                    activePorts={[8080, 3389, 20128, 14616]}
                    slotSize="3×1"
                  />
                </div>
                <div className="h-32">
                  <SocClockWidget
                    isTailscaleConnected={true}
                    onSync={onSyncTailscale}
                    slotSize="3×1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 5: UPTIME MATRICES & SERVICE HEALTH */}
          {(category === 'all' || category === 'health') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>5. Uptime 30 Ngày, Bảng Dịch Vụ &amp; Cảnh Báo</span>
                </h3>
              </div>

              {/* Stacked Multi-service Uptime Matrix (Vertically Scrollable) */}
              <div className="h-64">
                <ServiceUptimeMatrixWidget services={services} slotSize="12×2" />
              </div>

              <div className="h-28">
                <UptimeRibbonWidget slotSize="12×1" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
                <div className="lg:col-span-2 h-72">
                  <ServiceCompactTableWidget
                    services={services}
                    onRefresh={onRefresh}
                    slotSize="8×2"
                  />
                </div>
                <div className="h-72">
                  <EmergencyDownWidget
                    services={services}
                    onRetry={onRefresh}
                    slotSize="4×2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-64">
                  <ServiceCategoryTabsWidget services={services} slotSize="6×3" />
                </div>
                <div className="h-64">
                  <MeshNodesWidget devices={devices} slotSize="6×3" />
                </div>
              </div>
            </div>
          )}

          {/* Section 6: TERMINAL, ACTIONS & SYSTEM HEALTH */}
          {(category === 'all' || category === 'controls') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>6. Nhật Ký Dò Quét &amp; Điều Khiển Nhanh</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 h-72">
                  <AuditLogTerminalWidget slotSize="6×3" />
                </div>
                <div className="h-72">
                  <LiveIncidentFeedWidget slotSize="4×3" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-48">
                  <GaugeHealthWidget score={96} slotSize="3×2" />
                </div>
                <div className="h-48">
                  <HostResourceWidget slotSize="3×2" />
                </div>
                <div className="h-48">
                  <QuickActionPadWidget
                    onSyncTailscale={async () => {
                      if (onSyncTailscale) await onSyncTailscale()
                    }}
                    onRefreshData={async () => {
                      if (onRefresh) onRefresh()
                    }}
                    onProbeAll={async () => {
                      if (onRefresh) onRefresh()
                    }}
                    onShowToast={onShowToast}
                    slotSize="3×2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          VIEW MODE 2: LIVE 12×6 GRID SIMULATION WITH 3 TEMPLATES
          ======================================================== */}
      {viewMode === 'grid12x6' && (
        <div className="space-y-4">
          {/* Template Switcher Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500 font-semibold uppercase">Chọn Mẫu Màn Hình:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setDemoTemplate('server_topology')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  demoTemplate === 'server_topology'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Mẫu 1: Sơ Đồ Máy Chủ Nét Đứt Chuyên Dụng (12×4)
              </button>

              <button
                onClick={() => setDemoTemplate('soc_overview')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  demoTemplate === 'soc_overview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Mẫu 2: Trung Tâm Điều Hành SOC (Overview)
              </button>

              <button
                onClick={() => setDemoTemplate('deep_telemetry')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  demoTemplate === 'deep_telemetry'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Mẫu 3: Bảng Cổng Socket &amp; Terminal Live
              </button>
            </div>
          </div>

          {/* TEMPLATE 1: SERVER TOPOLOGY FOCUSED */}
          {demoTemplate === 'server_topology' && (
            <div className="space-y-3">
              {/* Row 1: 4 Quick Stats */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-28">
                  <StatCardWidget
                    title="Nút Mạng Hoạt Động"
                    value={`${onlineCount} / ${totalCount}`}
                    subValue="Mesh WireGuard Live"
                    icon={Server}
                    color="emerald"
                    trend="up"
                    trendText="Live"
                    slotSize="3×1"
                  />
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-28">
                  <StatCardWidget
                    title="Dịch Vụ Đang Quản Lý"
                    value={`${totalServices - downServices} / ${totalServices}`}
                    subValue={`${downServices > 0 ? `${downServices} dịch vụ DOWN` : '100% UP'}`}
                    icon={Activity}
                    color={downServices > 0 ? 'rose' : 'emerald'}
                    trend={downServices > 0 ? 'down' : 'neutral'}
                    trendText={downServices > 0 ? 'Cần kiểm tra' : 'Chuẩn'}
                    slotSize="3×1"
                  />
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-28">
                  <PortScannerStatWidget activePorts={[8080, 3389, 20128, 14616]} slotSize="3×1" />
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-28">
                  <SocClockWidget isTailscaleConnected={true} onSync={onSyncTailscale} slotSize="3×1" />
                </div>
              </div>

              {/* Row 2: Dedicated Large Server Topology Diagram (Enclosing Managed Services) */}
              <DedicatedTopologyWidget devices={devices} services={services} slotSize="12×4" />

              {/* Row 3: Bottom Full 30-Day Uptime Ribbon */}
              <div className="h-26">
                <UptimeRibbonWidget slotSize="12×1" />
              </div>
            </div>
          )}

          {/* TEMPLATE 2: SOC OVERVIEW */}
          {demoTemplate === 'soc_overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-28">
                  <StatCardWidget title="Nodes Online" value={`${onlineCount}/${totalCount}`} icon={Server} color="emerald" slotSize="3×1" />
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-28">
                  <StatCardWidget title="Services UP" value={`${totalServices - downServices}/${totalServices}`} icon={Activity} color="rose" slotSize="3×1" />
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-28">
                  <StatCardWidget title="Độ Trễ TB" value={`${avgLatency}ms`} icon={Wifi} color="blue" slotSize="3×1" />
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3 h-28">
                  <SocClockWidget isTailscaleConnected={true} onSync={onSyncTailscale} slotSize="3×1" />
                </div>

                <div className="col-span-12 lg:col-span-6 h-64">
                  <LatencyAreaChartWidget title="Độ Trễ API LLM (AWS)" serviceName="EC2 Instance" slotSize="6×3" />
                </div>
                <div className="col-span-12 lg:col-span-6 h-64">
                  <ComparativeLatencyChartWidget slotSize="6×3" />
                </div>

                <div className="col-span-12 lg:col-span-8 h-72">
                  <ServiceCompactTableWidget services={services} onRefresh={onRefresh} slotSize="8×2" />
                </div>
                <div className="col-span-12 lg:col-span-4 h-72">
                  <LiveIncidentFeedWidget slotSize="4×2" />
                </div>

                <div className="col-span-12 h-26">
                  <UptimeRibbonWidget slotSize="12×1" />
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE 3: DEEP TELEMETRY & PORTS */}
          {demoTemplate === 'deep_telemetry' && (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 lg:col-span-6 h-56">
                  <TcpPortStatusGridWidget services={services} slotSize="6×2" />
                </div>
                <div className="col-span-12 lg:col-span-6 h-56">
                  <PacketLossBarWidget slotSize="6×2" />
                </div>

                <div className="col-span-12 lg:col-span-8 h-72">
                  <AuditLogTerminalWidget slotSize="8×3" />
                </div>
                <div className="col-span-12 lg:col-span-4 h-72">
                  <HistogramLatencyWidget slotSize="4×3" />
                </div>

                <div className="col-span-12 h-64">
                  <ServiceUptimeMatrixWidget services={services} slotSize="12×2" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
