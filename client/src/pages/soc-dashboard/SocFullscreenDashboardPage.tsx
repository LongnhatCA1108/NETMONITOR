// ponytail: dedicated edge-to-edge 12x6 full-screen SOC command center dashboard with multi-screen presets, auto-cycle kiosk rotation, and live digital clock
import { useState, useEffect } from 'react'
import {
  Tv,
  Maximize2,
  Minimize2,
  ArrowLeft,
  RefreshCw,
  Play,
  Pause,
  Clock,
  Server,
  Cpu,
  Wifi,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DashboardSummary, Device, MonitoredService } from '@/modules'

import {
  DedicatedTopologyWidget,
  StatCardWidget,
  SocClockWidget,
  LatencyAreaChartWidget,
  ComparativeLatencyChartWidget,
  PacketLossBarWidget,
  TcpPortStatusGridWidget,
  UptimeRibbonWidget,
  ServiceUptimeMatrixWidget,
  ServiceCompactTableWidget,
  MeshNodesWidget,
  DerpRegionMapWidget,
  MeshTopologyRadarWidget,
  AuditLogTerminalWidget,
  QuickActionPadWidget,
} from '@/components/dashboard-widgets'

export interface SocFullscreenDashboardPageProps {
  summary: DashboardSummary | null
  devices: Device[]
  services: MonitoredService[]
  onNavigateAdmin?: () => void
  onRefresh?: () => void
  onShowToast?: (msg: string) => void
  onSyncTailscale?: () => Promise<void> | void
}

export type ScreenId = 'screen_1' | 'screen_2' | 'screen_3'

export function SocFullscreenDashboardPage({
  summary,
  devices,
  services,
  onNavigateAdmin,
  onRefresh,
  onShowToast,
  onSyncTailscale,
}: SocFullscreenDashboardPageProps) {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('screen_1')
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isAutoCycle, setIsAutoCycle] = useState<boolean>(false)
  const cycleSeconds = 15
  const [timeProgress, setTimeProgress] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [utcTime, setUtcTime] = useState<string>('')

  // Live Digital Clock (Local & UTC)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC')
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-Cycle Kiosk Timer (Cycles between Screen 1, 2, 3 every 15s)
  useEffect(() => {
    if (!isAutoCycle) {
      setTimeProgress(0)
      return
    }

    const interval = 100 // update progress every 100ms
    const totalSteps = (cycleSeconds * 1000) / interval
    let step = 0

    const cycleTimer = setInterval(() => {
      step += 1
      setTimeProgress((step / totalSteps) * 100)

      if (step >= totalSteps) {
        step = 0
        setTimeProgress(0)
        setActiveScreen(prev => {
          if (prev === 'screen_1') return 'screen_2'
          if (prev === 'screen_2') return 'screen_3'
          return 'screen_1'
        })
      }
    }, interval)

    return () => clearInterval(cycleTimer)
  }, [isAutoCycle, cycleSeconds])

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  // Telemetry KPIs
  const onlineCount = devices.filter(d => Boolean(d.is_online)).length
  const totalCount = devices.length || 6
  const totalServices = services.length || 6
  const downServices = services.filter(s => s.last_status === 'DOWN').length
  const upServices = totalServices - downServices
  const avgLatency = summary?.avg_latency_ms || 24

  return (
    <div className="fixed inset-0 z-50 bg-[#070709] text-zinc-100 flex flex-col h-screen w-screen overflow-hidden select-none font-sans">
      {/* 1. TOP TACTICAL HUD HEADER BAR (Height ~44px) */}
      <header className="h-11 shrink-0 bg-zinc-950/90 border-b border-zinc-800/80 px-3 flex items-center justify-between gap-3 backdrop-blur-md relative z-20">
        {/* Left: Branding & Navigation Return */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onNavigateAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateAdmin}
              className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-mono gap-1 cursor-pointer"
              title="Quay lại giao diện quản trị"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Quản Trị</span>
            </Button>
          )}

          <div className="flex items-center gap-2 pl-1 border-l border-zinc-800">
            <div className="h-6 w-6 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Tv className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold tracking-wider text-xs text-zinc-100">
                MESHGUARD SOC
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
          </div>

          {/* Screen Preset Tabs */}
          <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5 ml-2 text-xs font-mono">
            <button
              onClick={() => setActiveScreen('screen_1')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                activeScreen === 'screen_1'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              [1] Sơ Đồ &amp; Radar
            </button>
            <button
              onClick={() => setActiveScreen('screen_2')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                activeScreen === 'screen_2'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              [2] Tổng Quan
            </button>
            <button
              onClick={() => setActiveScreen('screen_3')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                activeScreen === 'screen_3'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              [3] Chuyên Sâu
            </button>
          </div>
        </div>

        {/* Center: Live Digital Clock & System Pulse */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded-md text-emerald-400">
            <Clock className="h-3 w-3 text-emerald-500" />
            <span className="font-bold tracking-widest">{currentTime}</span>
            <span className="text-[10px] text-zinc-500">{utcTime}</span>
          </div>

          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="flex items-center gap-1 text-zinc-400">
              <Server className="h-3 w-3 text-blue-400" />
              <strong className="text-zinc-100">{onlineCount}/{totalCount} UP</strong>
            </span>
            <span className="flex items-center gap-1 text-zinc-400">
              <Cpu className="h-3 w-3 text-indigo-400" />
              <strong className={downServices > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                {upServices}/{totalServices} UP
              </strong>
            </span>
            <span className="flex items-center gap-1 text-zinc-400">
              <Wifi className="h-3 w-3 text-emerald-400" />
              <strong className="text-emerald-400">{avgLatency}ms</strong>
            </span>
          </div>
        </div>

        {/* Right: Kiosk Auto-Cycle, Refresh & Fullscreen Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Auto-Cycle Kiosk Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoCycle(!isAutoCycle)}
              className={`h-7 px-2 text-[11px] font-mono gap-1 border-zinc-800 cursor-pointer ${
                isAutoCycle
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={isAutoCycle ? 'Dừng tự động xoay màn hình' : 'Bật tự động xoay màn hình (15s)'}
            >
              {isAutoCycle ? (
                <Pause className="h-3 w-3 text-emerald-400" />
              ) : (
                <Play className="h-3 w-3 text-zinc-400" />
              )}
              <span className="hidden sm:inline">Auto-Cycle</span>
            </Button>
            {isAutoCycle && (
              <div
                className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 transition-all duration-100"
                style={{ width: `${timeProgress}%` }}
              />
            )}
          </div>

          {/* Refresh Data */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-7 w-7 p-0 text-zinc-400 hover:text-white cursor-pointer"
              title="Làm mới dữ liệu telemetry"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Fullscreen Kiosk Mode */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-7 px-2 text-[11px] font-mono gap-1 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
            title="Bật/Tắt Toàn Màn Hình F11 Kiosk"
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu Nhỏ' : 'Toàn Màn'}</span>
          </Button>
        </div>
      </header>

      {/* 2. THE 12×6 EDGE-TO-EDGE FULL-SCREEN GRID (Height: 100vh - 44px) */}
      <main className="flex-1 min-h-0 w-full p-2 bg-[#060608] overflow-hidden">
        {/* =========================================================================
            SCREEN 1: SƠ ĐỒ MÁY CHỦ NÉT ĐỨT (REACT FLOW) & TOPOLOGY RADAR (12×6 GRID)
            - Row 1-4 (Height 4): Dedicated Server Topology (col 8) + Mesh Radar (col 4)
            - Row 5-6 (Height 2): Service Matrix (col 5) + Latency Chart (col 4) + KPIs (col 3)
            Total: 72 Cells (100% Filled, Zero Overflow)
            ========================================================================= */}
        {activeScreen === 'screen_1' && (
          <div className="grid grid-cols-12 grid-rows-6 gap-2 w-full h-full">
            {/* Slot 1: Dedicated Server Topology with Dashed Service Boundaries (8 cols × 4 rows) */}
            <div className="col-span-8 row-span-4 min-h-0 min-w-0 overflow-hidden">
              <DedicatedTopologyWidget
                devices={devices}
                services={services}
                slotSize="8×4"
              />
            </div>

            {/* Slot 2: High-Tech Topology Radar with Sweep Beam (4 cols × 4 rows) */}
            <div className="col-span-4 row-span-4 min-h-0 min-w-0 overflow-hidden">
              <MeshTopologyRadarWidget
                devices={devices}
                slotSize="4×4"
              />
            </div>

            {/* Slot 3: Service Status Matrix (5 cols × 2 rows) */}
            <div className="col-span-5 row-span-2 min-h-0 min-w-0 overflow-hidden">
              <TcpPortStatusGridWidget
                services={services}
                slotSize="5×2"
              />
            </div>

            {/* Slot 4: Live Latency Area Wave Chart (4 cols × 2 rows) */}
            <div className="col-span-4 row-span-2 min-h-0 min-w-0 overflow-hidden">
              <LatencyAreaChartWidget
                slotSize="4×2"
              />
            </div>

            {/* Slot 5 & 6: Stacked KPIs (3 cols × 2 rows total) */}
            <div className="col-span-3 row-span-2 min-h-0 min-w-0 flex flex-col gap-2">
              <div className="flex-1 min-h-0">
                <StatCardWidget
                  title="Thiết Bị Trực Tuyến"
                  value={`${onlineCount} / ${totalCount}`}
                  subValue="Toàn bộ trạm Mesh sẵn sàng"
                  icon={Server}
                  color="blue"
                  trend="up"
                  trendText="100% Up"
                  slotSize="3×1"
                />
              </div>
              <div className="flex-1 min-h-0">
                <StatCardWidget
                  title="Dịch Vụ Sẵn Sàng"
                  value={`${upServices} / ${totalServices}`}
                  subValue={downServices > 0 ? `${downServices} dịch vụ DOWN` : '100% Hoạt Động'}
                  icon={Activity}
                  color={downServices > 0 ? 'rose' : 'emerald'}
                  trend={downServices > 0 ? 'down' : 'neutral'}
                  trendText={downServices > 0 ? 'Sự Cố' : 'Chuẩn'}
                  slotSize="3×1"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 2: TỔNG QUAN SOC & HIỆU NĂNG GIÁM SÁT (12×6 GRID)
            - Row 1 (Height 1): 4 Stat Cards KPI Banner (4 × 3 cols)
            - Row 2-4 (Height 3): Latency Chart (col 6) + Comparative Latency (col 6)
            - Row 5-6 (Height 2): Service Table (col 6) + Mesh Nodes (col 3) + Action Pad (col 3)
            Total: 72 Cells (100% Filled, Zero Overflow)
            ========================================================================= */}
        {activeScreen === 'screen_2' && (
          <div className="grid grid-cols-12 grid-rows-6 gap-2 w-full h-full">
            {/* Row 1: 4 Top KPI Tiles */}
            <div className="col-span-3 row-span-1 min-h-0 min-w-0">
              <StatCardWidget
                title="Node Tailscale"
                value={`${onlineCount} / ${totalCount}`}
                subValue="Mesh VPN Active"
                icon={Server}
                color="blue"
                trend="up"
                trendText="Live"
                slotSize="3×1"
              />
            </div>
            <div className="col-span-3 row-span-1 min-h-0 min-w-0">
              <StatCardWidget
                title="Dịch Vụ Đang Chạy"
                value={`${upServices} / ${totalServices}`}
                subValue="TCP / HTTP Monitored"
                icon={Activity}
                color={downServices > 0 ? 'rose' : 'emerald'}
                trend={downServices > 0 ? 'down' : 'up'}
                trendText={downServices > 0 ? '1 Down' : '100%'}
                slotSize="3×1"
              />
            </div>
            <div className="col-span-3 row-span-1 min-h-0 min-w-0">
              <StatCardWidget
                title="Độ Trễ Trung Bình"
                value={`${avgLatency} ms`}
                subValue="Ping RTT Mesh Hub"
                icon={Wifi}
                color="purple"
                trend="up"
                trendText="-3ms"
                slotSize="3×1"
              />
            </div>
            <div className="col-span-3 row-span-1 min-h-0 min-w-0">
              <SocClockWidget slotSize="3×1" />
            </div>

            {/* Row 2-4: Twin Heavyweight Performance Charts */}
            <div className="col-span-6 row-span-3 min-h-0 min-w-0 overflow-hidden">
              <LatencyAreaChartWidget
                title="Biểu Đồ Biến Thiên Độ Trễ Thời Gian Thực (Live RTT Stream)"
                slotSize="6×3"
              />
            </div>
            <div className="col-span-6 row-span-3 min-h-0 min-w-0 overflow-hidden">
              <ComparativeLatencyChartWidget
                slotSize="6×3"
              />
            </div>

            {/* Row 5-6: Service Table, Mesh Nodes & Action Pad */}
            <div className="col-span-6 row-span-2 min-h-0 min-w-0 overflow-hidden">
              <ServiceCompactTableWidget
                services={services}
                onRefresh={onRefresh}
                slotSize="6×2"
              />
            </div>
            <div className="col-span-3 row-span-2 min-h-0 min-w-0 overflow-hidden">
              <MeshNodesWidget
                devices={devices}
                slotSize="3×2"
              />
            </div>
            <div className="col-span-3 row-span-2 min-h-0 min-w-0 overflow-hidden">
              <QuickActionPadWidget
                onSyncTailscale={onSyncTailscale}
                onRefreshData={onRefresh}
                onShowToast={onShowToast}
                slotSize="3×2"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 3: CHUYÊN SÂU MẠNG, TỶ LỆ RỚT GÓI & TELEMETRY (12×6 GRID)
            - Row 1 (Height 1): Uptime Ribbon Bar (col 12)
            - Row 2-3 (Height 2): Service Matrix (col 5) + Packet Loss (col 4) + DERP Map (col 3)
            - Row 4-6 (Height 3): Audit Terminal (col 5) + Scrollable Uptime Matrix (col 4) + Radar (col 3)
            Total: 72 Cells (100% Filled, Zero Overflow)
            ========================================================================= */}
        {activeScreen === 'screen_3' && (
          <div className="grid grid-cols-12 grid-rows-6 gap-2 w-full h-full">
            {/* Row 1: Full 12-col Uptime Ribbon Bar */}
            <div className="col-span-12 row-span-1 min-h-0 min-w-0 overflow-hidden">
              <UptimeRibbonWidget
                slotSize="12×1"
              />
            </div>

            {/* Row 2-3: Service Matrix, Packet Loss & DERP Relay */}
            <div className="col-span-5 row-span-2 min-h-0 min-w-0 overflow-hidden">
              <TcpPortStatusGridWidget
                services={services}
                slotSize="5×2"
              />
            </div>
            <div className="col-span-4 row-span-2 min-h-0 min-w-0 overflow-hidden">
              <PacketLossBarWidget
                slotSize="4×2"
              />
            </div>
            <div className="col-span-3 row-span-2 min-h-0 min-w-0 overflow-hidden">
              <DerpRegionMapWidget
                slotSize="3×2"
              />
            </div>

            {/* Row 4-6: Audit Log Terminal, Scrollable Service Uptime & Radar */}
            <div className="col-span-5 row-span-3 min-h-0 min-w-0 overflow-hidden">
              <AuditLogTerminalWidget
                slotSize="5×3"
              />
            </div>
            <div className="col-span-4 row-span-3 min-h-0 min-w-0 overflow-hidden">
              <ServiceUptimeMatrixWidget
                services={services}
                slotSize="4×3"
              />
            </div>
            <div className="col-span-3 row-span-3 min-h-0 min-w-0 overflow-hidden">
              <MeshTopologyRadarWidget
                devices={devices}
                slotSize="3×3"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
