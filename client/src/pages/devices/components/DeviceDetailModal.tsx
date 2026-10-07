import { useState, useEffect } from 'react'
import {
  Server,
  Laptop,
  Radio,
  ExternalLink,
  Clock,
  Shield,
  Activity,
  Database,
  HardDrive,
  Globe,
  Wifi,
  WifiOff,
  Pencil,
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
import { UptimeGrid } from '@/components/ui/UptimeGrid'
import { devicesService } from '@/modules/devices'
import type { Device, UptimeDayData } from '@/modules/devices'
import type { MonitoredService } from '@/modules/services'

export interface DeviceDetailModalProps {
  device: Device | null
  open: boolean
  onOpenChange: (open: boolean) => void
  services: MonitoredService[]
  onSelectService?: (service: MonitoredService) => void
  onEditService?: (service: MonitoredService) => void
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  device,
  open,
  onOpenChange,
  services,
  onSelectService,
  onEditService,
}) => {
  if (!device) return null

  const isServerOrHub = device.node_type === 'server' || device.node_type === 'monitor'
  const isOnline = !!device.is_online
  const nodeServices = services.filter((s) => s.device_id === device.node_id)
  const connectionLogs = device.connection_log || []

  const [uptimeDays, setUptimeDays] = useState<UptimeDayData[]>([])

  useEffect(() => {
    if (open && device && isServerOrHub) {
      devicesService
        .getDeviceUptime(device.node_id)
        .then((data: UptimeDayData[]) => setUptimeDays(data))
        .catch(() => setUptimeDays([]))
    }
  }, [open, device?.node_id, isServerOrHub])

  const validDays = uptimeDays.filter((d) => d.status !== 'NO_DATA')
  const hasMetrics = validDays.length > 0
  const avgUptime = hasMetrics
    ? Math.round((validDays.reduce((acc, d) => acc + d.uptime, 0) / validDays.length) * 10) / 10
    : isOnline
    ? 100.0
    : 0.0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden w-full">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full ${
                isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-zinc-400'
              }`}
            />
            <DialogTitle className="text-xl font-bold tracking-tight">
              {device.alias || device.hostname}
            </DialogTitle>
            <Badge
              variant={
                device.node_type === 'server'
                  ? 'purple'
                  : device.node_type === 'endpoint'
                  ? 'warning'
                  : 'blue'
              }
              className="text-xs font-bold uppercase tracking-wider"
            >
              {device.node_type === 'server' ? (
                <span className="flex items-center gap-1">
                  <Server className="h-3.5 w-3.5" /> Server
                </span>
              ) : device.node_type === 'endpoint' ? (
                <span className="flex items-center gap-1">
                  <Laptop className="h-3.5 w-3.5" /> Client Endpoint
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Radio className="h-3.5 w-3.5" /> Monitor Hub
                </span>
              )}
            </Badge>
          </div>
          <DialogDescription className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            {device.alias && (
              <span className="mr-2">
                Hostname: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{device.hostname}</span> •
              </span>
            )}
            Node ID: {device.node_id} • IP: <span className="font-bold text-zinc-700 dark:text-zinc-300">{device.ip}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* 1. General Spec Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800 text-sm">
            <div>
              <span className="text-xs text-zinc-500 font-medium">Hệ điều hành</span>
              <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">{device.os}</div>
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-medium">Phiên bản Tailscale</span>
              <div className="font-mono text-zinc-900 dark:text-zinc-100 mt-0.5 font-bold">{device.client_version}</div>
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-medium">Trạng thái</span>
              <div className={`font-bold mt-0.5 ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                {isOnline ? 'Online (Đang kết nối)' : 'Offline'}
              </div>
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-medium">Lần cuối thấy</span>
              <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 font-semibold">
                {new Date(device.last_seen).toLocaleTimeString('vi-VN')}
              </div>
            </div>
          </div>

          {/* 2. CASE A: CLIENT ENDPOINT (Chỉ cần lịch sử truy cập gần đây) */}
          {!isServerOrHub && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Lịch Sử Truy Cập & Kết Nối Gần Đây (Access Log)
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {connectionLogs.length} phiên ghi nhận
                </span>
              </div>

              <div className="space-y-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-4 max-h-60 overflow-y-auto pr-1">
                {connectionLogs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400 font-mono">
                    Chưa ghi nhận phiên kết nối nào. Hệ thống sẽ tự động lưu vết khi thiết bị kết nối/ngắt kết nối qua Tailscale.
                  </div>
                ) : (
                  connectionLogs.map((log, index) => {
                    const isConn = log.event === 'connected' || log.event === 'started'
                    return (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/60 text-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 p-1.5 rounded-lg ${
                              isConn
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            {isConn ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                                {log.event === 'connected' ? 'Đã kết nối' : log.event === 'disconnected' ? 'Ngắt kết nối' : log.event}
                              </span>
                              <Badge variant={isConn ? 'success' : 'secondary'} className="text-[10px] py-0 font-mono">
                                {log.event}
                              </Badge>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                              {log.note || 'Phiên kết nối mạng Tailscale'}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-zinc-500 shrink-0 mt-0.5 font-medium">
                          {log.time}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Security & Device Attributes */}
              {device.tags && device.tags.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide font-mono flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-blue-500" /> Tags phân quyền ACL:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {device.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. CASE B: SERVER (Chi tiết Uptime + Dải ô vuông + Danh sách dịch vụ) */}
          {isServerOrHub && (
            <div className="space-y-6">
              {/* Uptime Box & Compact Squares Component */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-4 space-y-3 w-full max-w-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Tình Trạng Sẵn Sàng Của Máy Chủ (Server Uptime)
                    </span>
                  </div>
                  <Badge variant={isOnline ? 'success' : 'danger'} className="text-xs font-bold">
                    {isOnline ? (hasMetrics ? `${avgUptime.toFixed(1)}% Uptime SLA` : 'Online (Hoạt động)') : 'Đang Gián Đoạn'}
                  </Badge>
                </div>

                {/* Uptime Grid */}
                <UptimeGrid
                  defaultDays={7}
                  overallUptime={avgUptime}
                  daysData={uptimeDays}
                />
              </div>

              {/* Running Services List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Server className="h-4 w-4 text-purple-500" />
                    Danh Sách Dịch Vụ Đang Chạy ({nodeServices.length})
                  </div>
                </div>

                {nodeServices.length === 0 ? (
                  <div className="text-sm text-zinc-500 italic p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    Chưa có dịch vụ nào được cấu hình giám sát trên máy chủ này.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {nodeServices.map((srv) => (
                      <div
                        key={srv.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-sm group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {srv.category === 'database' && <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                            {srv.category === 'storage' && <HardDrive className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                            {srv.category === 'application' && <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100">{srv.name}</span>
                              <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                :{srv.port}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {srv.type.toUpperCase()} • Ping mỗi {srv.interval_sec}s
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                            {srv.last_latency_ms} ms
                          </span>
                          <Badge variant={srv.last_status === 'UP' ? 'success' : 'danger'} className="text-xs font-bold">
                            {srv.last_status}
                          </Badge>
                          {onEditService && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onOpenChange(false)
                                onEditService(srv)
                              }}
                              className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 h-8 font-semibold cursor-pointer gap-1"
                            >
                              <Pencil className="h-3 w-3" />
                              Sửa
                            </Button>
                          )}
                          {onSelectService && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onOpenChange(false)
                                onSelectService(srv)
                              }}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 h-8 font-semibold cursor-pointer"
                            >
                              Xem dịch vụ <ExternalLink className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Server Audit / Events */}
              {connectionLogs.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-mono">
                    Nhật ký kiểm toán Daemon:
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {connectionLogs.map((log, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-100/60 dark:bg-zinc-900/40 text-xs font-mono text-zinc-600 dark:text-zinc-400"
                      >
                        <span>• {log.note}</span>
                        <span className="text-zinc-400">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
