import React from 'react'
import { ArrowRight, Database, HardDrive, Globe } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { MonitoredService } from '@/modules/services'

interface ServiceHealthListProps {
  services: MonitoredService[]
  onNavigate: (tab: string) => void
  onSelectService?: (service: MonitoredService) => void
}

export const ServiceHealthList: React.FC<ServiceHealthListProps> = ({
  services,
  onNavigate,
  onSelectService,
}) => {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Tình Trạng Dịch Vụ Cốt Lõi
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            HTTP Health Check & TCP Port Monitor
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('services')}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Tất cả ({services.length}) <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 font-mono">
            Chưa có dịch vụ nào được cấu hình.
          </div>
        ) : (
          services.slice(0, 5).map((service) => {
            const isUp = service.last_status === 'UP'
            return (
              <div
                key={service.id}
                onClick={() => onSelectService && onSelectService(service)}
                className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200/80 dark:border-zinc-800/60 text-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {service.category === 'database' && <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                    {service.category === 'storage' && <HardDrive className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                    {service.category === 'application' && <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{service.name}</div>
                    <div className="font-mono text-xs text-zinc-500">
                      {service.hostname}:{service.port}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                    {service.last_latency_ms} ms
                  </span>
                  <Badge variant={isUp ? 'success' : 'danger'} className="text-xs font-bold">
                    {service.last_status}
                  </Badge>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
