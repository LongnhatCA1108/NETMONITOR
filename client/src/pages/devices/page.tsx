// ponytail: devices page connecting hooks, tables, metrics, and modals
import React from 'react'
import type { Device } from '@/modules/devices'
import type { MonitoredService } from '@/modules/services'
import { useDevicesPage } from './hooks/useDevicesPage'
import { DeviceMetricsCards } from './components/DeviceMetricsCards'
import { DeviceTable } from './components/DeviceTable'
import { DeviceDetailModal } from './components/DeviceDetailModal'
import { EditDeviceModal } from './components/EditDeviceModal'

export interface DevicesPageProps {
  devices: Device[]
  services: MonitoredService[]
  onSelectServiceTab?: () => void
  onSelectService?: (service: MonitoredService) => void
  onRefreshDevices?: () => void
  onShowToast?: (msg: string) => void
  onNavigateSettings?: () => void
  onSyncTailscale?: () => void
}

export const DevicesPage: React.FC<DevicesPageProps> = ({
  devices,
  services,
  onSelectService,
  onRefreshDevices,
  onShowToast = (msg) => alert(msg),
  onNavigateSettings,
  onSyncTailscale,
}) => {
  const {
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
  } = useDevicesPage(devices, services)

  return (
    <div className="space-y-8">
      {/* 1. Metrics Cards */}
      <DeviceMetricsCards
        total={total}
        online={online}
        servers={servers}
        endpoints={endpoints}
      />

      {/* 2. Search & Devices Table */}
      <DeviceTable
        total={total}
        servers={servers}
        endpoints={endpoints}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        filteredDevices={filteredDevices}
        copiedIp={copiedIp}
        onCopyIp={handleCopy}
        getDeviceServices={getDeviceServices}
        onSelectDevice={setSelectedDevice}
        onEditDevice={setEditingDevice}
        onSyncTailscale={onSyncTailscale}
        onNavigateSettings={onNavigateSettings}
      />

      {/* 3. Detail Modal */}
      <DeviceDetailModal
        device={selectedDevice}
        open={!!selectedDevice}
        onOpenChange={(open) => !open && setSelectedDevice(null)}
        services={services}
        onSelectService={(srv) => {
          setSelectedDevice(null)
          if (onSelectService) onSelectService(srv)
        }}
        onEditService={(_srv) => {
          setSelectedDevice(null)
        }}
      />

      {/* 4. Edit Modal */}
      <EditDeviceModal
        device={editingDevice}
        open={!!editingDevice}
        onOpenChange={(open) => !open && setEditingDevice(null)}
        onSuccess={() => {
          if (onRefreshDevices) onRefreshDevices()
        }}
        onShowToast={onShowToast}
      />
    </div>
  )
}
