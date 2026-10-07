// ponytail: upscaled service creation modal with minimal form logic, standard validation, and theme support
import React, { useState } from 'react'
import { Plus, AlertCircle, Loader2 } from 'lucide-react'
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
import type { ServiceCategory, ServiceCheckType } from '@/modules/services'
import type { Device } from '@/modules/devices'

export interface AddServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  devices: Device[]
  onServiceCreated: () => void
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  open,
  onOpenChange,
  devices,
  onServiceCreated,
}) => {
  const [deviceId, setDeviceId] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ServiceCategory>('application')
  const [port, setPort] = useState('')
  const [type, setType] = useState<ServiceCheckType>('http')
  const [path, setPath] = useState('/')
  const [intervalSec, setIntervalSec] = useState('60')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setDeviceId(devices[0]?.node_id || '')
    setName('')
    setCategory('application')
    setPort('')
    setType('http')
    setPath('/')
    setIntervalSec('60')
    setDescription('')
    setError('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (!deviceId && devices.length > 0) {
        setDeviceId(devices[0].node_id)
      }
      setError('')
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên dịch vụ')
      return
    }
    if (!deviceId) {
      setError('Vui lòng chọn thiết bị')
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
      await servicesService.createService({
        device_id: deviceId,
        name: name.trim(),
        category,
        port: portNum,
        type,
        path: type === 'http' ? path.trim() || '/' : undefined,
        interval_sec: Number(intervalSec) || 60,
        description: description.trim(),
      })

      resetForm()
      onOpenChange(false)
      onServiceCreated()
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tạo dịch vụ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2.5">
            <Plus className="h-5 w-5 text-blue-500" />
            Thêm Dịch Vụ Mới
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
            Giám sát thêm một tiến trình, cổng mạng hoặc endpoint trên thiết bị Tailscale.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 p-3.5 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Chọn Node / Thiết bị */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Thiết bị Host (Tailscale Node)</label>
            {devices.length === 0 ? (
              <div className="p-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 font-medium">
                Chưa có thiết bị nào trong danh sách. Hãy đồng bộ thiết bị từ Tailscale trước.
              </div>
            ) : (
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {devices.map((d) => (
                  <option key={d.node_id} value={d.node_id}>
                    {d.alias ? `${d.alias} (${d.hostname})` : d.hostname} ({d.ip}) — {d.node_type}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tên dịch vụ & Danh mục */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Tên dịch vụ *</label>
              <Input
                placeholder="VD: PostgreSQL Master"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-sm h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="application">Ứng dụng (Application)</option>
                <option value="database">Cơ sở dữ liệu (Database)</option>
                <option value="storage">Lưu trữ (Storage / NAS)</option>
              </select>
            </div>
          </div>

          {/* Cổng & Giao thức */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Cổng (Port) *</label>
              <Input
                type="number"
                placeholder="VD: 5432, 8080"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="text-sm font-mono h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Loại kiểm tra</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ServiceCheckType)}
                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="http">HTTP Check</option>
                <option value="tcp">TCP Ping</option>
              </select>
            </div>
          </div>

          {/* Đường dẫn HTTP nếu chọn http */}
          {type === 'http' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Đường dẫn kiểm tra (Health Path)</label>
              <Input
                placeholder="/healthz hoặc /"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="text-sm font-mono h-11"
              />
            </div>
          )}

          {/* Interval */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Chu kỳ kiểm tra (giây)</label>
            <Input
              type="number"
              placeholder="60"
              value={intervalSec}
              onChange={(e) => setIntervalSec(e.target.value)}
              className="text-sm font-mono h-11"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Ghi chú / Mô tả (tùy chọn)</label>
            <Input
              placeholder="VD: Primary database cluster node"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm h-11"
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
              disabled={loading || devices.length === 0}
              className="bg-blue-600 text-white hover:bg-blue-500 text-sm font-semibold px-6 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              <span>Lưu dịch vụ</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
