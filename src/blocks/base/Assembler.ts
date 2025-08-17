import { BlockModel } from '../types';

/**
 * Bloc Assembler - Assemblage de pièces
 * Assemble des composants en pièces plus complexes
 */
export const AssemblerModel: BlockModel = {
  type: 'Assembler',
  name: 'Assembler',
  description: 'Assemble des composants en pièces plus complexes',
  inputs: [
    {
      id: 'in-0',
      name: 'Plaque de fer',
      kind: 'item',
      unit: 'items/min',
      rate: 22.5
    },
    {
      id: 'in-1',
      name: 'Vis',
      kind: 'item',
      unit: 'items/min',
      rate: 45
    }
  ],
  outputs: [
    {
      id: 'out-0',
      name: 'Plaque renforcée',
      kind: 'item',
      unit: 'items/min',
      rate: 5
    }
  ],
  overclockPct: 100,
  powerEstimateMW: 15,
  color: '#4A90E2',
  icon: '⚙️'
};

export default AssemblerModel;
