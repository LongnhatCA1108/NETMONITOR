import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag, Shield, Server, Laptop, CheckCircle2 } from 'lucide-react'
import type { Device, NodeType } from '@/modules/devices'
import { devicesService } from '@/modules/devices'

export interface EditDeviceModalProps {
  device: Device | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updatedDevice: Device) => void
  onShowToast: (msg: string) => void
}

export const EditDeviceModal: React.FC<EditDeviceModalProps> = ({
  device,
  open,
  onOpenChange,
  onSuccess,
  onShowToast,
}) => {
  const [alias, setAlias] = useState('')
  const [nodeType, setNodeType] = useState<NodeType>('endpoint')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (device) {
      setAlias(device.alias || '')
      setNodeType(device.node_type || 'endpoint')
    }
  }, [device])

  if (!device) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updated = await devicesService.updateDevice(device.node_id, {
        alias: alias.trim(),
        node_type: nodeType,
      })
      onShowToast(`Đã cập nhật thiết bị "${updated.alias || updated.hostname}" thành công!`)
      onSuccess(updated)
      onOpenChange(false)
    } catch (err: any) {
      onShowToast(`Lỗi: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full sm:max-w-lg rounded-3xl p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
              <Tag className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Chỉnh Sửa Thiết Bị
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500 font-mono">
            Hostname Tailscale: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{device.hostname}</span> • IP: {device.ip}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5 pt-1">
          {/* 1. Custom Alias / Label */}
          <div className="space-y-2">
            <label htmlFor="alias" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
              Tên Gợi Nhớ (Alias / Nhãn Hiển Thị)
            </label>
            <Input
              id="alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder={`ví dụ: Máy Chủ Kế Toán, PC Làm Việc (mặc định: ${device.hostname})`}
              className="text-sm h-11"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tên nhãn này sẽ hiển thị ưu tiên trên toàn bộ MeshGuard mà không làm thay đổi tên máy trên Tailscale.
            </p>
          </div>

          {/* 2. Node Type Selection */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
              Phân Loại Thiết Bị Trong Mạng
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {/* Option A: Server */}
              <div
                onClick={() => setNodeType('server')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  nodeType === 'server'
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/50'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mt-0.5">
                  <Server className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Máy Chủ Dịch Vụ (Server)</span>
                    <input
                      type="radio"
                      name="nodeType"
                      checked={nodeType === 'server'}
                      onChange={() => setNodeType('server')}
                      className="h-4 w-4 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Chạy các dịch vụ (Database, Storage, API). Theo dõi Uptime 30 ngày và danh sách dịch vụ.
                  </p>
                </div>
              </div>

              {/* Option B: Endpoint */}
              <div
                onClick={() => setNodeType('endpoint')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  nodeType === 'endpoint'
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/50'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mt-0.5">
                  <Laptop className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Thiết Bị Đầu Cuối (Endpoint / Client)</span>
                    <input
                      type="radio"
                      name="nodeType"
                      checked={nodeType === 'endpoint'}
                      onChange={() => setNodeType('endpoint')}
                      className="h-4 w-4 text-amber-600 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Laptop, PC cá nhân, Mobile. Tối giản, chỉ theo dõi lịch sử truy cập & kết nối gần đây.
                  </p>
                </div>
              </div>

              {/* Option C: Monitor */}
              <div
                onClick={() => setNodeType('monitor')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  nodeType === 'monitor'
                    ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/30'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/50'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 mt-0.5">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Hub Giám Sát (Monitor Core)</span>
                    <input
                      type="radio"
                      name="nodeType"
                      checked={nodeType === 'monitor'}
                      onChange={() => setNodeType('monitor')}
                      className="h-4 w-4 text-purple-600 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Node trung tâm chạy MeshGuard Agent để điều phối mạng và giám sát các node khác.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-sm font-medium border-zinc-200 dark:border-zinc-800"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 shadow-sm shadow-blue-500/20"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
