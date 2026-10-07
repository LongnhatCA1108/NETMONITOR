import { useState, useMemo } from 'react'
import {
  Radar,
  Play,
  Pause,
  Server,
  Smartphone,
  Cloud,
  Laptop,
  Crosshair,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Device } from '@/modules'

export interface RadarNode {
  id: string
  name: string
  ip: string
  os?: string
  type: 'server' | 'endpoint' | 'cloud' | 'gateway'
  latency: number
  jitter?: number
  packetLoss?: number
  status: 'UP' | 'DOWN'
  angle: number // in degrees 0-360 (0 = North/Up)
  distance: number // radius percentage 0.15 - 0.95
}

export interface MeshTopologyRadarWidgetProps {
  devices?: Device[]
  slotSize?: string
  className?: string
}

const DEFAULT_RADAR_NODES: RadarNode[] = [
  {
    id: 'n1',
    name: 'AWS Tokyo Gateway',
    ip: '13.230.12.8',
    os: 'Linux (Debian)',
    type: 'cloud',
    latency: 48,
    jitter: 1.4,
    packetLoss: 0,
    status: 'UP',
    angle: 35,
    distance: 0.45,
  },
  {
    id: 'n2',
    name: 'Termux Hub Note10+',
    ip: '100.64.0.1',
    os: 'Android Termux',
    type: 'server',
    latency: 12,
    jitter: 0.4,
    packetLoss: 0,
    status: 'UP',
    angle: 115,
    distance: 0.24,
  },
  {
    id: 'n3',
    name: 'Office Router MikroTik',
    ip: '192.168.1.1',
    os: 'RouterOS v7',
    type: 'gateway',
    latency: 5,
    jitter: 0.2,
    packetLoss: 0,
    status: 'UP',
    angle: 175,
    distance: 0.2,
  },
  {
    id: 'n4',
    name: 'POCO C40 Field Agent',
    ip: '100.64.0.45',
    os: 'Android 11',
    type: 'endpoint',
    latency: 68,
    jitter: 3.8,
    packetLoss: 0.2,
    status: 'UP',
    angle: 220,
    distance: 0.58,
  },
  {
    id: 'n5',
    name: 'PC Trạm Chính',
    ip: '100.64.0.10',
    os: 'Windows 11 Pro',
    type: 'server',
    latency: 16,
    jitter: 0.6,
    packetLoss: 0,
    status: 'UP',
    angle: 280,
    distance: 0.28,
  },
  {
    id: 'n6',
    name: 'Máy Chủ Relay EU',
    ip: '185.12.44.90',
    os: 'Ubuntu 22.04',
    type: 'server',
    latency: 0,
    jitter: 0,
    packetLoss: 100,
    status: 'DOWN',
    angle: 335,
    distance: 0.88,
  },
]

export function MeshTopologyRadarWidget({
  devices,
  slotSize: _slotSize = '6×3',
  className = '',
}: MeshTopologyRadarWidgetProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState<boolean>(true)
  const [filterMode, setFilterMode] = useState<'all' | 'up' | 'down'>('all')

  // Map real devices if provided, otherwise fallback to rich tactical mock nodes
  const nodes = useMemo<RadarNode[]>(() => {
    if (devices && devices.length > 0) {
      return devices.map((d, idx) => {
        const isOnline = Boolean(d.is_online)
        const angle = Math.round((360 / devices.length) * idx + 20) % 360
        const latency = !isOnline
          ? 0
          : d.node_type === 'server'
            ? 12 + idx * 10
            : d.node_type === 'endpoint'
              ? 45 + idx * 15
              : 30
        const distance = !isOnline
          ? 0.88
          : Math.min(0.85, Math.max(0.22, (latency / 220) * 0.85))

        return {
          id: d.node_id || `d-${idx}`,
          name: d.alias || d.hostname,
          ip: d.ip,
          os: d.os,
          type:
            d.node_type === 'server'
              ? 'server'
              : d.node_type === 'endpoint'
                ? 'endpoint'
                : 'cloud',
          latency,
          jitter: Number((Math.random() * 2 + 0.3).toFixed(1)),
          packetLoss: isOnline ? 0 : 100,
          status: isOnline ? 'UP' : 'DOWN',
          angle,
          distance,
        }
      })
    }
    return DEFAULT_RADAR_NODES
  }, [devices])

  // Filter nodes based on active view mode
  const filteredNodes = useMemo(() => {
    if (filterMode === 'up') return nodes.filter(n => n.status === 'UP')
    if (filterMode === 'down') return nodes.filter(n => n.status === 'DOWN')
    return nodes
  }, [nodes, filterMode])

  const upCount = nodes.filter(n => n.status === 'UP').length
  const downCount = nodes.filter(n => n.status === 'DOWN').length

  const activeNode = useMemo(() => {
    const targetId = hoveredNodeId || selectedNodeId
    if (!targetId) return null
    return nodes.find(n => n.id === targetId) || null
  }, [nodes, hoveredNodeId, selectedNodeId])

  // Radar Center & Geometry
  const cx = 220
  const cy = 220
  const maxR = 175

  // Distance tiers in milliseconds
  const rings = [
    { r: maxR * 0.25, label: '25ms', color: '#10b981' },
    { r: maxR * 0.5, label: '50ms', color: '#38bdf8' },
    { r: maxR * 0.75, label: '100ms', color: '#f59e0b' },
    { r: maxR, label: '250ms', color: '#f43f5e' },
  ]

  // Compass azimuth bearings
  const bearings = [
    { angle: 0, label: '000° N', dx: 0, dy: -maxR - 14 },
    { angle: 90, label: '090° E', dx: maxR + 18, dy: 3 },
    { angle: 180, label: '180° S', dx: 0, dy: maxR + 16 },
    { angle: 270, label: '270° W', dx: -maxR - 18, dy: 3 },
  ]

  // Compute node pixel coordinates
  const nodeCoords = useMemo(() => {
    return filteredNodes.map(n => {
      // 0 degrees is North (UP): subtract 90 to orient correctly
      const rad = ((n.angle - 90) * Math.PI) / 180
      const px = cx + Math.cos(rad) * (maxR * n.distance)
      const py = cy + Math.sin(rad) * (maxR * n.distance)
      return { node: n, px, py }
    })
  }, [filteredNodes, cx, cy, maxR])

  // Get active node position for floating HUD tooltip
  const activeCoord = useMemo(() => {
    if (!activeNode) return null
    return nodeCoords.find(item => item.node.id === activeNode.id) || null
  }, [activeNode, nodeCoords])

  return (
    <Card
      className={`relative overflow-hidden border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between h-full select-none ${className}`}
    >
      {/* Background High-Tech Grid Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] dark:bg-[radial-gradient(#10b98120_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between gap-3 p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Radar className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            {isScanning && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            )}
          </div>
          <div className="truncate">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Radar Vệ Tinh
            </span>
          </div>
        </div>

        {/* Tactical Controls & Filters */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800/80 p-0.5 rounded-md text-[11px] font-mono">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Tất Cả ({nodes.length})
            </button>
            <button
              onClick={() => setFilterMode('up')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                filterMode === 'up'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-zinc-500 hover:text-emerald-600'
              }`}
            >
              Up ({upCount})
            </button>
            {downCount > 0 && (
              <button
                onClick={() => setFilterMode('down')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  filterMode === 'down'
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'text-zinc-500 hover:text-rose-600'
                }`}
              >
                Down ({downCount})
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsScanning(!isScanning)}
            title={isScanning ? 'Tạm dừng quét' : 'Tiếp tục quét'}
            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
          >
            {isScanning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-emerald-500" />}
          </Button>
        </div>
      </div>

      {/* Main Radar Screen Viewport */}
      <div className="relative flex-1 min-h-[220px] max-h-[360px] w-full flex items-center justify-center p-2 overflow-hidden">
        <svg
          viewBox="0 0 440 440"
          className="w-full h-full max-h-[340px] aspect-square overflow-visible drop-shadow-md select-none"
        >
          <defs>
            {/* Radar Sweep Gradient Cone */}
            <linearGradient id="radarSweepCone" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
              <stop offset="65%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="90%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.45" />
            </linearGradient>

            {/* Hub Radial Glow */}
            <radialGradient id="hubRadialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            {/* Outer Bezel Glow Filter */}
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Dark Radar Scope Base Disc */}
          <circle
            cx={cx}
            cy={cy}
            r={maxR + 1}
            className="fill-zinc-950/70 dark:fill-zinc-950/90 stroke-emerald-500/20 dark:stroke-emerald-500/30 stroke-1"
          />

          {/* Diagonal 45-degree Guide Rays */}
          <line
            x1={cx - maxR * 0.707}
            y1={cy - maxR * 0.707}
            x2={cx + maxR * 0.707}
            y2={cy + maxR * 0.707}
            stroke="#10b981"
            strokeWidth="0.8"
            strokeDasharray="2 4"
            className="opacity-20"
          />
          <line
            x1={cx - maxR * 0.707}
            y1={cy + maxR * 0.707}
            x2={cx + maxR * 0.707}
            y2={cy - maxR * 0.707}
            stroke="#10b981"
            strokeWidth="0.8"
            strokeDasharray="2 4"
            className="opacity-20"
          />

          {/* Crosshairs with division tick marks */}
          <line
            x1={cx - maxR - 8}
            y1={cy}
            x2={cx + maxR + 8}
            y2={cy}
            stroke="#10b981"
            strokeWidth="1.2"
            className="opacity-35"
          />
          <line
            x1={cx}
            y1={cy - maxR - 8}
            x2={cx}
            y2={cy + maxR + 8}
            stroke="#10b981"
            strokeWidth="1.2"
            className="opacity-35"
          />

          {/* Concentric Range Rings with Latency Markers */}
          {rings.map((ring, idx) => (
            <g key={idx}>
              <circle
                cx={cx}
                cy={cy}
                r={ring.r}
                fill="none"
                stroke="#10b981"
                strokeWidth={idx === rings.length - 1 ? 1.5 : 1}
                strokeDasharray={idx === rings.length - 1 ? undefined : '3 3'}
                className={idx === rings.length - 1 ? 'opacity-40' : 'opacity-25'}
              />
              {/* Range Metric Tag along vertical crosshair */}
              <text
                x={cx + 6}
                y={cy - ring.r + 11}
                className="fill-emerald-600/80 dark:fill-emerald-400/80 font-mono text-[9px] font-semibold select-none pointer-events-none"
              >
                {ring.label}
              </text>
            </g>
          ))}

          {/* Compass Azimuth Bearing Labels (N, E, S, W) */}
          {bearings.map((b, idx) => (
            <text
              key={idx}
              x={cx + b.dx}
              y={cy + b.dy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-zinc-400 dark:fill-zinc-500 font-mono text-[10px] font-bold select-none pointer-events-none"
            >
              {b.label}
            </text>
          ))}

          {/* Animated Sweeping Sonar/Radar Cone */}
          <g
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              animationPlayState: isScanning ? 'running' : 'paused',
              animationDuration: '4s',
              animationTimingFunction: 'linear',
            }}
            className={isScanning ? 'animate-spin' : ''}
          >
            {/* Trailing Sector Arc: 50 degrees counter-clockwise from 0 (North) */}
            {/* At 0 deg: (220, 45). At -50 deg: (220 - 175*sin(50), 220 - 175*cos(50)) = (85.9, 107.5) */}
            <path
              d={`M ${cx} ${cy} L 85.9 107.5 A ${maxR} ${maxR} 0 0 1 ${cx} ${cy - maxR} Z`}
              fill="url(#radarSweepCone)"
              className="pointer-events-none"
            />
            {/* Sharp Leading Sweep Beam Line */}
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - maxR}
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
              className="opacity-90 pointer-events-none"
            />
            {/* Glowing Leading Beam Tip */}
            <circle
              cx={cx}
              cy={cy - maxR}
              r="3.5"
              fill="#34d399"
              className="pointer-events-none filter drop-shadow-[0_0_4px_#10b981]"
            />
          </g>

          {/* Central Monitor Hub (Termux / Main Monitor) */}
          <g className="select-none">
            {/* Hub Glow Aura */}
            <circle cx={cx} cy={cy} r={28} fill="url(#hubRadialGlow)" className="pointer-events-none" />
            <circle
              cx={cx}
              cy={cy}
              r={18}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.2"
              className="opacity-40 animate-ping pointer-events-none"
            />
            <circle
              cx={cx}
              cy={cy}
              r={9}
              className="fill-emerald-500 stroke-zinc-950 stroke-2 pointer-events-none shadow-lg"
            />
            <circle cx={cx} cy={cy} r={3} className="fill-white pointer-events-none" />
          </g>

          {/* Satellite Node Vectors & Blips (Zero-Glitch Hit Detection) */}
          {nodeCoords.map(({ node, px, py }) => {
            const isHovered = hoveredNodeId === node.id
            const isSelected = selectedNodeId === node.id
            const isDown = node.status === 'DOWN'

            const nodeColor = isDown ? '#f43f5e' : node.latency > 150 ? '#f59e0b' : '#10b981'
            const strokeColor = isDown ? '#f43f5e' : node.latency > 150 ? '#fbbf24' : '#34d399'

            // Label positioning: place away from center
            const labelAbove = py < cy

            return (
              <g key={node.id} className="select-none">
                {/* Connecting Vector Ray from Hub */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={px}
                  y2={py}
                  stroke={nodeColor}
                  strokeWidth={isHovered || isSelected ? 2 : 1.2}
                  strokeDasharray={isDown ? '3 3' : isHovered ? undefined : '2 3'}
                  className={`pointer-events-none transition-all duration-200 ${
                    isHovered || isSelected ? 'opacity-90' : 'opacity-35'
                  }`}
                />

                {/* Animated Blip Ping Ring for Active Nodes */}
                {!isDown && (
                  <circle
                    cx={px}
                    cy={py}
                    r={isHovered ? 18 : 10}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.2"
                    className={`pointer-events-none transition-all duration-300 ${
                      isHovered ? 'opacity-70 animate-ping' : 'opacity-30'
                    }`}
                  />
                )}

                {/* Tactical Target Lock Reticle (When Selected or Hovered) */}
                {(isHovered || isSelected) && (
                  <g className="pointer-events-none">
                    <circle
                      cx={px}
                      cy={py}
                      r={15}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="animate-spin opacity-80"
                      style={{ animationDuration: '6s' }}
                    />
                    <line x1={px - 18} y1={py} x2={px - 10} y2={py} stroke={strokeColor} strokeWidth="1.5" />
                    <line x1={px + 10} y1={py} x2={px + 18} y2={py} stroke={strokeColor} strokeWidth="1.5" />
                    <line x1={px} y1={py - 18} x2={px} y2={py - 10} stroke={strokeColor} strokeWidth="1.5" />
                    <line x1={px} y1={py + 10} x2={px} y2={py + 18} stroke={strokeColor} strokeWidth="1.5" />
                  </g>
                )}

                {/* Solid Core Target Blip (Uses SVG radius props, NO CSS transform scale) */}
                <circle
                  cx={px}
                  cy={py}
                  r={isHovered ? 7.5 : isSelected ? 7 : 5.5}
                  fill={nodeColor}
                  stroke="#09090b"
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="pointer-events-none transition-all duration-150 filter drop-shadow-sm"
                />

                {/* Node Callsign / Alias */}
                {/* Node Callsign (Only if not clustered at center or if hovered/selected) */}
                {(node.distance >= 0.35 || isHovered || isSelected) && (
                  <text
                    x={px}
                    y={labelAbove ? py - 11 : py + 16}
                    textAnchor="middle"
                    className={`pointer-events-none select-none font-mono text-[10px] font-semibold transition-all duration-150 ${
                      isHovered || isSelected
                        ? 'fill-white dark:fill-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                        : 'fill-zinc-400 dark:fill-zinc-400'
                    }`}
                  >
                    {node.name.length > 9 ? `${node.name.slice(0, 8)}..` : node.name}
                  </text>
                )}

                {/* Transparent Hit Zone (Fixes mouseenter/leave flutter completely) */}
                <circle
                  cx={px}
                  cy={py}
                  r={22}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
                />
              </g>
            )
          })}
        </svg>

        {/* Floating High-Tech Glassmorphism HUD Tooltip */}
        {activeNode && activeCoord && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(activeCoord.px / 440) * 100}%`,
              top: `${(activeCoord.py / 440) * 100}%`,
            }}
          >
            <div className="bg-zinc-950/95 dark:bg-zinc-900/95 border border-emerald-500/40 text-zinc-100 rounded-lg shadow-2xl p-2.5 backdrop-blur-md min-w-[200px] text-xs font-mono">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-1.5 mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 truncate">
                  {activeNode.type === 'server' ? (
                    <Server className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  ) : activeNode.type === 'endpoint' ? (
                    <Smartphone className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : activeNode.type === 'cloud' ? (
                    <Cloud className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                  ) : (
                    <Laptop className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  )}
                  <span className="truncate">{activeNode.name}</span>
                </div>
                <Badge
                  variant={activeNode.status === 'UP' ? 'success' : 'danger'}
                  className="text-[9px] px-1 py-0 uppercase"
                >
                  {activeNode.status}
                </Badge>
              </div>

              <div className="space-y-1 text-[11px] text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">IP:</span>
                  <span className="text-zinc-200 font-semibold">{activeNode.ip}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">RTT:</span>
                  <span className={activeNode.status === 'UP' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {activeNode.status === 'UP' ? `${activeNode.latency} ms` : 'Mất Tín Hiệu'}
                  </span>
                </div>
                {activeNode.jitter !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Jitter:</span>
                    <span className="text-zinc-300">±{activeNode.jitter} ms</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Vị trí:</span>
                  <span className="text-zinc-400">
                    {activeNode.angle}° / {Math.round(activeNode.distance * 250)}ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tactical Telemetry Bar */}
      <div className="relative z-10 p-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-900/80 text-[11px] font-mono text-zinc-400">
        {selectedNodeId ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <Crosshair className="h-3.5 w-3.5 text-emerald-500 animate-spin shrink-0" style={{ animationDuration: '8s' }} />
              <span className="text-emerald-500 font-bold">[KHÓA]</span>
              {(() => {
                const sel = nodes.find(n => n.id === selectedNodeId)
                if (!sel) return null
                return (
                  <span className="text-zinc-900 dark:text-zinc-100 truncate">
                    <strong>{sel.name}</strong> ({sel.ip}) &bull;{' '}
                    <span className={sel.status === 'UP' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                      {sel.status === 'UP' ? `${sel.latency}ms` : 'OFFLINE'}
                    </span>
                  </span>
                )
              })()}
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 underline cursor-pointer shrink-0"
            >
              Bỏ chọn
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span>&lt;50ms</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span>&gt;150ms</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                <span>Mất tín hiệu</span>
              </span>
            </div>
            <span className="text-[10px] text-zinc-500">250ms Max</span>
          </div>
        )}
      </div>
    </Card>
  )
}
