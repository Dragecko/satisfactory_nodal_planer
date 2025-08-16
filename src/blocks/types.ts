export type PortType = 'item' | 'fluid' | 'power'

export interface IoPortSpec {
  id: string
  label: string
  type: PortType
}

export interface BlockDefinition {
  id: string
  name: string
  category: 'Extraction' | 'Raffinage' | 'Assemblage' | 'Logistique'
  icon: string
  color?: string
  description?: string
  inputs: IoPortSpec[]
  outputs: IoPortSpec[]
}

// Type MIME utilisé pour glisser-déposer un bloc depuis la sidebar
export const DRAG_BLOCK_MIME = 'application/x-snp-block'


