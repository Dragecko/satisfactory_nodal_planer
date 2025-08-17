import { BlockModel } from '../types';

/**
 * Bloc Train Freight - Logistique ferroviaire
 * Transporte des marchandises par train
 */
export const TrainFreightModel: BlockModel = {
  type: 'TrainFreight',
  name: 'Train Freight',
  description: 'Transporte des marchandises par train',
  inputs: [
    {
      id: 'in-0',
      name: 'Marchandises',
      kind: 'item',
      unit: 'items/min',
      rate: 1200
    }
  ],
  outputs: [
    {
      id: 'out-0',
      name: 'Marchandises',
      kind: 'item',
      unit: 'items/min',
      rate: 1200
    }
  ],
  overclockPct: 100,
  powerEstimateMW: 25,
  color: '#8B4513',
  icon: '🚂'
};

export default TrainFreightModel;
