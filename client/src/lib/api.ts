// ponytail: legacy api client adapter re-exporting from modules API singletons
import { devicesApi } from '@/modules/devices/api'
import { servicesApi } from '@/modules/services/api'
import { settingsApi } from '@/modules/settings/api'
import { dashboardApi } from '@/modules/dashboard/api'

export * from '@/modules/devices/types'
export * from '@/modules/services/types'
export * from '@/modules/settings/types'
export * from '@/modules/dashboard/types'

// Dashboard
export const fetchSummary = () => dashboardApi.fetchSummary()

// Devices
export const fetchDevices = () => devicesApi.fetchDevices()
export const updateDevice = (nodeId: string, data: any) => devicesApi.updateDevice(nodeId, data)
export const resetDatabase = () => devicesApi.resetDatabase()
export const syncTailscaleDevices = () => devicesApi.syncTailscale()
export const fetchDeviceUptime = (nodeId: string) => devicesApi.fetchDeviceUptime(nodeId)

// Settings
export const fetchSettings = () => settingsApi.fetchSettings()
export const saveSettings = (payload: any) => settingsApi.saveSettings(payload)

// Services
export const fetchServices = () => servicesApi.fetchServices()
export const createService = (input: any) => servicesApi.createService(input)
export const updateService = (id: number, data: any) => servicesApi.updateService(id, data)
export const deleteService = (id: number) => servicesApi.deleteService(id)
export const fetchServiceHistory = (id: number, limit = 20, mode: 'recent' | 'hourly' = 'recent') =>
  servicesApi.fetchServiceHistory(id, limit, mode)
export const fetchServiceIncidents = (id: number) => servicesApi.fetchServiceIncidents(id)
export const fetchServiceUptime = (id: number, days = 30) => servicesApi.fetchServiceUptime(id, days)
export const testPingService = (id: number) => servicesApi.testPingService(id)
