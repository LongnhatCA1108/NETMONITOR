// ponytail: services service with business logic, metrics helpers, and api orchestration
import { servicesApi } from './api'
import type {
  Service,
  ServiceCategory,
  ServiceStatus,
  CreateServiceInput,
  UpdateServiceInput,
  PingResult,
  ServiceHistoryPoint,
  ServiceIncident,
  ServiceUptimeDay,
} from './types'

export class ServicesService {
  getServices(): Promise<Service[]> {
    return servicesApi.fetchServices()
  }

  createService(data: CreateServiceInput): Promise<Service> {
    return servicesApi.createService(data)
  }

  updateService(id: number, data: UpdateServiceInput): Promise<Service> {
    return servicesApi.updateService(id, data)
  }

  deleteService(id: number): Promise<{ success: boolean; id: number }> {
    return servicesApi.deleteService(id)
  }

  testPingService(id: number): Promise<PingResult> {
    return servicesApi.testPingService(id)
  }

  getServiceHistory(
    id: number,
    limit = 20,
    mode: 'recent' | 'hourly' = 'recent'
  ): Promise<ServiceHistoryPoint[]> {
    return servicesApi.fetchServiceHistory(id, limit, mode)
  }

  getServiceIncidents(id: number): Promise<ServiceIncident[]> {
    return servicesApi.fetchServiceIncidents(id)
  }

  getServiceUptime(id: number): Promise<ServiceUptimeDay[]> {
    return servicesApi.fetchServiceUptime(id)
  }

  static isUp(service: Service): boolean {
    return service.last_status === 'UP'
  }

  static filterServices(
    services: Service[],
    query: string,
    category: 'all' | ServiceCategory = 'all',
    status: 'all' | ServiceStatus = 'all'
  ): Service[] {
    const q = query.trim().toLowerCase()
    return services.filter(s => {
      if (category !== 'all' && s.category !== category) return false
      if (status !== 'all' && s.last_status !== status) return false
      if (q) {
        const matchName = s.name.toLowerCase().includes(q)
        const matchHost = (s.hostname || '').toLowerCase().includes(q)
        const matchPort = String(s.port).includes(q)
        if (!matchName && !matchHost && !matchPort) return false
      }
      return true
    })
  }

  static getMetrics(services: Service[]) {
    const total = services.length
    const upCount = services.filter(s => s.last_status === 'UP').length
    const downCount = services.filter(s => s.last_status === 'DOWN').length
    const dbCount = services.filter(s => s.category === 'database').length
    const storageCount = services.filter(s => s.category === 'storage').length
    const appCount = services.filter(s => s.category === 'application').length

    const upServices = services.filter(s => s.last_status === 'UP')
    const avgLatency = upServices.length > 0
      ? Math.round(upServices.reduce((acc, s) => acc + (s.last_latency_ms || 0), 0) / upServices.length)
      : 0

    return { total, upCount, downCount, dbCount, storageCount, appCount, avgLatency }
  }
}

export const servicesService = new ServicesService()
