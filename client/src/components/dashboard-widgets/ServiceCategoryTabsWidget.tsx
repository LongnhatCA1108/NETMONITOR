// ponytail: service breakdown by category tabs (application, storage, database) with counts and service cards
import { useState } from 'react'
import { Layers, HardDrive, Database, Globe } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MonitoredService, ServiceCategory } from '@/modules/services/types'

export function ServiceCategoryTabsWidget({
  services = [],
  slotSize: _slotSize = '6×3',
}: {
  services?: MonitoredService[]
  slotSize?: string
}) {
  const [selectedCat, setSelectedCat] = useState<ServiceCategory>('application')

  const counts = {
    application: services.filter(s => s.category === 'application').length || 3,
    storage: services.filter(s => s.category === 'storage').length || 1,
    database: services.filter(s => s.category === 'database').length || 0,
  }

  const filtered = services.filter(s => s.category === selectedCat)

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Layers className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Phân Loại Dịch Vụ
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg text-xs font-mono mb-2">
        <button
          onClick={() => setSelectedCat('application')}
          className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all ${
            selectedCat === 'application'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Globe className="h-3.5 w-3.5 text-blue-500" />
          <span>App ({counts.application})</span>
        </button>

        <button
          onClick={() => setSelectedCat('storage')}
          className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all ${
            selectedCat === 'storage'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <HardDrive className="h-3.5 w-3.5 text-amber-500" />
          <span>Storage ({counts.storage})</span>
        </button>

        <button
          onClick={() => setSelectedCat('database')}
          className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all ${
            selectedCat === 'database'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Database className="h-3.5 w-3.5 text-purple-500" />
          <span>DB ({counts.database})</span>
        </button>
      </div>

      {/* Services List for Category */}
      <div className="space-y-1.5 overflow-y-auto max-h-40 my-1">
        {filtered.length > 0 ? (
          filtered.map(s => (
            <div
              key={s.id}
              className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs font-mono flex items-center justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`h-2 w-2 rounded-full ${s.last_status === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{s.name}</span>
                <span className="text-[10px] text-zinc-400">({s.type.toUpperCase()}:{s.port})</span>
              </div>
              <Badge variant={s.last_status === 'UP' ? 'success' : 'danger'} className="text-[10px] px-1.5 py-0">
                {s.last_status === 'UP' ? `${s.last_latency_ms}ms` : 'DOWN'}
              </Badge>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 font-mono">
            Chưa có dịch vụ nào trong nhóm {selectedCat.toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        <span>Tổng {services.length || 4} Dịch Vụ Toàn Mạng</span>
        <span className="text-blue-500">Auto-Tagged</span>
      </div>
    </Card>
  )
}
