import { BlockModel } from '../types';

/**
 * Bloc Miner - Extraction de minerais
 * Extrait des minerais à partir de gisements
 */
export const MinerModel: BlockModel = {
  type: 'Miner',
  name: 'Miner Mk1',
  description: 'Extrait des minerais à partir de gisements',
  inputs: [],
  outputs: [
    {
      id: 'out-0',
      name: 'Minerai de fer',
      kind: 'item',
      unit: 'items/min',
      rate: 60
    }
  ],
  overclockPct: 100,
  powerEstimateMW: 4,
  color: '#8B4513',
  icon: '⛏️'
};

export default MinerModel;
