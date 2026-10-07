import React from 'react'
import {
  Search,
  Copy,
  Check,
  Layers,
  Info,
  Pencil,
  RefreshCw,
  Settings,
  ShieldAlert,
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
import type { Device, NodeType } from '@/modules/devices'
import type { MonitoredService } from '@/modules/services'

interface DeviceTableProps {
  total: number
  servers: number
  endpoints: number
  searchTerm: string
  onSearchChange: (val: string) => void
  typeFilter: 'all' | NodeType
  onTypeFilterChange: (type: 'all' | NodeType) => void
  statusFilter: 'all' | 'online' | 'offline'
  onStatusFilterChange: (status: 'all' | 'online' | 'offline') => void
  filteredDevices: Device[]
  copiedIp: string | null
  onCopyIp: (ip: string) => void
  getDeviceServices: (id: string) => MonitoredService[]
  onSelectDevice: (device: Device) => void
  onEditDevice: (device: Device) => void
  onSyncTailscale?: () => void
  onNavigateSettings?: () => void
}

export const DeviceTable: React.FC<DeviceTableProps> = ({
  total,
  servers,
  endpoints,
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  filteredDevices,
  copiedIp,
  onCopyIp,
  getDeviceServices,
  onSelectDevice,
  onEditDevice,
  onSyncTailscale,
  onNavigateSettings,
}) => {
  if (total === 0) {
    return (
      <Card className="border-dashed border-2 border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 p-8 rounded-3xl text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Chưa có thiết bị nào trong cơ sở dữ liệu
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Toàn bộ dữ liệu mock đã được xóa sạch. Hệ thống đã sẵn sàng kết nối API Tailscale để tải về toàn bộ danh sách node thật từ Tailnet của bạn!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {onSyncTailscale && (
              <Button
                onClick={onSyncTailscale}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 shadow-sm cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Đồng bộ từ Tailscale
              </Button>
            )}
            {onNavigateSettings && (
              <Button
                variant="outline"
                onClick={onNavigateSettings}
                className="text-xs font-semibold border-zinc-300 dark:border-zinc-700 cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Cài đặt API Key & Tailnet
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Tìm theo Alias, Hostname, IP, OS, Tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-sm h-11 bg-white dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => onTypeFilterChange('all')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Tất cả ({total})
            </button>
            <button
              onClick={() => onTypeFilterChange('server')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                typeFilter === 'server'
                  ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Server ({servers})
            </button>
            <button
              onClick={() => onTypeFilterChange('endpoint')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                typeFilter === 'endpoint'
                  ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Endpoint ({endpoints})
            </button>
            <button
              onClick={() => onTypeFilterChange('monitor')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                typeFilter === 'monitor'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Hub
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
              Mọi trạng thái
            </button>
            <button
              onClick={() => onStatusFilterChange('online')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                statusFilter === 'online'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => onStatusFilterChange('offline')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                statusFilter === 'offline'
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 overflow-hidden rounded-2xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[320px]">Thiết Bị (Alias / Hostname)</TableHead>
              <TableHead className="w-[180px]">Địa Chỉ IP</TableHead>
              <TableHead>Phân Loại</TableHead>
              <TableHead>Hệ Điều Hành</TableHead>
              <TableHead>Tags Mạng</TableHead>
              <TableHead className="text-center">Dịch Vụ</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-zinc-500 font-medium">
                  Không tìm thấy thiết bị nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              filteredDevices.map((device) => {
                const nodeServices = getDeviceServices(device.node_id)
                const isOnline = !!device.is_online

                return (
                  <TableRow key={device.node_id} className="group">
                    {/* Node / Hostname / Alias */}
                    <TableCell>
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex items-center justify-center">
                          {isOnline ? (
                            <span className="flex h-3 w-3 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full h-3 w-3 bg-zinc-400"></span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                              {device.alias || device.hostname}
                            </span>
                            {device.node_type === 'monitor' && (
                              <Badge variant="blue" className="text-[10px] py-0 px-1.5">
                                Hub
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {device.alias ? (
                              <span className="text-[11px] text-zinc-500 font-mono">
                                Hostname: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{device.hostname}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-zinc-400 font-mono">
                                {device.node_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* IP with Copy */}
                    <TableCell>
                      <button
                        onClick={() => onCopyIp(device.ip)}
                        className="flex items-center gap-1.5 font-mono text-xs text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group/btn"
                        title="Sao chép địa chỉ IP"
                      >
                        <span className="font-semibold">{device.ip}</span>
                        {copiedIp === device.ip ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 opacity-0 group-hover/btn:opacity-100 transition-opacity text-zinc-400" />
                        )}
                      </button>
                    </TableCell>

                    {/* Node Type Badge */}
                    <TableCell>
                      {device.node_type === 'monitor' && (
                        <Badge variant="blue" className="text-xs">
                          Hub Giám Sát
                        </Badge>
                      )}
                      {device.node_type === 'server' && (
                        <Badge variant="purple" className="text-xs">
                          Máy Chủ (Server)
                        </Badge>
                      )}
                      {device.node_type === 'endpoint' && (
                        <Badge variant="warning" className="text-xs">
                          Client (Endpoint)
                        </Badge>
                      )}
                    </TableCell>

                    {/* OS & Version */}
                    <TableCell>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">
                        {device.os}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        Tailscale {device.client_version}
                      </div>
                    </TableCell>

                    {/* Tags */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {(device.tags || []).length > 0 ? (
                          (device.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Không có tags</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Services Count */}
                    <TableCell className="text-center">
                      {nodeServices.length > 0 ? (
                        <button
                          onClick={() => onSelectDevice(device)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                        >
                          <Layers className="h-3.5 w-3.5" />
                          <span>{nodeServices.length}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-400 font-mono font-medium">0</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditDevice(device)}
                          className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 h-8 px-2.5 cursor-pointer"
                          title="Sửa Alias & Phân loại Node"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectDevice(device)}
                          className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 h-8 px-2.5 cursor-pointer"
                        >
                          <Info className="h-3.5 w-3.5 mr-1" />
                          Chi tiết
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
    </div>
  )
}
