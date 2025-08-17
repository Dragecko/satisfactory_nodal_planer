import { BlockModel } from '../types';

/**
 * Bloc Smelter - Transformation minerai → lingot
 * Transforme les minerais en lingots métalliques
 */
export const SmelterModel: BlockModel = {
  type: 'Smelter',
  name: 'Smelter',
  description: 'Transforme les minerais en lingots métalliques',
  inputs: [
    {
      id: 'in-0',
      name: 'Minerai de fer',
      kind: 'item',
      unit: 'items/min',
      rate: 30
    }
  ],
  outputs: [
    {
      id: 'out-0',
      name: 'Lingot de fer',
      kind: 'item',
      unit: 'items/min',
      rate: 30
    }
  ],
  overclockPct: 100,
  powerEstimateMW: 4,
  color: '#FF6B35',
  icon: '🔥'
};

export default SmelterModel;
