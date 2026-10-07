import React from 'react'
import {
  Database,
  HardDrive,
  Globe,
  Search,
  Plus,
  Trash2,
  Info,
  Pencil,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { MonitoredService, ServiceCategory, ServiceStatus } from '@/modules/services'

interface ServiceTableProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  categoryFilter: 'all' | ServiceCategory
  onCategoryFilterChange: (cat: 'all' | ServiceCategory) => void
  statusFilter: 'all' | ServiceStatus
  onStatusFilterChange: (status: 'all' | ServiceStatus) => void
  onOpenAddModal: () => void
  filteredServices: MonitoredService[]
  onViewService: (service: MonitoredService, tab?: 'overview' | 'edit') => void
  onEditService: (service: MonitoredService) => void
  deletingService: MonitoredService | null
  onSetDeletingService: (service: MonitoredService | null) => void
  isDeleting: boolean
  onDeleteConfirm: () => void
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  onOpenAddModal,
  filteredServices,
  onViewService,
  onEditService,
  deletingService,
  onSetDeletingService,
  isDeleting,
  onDeleteConfirm,
}) => {
  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-zinc-400 dark:text-zinc-500" />
          <Input
            placeholder="Tìm dịch vụ theo tên, host, port..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 h-11 text-sm bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => onCategoryFilterChange('all')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => onCategoryFilterChange('application')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                categoryFilter === 'application'
                  ? 'bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-300 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              App
            </button>
            <button
              onClick={() => onCategoryFilterChange('database')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                categoryFilter === 'database'
                  ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-300 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              DB
            </button>
            <button
              onClick={() => onCategoryFilterChange('storage')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                categoryFilter === 'storage'
                  ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-300 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Storage
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Trạng thái
            </button>
            <button
              onClick={() => onStatusFilterChange('UP')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                statusFilter === 'UP'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              UP
            </button>
            <button
              onClick={() => onStatusFilterChange('DOWN')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                statusFilter === 'DOWN'
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              DOWN
            </button>
          </div>

          {/* Add Service Button */}
          <Button
            size="default"
            onClick={onOpenAddModal}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold h-11 px-4 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Thêm dịch vụ</span>
          </Button>
        </div>
      </div>

      {/* Services Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 overflow-hidden rounded-2xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Dịch Vụ / Endpoint</TableHead>
              <TableHead className="w-[240px]">Host Node</TableHead>
              <TableHead>Danh Mục</TableHead>
              <TableHead>Cổng / Loại</TableHead>
              <TableHead className="text-right">Độ Trễ</TableHead>
              <TableHead className="text-right">Uptime 24h</TableHead>
              <TableHead className="text-center">Trạng Thái</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center text-zinc-500 font-medium">
                  Không có dịch vụ nào phù hợp với bộ lọc hiện tại.
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => {
                const isUp = service.last_status === 'UP'

                return (
                  <TableRow key={service.id} className="group">
                    {/* Tên & Endpoint */}
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-bold text-zinc-900 dark:text-zinc-100 text-sm cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => onViewService(service, 'overview')}
                          >
                            {service.name}
                          </span>
                          {service.type === 'http' && service.path && (
                            <span className="font-mono text-xs text-zinc-500">({service.path})</span>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-xs text-zinc-500 truncate max-w-[260px] mt-1 font-medium">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Host Node */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            service.device_online ? 'bg-emerald-500' : 'bg-zinc-400'
                          }`}
                        />
                        <div>
                          <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                            {service.hostname}
                          </div>
                          <div className="font-mono text-xs text-zinc-500">{service.ip}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Danh mục */}
                    <TableCell>
                      {service.category === 'database' && (
                        <Badge variant="purple" className="text-xs">
                          <Database className="h-3.5 w-3.5 mr-1" />
                          Database
                        </Badge>
                      )}
                      {service.category === 'storage' && (
                        <Badge variant="warning" className="text-xs">
                          <HardDrive className="h-3.5 w-3.5 mr-1" />
                          Storage
                        </Badge>
                      )}
                      {service.category === 'application' && (
                        <Badge variant="blue" className="text-xs">
                          <Globe className="h-3.5 w-3.5 mr-1" />
                          App
                        </Badge>
                      )}
                    </TableCell>

                    {/* Port & Protocol */}
                    <TableCell>
                      <div className="font-mono text-sm text-zinc-800 dark:text-zinc-200 font-semibold">
                        <span className="text-blue-600 dark:text-blue-400">{service.port}</span>
                        <span className="text-zinc-500 ml-1 uppercase text-xs">/{service.type}</span>
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">
                        {service.interval_sec}s/ping
                      </div>
                    </TableCell>

                    {/* Latency */}
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {isUp ? (
                        <span
                          className={
                            service.last_latency_ms < 15
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }
                        >
                          {service.last_latency_ms} ms
                        </span>
                      ) : (
                        <span className="text-rose-500">—</span>
                      )}
                    </TableCell>

                    {/* Uptime 24h */}
                    <TableCell className="text-right font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {service.uptime_24h.toFixed(1)}%
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Badge
                          variant={isUp ? 'success' : 'danger'}
                          className="text-xs font-bold px-2.5 py-1"
                        >
                          {isUp ? (
                            <span className="flex items-center gap-1.5">
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              UP
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                              DOWN
                            </span>
                          )}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditService(service)}
                          title="Sửa cấu hình dịch vụ"
                          className="h-9 w-9 text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewService(service, 'overview')}
                          title="Xem chi tiết dịch vụ"
                          className="h-9 w-9 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg cursor-pointer"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSetDeletingService(service)}
                          title="Xóa dịch vụ giám sát"
                          className="h-9 w-9 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deletingService && (
        <Dialog open={!!deletingService} onOpenChange={(open) => !open && onSetDeletingService(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Xác nhận dừng giám sát
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-600 dark:text-zinc-400 pt-2 leading-relaxed">
                Bạn có chắc chắn muốn xóa dịch vụ{' '}
                <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                  "{deletingService.name}"
                </strong>{' '}
                (Cổng {deletingService.port}) trên node{' '}
                <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                  {deletingService.hostname}
                </strong>
                ?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-4">
              <Button
                variant="ghost"
                size="default"
                onClick={() => onSetDeletingService(null)}
                className="text-sm text-zinc-500 cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                size="default"
                disabled={isDeleting}
                onClick={onDeleteConfirm}
                className="text-sm font-semibold cursor-pointer"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa dịch vụ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
