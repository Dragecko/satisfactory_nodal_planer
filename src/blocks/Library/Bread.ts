import { BlockModel } from '../types';

/**
 * Bloc personnalisé : Bread
 * 
 * Assembleur personnalisé avec des taux optimisés pour la production de circuits
 * 
 * Créé le : 18/08/2025
 */
const Bread: BlockModel = {
  "name": "Bread",
  "description": "Assembleur personnalisé avec des taux optimisés pour la production de circuits",
  "type": "Assembler",
  "color": "#ff6b6b",
  "icon": "⚡",
  "inputs": [
    {
      "id": "input-copper",
      "name": "Cuivre",
      "kind": "item",
      "unit": "items/min",
      "rate": 60
    },
    {
      "id": "input-iron",
      "name": "Fer",
      "kind": "item",
      "unit": "items/min",
      "rate": 30
    }
  ],
  "outputs": [
    {
      "id": "output-circuits",
      "name": "Circuits",
      "kind": "item",
      "unit": "items/min",
      "rate": 45
    },
    {
      "id": "output-2",
      "name": "Sortie 2",
      "kind": "item",
      "unit": "items/min",
      "rate": 30
    },
    {
      "id": "output-3",
      "name": "Sortie 3",
      "kind": "item",
      "unit": "items/min",
      "rate": 30
    }
  ],
  "overclockPct": 150,
  "powerEstimateMW": 6
};

export default Bread;
