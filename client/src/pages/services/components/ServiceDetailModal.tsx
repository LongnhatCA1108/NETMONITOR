// ponytail: comprehensive service detail modal with 100% REAL data and full in-place service editing panel
import React, { useState, useEffect } from 'react'
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Database,
  HardDrive,
  Globe,
  Radio,
  Pencil,
  Save,
  AlertCircle,
  Server,
  ArrowRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UptimeGrid } from '@/components/ui/UptimeGrid'
import { servicesService } from '@/modules/services'
import type {
  MonitoredService,
  ServiceCategory,
  ServiceCheckType,
  ServiceHistoryPoint,
  ServiceIncident,
} from '@/modules/services'
import type { Device, UptimeDayData } from '@/modules/devices'

export interface ServiceDetailModalProps {
  service: MonitoredService | null
  open: boolean
  onOpenChange: (open: boolean) => void
  devices: Device[]
  onSelectDevice?: (device: Device) => void
  onRefresh?: () => void
  onEdit?: (service: MonitoredService) => void
  initialTab?: 'overview' | 'edit'
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  open,
  onOpenChange,
  devices,
  onSelectDevice,
  onRefresh,
  onEdit,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'edit'>(initialTab)
  const [history, setHistory] = useState<ServiceHistoryPoint[]>([])
  const [historyMode, setHistoryMode] = useState<'recent' | 'hourly'>('recent')
  const [incidents, setIncidents] = useState<ServiceIncident[]>([])
  const [uptimeDays, setUptimeDays] = useState<UptimeDayData[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [testingPing, setTestingPing] = useState(false)
  const [pingResult, setPingResult] = useState<string | null>(null)

  // Edit panel form states
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState<ServiceCategory>('application')
  const [editDeviceId, setEditDeviceId] = useState('')
  const [editPort, setEditPort] = useState('')
  const [editType, setEditType] = useState<ServiceCheckType>('http')
  const [editPath, setEditPath] = useState('/')
  const [editIntervalSec, setEditIntervalSec] = useState('60')
  const [editDescription, setEditDescription] = useState('')
  const [editEnabled, setEditEnabled] = useState(true)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccessMsg, setEditSuccessMsg] = useState('')

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab || 'overview')
      setEditError('')
      setEditSuccessMsg('')
      setPingResult(null)
    }
  }, [open, initialTab])

  useEffect(() => {
    if (service) {
      setEditName(service.name || '')
      setEditCategory(service.category || 'application')
      setEditDeviceId(service.device_id || devices[0]?.node_id || '')
      setEditPort(String(service.port || ''))
      setEditType(service.type || 'http')
      setEditPath(service.path || '/')
      setEditIntervalSec(String(service.interval_sec || '60'))
      setEditDescription(service.description || '')
      setEditEnabled(service.enabled !== undefined ? !!service.enabled : true)
    }
  }, [service, devices])

  useEffect(() => {
    if (open && service && activeTab === 'overview') {
      setLoadingHistory(true)
      setPingResult(null)

      Promise.all([
        servicesService.getServiceHistory(service.id, 20, historyMode).catch(() => []),
        servicesService.getServiceIncidents(service.id).catch(() => []),
        servicesService.getServiceUptime(service.id).catch(() => []),
      ])
        .then(([histData, incData, uptimeData]) => {
          setHistory(histData)
          setIncidents(incData)
          setUptimeDays(uptimeData)
        })
        .finally(() => setLoadingHistory(false))
    }
  }, [open, service, historyMode, activeTab])

  if (!service) return null

  const isUp = service.last_status === 'UP'
  const matchedDevice = devices.find(
    (d) => d.node_id === (activeTab === 'edit' ? editDeviceId : service.device_id)
  )

  const handleTestPing = async () => {
    setTestingPing(true)
    setPingResult(null)
    try {
      const res = await servicesService.testPingService(service.id)
      if (res.ok) {
        setPingResult(`Thành công: 200 OK (${res.latency}ms)`)
      } else {
        setPingResult(`Thất bại: ${res.error || 'Không phản hồi'}`)
      }
      if (onRefresh) onRefresh()
    } catch (err: any) {
      setPingResult(`Lỗi kiểm tra: ${err.message}`)
    } finally {
      setTestingPing(false)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      setEditError('Vui lòng nhập tên dịch vụ')
      return
    }
    if (!editDeviceId) {
      setEditError('Vui lòng chọn thiết bị host')
      return
    }
    const portNum = Number(editPort)
    if (!editPort || isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setEditError('Cổng (Port) phải là số từ 1 đến 65535')
      return
    }

    setSavingEdit(true)
    setEditError('')
    setEditSuccessMsg('')

    try {
      const updated = await servicesService.updateService(service.id, {
        device_id: editDeviceId,
        name: editName.trim(),
        category: editCategory,
        port: portNum,
        type: editType,
        path: editType === 'http' ? editPath.trim() || '/' : '',
        interval_sec: Number(editIntervalSec) || 60,
        description: editDescription.trim(),
        enabled: editEnabled ? 1 : 0,
      })

      setEditSuccessMsg(`Đã cập nhật dịch vụ "${updated.name}" thành công!`)
      if (onRefresh) onRefresh()
    } catch (err: any) {
      setEditError(err?.message || 'Có lỗi xảy ra khi lưu thông tin dịch vụ')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden w-full">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400">
                {service.category === 'database' && <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                {service.category === 'storage' && <HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                {service.category === 'application' && <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    {service.name}
                  </DialogTitle>
                  <Badge
                    variant={isUp ? 'success' : service.last_status === 'PENDING' ? 'secondary' : 'danger'}
                    className="text-xs font-bold px-2 py-0.5"
                  >
                    {service.last_status === 'UP' ? 'UP (Hoạt động)' : service.last_status === 'PENDING' ? 'Đang chuẩn bị' : 'DOWN (Sự cố)'}
                  </Badge>
                </div>
                <DialogDescription className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
                  Port: <span className="font-bold text-blue-600 dark:text-blue-400">{service.port}</span>/{service.type.toUpperCase()}
                  {service.path ? ` (${service.path})` : ''} • Quét mỗi {service.interval_sec}s
                </DialogDescription>
              </div>
            </div>

            {/* Quick Toggle to Edit / Overview */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextTab = activeTab === 'edit' ? 'overview' : 'edit'
                setActiveTab(nextTab)
                setEditSuccessMsg('')
                if (nextTab === 'edit' && onEdit) onEdit(service)
              }}
              className={`shrink-0 gap-1.5 h-8 font-medium text-xs cursor-pointer ${
                activeTab === 'edit'
                  ? 'border-blue-500/60 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-600 dark:text-amber-400'
              }`}
            >
              {activeTab === 'edit' ? (
                <>
                  <Activity className="h-3.5 w-3.5" />
                  <span>Xem đo đạc</span>
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Sửa thông tin</span>
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2.5 pt-1">
          <button
            type="button"
            onClick={() => { setActiveTab('overview'); setEditSuccessMsg('') }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Đo Đạc & Giám Sát</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Sửa Thông Tin Service</span>
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-6 pt-2">
            {/* 1. Quick Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800 text-sm">
              <div>
                <span className="text-xs text-zinc-500 font-medium">Uptime 24 giờ</span>
                <div className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
                  {service.uptime_24h.toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-medium">Độ trễ gần nhất</span>
                <div className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
                  {service.last_latency_ms} ms
                </div>
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-medium">Trạng thái</span>
                <div className={`font-extrabold text-base mt-0.5 ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {service.last_status}
                </div>
              </div>
              <div>
                <span className="text-xs text-zinc-500 font-medium">Lần kiểm tra cuối</span>
                <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 font-semibold">
                  {service.last_check ? new Date(service.last_check).toLocaleTimeString('vi-VN') : 'Chưa quét'}
                </div>
              </div>
            </div>

            {/* 2. Interactive Uptime Grid */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-4 space-y-2 w-full max-w-full overflow-hidden">
              <UptimeGrid
                defaultDays={7}
                overallUptime={service.uptime_24h}
                daysData={uptimeDays}
              />
            </div>

            {/* 3. Latency Chart */}
            <div className="space-y-3 w-full max-w-full overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Biểu Đồ Độ Trễ
                  </span>
                  <div className="flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-900 p-0.5 border border-zinc-200/80 dark:border-zinc-800 text-[11px] font-semibold ml-1">
                    <button
                      type="button"
                      onClick={() => setHistoryMode('recent')}
                      className={`px-2 py-0.5 rounded-[5px] transition-all cursor-pointer ${
                        historyMode === 'recent'
                          ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      20 gần nhất
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryMode('hourly')}
                      className={`px-2 py-0.5 rounded-[5px] transition-all cursor-pointer ${
                        historyMode === 'hourly'
                          ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      24h theo giờ
                    </button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestPing}
                  disabled={testingPing}
                  className="text-xs font-semibold h-8 cursor-pointer"
                >
                  {testingPing ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  <span>{testingPing ? 'Đang gửi gói tin...' : 'Ping kiểm tra ngay'}</span>
                </Button>
              </div>

              {pingResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono font-medium flex items-center gap-2 ${
                    pingResult.startsWith('Thành công')
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <Radio className="h-4 w-4 shrink-0" />
                  <span>Kết quả probe socket trực tiếp: {pingResult}</span>
                </div>
              )}

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-4 w-full max-w-full overflow-hidden">
                {loadingHistory ? (
                  <div className="h-28 flex items-center justify-center text-xs text-zinc-500 font-mono">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang tải dữ liệu độ trễ...
                  </div>
                ) : history.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-xs text-zinc-400 font-mono">
                    <Activity className="h-5 w-5 mb-1 text-zinc-400" />
                    <span>Chưa có dữ liệu độ trễ.</span>
                    <span className="text-[11px] text-zinc-500 mt-0.5">
                      Tiến trình kiểm tra ngầm đang đo đạc theo chu kỳ {service.interval_sec}s.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 w-full max-w-full overflow-hidden">
                    <div className="h-28 flex items-end gap-1 pt-3 w-full max-w-full min-w-0">
                      {history.slice(-20).map((pt, i) => {
                        const heightPct =
                          pt.status === 'DOWN' ? 12 : Math.min(100, Math.max(16, (pt.latency / 40) * 100))
                        const barColor =
                          pt.status === 'DOWN'
                            ? 'bg-rose-500'
                            : pt.latency > 25
                            ? 'bg-amber-400'
                            : 'bg-emerald-500 dark:bg-emerald-400'

                        return (
                          <div
                            key={i}
                            className="flex-1 min-w-0 flex flex-col items-center group/bar relative h-full justify-end cursor-pointer"
                          >
                            <div className="absolute -top-7 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] font-mono py-0.5 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-md">
                              {pt.time}: {pt.status === 'DOWN' ? 'DOWN' : `${pt.latency}ms`}
                            </div>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full min-w-0 rounded-t-[2px] transition-all ${barColor} group-hover/bar:brightness-110`}
                            />
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
                      <span>{history[0]?.time}</span>
                      <span className="text-zinc-500 text-[10px]">
                        {historyMode === 'recent'
                          ? `Khoảng cách: ~${service.interval_sec}s/lần`
                          : 'Tính trung bình theo giờ'}
                      </span>
                      <span>{history[history.length - 1]?.time} (Gần nhất)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Host Node Info */}
            {matchedDevice && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">
                      Máy chủ Host: {matchedDevice.alias || matchedDevice.hostname}
                    </div>
                    <div className="font-mono text-xs text-zinc-500">
                      IP: {matchedDevice.ip} • OS: {matchedDevice.os}
                    </div>
                  </div>
                </div>

                {onSelectDevice && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false)
                      onSelectDevice(matchedDevice)
                    }}
                    className="text-xs font-semibold h-8.5 cursor-pointer"
                  >
                    Xem máy chủ này <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            )}

            {/* 5. Incidents Log */}
            <div className="space-y-3">
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Lịch Sử Bật / Tắt & Sự Kiện Kiểm Tra (Real Incidents Log)
              </div>

              <div className="space-y-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-4 max-h-52 overflow-y-auto pr-1">
                {incidents.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400 font-mono">
                    Chưa ghi nhận sự cố nào. Dịch vụ đang hoạt động ổn định và an toàn.
                  </div>
                ) : (
                  incidents.map((inc) => {
                    const isDownLog = inc.event_type === 'STATUS_CHANGE' && inc.message.includes('DOWN')
                    return (
                      <div
                        key={inc.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/60 text-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 p-1.5 rounded-lg ${
                              isDownLog
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {isDownLog ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                {inc.event_type}
                              </span>
                              <Badge variant={isDownLog ? 'danger' : 'success'} className="text-[10px] py-0 font-bold font-mono">
                                {isDownLog ? 'SỰ CỐ' : 'HOẠT ĐỘNG'}
                              </Badge>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                              {inc.message}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-zinc-400 shrink-0 mt-0.5 font-medium">
                          {inc.formatted_time || new Date(inc.created_at).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ==============================================================
             PANEL CHỈNH SỬA THÔNG TIN SERVICE (IN-PLACE DEDICATED PANEL)
             ============================================================== */
          <div className="space-y-5 pt-2">
            {editError && (
              <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 p-3.5 text-sm text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {editSuccessMsg && (
              <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 p-3.5 text-sm text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-200">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span className="font-medium">{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Tên Dịch Vụ <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Ví dụ: NGINX, Vaultwarden, Ollama..."
                    className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Phân Loại Danh Mục
                  </label>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setEditCategory('application')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        editCategory === 'application'
                          ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Ứng dụng
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCategory('database')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        editCategory === 'database'
                          ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Database
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCategory('storage')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        editCategory === 'storage'
                          ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Storage/NAS
                    </button>
                  </div>
                </div>
              </div>

              {/* Host Node Device */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-blue-500" />
                    Host Node (Thiết Bị Cài Đặt) <span className="text-rose-500">*</span>
                  </span>
                  {matchedDevice && (
                    <span className="text-[11px] font-mono text-zinc-500">
                      IP: {matchedDevice.ip}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={editDeviceId}
                    onChange={(e) => setEditDeviceId(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {devices.map((d) => (
                      <option key={d.node_id} value={d.node_id}>
                        {d.alias ? `${d.alias} (${d.hostname})` : d.hostname} — {d.ip} {d.is_online ? '(Online)' : '(Offline)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Port & Protocol */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Cổng (Port) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="65535"
                    value={editPort}
                    onChange={(e) => setEditPort(e.target.value)}
                    placeholder="Ví dụ: 80, 443, 8080..."
                    className="h-10 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Giao Thức Kiểm Tra
                  </label>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setEditType('http')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        editType === 'http'
                          ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      HTTP Health
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditType('tcp')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        editType === 'tcp'
                          ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      TCP Socket
                    </button>
                  </div>
                </div>
              </div>

              {/* Path & Interval */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {editType === 'http' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Đường Dẫn HTTP (Path)
                    </label>
                    <Input
                      value={editPath}
                      onChange={(e) => setEditPath(e.target.value)}
                      placeholder="/ hoặc /api/health"
                      className="h-10 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Giao Thức Socket
                    </label>
                    <div className="h-10 px-3 flex items-center text-xs font-mono text-zinc-500 bg-zinc-100/70 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                      TCP Handshake Ping
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Tần Suất Quét Ping
                  </label>
                  <select
                    value={editIntervalSec}
                    onChange={(e) => setEditIntervalSec(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15">Mỗi 15 giây (Cảnh báo nhạy)</option>
                    <option value="30">Mỗi 30 giây (Khuyên dùng)</option>
                    <option value="60">Mỗi 1 phút (Tiết kiệm pin)</option>
                    <option value="120">Mỗi 2 phút</option>
                    <option value="300">Mỗi 5 phút</option>
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Trạng Thái Giám Sát
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {editEnabled ? 'Đang kích hoạt quét TCP/HTTP định kỳ' : 'Tạm dừng giám sát dịch vụ này'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditEnabled(!editEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    editEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Ghi Chú / Mô Tả Thêm
                </label>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Mô tả công dụng, tài khoản hoặc ghi chú quản trị..."
                  className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setActiveTab('overview'); setEditSuccessMsg('') }}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  Quay lại đo đạc
                </Button>

                <Button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-sm shadow-amber-600/20 cursor-pointer"
                >
                  {savingEdit ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>{savingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi Cấu Hình'}</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
