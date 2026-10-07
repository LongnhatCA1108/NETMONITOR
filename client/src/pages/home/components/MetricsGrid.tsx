// ponytail: metrics grid cards for overview dashboard
import { Radio, CheckCircle2, AlertTriangle, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface MetricsGridProps {
  totalDevices: number
  onlineCount: number
  onlinePercent: number
  totalServices: number
  upCount: number
  upPercent: number
  downCount: number
  avgLatency: number
}

export function MetricsGrid({
  totalDevices,
  onlineCount,
  onlinePercent,
  totalServices,
  upCount,
  upPercent,
  downCount,
  avgLatency,
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 sm:gap-6">
      {/* 1. Online Devices */}
      <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span className="text-sm font-semibold">Thiết bị Trực tuyến</span>
            <Radio className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
            {onlineCount} <span className="text-lg font-normal text-zinc-500">/ {totalDevices}</span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 font-medium">
            {totalDevices > 0 ? `${onlinePercent}% trực tuyến` : '0%'}
          </p>
        </CardContent>
      </Card>

      {/* 2. UP Services */}
      <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span className="text-sm font-semibold">Dịch vụ Hoạt động (UP)</span>
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 font-mono">
            {upCount} <span className="text-lg font-normal text-zinc-500">/ {totalServices}</span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 font-medium">
            {totalServices > 0 ? `${upPercent}% dịch vụ ổn định` : '0%'}
          </p>
        </CardContent>
      </Card>

      {/* 3. DOWN Services */}
      <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span className="text-sm font-semibold">Dịch vụ Sự cố (DOWN)</span>
            <AlertTriangle className={`h-5 w-5 ${downCount > 0 ? 'text-rose-500' : 'text-zinc-400'}`} />
          </div>
          <div className={`mt-3 text-3xl font-extrabold tracking-tight font-mono ${downCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400'}`}>
            {downCount}
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 font-medium">
            {downCount > 0 ? 'Cảnh báo: Cần can thiệp' : 'Tất cả dịch vụ bình thường'}
          </p>
        </CardContent>
      </Card>

      {/* 4. Network Latency */}
      <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span className="text-sm font-semibold">Độ trễ TB Mạng</span>
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
            {avgLatency > 0 ? (
              <>
                {avgLatency} <span className="text-lg font-normal text-zinc-500">ms</span>
              </>
            ) : (
              <span className="text-zinc-400 text-2xl font-semibold">— ms</span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 font-medium">TCP/HTTP probe thực tế</p>
        </CardContent>
      </Card>
    </div>
  )
}
