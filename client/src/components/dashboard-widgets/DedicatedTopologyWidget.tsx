// ponytail: interactive server topology diagram with smart nearest-side edge handles, persistent drag positions, and alias/name service badges
import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  applyNodeChanges,
  type Node,
  type Edge,
  type NodeProps,
  type OnNodesChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import {
  Server,
  Smartphone,
  Laptop,
  Cloud,
  HardDrive,
  Database,
  Cpu,
  Globe,
  Monitor,
  Network,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Device, MonitoredService } from '@/modules'

export interface TopologyServiceItem {
  id: number
  name: string
  port: number
  type: 'http' | 'tcp'
  category: 'storage' | 'database' | 'application'
  last_status: 'UP' | 'DOWN' | 'PENDING'
  last_latency_ms: number
  error_msg?: string | null
}

export interface DeviceNodeData {
  [key: string]: unknown
  nodeId: string
  hostname: string
  alias?: string
  ip: string
  os: string
  isOnline: boolean
  nodeType: 'monitor' | 'server' | 'endpoint'
  services: TopologyServiceItem[]
}

const STORAGE_KEY = 'meshguard_topology_positions_v3'

// Helper: Tải tọa độ đã lưu từ localStorage
function loadSavedPositions(): Record<string, { x: number; y: number }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Helper: Lưu tọa độ vào localStorage
function saveNodePositions(posMap: Record<string, { x: number; y: number }>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posMap))
  } catch {
    // ignore
  }
}

// =========================================================================
// 1. NODE THIẾT BỊ THƯỜNG (Icon trung tâm + Vòng nét đứt xoay tròn + 4 cổng kết nối 4 phía)
// =========================================================================
function EndpointRotatingNode({ data }: NodeProps<Node<DeviceNodeData>>) {
  const isOnline = data.isOnline

  const getDeviceIcon = () => {
    const o = (data.os || '').toLowerCase()
    if (o.includes('android')) return <Smartphone className="h-5 w-5 text-emerald-500" />
    if (o.includes('windows')) return <Laptop className="h-5 w-5 text-blue-500" />
    return <Smartphone className="h-5 w-5 text-zinc-400" />
  }

  return (
    <div className="group relative flex flex-col items-center">
      {/* 4 Handles cho 4 phía để kết nối từ bên gần nhất */}
      <Handle type="target" id="target-left" position={Position.Left} className="!w-2 !h-2 !bg-blue-500 !border-white dark:!border-zinc-900" />
      <Handle type="target" id="target-right" position={Position.Right} className="!w-2 !h-2 !bg-blue-500 !border-white dark:!border-zinc-900" />
      <Handle type="target" id="target-top" position={Position.Top} className="!w-2 !h-2 !bg-blue-500 !border-white dark:!border-zinc-900" />
      <Handle type="target" id="target-bottom" position={Position.Bottom} className="!w-2 !h-2 !bg-blue-500 !border-white dark:!border-zinc-900" />

      {/* Rotating Ring Container */}
      <div className="relative flex h-14 w-14 items-center justify-center">
        {/* Animated Rotating Border Ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-300 ${
            isOnline
              ? 'border-emerald-500/80 animate-[spin_10s_linear_infinite] shadow-sm shadow-emerald-500/20'
              : 'border-zinc-400/50 dark:border-zinc-600/50'
          }`}
        />

        {/* Center Device Disc */}
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md group-hover:scale-105 transition-transform">
          {getDeviceIcon()}

          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 ${
              isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
            }`}
          />
        </div>
      </div>

      {/* Hiển thị Alias / Tên thiết bị (không nhồi nhét) */}
      <div className="mt-1 text-center font-mono">
        <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 max-w-[120px] truncate leading-tight">
          {data.alias || data.hostname}
        </div>
        <div className="text-[9px] text-zinc-400 leading-tight">
          {data.ip}
        </div>
      </div>
    </div>
  )
}

// =========================================================================
// 2. NODE MÁY CHỦ QUẢN LÝ DỊCH VỤ (Bao nét đứt, mỗi service là 1 icon kèm TÊN/ALIAS)
// =========================================================================
function ServerWithServicesNode({ data }: NodeProps<Node<DeviceNodeData>>) {
  const isOnline = data.isOnline
  const isMonitor = data.nodeType === 'monitor'

  const getServerIcon = () => {
    if (data.hostname.toLowerCase().includes('aws') || data.alias?.toLowerCase().includes('aws')) {
      return <Cloud className="h-4 w-4 text-amber-500" />
    }
    if ((data.os || '').toLowerCase().includes('android')) {
      return <Smartphone className="h-4 w-4 text-emerald-500" />
    }
    return <Server className="h-4 w-4 text-blue-500" />
  }

  const getServiceIcon = (name: string, category: string) => {
    const n = name.toLowerCase()
    if (category === 'storage' || n.includes('nas')) return <HardDrive className="h-4 w-4 text-amber-500" />
    if (category === 'database' || n.includes('sql') || n.includes('db')) return <Database className="h-4 w-4 text-purple-500" />
    if (n.includes('rdp') || n.includes('remote')) return <Monitor className="h-4 w-4 text-blue-500" />
    if (n.includes('llm') || n.includes('ai')) return <Cpu className="h-4 w-4 text-rose-500" />
    return <Globe className="h-4 w-4 text-emerald-500" />
  }

  return (
    <div
      className={`relative min-w-[230px] max-w-[300px] rounded-2xl p-3 shadow-lg transition-all ${
        isMonitor
          ? 'bg-blue-50/95 dark:bg-zinc-900/95 border-2 border-dashed border-blue-500 shadow-blue-500/15 ring-2 ring-blue-500/10'
          : isOnline
          ? 'bg-white/95 dark:bg-zinc-900/95 border-2 border-dashed border-zinc-400 dark:border-zinc-700 hover:border-blue-400'
          : 'bg-zinc-50/80 dark:bg-zinc-950/80 border-2 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60'
      }`}
    >
      {/* 4 Handles cho Monitor Hub (Source) và các Server khác (Target) */}
      <Handle type="source" id="hub-left" position={Position.Left} className="!w-2 !h-2 !bg-blue-500 !border-white dark:!border-zinc-900" />
      <Handle type="source" id="hub-right" position={Position.Right} className="!w-2 !h-2 !bg-blue-500 !border-white dark:!border-zinc-900" />
      <Handle type="source" id="hub-top" position={Position.Top} className="!w-2 !h-2 !bg-blue-500 !border-white dark:!border-zinc-900" />
      <Handle type="source" id="hub-bottom" position={Position.Bottom} className="!w-2 !h-2 !bg-blue-500 !border-white dark:!border-zinc-900" />

      <Handle type="target" id="target-left" position={Position.Left} className="!w-2 !h-2 !bg-emerald-500 !border-white dark:!border-zinc-900" />
      <Handle type="target" id="target-right" position={Position.Right} className="!w-2 !h-2 !bg-emerald-500 !border-white dark:!border-zinc-900" />
      <Handle type="target" id="target-top" position={Position.Top} className="!w-2 !h-2 !bg-emerald-500 !border-white dark:!border-zinc-900" />
      <Handle type="target" id="target-bottom" position={Position.Bottom} className="!w-2 !h-2 !bg-emerald-500 !border-white dark:!border-zinc-900" />

      {/* Server Header: Alias / Hostname + IP */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
            {getServerIcon()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1">
              <span>{data.alias || data.hostname}</span>
              {isMonitor && <Badge variant="blue" className="text-[9px] px-1 py-0">HUB</Badge>}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 truncate">
              {data.ip}
            </div>
          </div>
        </div>

        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-zinc-400'}`} />
      </div>

      {/* Services Area: Hiển thị icon + TÊN DỊCH VỤ (không hiện port theo đúng yêu cầu) */}
      <div className="mt-2.5">
        <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Dịch Vụ Quản Lý ({data.services.length})</span>
          <span className="text-zinc-500 font-normal">TÊN / ALIAS</span>
        </div>

        {data.services.length > 0 ? (
          <div className="flex items-center gap-2.5 flex-wrap">
            {data.services.map(svc => {
              const isUp = svc.last_status === 'UP'
              return (
                <div
                  key={svc.id}
                  className="group/svc relative flex flex-col items-center"
                >
                  {/* Service Icon Disc */}
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                      isUp
                        ? 'bg-zinc-50 dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:scale-105 shadow-xs'
                        : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/80 animate-pulse'
                    }`}
                  >
                    {getServiceIcon(svc.name, svc.category)}

                    {/* Status Dot on Corner */}
                    <span
                      className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                        isUp ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>

                  {/* Hiển thị Alias / Tên dịch vụ (không hiện port) */}
                  <span className="mt-1 text-[10px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 max-w-[68px] truncate text-center leading-tight">
                    {svc.name}
                  </span>

                  {/* Hover Floating Tooltip */}
                  <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/svc:opacity-100 transition-opacity z-50 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2.5 py-1.5 rounded-lg shadow-xl text-[10px] font-mono whitespace-nowrap">
                    <div className="font-bold text-xs">{svc.name}</div>
                    <div className="text-zinc-300 dark:text-zinc-600">
                      Giao thức: {svc.type.toUpperCase()}:{svc.port}
                    </div>
                    <div className={isUp ? 'text-emerald-400 dark:text-emerald-600 font-bold' : 'text-rose-400 font-bold'}>
                      {isUp ? `Độ trễ: ${svc.last_latency_ms}ms` : 'Sự cố: Không phản hồi'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-1 text-center text-[10px] font-mono text-zinc-400 italic">
            Không có dịch vụ gắn kèm
          </div>
        )}
      </div>
    </div>
  )
}

const nodeTypes = {
  endpointRotating: EndpointRotatingNode,
  serverWithServices: ServerWithServicesNode,
}

// =========================================================================
// THUẬT TOÁN TÍNH TOÁN CỔNG GẦN NHẤT THÔNG MINH (NEAREST-HANDLE ROUTING)
// =========================================================================
function computeNearestHandles(hubPos: { x: number; y: number }, targetPos: { x: number; y: number }) {
  const dx = targetPos.x - hubPos.x
  const dy = targetPos.y - hubPos.y

  // Nếu chênh lệch ngang lớn hơn chênh lệch dọc
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx < 0) {
      // Target nằm BÊN TRÁI Hub -> Hub mở cổng TRÁI, Target nhận cổng PHẢI
      return { sourceHandle: 'hub-left', targetHandle: 'target-right' }
    } else {
      // Target nằm BÊN PHẢI Hub -> Hub mở cổng PHẢI, Target nhận cổng TRÁI
      return { sourceHandle: 'hub-right', targetHandle: 'target-left' }
    }
  } else {
    if (dy < 0) {
      // Target nằm PHÍA TRÊN Hub -> Hub mở cổng TRÊN, Target nhận cổng DƯỚI
      return { sourceHandle: 'hub-top', targetHandle: 'target-bottom' }
    } else {
      // Target nằm PHÍA DƯỚI Hub -> Hub mở cổng DƯỚI, Target nhận cổng TRÊN
      return { sourceHandle: 'hub-bottom', targetHandle: 'target-top' }
    }
  }
}

export function DedicatedTopologyWidget({
  devices = [],
  services = [],
  slotSize: _slotSize = '12×4',
  size = 'standard',
}: {
  devices?: Device[]
  services?: MonitoredService[]
  slotSize?: string
  size?: 'compact' | 'standard' | 'large'
}) {
  const [expanded, setExpanded] = useState(false)

  // Bố cục mặc định chuẩn: 2 máy bên trái, 2 máy bên phải, 1 máy trên, 1 máy dưới, Hub ở giữa
  const defaultPositions: Record<string, { x: number; y: number }> = useMemo(() => ({
    hub: { x: 420, y: 200 },
    pos_left_1: { x: 70, y: 80 },    // Bên trái trên
    pos_left_2: { x: 70, y: 320 },   // Bên trái dưới
    pos_right_1: { x: 780, y: 80 },  // Bên phải trên
    pos_right_2: { x: 780, y: 320 }, // Bên phải dưới
    pos_top: { x: 420, y: 40 },      // Phía trên
    pos_bottom: { x: 420, y: 450 },  // Phía dưới
  }), [])

  // Xây dựng danh sách node từ dữ liệu thiết bị và tọa độ đã lưu
  const buildNodes = useCallback(
    (devList: Device[], srvList: MonitoredService[]) => {
      const savedPos = loadSavedPositions()
      const monitorNode = devList.find(d => d.node_type === 'monitor') || {
        node_id: 'hub_central',
        hostname: 'nhatlong-381790',
        alias: 'Máy chủ điều phối (Termux Hub)',
        ip: '100.96.221.122',
        os: 'linux',
        is_online: 1,
        node_type: 'monitor' as const,
      }

      const otherDevices = devList.filter(d => d.node_id !== monitorNode.node_id)
      const resNodes: Node<DeviceNodeData>[] = []

      // 1. Hub Node
      const hubServices = srvList.filter(s => s.device_id === monitorNode.node_id)
      const hubCoord = savedPos[monitorNode.node_id] || defaultPositions.hub

      resNodes.push({
        id: monitorNode.node_id,
        type: 'serverWithServices',
        position: hubCoord,
        draggable: true,
        data: {
          nodeId: monitorNode.node_id,
          hostname: monitorNode.hostname,
          alias: monitorNode.alias,
          ip: monitorNode.ip,
          os: monitorNode.os || 'linux',
          isOnline: !!monitorNode.is_online,
          nodeType: 'monitor',
          services: hubServices.map(s => ({
            id: s.id,
            name: s.name,
            port: s.port,
            type: s.type,
            category: s.category,
            last_status: s.last_status,
            last_latency_ms: s.last_latency_ms,
            error_msg: s.error_msg,
          })),
        },
      })

      // 2. Vệ tinh xung quanh: 2 cái bên trái, 2 cái bên phải, còn lại trên/dưới
      const fallbackList = [
        defaultPositions.pos_left_1,
        defaultPositions.pos_left_2,
        defaultPositions.pos_right_1,
        defaultPositions.pos_right_2,
        defaultPositions.pos_top,
        defaultPositions.pos_bottom,
      ]

      otherDevices.forEach((d, idx) => {
        const devServices = srvList.filter(s => s.device_id === d.node_id)
        const hasServices = devServices.length > 0
        const nodeType = hasServices ? 'serverWithServices' : 'endpointRotating'

        const fallback = fallbackList[idx] || { x: 780, y: 150 + idx * 80 }
        const coord = savedPos[d.node_id] || fallback

        resNodes.push({
          id: d.node_id,
          type: nodeType,
          position: coord,
          draggable: true,
          data: {
            nodeId: d.node_id,
            hostname: d.hostname,
            alias: d.alias,
            ip: d.ip,
            os: d.os || '',
            isOnline: !!d.is_online,
            nodeType: (d.node_type || 'server') as any,
            services: devServices.map(s => ({
              id: s.id,
              name: s.name,
              port: s.port,
              type: s.type,
              category: s.category,
              last_status: s.last_status,
              last_latency_ms: s.last_latency_ms,
              error_msg: s.error_msg,
            })),
          },
        })
      })

      return resNodes
    },
    [defaultPositions]
  )

  // Khởi tạo state nodes
  const [nodes, setNodes] = useState<Node<DeviceNodeData>[]>(() => buildNodes(devices, services))

  // Cập nhật data cho nodes khi devices hoặc services thay đổi (bảo toàn vị trí người dùng đã kéo thả)
  useEffect(() => {
    if (devices.length === 0) return
    setNodes(currentNodes => {
      const savedPos = loadSavedPositions()
      const freshNodes = buildNodes(devices, services)

      return freshNodes.map(fresh => {
        const existing = currentNodes.find(c => c.id === fresh.id)
        const pos = savedPos[fresh.id] || (existing ? existing.position : fresh.position)
        return {
          ...fresh,
          position: pos,
        }
      })
    })
  }, [devices, services, buildNodes])

  // Xây dựng đường nối (Edges) thông minh dựa trên vị trí hiện tại của các node
  const edges = useMemo(() => {
    const hubNode = nodes.find(n => (n.data as DeviceNodeData).nodeType === 'monitor') || nodes[0]
    if (!hubNode) return []

    const resEdges: Edge[] = []
    const otherNodes = nodes.filter(n => n.id !== hubNode.id)

    otherNodes.forEach(target => {
      const isOnline = !!(target.data as DeviceNodeData).isOnline

      // Tính toán cổng mở gần nhất giữa Hub và Target
      const { sourceHandle, targetHandle } = computeNearestHandles(hubNode.position, target.position)

      resEdges.push({
        id: `edge-${hubNode.id}-${target.id}`,
        source: hubNode.id,
        target: target.id,
        sourceHandle,
        targetHandle,
        animated: isOnline,
        style: {
          stroke: isOnline ? '#3b82f6' : '#94a3b8',
          strokeWidth: isOnline ? 2 : 1.5,
          strokeDasharray: isOnline ? undefined : '5,5',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isOnline ? '#3b82f6' : '#94a3b8',
        },
      })
    })

    return resEdges
  }, [nodes])

  // Xử lý kéo thả node và lưu toạ độ ngay lập tức vào localStorage
  const onNodesChange: OnNodesChange<Node<DeviceNodeData>> = useCallback(changes => {
    setNodes(currentNodes => {
      const nextNodes = applyNodeChanges(changes, currentNodes)

      // Kiểm tra nếu có thay đổi vị trí thì lưu ngay
      const hasPosChange = changes.some(c => c.type === 'position' && c.position)
      if (hasPosChange) {
        const posMap: Record<string, { x: number; y: number }> = {}
        nextNodes.forEach(n => {
          posMap[n.id] = { x: Math.round(n.position.x), y: Math.round(n.position.y) }
        })
        saveNodePositions(posMap)
      }

      return nextNodes
    })
  }, [])

  // Đặt lại vị trí ban đầu (xóa localStorage)
  const handleResetPositions = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setNodes(buildNodes(devices, services))
    } catch {
      // ignore
    }
  }, [devices, services, buildNodes])

  const heightClass = expanded
    ? 'fixed inset-3 z-50 h-[calc(100vh-1.5rem)]'
    : size === 'compact'
    ? 'h-[380px]'
    : size === 'large'
    ? 'h-[620px]'
    : 'h-[520px]'

  return (
    <Card className={`relative overflow-hidden p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between transition-all ${heightClass}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Network className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Sơ Đồ Máy Chủ &amp; Dịch Vụ
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs font-mono gap-1 text-zinc-400 hover:text-white cursor-pointer"
            onClick={handleResetPositions}
            title="Khôi phục lại vị trí mặc định"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Đặt lại</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white cursor-pointer"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="relative flex-1 w-full rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/80">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#71717a" gap={20} size={1} />
          <Controls
            showInteractive={false}
            className="!bg-zinc-900/95 !border-zinc-800 !shadow-md [&>button]:!bg-zinc-900 [&>button]:!border-zinc-800 [&>button]:!fill-zinc-300 [&>button]:!text-zinc-300 hover:[&>button]:!bg-zinc-800"
          />
          <MiniMap
            nodeStrokeColor="#3b82f6"
            nodeColor="#93c5fd"
            maskColor="rgba(0, 0, 0, 0.5)"
            className="!bg-zinc-950/90 !border-zinc-800 !rounded-lg"
          />
        </ReactFlow>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed border-emerald-500 inline-block animate-spin" />
            <span>Endpoint</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-3.5 rounded-[2px] border border-dashed border-blue-500 inline-block" />
            <span>Máy chủ</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>Dịch vụ Live</span>
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:inline">Kéo thả để đổi góc dây</span>
      </div>
    </Card>
  )
}
