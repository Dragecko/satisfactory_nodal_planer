import type { BlockDefinition } from './types'

export const TrainFreight: BlockDefinition = {
  id: 'train-freight',
  name: 'Train Freight',
  category: 'Logistique',
  icon: '🚆',
  color: '#a8b3cf',
  description: 'Transport de fret par train (chargement/déchargement).',
  inputs: [
    { id: 'cargo-in', label: 'Chargement', type: 'item' },
    { id: 'power-in', label: 'Alimentation', type: 'power' }
  ],
  outputs: [
    { id: 'cargo-out', label: 'Déchargement', type: 'item' }
  ]
}


