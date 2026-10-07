// ponytail: devices page hook managing search, filters, modals, and clipboard copy
import { useState, useMemo, useCallback } from 'react'
import type { Device, NodeType } from '@/modules/devices'
import type { MonitoredService } from '@/modules/services'

export function useDevicesPage(devices: Device[], services: MonitoredService[]) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | NodeType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [copiedIp, setCopiedIp] = useState<string | null>(null)

  const handleCopy = useCallback((ip: string) => {
    navigator.clipboard.writeText(ip)
    setCopiedIp(ip)
    setTimeout(() => setCopiedIp(null), 2000)
  }, [])

  // Quick stats
  const total = devices.length
  const online = useMemo(() => devices.filter(d => !!d.is_online).length, [devices])
  const servers = useMemo(() => devices.filter(d => d.node_type === 'server').length, [devices])
  const endpoints = useMemo(() => devices.filter(d => d.node_type === 'endpoint').length, [devices])

  // Filtered devices list
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      if (typeFilter !== 'all' && d.node_type !== typeFilter) return false
      if (statusFilter === 'online' && !d.is_online) return false
      if (statusFilter === 'offline' && d.is_online) return false
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchHostname = d.hostname.toLowerCase().includes(query)
        const matchAlias = (d.alias || '').toLowerCase().includes(query)
        const matchIp = d.ip.toLowerCase().includes(query)
        const matchOs = (d.os || '').toLowerCase().includes(query)
        const matchTags = (d.tags || []).some(t => t.toLowerCase().includes(query))
        if (!matchHostname && !matchAlias && !matchIp && !matchOs && !matchTags) return false
      }
      return true
    })
  }, [devices, typeFilter, statusFilter, searchTerm])

  const getDeviceServices = useCallback(
    (deviceId: string) => services.filter(s => s.device_id === deviceId),
    [services]
  )

  return {
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    selectedDevice,
    setSelectedDevice,
    editingDevice,
    setEditingDevice,
    copiedIp,
    handleCopy,
    filteredDevices,
    total,
    online,
    servers,
    endpoints,
    getDeviceServices,
  }
}
