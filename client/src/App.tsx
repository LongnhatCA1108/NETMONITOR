// ponytail: root app connecting react-router-dom routes, modular Layout and page components
import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout'
import {
  HomePage,
  DevicesPage,
  ServicesPage,
  SystemSettingsPage,
  SocSettingsPage,
  DashboardDemoPage,
  SocFullscreenDashboardPage,
} from '@/pages'
import { DeviceDetailModal } from '@/pages/devices'
import { ServiceDetailModal } from '@/pages/services'
import {
  dashboardService,
  devicesService,
  servicesService,
  settingsService,
  type Device,
  type MonitoredService,
  type DashboardSummary,
} from '@/modules'

export default function App() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [services, setServices] = useState<MonitoredService[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [inspectDevice, setInspectDevice] = useState<Device | null>(null)
  const [inspectService, setInspectService] = useState<MonitoredService | null>(null)
  const [inspectServiceTab, setInspectServiceTab] = useState<'overview' | 'edit'>('overview')
  const [notification, setNotification] = useState<string | null>(null)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)

  // Light / Dark Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('app-theme') as 'dark' | 'light') || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('app-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  // Load all dashboard data
  const loadData = useCallback(async () => {
    try {
      const [sumData, devData, srvData] = await Promise.all([
        dashboardService.getSummary(),
        devicesService.getDevices(),
        servicesService.getServices(),
      ])
      setSummary(sumData)
      setDevices(devData)
      setServices(srvData)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu từ API:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    // Poll data every 10 seconds
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [loadData])

  // Sync Tailscale devices
  const handleSyncTailscale = async () => {
    setSyncing(true)
    try {
      const res = await settingsService.syncTailscaleDevices()
      showToast(res.message || 'Đã đồng bộ thành công với Tailscale!')
      await loadData()
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi đồng bộ thiết bị!')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <>
      <Routes>
        {/* 1. Dedicated Standalone 100vh Fullscreen SOC Dashboard */}
        <Route
          path="/soc"
          element={
            <SocFullscreenDashboardPage
              summary={summary}
              devices={devices}
              services={services}
              onNavigateAdmin={() => navigate('/')}
              onRefresh={loadData}
              onShowToast={showToast}
              onSyncTailscale={handleSyncTailscale}
            />
          }
        />

        {/* 2. Admin Layout Routes */}
        <Route
          path="*"
          element={
            <Layout
              summary={summary}
              syncing={syncing}
              onSync={handleSyncTailscale}
              theme={theme}
              onToggleTheme={toggleTheme}
              sidebarMobileOpen={sidebarMobileOpen}
              onToggleSidebarMobile={() => setSidebarMobileOpen(!sidebarMobileOpen)}
              onCloseSidebarMobile={() => setSidebarMobileOpen(false)}
              notification={notification}
            >
              {loading ? (
                <div className="flex h-72 flex-col items-center justify-center gap-3.5 text-zinc-500">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-300 dark:border-zinc-700 border-t-blue-600" />
                  <p className="text-sm font-mono font-medium">Đang kết nối tới Mesh Agent...</p>
                </div>
              ) : (
                <Routes>
                  <Route
                    path="/"
                    element={
                      <HomePage
                        summary={summary}
                        devices={devices}
                        services={services}
                        onNavigate={(tab) => navigate(tab.startsWith('/') ? tab : `/${tab}`)}
                        onSelectDevice={(dev) => setInspectDevice(dev)}
                        onSelectService={(srv) => {
                          setInspectService(srv)
                          setInspectServiceTab('overview')
                        }}
                      />
                    }
                  />

                  <Route
                    path="/widgets"
                    element={
                      <DashboardDemoPage
                        summary={summary}
                        devices={devices}
                        services={services}
                        onRefresh={loadData}
                        onShowToast={showToast}
                        onSyncTailscale={handleSyncTailscale}
                        onOpenSocFullscreen={() => navigate('/soc')}
                      />
                    }
                  />

                  {/* Backward-compatible redirect for demo */}
                  <Route
                    path="/dashboard-demo"
                    element={<Navigate to="/widgets" replace />}
                  />

                  <Route
                    path="/devices"
                    element={
                      <DevicesPage
                        devices={devices}
                        services={services}
                        onSelectServiceTab={() => navigate('/services')}
                        onSelectService={(srv) => {
                          setInspectService(srv)
                          setInspectServiceTab('overview')
                        }}
                        onRefreshDevices={loadData}
                        onShowToast={showToast}
                        onNavigateSettings={() => navigate('/settings')}
                        onSyncTailscale={handleSyncTailscale}
                      />
                    }
                  />

                  <Route
                    path="/services"
                    element={
                      <ServicesPage
                        services={services}
                        devices={devices}
                        isAddModalOpen={isAddServiceOpen}
                        onOpenAddModal={() => setIsAddServiceOpen(true)}
                        onCloseAddModal={() => setIsAddServiceOpen(false)}
                        onRefresh={loadData}
                        onSelectDevice={(dev) => setInspectDevice(dev)}
                      />
                    }
                  />

                  <Route
                    path="/settings"
                    element={<SystemSettingsPage onShowToast={showToast} />}
                  />

                  <Route
                    path="/settings/soc"
                    element={<SocSettingsPage onShowToast={showToast} />}
                  />

                  {/* Fallback to Home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              )}
            </Layout>
          }
        />
      </Routes>

      {/* Global Device Detail Modal */}
      <DeviceDetailModal
        device={inspectDevice}
        open={!!inspectDevice}
        onOpenChange={(open) => !open && setInspectDevice(null)}
        services={services}
        onSelectService={(srv) => {
          setInspectDevice(null)
          setInspectService(srv)
          setInspectServiceTab('overview')
        }}
        onEditService={(srv) => {
          setInspectDevice(null)
          setInspectService(srv)
          setInspectServiceTab('edit')
        }}
      />

      {/* Global Service Detail Modal */}
      <ServiceDetailModal
        service={inspectService}
        open={!!inspectService}
        onOpenChange={(open) => !open && setInspectService(null)}
        devices={devices}
        initialTab={inspectServiceTab}
        onSelectDevice={(dev) => {
          setInspectService(null)
          setInspectDevice(dev)
        }}
        onRefresh={loadData}
      />
    </>
  )
}
