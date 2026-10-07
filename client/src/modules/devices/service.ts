// ponytail: devices service with business logic, presentation helpers, and api orchestration
import { devicesApi } from './api'
import type { Device, NodeType, UpdateDevicePayload, SyncTailscaleResult, DeviceUptimeDay } from './types'

export class DevicesService {
  getDevices(): Promise<Device[]> {
    return devicesApi.fetchDevices()
  }

  updateDevice(nodeId: string, data: UpdateDevicePayload): Promise<Device> {
    return devicesApi.updateDevice(nodeId, data)
  }

  syncTailscale(): Promise<SyncTailscaleResult> {
    return devicesApi.syncTailscale()
  }

  getDeviceUptime(nodeId: string): Promise<DeviceUptimeDay[]> {
    return devicesApi.fetchDeviceUptime(nodeId)
  }

  static getDisplayName(device: Device): string {
    return device.alias ? device.alias : device.hostname
  }

  static isOnline(device: Device): boolean {
    return !!device.is_online
  }

  static filterDevices(
    devices: Device[],
    query: string,
    typeFilter: 'all' | NodeType = 'all',
    statusFilter: 'all' | 'online' | 'offline' = 'all'
  ): Device[] {
    const q = query.trim().toLowerCase()
    return devices.filter(d => {
      if (typeFilter !== 'all' && d.node_type !== typeFilter) return false
      if (statusFilter === 'online' && !d.is_online) return false
      if (statusFilter === 'offline' && d.is_online) return false
      if (q) {
        const matchHost = d.hostname.toLowerCase().includes(q)
        const matchAlias = (d.alias || '').toLowerCase().includes(q)
        const matchIp = d.ip.toLowerCase().includes(q)
        const matchOs = (d.os || '').toLowerCase().includes(q)
        const matchTags = (d.tags || []).some(t => t.toLowerCase().includes(q))
        if (!matchHost && !matchAlias && !matchIp && !matchOs && !matchTags) return false
      }
      return true
    })
  }

  static getDeviceStats(devices: Device[]) {
    const total = devices.length
    const online = devices.filter(d => !!d.is_online).length
    const servers = devices.filter(d => d.node_type === 'server').length
    const endpoints = devices.filter(d => d.node_type === 'endpoint').length
    const monitors = devices.filter(d => d.node_type === 'monitor').length
    return { total, online, servers, endpoints, monitors }
  }
}

export const devicesService = new DevicesService()
