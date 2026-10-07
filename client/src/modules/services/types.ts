// ponytail: services module domain types
import type { NodeType } from '../devices/types'

export type ServiceCategory = 'storage' | 'database' | 'application'
export type ServiceCheckType = 'http' | 'tcp'
export type ServiceStatus = 'UP' | 'DOWN' | 'PENDING'

export interface Service {
  id: number
  device_id: string
  name: string
  category: ServiceCategory
  port: number
  type: ServiceCheckType
  path?: string
  interval_sec: number
  enabled: number
  last_status: ServiceStatus
  last_latency_ms: number
  uptime_24h: number
  last_check: string
  error_msg?: string | null
  description?: string
  hostname?: string
  ip?: string
  device_online?: boolean
  node_type?: NodeType
}

export type MonitoredService = Service

export interface CreateServiceInput {
  device_id: string
  name: string
  category: ServiceCategory
  port: number
  type: ServiceCheckType
  path?: string
  interval_sec?: number
  description?: string
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  enabled?: number | boolean
}

export interface ServiceHistoryPoint {
  time: string
  latency: number
  latency_ms: number
  status: 'UP' | 'DOWN'
}

export interface ServiceIncident {
  id: number
  service_id: number
  event_type: string
  message: string
  created_at: string
  formatted_time: string
}

export interface ServiceUptimeDay {
  date: string
  fullDate: string
  uptime: number
  status: 'UP' | 'DEGRADED' | 'DOWN' | 'NO_DATA'
  latency: number
}


export interface PingResult {
  ok: boolean
  latency: number
  status: number | null
  error: string | null
  checked_at: string
}
