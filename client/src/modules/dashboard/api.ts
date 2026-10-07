// ponytail: dashboard API client inheriting BaseApi
import { BaseApi } from '@/https/baseApi'
import type { DashboardSummary } from './types'

export class DashboardApi extends BaseApi {
  constructor() {
    super('/api')
  }

  fetchSummary(): Promise<DashboardSummary> {
    return this.get<DashboardSummary>('/dashboard/summary')
  }
}

export const dashboardApi = new DashboardApi()
