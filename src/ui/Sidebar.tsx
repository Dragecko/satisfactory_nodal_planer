// @ts-nocheck
import { ALL_BLOCKS } from '../blocks'
import { DRAG_BLOCK_MIME } from '../blocks/types'

export function Sidebar() {
  const customKeys = Object.keys(localStorage).filter((k) => k.startsWith('snp:custom:'))
  const customBlocks = customKeys.map((k) => ({ key: k, payload: JSON.parse(localStorage.getItem(k) || 'null') })).filter(Boolean)
  return (
    <aside className="sidebar">
      <div className="section">
        <h3>Bibliothèque</h3>
        <div className="card">
          <div className="muted" style={{ marginBottom: 8 }}>Blocs de base</div>
          <div className="blocks-grid">
            {ALL_BLOCKS.map((b) => (
              <button
                key={b.id}
                className="block-tile"
                title={b.description}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_BLOCK_MIME, JSON.stringify(b))
                  e.dataTransfer.effectAllowed = 'copy'
                }}
              >
                <span className="icon" aria-hidden>{b.icon}</span>
                <span className="name">{b.name}</span>
                <span className="category">{b.category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Bibliothèque perso</h3>
        <div className="card">
          <div className="blocks-grid">
            {customBlocks.length === 0 && (<div className="muted">Aucun nœud enregistré</div>)}
            {customBlocks.map(({ key, payload }) => (
              <button
                key={key}
                className="block-tile"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_BLOCK_MIME, JSON.stringify(payload.def ?? { id: 'custom', name: payload.customName || 'Custom', inputs: Array(payload.inCount).fill({}), outputs: Array(payload.outCount).fill({}), icon: '🧩', category: 'Assemblage' }))
                  e.dataTransfer.effectAllowed = 'copy'
                }}
              >
                <span className="icon" aria-hidden>{payload?.def?.icon || '🧩'}</span>
                <span className="name">{payload?.customName || payload?.def?.name || 'Custom'}</span>
                <span className="category">Perso</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Projet</h3>
        <div className="card">
          <div className="muted">Nom: Mon usine</div>
          <div className="muted">Sauvegarde auto: activée</div>
        </div>
      </div>
    </aside>
  )
}


