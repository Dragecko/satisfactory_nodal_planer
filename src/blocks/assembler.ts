import type { BlockDefinition } from './types'

export const Assembler: BlockDefinition = {
  id: 'assembler',
  name: 'Assembler',
  category: 'Assemblage',
  icon: '🛠️',
  color: '#39c6ff',
  description: 'Assemble deux composants en un produit.',
  inputs: [
    { id: 'in-a', label: 'Entrée A', type: 'item' },
    { id: 'in-b', label: 'Entrée B', type: 'item' },
    { id: 'power-in', label: 'Alimentation', type: 'power' }
  ],
  outputs: [
    { id: 'out', label: 'Produit', type: 'item' }
  ]
}


