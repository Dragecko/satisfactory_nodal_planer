// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  ReactFlowProvider,
  Panel,
  useReactFlow
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Sidebar } from './Sidebar'
import { DRAG_BLOCK_MIME, type BlockDefinition } from '../blocks/types'
import { BlockNode } from './nodes/BlockNode'

export function App() {
  return (
    <ReactFlowProvider>
      <div className="layout">
        <header className="header">
          <div className="brand">
            <div className="logo">⚙️</div>
            <div>
              <h1>Satisfactory Nodal Planner</h1>
              <div className="muted">Prototype nodal inspiré de Blender</div>
            </div>
          </div>
        </header>
        <Sidebar />
        <MainCanvas />
      </div>
    </ReactFlowProvider>
  )
}

function MainCanvas() {
  const initialNodes = useMemo(() => ([
    { id: '1', position: { x: 0, y: 0 }, type: 'block', data: { customName: 'Miner', inCount: 0, outCount: 1, outputRates: [120], updateNodeData: () => {} } },
    { id: '2', position: { x: 300, y: 120 }, type: 'block', data: { customName: 'Smelter', inCount: 1, outCount: 1, inputRates: [120], outputRates: [60], updateNodeData: () => {} } },
    { id: '3', position: { x: 600, y: 240 }, type: 'block', data: { customName: 'Assembler', inCount: 2, outCount: 1, inputRates: [30, 30], outputRates: [30], updateNodeData: () => {} } }
  ]), [])

  const initialEdges = useMemo(() => ([
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3' }
  ]), [])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [snapToGrid] = useState(true)
  const reactFlow = useReactFlow()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const handleResetView = () => {
    reactFlow.fitView({ padding: 0.2 })
  }

  const handleAddNode = () => {
    const id = (nodes.length + 1).toString()
    const { x, y, zoom } = reactFlow.getViewport()
    const position = { x: (-x + 200) / zoom, y: (-y + 120) / zoom }
    setNodes((prev) => [...prev, { id, position, data: { label: `Nœud ${id}` } }])
  }

  const handleNewGraph = () => {
    setNodes(initialNodes)
    setEdges(initialEdges)
    reactFlow.fitView({ padding: 0.2 })
  }

  const onConnect = (connection: Connection | Edge) => {
    setEdges((eds) => addEdge({ ...connection, animated: true }, eds))
  }

  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const onDragOver = (event: React.DragEvent) => {
    // Toujours empêcher le comportement par défaut pour autoriser le drop
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    try {
      const payload = event.dataTransfer.getData(DRAG_BLOCK_MIME)
      if (!payload) return
      const def: BlockDefinition = JSON.parse(payload)

      const wrapper = wrapperRef.current
      const bounds = wrapper ? wrapper.getBoundingClientRect() : (event.currentTarget as HTMLElement).getBoundingClientRect()
      const positionInPane = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
      const position = reactFlow.project(positionInPane)

      const id = `${def.id}-${Date.now().toString(36)}`
      setNodes((prev) => [
        ...prev,
        {
          id,
          type: 'block',
          position,
          data: { def, customName: undefined, inCount: def.inputs.length, outCount: def.outputs.length, updateNodeData: updateNodeDataById }
        }
      ])
    } catch (e) {
      // ignore
    }
  }

  // Gestion sélection (et touche Suppr/Backspace)
  const onSelectionChange = ({ nodes: ns }: { nodes: any[] }) => {
    setSelectedNodeId(ns && ns.length > 0 ? ns[0].id : null)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId))
        setEdges((prev) => prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedNodeId, setNodes, setEdges])

  const updateSelectedNodeData = (updater: (data: any) => any) => {
    if (!selectedNodeId) return
    setNodes((prev) => prev.map((n) => n.id === selectedNodeId ? { ...n, data: updater(n.data) } : n))
  }

  const updateNodeDataById = (id: string, updater: (data: any) => any) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, data: updater(n.data) } : n))
  }

  // Calcul des débits par arête et du taux d'utilisation par port source
  const computeEdgeFlows = (ns: any[], es: any[]) => {
    const idToNode: Record<string, any> = Object.fromEntries(ns.map((n) => [n.id, n]))
    // Regrouper par port source
    type GroupEdge = { edge: any, demand: number, targetIdx: number }
    const groups: Record<string, { capacity: number, edges: GroupEdge[], sourceIdx: number }> = {}

    const parseIdx = (h?: string) => {
      if (!h) return 0
      const p = h.split('-')
      const v = parseInt(p[p.length - 1] || '0', 10)
      return Number.isFinite(v) ? v : 0
    }

    for (const e of es) {
      const source = idToNode[e.source]
      const target = idToNode[e.target]
      if (!source || !target) continue
      const sIdx = parseIdx(e.sourceHandle)
      const tIdx = parseIdx(e.targetHandle)
      const capacity = Math.max(0, Number(source.data?.outputRates?.[sIdx] ?? 0))
      const demand = Math.max(0, Number(target.data?.inputRates?.[tIdx] ?? 0))
      const key = `${e.source}:${sIdx}`
      if (!groups[key]) groups[key] = { capacity, edges: [], sourceIdx: sIdx }
      groups[key].edges.push({ edge: e, demand, targetIdx: tIdx })
    }

    // Distribuer la capacité aux arêtes d'un même port source, par demande décroissante
    const edgeIdToFlow: Record<string, { flow: number, utilPct: number }> = {}
    for (const key of Object.keys(groups)) {
      const { capacity } = groups[key]
      const edgesInGroup = groups[key].edges.sort((a, b) => b.demand - a.demand)
      let remaining = capacity
      let usedTotal = 0
      const perEdgeFlow: Record<string, number> = {}
      for (const ge of edgesInGroup) {
        const take = Math.max(0, Math.min(ge.demand, remaining))
        remaining -= take
        usedTotal += take
        perEdgeFlow[ge.edge.id] = take
      }
      const utilPctGroup = capacity > 0 ? (usedTotal / capacity) * 100 : 0
      for (const ge of edgesInGroup) {
        edgeIdToFlow[ge.edge.id] = { flow: perEdgeFlow[ge.edge.id] || 0, utilPct: utilPctGroup }
      }
    }

    // Générer les nouvelles arêtes avec labels/styles
    const withLabels = es.map((e) => {
      const metrics = edgeIdToFlow[e.id] || { flow: 0, utilPct: 0 }
      const flow = Math.round(metrics.flow * 100) / 100
      const util = Math.min(100, Math.round(metrics.utilPct))
      const label = `${flow}/min • ${util}%`
      // Couleur selon utilisation (0% rouge → 100% vert), uniforme par port source
      const hue = Math.min(100, util) * 1.2 // 0→rouge, 100→vert
      const stroke = `hsl(${hue} 80% 55%)`
      return {
        ...e,
        label,
        labelBgPadding: [4, 6],
        labelBgBorderRadius: 6,
        labelBgStyle: { fill: 'rgba(0,0,0,.45)', stroke: 'rgba(255,255,255,.08)' },
        labelStyle: { fill: '#e7ebf3', fontSize: 11 },
        style: { ...(e.style || {}), stroke, strokeWidth: 2 }
      }
    })
    return withLabels
  }

  // Appliquer les labels/styling calculés sans boucle infinie
  useEffect(() => {
    const computed = computeEdgeFlows(nodes, edges)
    // comparer labels pour éviter set inutile
    const a = edges.map((e) => `${e.id}:${e.label ?? ''}`).join('|')
    const b = computed.map((e) => `${e.id}:${e.label ?? ''}`).join('|')
    if (a !== b) setEdges(computed)
  }, [nodes, edges, setEdges])

  const nodeTypes = useMemo(() => ({ block: BlockNode }), [])

  return (
    <div className="main" ref={wrapperRef}>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onSelectionChange={onSelectionChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          snapToGrid={snapToGrid}
          snapGrid={[16, 16]}
          panOnScroll={false}
          panOnDrag
          selectionOnDrag
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
          minZoom={0.25}
          maxZoom={2}
          attributionPosition="bottom-right"
          proOptions={{ hideAttribution: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Panel position="top-right">
            <div className="node-toolbar">
              <button className="btn" onClick={() => {
                if (!selectedNodeId) return
                setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId))
                setEdges((prev) => prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId))
              }}>Supprimer nœud</button>
              <div className="btn" style={{ gap: 6 }}>
                <span>Entrées</span>
                <button className="btn" onClick={() => updateSelectedNodeData((d) => {
                  const inCount = Math.max(0, (d.inCount ?? 0) - 1)
                  const inputRates = (d.inputRates ?? []).slice(0, inCount)
                  return { ...d, inCount, inputRates }
                })}>-</button>
                <button className="btn" onClick={() => updateSelectedNodeData((d) => {
                  const inCount = (d.inCount ?? 0) + 1
                  const inputRates = [...(d.inputRates ?? []), 0]
                  return { ...d, inCount, inputRates }
                })}>+</button>
              </div>
              <div className="btn" style={{ gap: 6 }}>
                <span>Sorties</span>
                <button className="btn" onClick={() => updateSelectedNodeData((d) => {
                  const outCount = Math.max(0, (d.outCount ?? 0) - 1)
                  const outputRates = (d.outputRates ?? []).slice(0, outCount)
                  return { ...d, outCount, outputRates }
                })}>-</button>
                <button className="btn" onClick={() => updateSelectedNodeData((d) => {
                  const outCount = (d.outCount ?? 0) + 1
                  const outputRates = [...(d.outputRates ?? []), 0]
                  return { ...d, outCount, outputRates }
                })}>+</button>
              </div>
              <div className="btn" style={{ gap: 6 }}>
                <span>Débit</span>
                <button className="btn" onClick={() => {
                  if (!selectedNodeId) return
                  const idx = parseInt(prompt('Index du port entrée à modifier (0..n-1) :') || '-1', 10)
                  const val = parseFloat(prompt('Débit entrée (items/min) :') || '0')
                  if (isNaN(idx)) return
                  updateSelectedNodeData((d) => {
                    const arr = [...(d.inputRates ?? [])]
                    if (idx >= 0) arr[idx] = val
                    return { ...d, inputRates: arr }
                  })
                }}>Entrée</button>
                <button className="btn" onClick={() => {
                  if (!selectedNodeId) return
                  const idx = parseInt(prompt('Index du port sortie à modifier (0..n-1) :') || '-1', 10)
                  const val = parseFloat(prompt('Débit sortie (items/min) :') || '0')
                  if (isNaN(idx)) return
                  updateSelectedNodeData((d) => {
                    const arr = [...(d.outputRates ?? [])]
                    if (idx >= 0) arr[idx] = val
                    return { ...d, outputRates: arr }
                  })
                }}>Sortie</button>
              </div>
              <button className="btn primary" onClick={() => {
                if (!selectedNodeId) return
                const node = nodes.find((n) => n.id === selectedNodeId)
                if (!node) return
                const name = prompt('Enregistrer sous (nom du modèle):', node.data?.customName || node.data?.def?.name || 'Bloc')
                if (!name) return
                try {
                  const key = `snp:custom:${name}`
                  const payload = { def: node.data?.def ?? null, inCount: node.data?.inCount ?? 0, outCount: node.data?.outCount ?? 0, customName: name }
                  localStorage.setItem(key, JSON.stringify(payload))
                  alert('Nœud enregistré dans la bibliothèque personnalisée')
                } catch {}
              }}>Enregistrer nœud</button>
              <button className="btn" onClick={handleResetView}>Réinitialiser vue</button>
            </div>
          </Panel>
          <MiniMap pannable zoomable />
          <Controls position="bottom-right" showInteractive={false} />
          <Background gap={16} size={1} color="#232b3a" />
        </ReactFlow>
    </div>
  )
}


