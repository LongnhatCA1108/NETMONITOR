// ponytail: master layout wrapper connecting sidebar, header, footer with locked top position
import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import type { DashboardSummary } from '@/modules/dashboard/types'

export interface LayoutProps {
  children?: ReactNode
  summary: DashboardSummary | null
  syncing: boolean
  onSync: () => Promise<void>
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  sidebarMobileOpen: boolean
  onToggleSidebarMobile: () => void
  onCloseSidebarMobile: () => void
  notification?: string | null
}

export function Layout({
  children,
  summary,
  syncing,
  onSync,
  theme,
  onToggleTheme,
  sidebarMobileOpen,
  onToggleSidebarMobile,
  onCloseSidebarMobile,
  notification,
}: LayoutProps) {
  return (
    <div
      className={`flex h-screen h-[100dvh] overflow-hidden bg-slate-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-600 dark:selection:text-blue-200 transition-colors duration-200 ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-5 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        summary={summary}
        isOpen={sidebarMobileOpen}
        onCloseMobile={onCloseSidebarMobile}
      />

      {/* 2. Main Column: Locked Top Header + Scrollable Content + Footer */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Locked at Top */}
        <Header
          summary={summary}
          onSync={onSync}
          syncing={syncing}
          onToggleSidebarMobile={onToggleSidebarMobile}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        {/* Scrollable View Content Slot */}
        <main className="flex-1 overflow-y-auto min-h-0 px-5 py-8 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Minimal Bottom Footer */}
        <Footer theme={theme} />
      </div>
    </div>
  )
}
