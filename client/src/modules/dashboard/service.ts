// ponytail: dashboard service helpers and api orchestration
import { dashboardApi } from './api'
import type { DashboardSummary } from './types'

export class DashboardService {
  getSummary(): Promise<DashboardSummary> {
    return dashboardApi.fetchSummary()
  }

  static getNetworkHealthPercent(summary: DashboardSummary | null): number {
    if (!summary || summary.total_devices === 0) return 0
    return Math.round((summary.online_devices / summary.total_devices) * 100)
  }

  static getServicesHealthPercent(summary: DashboardSummary | null): number {
    if (!summary || summary.total_services === 0) return 0
    const up = summary.total_services - summary.down_services
    return Math.round((up / summary.total_services) * 100)
  }
}

export const dashboardService = new DashboardService()
