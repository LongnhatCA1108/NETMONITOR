// ponytail: service editing modal with standard validation and zero boilerplate
import React, { useState, useEffect } from 'react'
import { Pencil, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { servicesService } from '@/modules/services'
import type { MonitoredService, ServiceCategory, ServiceCheckType } from '@/modules/services'
import type { Device } from '@/modules/devices'

export interface EditServiceModalProps {
  service: MonitoredService | null
  open: boolean
  onOpenChange: (open: boolean) => void
  devices: Device[]
  onServiceUpdated: (updated: MonitoredService) => void
  onShowToast?: (msg: string) => void
}

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  open,
  onOpenChange,
  devices,
  onServiceUpdated,
  onShowToast,
}) => {
  const [deviceId, setDeviceId] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ServiceCategory>('application')
  const [port, setPort] = useState('')
  const [type, setType] = useState<ServiceCheckType>('http')
  const [path, setPath] = useState('/')
  const [intervalSec, setIntervalSec] = useState('60')
  const [description, setDescription] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (service) {
      setDeviceId(service.device_id || devices[0]?.node_id || '')
      setName(service.name || '')
      setCategory(service.category || 'application')
      setPort(String(service.port || ''))
      setType(service.type || 'http')
      setPath(service.path || '/')
      setIntervalSec(String(service.interval_sec || '60'))
      setDescription(service.description || '')
      setEnabled(service.enabled !== undefined ? !!service.enabled : true)
      setError('')
    }
  }, [service, devices])

  if (!service) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên dịch vụ')
      return
    }
    if (!deviceId) {
      setError('Vui lòng chọn thiết bị host')
      return
    }
    const portNum = Number(port)
    if (!port || isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Cổng (Port) phải là số từ 1 đến 65535')
      return
    }

    setLoading(true)
    setError('')

    try {
      const updated = await servicesService.updateService(service.id, {
        device_id: deviceId,
        name: name.trim(),
        category,
        port: portNum,
        type,
        path: type === 'http' ? path.trim() || '/' : '',
        interval_sec: Number(intervalSec) || 60,
        description: description.trim(),
        enabled: enabled ? 1 : 0,
      })

      if (onShowToast) onShowToast(`Đã cập nhật dịch vụ "${updated.name}" thành công!`)
      onOpenChange(false)
      onServiceUpdated(updated)
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi cập nhật dịch vụ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Chỉnh Sửa Dịch Vụ
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 font-mono mt-0.5">
                ID #{service.id} • Host hiện tại: {service.hostname || service.device_id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 p-3.5 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Tên dịch vụ & Danh mục */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Tên Dịch Vụ <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ví dụ: MobileNas, API Relay..."
                className="h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Danh Mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="application">Ứng dụng (Application)</option>
                <option value="database">Cơ sở dữ liệu (Database)</option>
                <option value="storage">Lưu trữ / NAS (Storage)</option>
              </select>
            </div>
          </div>

          {/* Thiết bị Host */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Thiết Bị Host (Tailscale Node)
            </label>
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {devices.map((d) => (
                <option key={d.node_id} value={d.node_id}>
                  {d.alias ? `${d.alias} (${d.hostname})` : d.hostname} ({d.ip}) — {d.node_type}
                </option>
              ))}
            </select>
          </div>

          {/* Port & Protocol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Cổng Mạng (Port) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="ví dụ: 8080, 5432, 22..."
                className="h-10 text-sm font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Giao Thức Kiểm Tra
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ServiceCheckType)}
                className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="tcp">TCP Socket (Kiểm tra mở cổng)</option>
                <option value="http">HTTP Health Check (2xx/3xx)</option>
              </select>
            </div>
          </div>

          {/* Path (nếu chọn HTTP) */}
          {type === 'http' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Đường Dẫn HTTP Health Check (Path)
              </label>
              <Input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/ hoặc /healthz hoặc /api/ping"
                className="h-10 text-sm font-mono"
              />
            </div>
          )}

          {/* Chu kỳ & Trạng thái bật/tắt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Tần Suất Quét Ping
              </label>
              <select
                value={intervalSec}
                onChange={(e) => setIntervalSec(e.target.value)}
                className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="30">30 giây (Nhanh)</option>
                <option value="60">60 giây (Tiêu chuẩn)</option>
                <option value="120">2 phút</option>
                <option value="300">5 phút</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer h-10 select-none">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {enabled ? 'Đang kích hoạt giám sát' : 'Tạm dừng giám sát'}
                </span>
              </label>
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Ghi Chú / Mô Tả
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú về dịch vụ (tùy chọn)"
              className="h-10 text-sm"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={() => onOpenChange(false)}
              className="text-sm text-zinc-500 cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="default"
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-500 text-sm font-semibold px-6 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              <span>Lưu thay đổi</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
