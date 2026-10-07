// ponytail: real-time scrolling live event and incident ticker widget
import { History, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'

export interface EventItem {
  id: string | number
  type: 'up' | 'down' | 'connect' | 'disconnect' | 'config'
  time: string
  title: string
  detail: string
}

export function LiveIncidentFeedWidget({
  events,
  slotSize: _slotSize = '4×3',
}: {
  events?: EventItem[]
  slotSize?: string
}) {
  const displayEvents: EventItem[] = events && events.length > 0 ? events : [
    {
      id: 1,
      type: 'down',
      time: '09:12:05',
      title: 'Relay (14616) Gặp sự cố',
      detail: 'Không thể kết nối socket: fetch failed',
    },
    {
      id: 2,
      type: 'connect',
      time: '08:32:11',
      title: 'POCO C40 Trực tuyến',
      detail: 'Thiết bị hoạt động trở lại từ Tailscale Control Plane',
    },
    {
      id: 3,
      type: 'disconnect',
      time: '08:26:11',
      title: 'Z Flip3 Ngắt kết nối',
      detail: 'Mất tín hiệu kết nối (Chuyển chế độ ngủ/Roaming)',
    },
    {
      id: 4,
      type: 'up',
      time: '07:41:11',
      title: 'Termux Note10+ Phục hồi',
      detail: 'Dịch vụ MobileNas phản hồi bình thường (41ms)',
    },
    {
      id: 5,
      type: 'config',
      time: '07:30:00',
      title: 'Tự động dọn dẹp Log',
      detail: 'Đã xóa các bản ghi lịch sử cũ hơn 30 ngày',
    },
  ]

  const getIcon = (type: EventItem['type']) => {
    switch (type) {
      case 'down':
        return <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
      case 'up':
        return <Wifi className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      case 'disconnect':
        return <WifiOff className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      case 'connect':
        return <Wifi className="h-3.5 w-3.5 text-blue-500 shrink-0" />
      default:
        return <RefreshCw className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
    }
  }

  return (
    <Card className="relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <History className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Nhật Ký Sự Kiện
          </div>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-2 overflow-y-auto max-h-52 pr-1">
        {displayEvents.map(ev => (
          <div
            key={ev.id}
            className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 text-xs font-mono"
          >
            <div className="mt-0.5">{getIcon(ev.type)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {ev.title}
                </span>
                <span className="text-[10px] text-zinc-400 shrink-0">
                  {ev.time}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {ev.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-time Event Stream</span>
        </div>
        <span>Lưu giữ 30 ngày</span>
      </div>
    </Card>
  )
}
