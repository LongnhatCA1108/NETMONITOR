// ponytail: spotlight list of critical device nodes
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Device } from '@/modules/devices/types'

interface DeviceSpotlightProps {
  devices: Device[]
  onNavigateDevices: () => void
  onSelectDevice?: (dev: Device) => void
}

export function DeviceSpotlight({
  devices,
  onNavigateDevices,
  onSelectDevice,
}: DeviceSpotlightProps) {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Các Thiết Bị Mạng Quan Trọng
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Cập nhật tức thời trạng thái máy chủ trong Tailnet
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateDevices}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
        >
          Chi tiết <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {devices.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 font-mono">
            Chưa có thiết bị nào. Hãy kết nối Tailscale API để nạp danh sách máy thật.
          </div>
        ) : (
          devices.map((device) => {
            const isOnline = !!device.is_online
            return (
              <div
                key={device.node_id}
                onClick={() => onSelectDevice && onSelectDevice(device)}
                className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200/80 dark:border-zinc-800/60 text-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">
                      {device.alias || device.hostname}
                    </div>
                    <div className="font-mono text-xs text-zinc-500">
                      {device.alias ? `${device.hostname} • ${device.ip}` : device.ip}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={device.node_type === 'server' ? 'purple' : device.node_type === 'endpoint' ? 'warning' : 'blue'}>
                    {device.node_type}
                  </Badge>
                  <span className="font-mono text-xs text-zinc-500 font-semibold">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
