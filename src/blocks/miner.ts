import type { BlockDefinition } from './types'

export const Miner: BlockDefinition = {
  id: 'miner',
  name: 'Miner',
  category: 'Extraction',
  icon: '⛏️',
  color: '#67f3a2',
  description: 'Extrait du minerai brut depuis un gisement.',
  inputs: [
    { id: 'power-in', label: 'Alimentation', type: 'power' }
  ],
  outputs: [
    { id: 'ore-out', label: 'Minerai', type: 'item' }
  ]
}


