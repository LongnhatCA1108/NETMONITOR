import React from 'react'
import { Cpu, CheckCircle2, AlertTriangle, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ServiceMetricsCardsProps {
  total: number
  upCount: number
  downCount: number
  avgLatency: number
  appCount: number
  dbCount: number
  storageCount: number
}

export const ServiceMetricsCards: React.FC<ServiceMetricsCardsProps> = ({
  total,
  upCount,
  downCount,
  avgLatency,
  appCount,
  dbCount,
  storageCount,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-semibold">Tổng Dịch Vụ</span>
            <Cpu className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
            {total}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {appCount} app, {dbCount} db, {storageCount} storage
          </p>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-semibold">Hoạt Động (UP)</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
            {upCount} <span className="text-lg font-normal text-zinc-500">/ {total}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {total > 0 ? `${Math.round((upCount / total) * 100)}% dịch vụ bình thường` : '0%'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-semibold">Gặp Sự Cố (DOWN)</span>
            <AlertTriangle className={`h-5 w-5 ${downCount > 0 ? 'text-rose-500' : 'text-zinc-400'}`} />
          </div>
          <div
            className={`mt-3 text-3xl font-extrabold tracking-tight font-mono ${
              downCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400'
            }`}
          >
            {downCount}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {downCount > 0 ? 'Cần kiểm tra ngay!' : 'Tất cả dịch vụ an toàn'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-semibold">Độ Trễ Trung Bình</span>
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
            {avgLatency} <span className="text-lg font-normal text-zinc-500">ms</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Thời gian phản hồi nội mạng</p>
        </CardContent>
      </Card>
    </div>
  )
}
