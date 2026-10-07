// ponytail: services page hook managing search, filters, metrics, deletion and modal states
import { useState, useMemo, useCallback } from 'react'
import { servicesService } from '@/modules/services'
import type { MonitoredService, ServiceCategory, ServiceStatus } from '@/modules/services'

export function useServicesPage(
  services: MonitoredService[],
  initialSelectedService?: MonitoredService | null
) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | ServiceCategory>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceStatus>('all')
  const [deletingService, setDeletingService] = useState<MonitoredService | null>(null)
  const [editingService, setEditingService] = useState<MonitoredService | null>(null)
  const [viewingService, setViewingService] = useState<MonitoredService | null>(
    initialSelectedService || null
  )
  const [viewingServiceTab, setViewingServiceTab] = useState<'overview' | 'edit'>('overview')
  const [isDeleting, setIsDeleting] = useState(false)

  // Metrics
  const total = services.length
  const upCount = useMemo(() => services.filter((s) => s.last_status === 'UP').length, [services])
  const downCount = useMemo(() => services.filter((s) => s.last_status === 'DOWN').length, [services])
  const dbCount = useMemo(() => services.filter((s) => s.category === 'database').length, [services])
  const storageCount = useMemo(() => services.filter((s) => s.category === 'storage').length, [services])
  const appCount = useMemo(() => services.filter((s) => s.category === 'application').length, [services])

  const avgLatency = useMemo(() => {
    const upServices = services.filter((s) => s.last_status === 'UP')
    if (upServices.length === 0) return 0
    const sum = upServices.reduce((acc, s) => acc + (s.last_latency_ms || 0), 0)
    return Math.round(sum / upServices.length)
  }, [services])

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false
      if (statusFilter !== 'all' && s.last_status !== statusFilter) return false
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchName = s.name.toLowerCase().includes(query)
        const matchHost = (s.hostname || '').toLowerCase().includes(query)
        const matchIp = (s.ip || '').toLowerCase().includes(query)
        const matchPort = String(s.port).includes(query)
        const matchDesc = (s.description || '').toLowerCase().includes(query)
        if (!matchName && !matchHost && !matchIp && !matchPort && !matchDesc) return false
      }
      return true
    })
  }, [services, categoryFilter, statusFilter, searchTerm])

  const handleDeleteConfirm = useCallback(
    async (onRefresh: () => void) => {
      if (!deletingService) return
      setIsDeleting(true)
      try {
        await servicesService.deleteService(deletingService.id)
        setDeletingService(null)
        onRefresh()
      } catch {
        alert('Lỗi khi xóa dịch vụ!')
      } finally {
        setIsDeleting(false)
      }
    },
    [deletingService]
  )

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    deletingService,
    setDeletingService,
    editingService,
    setEditingService,
    viewingService,
    setViewingService,
    viewingServiceTab,
    setViewingServiceTab,
    isDeleting,
    handleDeleteConfirm,
    filteredServices,
    total,
    upCount,
    downCount,
    dbCount,
    storageCount,
    appCount,
    avgLatency,
  }
}
