// ponytail: services API client inheriting BaseApi
import { BaseApi } from '@/https/baseApi'
import type {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceHistoryPoint,
  ServiceIncident,
  ServiceUptimeDay,
  PingResult
} from './types'

export class ServicesApi extends BaseApi {
  constructor() {
    super('/api')
  }

  fetchServices(): Promise<Service[]> {
    return this.get<Service[]>('/services')
  }

  createService(input: CreateServiceInput): Promise<Service> {
    return this.post<Service, CreateServiceInput>('/services', input)
  }

  updateService(id: number, data: UpdateServiceInput): Promise<Service> {
    return this.patch<Service, UpdateServiceInput>(`/services/${id}`, data)
  }

  deleteService(id: number): Promise<{ success: boolean; id: number }> {
    return this.delete<{ success: boolean; id: number }>(`/services/${id}`)
  }

  fetchServiceHistory(
    id: number,
    limit: number = 20,
    mode: 'recent' | 'hourly' = 'recent'
  ): Promise<ServiceHistoryPoint[]> {
    return this.get<ServiceHistoryPoint[]>(`/services/${id}/history`, {
      params: { limit, mode }
    })
  }

  fetchServiceIncidents(id: number): Promise<ServiceIncident[]> {
    return this.get<ServiceIncident[]>(`/services/${id}/incidents`)
  }

  fetchServiceUptime(id: number, days: number = 30): Promise<ServiceUptimeDay[]> {
    return this.get<ServiceUptimeDay[]>(`/services/${id}/uptime`, {
      params: { days }
    })
  }

  testPingService(id: number): Promise<PingResult> {
    return this.post<PingResult>(`/services/${id}/ping`)
  }
}

export const servicesApi = new ServicesApi()
