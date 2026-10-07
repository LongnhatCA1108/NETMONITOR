// ponytail: services page connecting hooks, tables, metrics, and modals
import React, { useState } from 'react'
import type { Device } from '@/modules/devices'
import type { MonitoredService } from '@/modules/services'
import { useServicesPage } from './hooks/useServicesPage'
import { ServiceMetricsCards } from './components/ServiceMetricsCards'
import { ServiceTable } from './components/ServiceTable'
import { ServiceDetailModal } from './components/ServiceDetailModal'
import { EditServiceModal } from './components/EditServiceModal'
import { AddServiceModal } from './components/AddServiceModal'

export interface ServicesPageProps {
  services: MonitoredService[]
  devices?: Device[]
  onOpenAddModal?: () => void
  isAddModalOpen?: boolean
  onCloseAddModal?: () => void
  onRefresh: () => void
  onSelectDevice?: (device: Device) => void
  initialSelectedService?: MonitoredService | null
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  devices = [],
  onOpenAddModal,
  isAddModalOpen,
  onCloseAddModal,
  onRefresh,
  onSelectDevice,
  initialSelectedService,
}) => {
  const [internalAddOpen, setInternalAddOpen] = useState(false)

  const {
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
  } = useServicesPage(services, initialSelectedService)

  const handleOpenAdd = () => {
    if (onOpenAddModal) {
      onOpenAddModal()
    } else {
      setInternalAddOpen(true)
    }
  }

  const handleAddChange = (open: boolean) => {
    if (onCloseAddModal && !open) {
      onCloseAddModal()
    }
    setInternalAddOpen(open)
  }

  const effectiveAddOpen = isAddModalOpen !== undefined ? isAddModalOpen : internalAddOpen

  return (
    <div className="space-y-8">
      {/* 1. Metrics Cards */}
      <ServiceMetricsCards
        total={total}
        upCount={upCount}
        downCount={downCount}
        avgLatency={avgLatency}
        appCount={appCount}
        dbCount={dbCount}
        storageCount={storageCount}
      />

      {/* 2. Controls & Services Table */}
      <ServiceTable
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onOpenAddModal={handleOpenAdd}
        filteredServices={filteredServices}
        onViewService={(service, tab = 'overview') => {
          setViewingService(service)
          setViewingServiceTab(tab)
        }}
        onEditService={(service) => {
          setViewingService(service)
          setViewingServiceTab('edit')
        }}
        deletingService={deletingService}
        onSetDeletingService={setDeletingService}
        isDeleting={isDeleting}
        onDeleteConfirm={() => handleDeleteConfirm(onRefresh)}
      />

      {/* 3. Detail & In-Place Edit Modal */}
      <ServiceDetailModal
        service={viewingService}
        open={!!viewingService}
        onOpenChange={(open) => !open && setViewingService(null)}
        devices={devices}
        onSelectDevice={onSelectDevice}
        onRefresh={onRefresh}
        initialTab={viewingServiceTab}
        onEdit={(srv) => {
          setViewingService(srv)
          setViewingServiceTab('edit')
        }}
      />

      {/* 4. Secondary Edit Service Modal */}
      <EditServiceModal
        service={editingService}
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
        devices={devices}
        onServiceUpdated={() => {
          onRefresh()
          if (viewingService && editingService && viewingService.id === editingService.id) {
            setViewingService(null)
          }
        }}
      />

      {/* 5. Add Service Modal */}
      <AddServiceModal
        open={effectiveAddOpen}
        onOpenChange={handleAddChange}
        devices={devices}
        onServiceCreated={() => {
          onRefresh()
          handleAddChange(false)
        }}
      />
    </div>
  )
}
