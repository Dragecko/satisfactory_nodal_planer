import { BlockModel } from '../types';

/**
 * Bloc personnalisé : Yes
 * 
 * Transforme les minerais en lingots métalliques
 * 
 * Créé le : 18/08/2025
 */
const Yes: BlockModel = {
  "name": "Yes",
  "description": "Transforme les minerais en lingots métalliques",
  "type": "Smelter",
  "color": "#FF6B35",
  "icon": "🔥",
  "inputs": [
    {
      "id": "in-0",
      "name": "Minerai de fer",
      "kind": "item",
      "unit": "items/min",
      "rate": 30
    }
  ],
  "outputs": [
    {
      "id": "out-0",
      "name": "Lingot de fer",
      "kind": "item",
      "unit": "items/min",
      "rate": 30
    }
  ],
  "overclockPct": 100,
  "powerEstimateMW": 4
};

export default Yes;
