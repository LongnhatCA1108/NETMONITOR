// ponytail: devices module domain types
export type NodeType = 'monitor' | 'server' | 'endpoint'

export interface ConnectionLog {
  event: string
  time: string
  note: string
}

export interface Device {
  node_id: string
  hostname: string
  alias?: string
  ip: string
  os: string
  client_version: string
  last_seen: string
  is_online: number | boolean
  node_type: NodeType
  tags: string[]
  connection_log?: ConnectionLog[]
  services?: any[]
  services_count?: number
}

export interface UpdateDevicePayload {
  alias?: string
  node_type?: NodeType
}

export interface SyncTailscaleResult {
  message: string
  count: number
  isReal?: boolean
}

export interface ResetDatabaseResult {
  success: boolean
  message: string
}

export interface DeviceUptimeDay {
  date: string
  fullDate: string
  uptime: number
  status: 'UP' | 'DEGRADED' | 'DOWN' | 'NO_DATA'
  latency: number
}

export type UptimeDayData = DeviceUptimeDay
