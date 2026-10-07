// ponytail: layout header with locked top position, search, theme switcher, and SOC status
import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Menu,
  ChevronDown,
  User,
  RefreshCw,
  Shield,
  LogOut,
  Activity,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { DashboardSummary } from '@/modules/dashboard/types'

export interface HeaderProps {
  summary: DashboardSummary | null
  onSync: () => Promise<void>
  syncing: boolean
  onToggleSidebarMobile: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onGlobalSearch?: (term: string) => void
}

export function Header({
  summary,
  onSync,
  syncing,
  onToggleSidebarMobile,
  theme,
  onToggleTheme,
  onGlobalSearch,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [syncedRecently, setSyncedRecently] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (onGlobalSearch) onGlobalSearch(e.target.value)
  }

  const handleSyncClick = async () => {
    await onSync()
    setSyncedRecently(true)
    setTimeout(() => setSyncedRecently(false), 3000)
    setDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 shrink-0 flex h-18 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/90 px-5 sm:px-8 backdrop-blur-md transition-colors">
      {/* 1. Left: Mobile Menu Toggle + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Brand indicator in header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400/30">
            <Activity className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
              MeshGuard
            </span>
            <span className="ml-2 rounded-md bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              SOC
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center: Global Search Bar */}
      <div className="flex-1 max-w-xl mx-4 sm:mx-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-zinc-400 dark:text-zinc-500" />
          <Input
            placeholder="Tìm kiếm thiết bị, dịch vụ, IP..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-11 pr-14 h-11 bg-zinc-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus-visible:ring-blue-500"
          />
          <kbd className="absolute right-3 top-2.5 hidden sm:inline-block rounded-md bg-zinc-200 dark:bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* 3. Right: Status, Theme Switcher & Dropdown Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Network Status Badge */}
        {summary && (
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">
              {summary.online_devices}/{summary.total_devices} Mesh
            </span>
          </div>
        )}

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer select-none"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="h-5 w-5 text-blue-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Dropdown Menu Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 p-2 pr-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/90 transition-colors select-none cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-zinc-300 border border-blue-200 dark:border-zinc-700">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-none">Admin</div>
            </div>
            <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Content */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-2xl z-50 text-sm animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">Quản Trị Viên SOC</div>
                <div className="text-xs text-zinc-500 font-mono truncate">admin@meshguard.local</div>
              </div>

              <div className="space-y-1">
                {/* Sync Action */}
                <button
                  onClick={handleSyncClick}
                  disabled={syncing}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin text-blue-500' : 'text-zinc-400'}`} />
                    <span>Đồng bộ Tailscale</span>
                  </div>
                  {syncedRecently && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </button>

                {/* Theme toggle in dropdown */}
                <button
                  onClick={() => {
                    onToggleTheme()
                    setDropdownOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-600" />}
                    <span>{theme === 'dark' ? 'Giao diện Sáng (Light)' : 'Giao diện Tối (Dark)'}</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                </button>

                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                <button
                  onClick={() => {
                    alert('Phiên bản MeshGuard SOC v1.0.0 — Bản dựng hoàn thiện.')
                    setDropdownOpen(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Shield className="h-4 w-4 text-zinc-400" />
                  <span>Thông tin SOC & Bản quyền</span>
                </button>

                <button
                  onClick={() => {
                    alert('Chức năng đăng xuất khỏi phiên làm việc.')
                    setDropdownOpen(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
