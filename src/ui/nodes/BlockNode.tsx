// @ts-nocheck
import { memo } from 'react'
import { Handle, Position } from 'reactflow'

/**
 * Node d'affichage pour un bloc.
 * Entrées = cibles (target) positionnées à droite
 * Sorties = sources (source) positionnées à gauche
 */
function BlockNodeComponent({ id, data, selected }) {
  const def = data.def
  const inCount = data.inCount ?? (def?.inputs?.length ?? 0)
  const outCount = data.outCount ?? (def?.outputs?.length ?? 0)
  const label = data.customName || `${def?.icon ?? '🧩'} ${def?.name ?? 'Bloc'}`
  const inputRates = Array.isArray(data.inputRates) ? data.inputRates : Array(inCount).fill(0)
  const outputRates = Array.isArray(data.outputRates) ? data.outputRates : Array(outCount).fill(0)
  const description = data.description || (def?.description ?? '')

  const update = data?.updateNodeData
  const editName = () => {
    if (!update) return
    const next = prompt('Nom du nœud:', label)
    if (next != null) update(id, (d) => ({ ...d, customName: next }))
  }
  const editDesc = () => {
    if (!update) return
    const next = prompt('Description:', description)
    if (next != null) update(id, (d) => ({ ...d, description: next }))
  }

  const setInputRate = (idx: number) => {
    if (!update) return
    const current = inputRates[idx] ?? 0
    const val = parseFloat(prompt(`Débit entrée #${idx} (items/min):`, String(current)) || '0')
    if (Number.isNaN(val)) return
    update(id, (d: any) => {
      const arr = Array.isArray(d.inputRates) ? [...d.inputRates] : []
      arr[idx] = val
      return { ...d, inputRates: arr }
    })
  }

  const setOutputRate = (idx: number) => {
    if (!update) return
    const current = outputRates[idx] ?? 0
    const val = parseFloat(prompt(`Débit sortie #${idx} (items/min):`, String(current)) || '0')
    if (Number.isNaN(val)) return
    update(id, (d: any) => {
      const arr = Array.isArray(d.outputRates) ? [...d.outputRates] : []
      arr[idx] = val
      return { ...d, outputRates: arr }
    })
  }

  return (
    <div className={`rf-block rf-grid${selected ? ' selected' : ''}`} style={{ borderColor: def?.color ?? '#2d3a50' }}>
      {/* Colonne entrées */}
      <div className="rf-io rf-io-left">
        {Array.from({ length: inCount }).map((_, idx) => (
          <div key={`in-${idx}`} className="rf-port" onClick={() => setInputRate(idx)} title="Cliquer pour définir le débit">
            <Handle type="target" position={Position.Left} id={`in-${idx}`} />
            <span className="name">{def?.inputs?.[idx]?.label ?? `In ${idx+1}`}</span>
            <span className="rate">{inputRates[idx] ?? 0}</span>
          </div>
        ))}
      </div>

      {/* Colonne centrale (header + description) */}
      <div className="rf-content">
        <div className="rf-header" onDoubleClick={editName} title="Double-cliquez pour renommer">
          {label}
        </div>
        <div className="rf-desc" onDoubleClick={editDesc} title="Double-cliquez pour modifier la description">
          {description || '—'}
        </div>
      </div>

      {/* Colonne sorties */}
      <div className="rf-io rf-io-right">
        {Array.from({ length: outCount }).map((_, idx) => (
          <div key={`out-${idx}`} className="rf-port" onClick={() => setOutputRate(idx)} title="Cliquer pour définir le débit">
            <span className="name">{def?.outputs?.[idx]?.label ?? `Out ${idx+1}`}</span>
            <span className="rate">{outputRates[idx] ?? 0}</span>
            <Handle type="source" position={Position.Right} id={`out-${idx}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

export const BlockNode = memo(BlockNodeComponent)


