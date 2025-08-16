import type { BlockDefinition } from './types'

export const Foundry: BlockDefinition = {
  id: 'foundry',
  name: 'Foundry',
  category: 'Raffinage',
  icon: '🏭',
  color: '#ff6b6b',
  description: 'Fonderie mixte (2 entrées, 1 sortie).',
  inputs: [
    { id: 'ore-a-in', label: 'Entrée A', type: 'item' },
    { id: 'ore-b-in', label: 'Entrée B', type: 'item' },
    { id: 'power-in', label: 'Alimentation', type: 'power' }
  ],
  outputs: [
    { id: 'alloy-out', label: 'Alliage', type: 'item' }
  ]
}


