// ponytail: dashboard module domain types
import type { Device } from '../devices/types'

export interface DashboardSummary {
  monitor_node: Device
  total_devices: number
  online_devices: number
  server_count: number
  server_online: number
  endpoint_count: number
  endpoint_online: number
  total_services: number
  down_services: number
  storage_count: number
  db_count: number
  app_count: number
  last_sync: string
  avg_latency_ms?: number
}
