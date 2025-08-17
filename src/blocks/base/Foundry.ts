import { BlockModel } from '../types';

/**
 * Bloc Foundry - Création d'alliages
 * Combine différents métaux pour créer des alliages
 */
export const FoundryModel: BlockModel = {
  type: 'Foundry',
  name: 'Foundry',
  description: 'Combine différents métaux pour créer des alliages',
  inputs: [
    {
      id: 'in-0',
      name: 'Lingot de fer',
      kind: 'item',
      unit: 'items/min',
      rate: 45
    },
    {
      id: 'in-1',
      name: 'Lingot de cuivre',
      kind: 'item',
      unit: 'items/min',
      rate: 15
    }
  ],
  outputs: [
    {
      id: 'out-0',
      name: 'Acier',
      kind: 'item',
      unit: 'items/min',
      rate: 45
    }
  ],
  overclockPct: 100,
  powerEstimateMW: 16,
  color: '#C0C0C0',
  icon: '🏭'
};

export default FoundryModel;
