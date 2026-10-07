// ponytail: responsive sidebar navigation with react-router-dom NavLink, active indicator, and hub status
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Server,
  Cpu,
  Settings,
  ShieldAlert,
  Activity,
  LayoutGrid,
  Tv,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DashboardSummary } from '@/modules/dashboard/types'

export interface SidebarProps {
  summary: DashboardSummary | null
  isOpen?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({
  summary,
  isOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems: Array<{
    path: string
    label: string
    icon: typeof LayoutDashboard
    badge?: string | number
    badgeVariant?: 'default' | 'success' | 'danger' | 'blue'
  }> = [
    {
      path: '/',
      label: 'Trang chủ',
      icon: LayoutDashboard,
    },
    {
      path: '/soc',
      label: 'Màn Hình SOC (12×6)',
      icon: Tv,
      badge: 'KIOSK',
      badgeVariant: 'danger',
    },
    {
      path: '/widgets',
      label: 'Kho Ô Dashboard (Demo)',
      icon: LayoutGrid,
      badge: '23 Loại',
      badgeVariant: 'blue',
    },
    {
      path: '/devices',
      label: 'Quản lý thiết bị',
      icon: Server,
      badge: summary?.total_devices,
      badgeVariant: 'default',
    },
    {
      path: '/services',
      label: 'Quản lý dịch vụ',
      icon: Cpu,
      badge: summary ? `${summary.total_services - summary.down_services}/${summary.total_services}` : undefined,
      badgeVariant: summary && summary.down_services > 0 ? 'danger' : 'success',
    },
    {
      path: '/settings',
      label: 'Thiết lập hệ thống',
      icon: Settings,
    },
    {
      path: '/settings/soc',
      label: 'Thiết lập SOC Dashboard',
      icon: ShieldAlert,
    },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 h-full shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-transform duration-200 lg:static lg:h-full lg:shrink-0 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center gap-3.5 border-b border-zinc-200 dark:border-zinc-800 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
                MeshGuard
              </span>
              <Badge variant="blue" className="text-[10px] px-1.5 py-0 font-bold uppercase">
                SOC
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 font-mono">Tailscale Mesh Hub</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 mb-3 font-mono">
            Menu Điều Hướng
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all select-none cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 truncate">
                        <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeVariant === 'danger'
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                              : item.badgeVariant === 'success'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : item.badgeVariant === 'blue'
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer / Hub Status */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Trạng Thái Hub:</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 font-mono truncate">
              {summary?.monitor_node ? (
                <>Trạm: <strong>{summary.monitor_node.hostname}</strong> ({summary.monitor_node.ip})</>
              ) : (
                'Trạm: Note10+ Termux (100.64.0.1)'
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
