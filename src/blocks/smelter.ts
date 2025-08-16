import type { BlockDefinition } from './types'

export const Smelter: BlockDefinition = {
  id: 'smelter',
  name: 'Smelter',
  category: 'Raffinage',
  icon: '🔥',
  color: '#ffb703',
  description: 'Fonde le minerai en lingots.',
  inputs: [
    { id: 'ore-in', label: 'Minerai', type: 'item' },
    { id: 'power-in', label: 'Alimentation', type: 'power' }
  ],
  outputs: [
    { id: 'ingot-out', label: 'Lingot', type: 'item' }
  ]
}


