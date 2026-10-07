// ponytail: home page hook encapsulating metrics and slice data
import { useMemo } from 'react'
import type { Device, Service, DashboardSummary } from '@/modules'

export function useHomePage(devices: Device[], services: Service[], summary: DashboardSummary | null) {
  const upServices = useMemo(() => services.filter(s => s.last_status === 'UP'), [services])
  const downServices = useMemo(() => services.filter(s => s.last_status === 'DOWN'), [services])
  const onlineDevices = useMemo(() => devices.filter(d => !!d.is_online), [devices])

  const topDevices = useMemo(() => devices.slice(0, 5), [devices])
  const topServices = useMemo(() => services.slice(0, 5), [services])

  const onlinePercent = devices.length > 0
    ? Math.round((onlineDevices.length / devices.length) * 100)
    : 0

  const upPercent = services.length > 0
    ? Math.round((upServices.length / services.length) * 100)
    : 0

  return {
    upServices,
    downServices,
    onlineDevices,
    topDevices,
    topServices,
    onlinePercent,
    upPercent,
    avgLatency: summary?.avg_latency_ms ?? 0,
  }
}
