import React from 'react'
import { Radio, Server, Laptop } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface DeviceMetricsCardsProps {
  total: number
  online: number
  servers: number
  endpoints: number
}

export const DeviceMetricsCards: React.FC<DeviceMetricsCardsProps> = ({
  total,
  online,
  servers,
  endpoints,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-semibold">Tổng Thiết Bị</span>
            <Radio className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
            {total}
          </div>
          <p className="mt-1 text-xs text-zinc-500">Mạng Tailscale Mesh</p>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-semibold">Đang Online</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
            {online}
          </div>
          <p className="mt-1 text-xs text-zinc-500">Kết nối thời gian thực</p>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-semibold">Máy Chủ (Servers)</span>
            <Server className="h-5 w-5 text-purple-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400 font-mono">
            {servers}
          </div>
          <p className="mt-1 text-xs text-zinc-500">Chạy dịch vụ & TCP probe</p>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-semibold">Thiết Bị Đầu Cuối</span>
            <Laptop className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 font-mono">
            {endpoints}
          </div>
          <p className="mt-1 text-xs text-zinc-500">Workstation / Mobile Client</p>
        </CardContent>
      </Card>
    </div>
  )
}
