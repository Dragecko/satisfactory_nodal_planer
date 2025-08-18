import { BlockModel } from '../types';

/**
 * Exemple de bloc personnalisé : Assembleur optimisé
 * 
 * Ce bloc est un exemple de ce que peut créer un utilisateur
 * en personnalisant un bloc de base.
 */
const CustomAssembler: BlockModel = {
  type: 'Assembler',
  name: 'Assembleur Optimisé',
  description: 'Assembleur personnalisé avec des taux optimisés pour la production de circuits',
  inputs: [
    {
      id: 'input-copper',
      name: 'Cuivre',
      kind: 'item',
      unit: 'items/min',
      rate: 60
    },
    {
      id: 'input-iron',
      name: 'Fer',
      kind: 'item',
      unit: 'items/min',
      rate: 30
    }
  ],
  outputs: [
    {
      id: 'output-circuits',
      name: 'Circuits',
      kind: 'item',
      unit: 'items/min',
      rate: 45
    }
  ],
  overclockPct: 150,
  powerEstimateMW: 6.0,
  color: '#ff6b6b',
  icon: '⚡'
};

export default CustomAssembler;
