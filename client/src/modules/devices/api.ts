// ponytail: devices API client inheriting BaseApi
import { BaseApi } from '@/https/baseApi'
import type { Device, UpdateDevicePayload, SyncTailscaleResult, ResetDatabaseResult, DeviceUptimeDay } from './types'

export class DevicesApi extends BaseApi {
  constructor() {
    super('/api')
  }

  fetchDevices(): Promise<Device[]> {
    return this.get<Device[]>('/devices')
  }

  updateDevice(nodeId: string, data: UpdateDevicePayload): Promise<Device> {
    return this.patch<Device, UpdateDevicePayload>(`/devices/${encodeURIComponent(nodeId)}`, data)
  }

  syncTailscale(): Promise<SyncTailscaleResult> {
    return this.post<SyncTailscaleResult>('/devices/sync')
  }

  resetDatabase(): Promise<ResetDatabaseResult> {
    return this.post<ResetDatabaseResult>('/database/reset')
  }

  fetchDeviceUptime(nodeId: string): Promise<DeviceUptimeDay[]> {
    return this.get<DeviceUptimeDay[]>(`/devices/${encodeURIComponent(nodeId)}/uptime`)
  }
}

export const devicesApi = new DevicesApi()
