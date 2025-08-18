import { BlockModel, BlockType } from './types';
import MinerModel from './base/Miner';
import SmelterModel from './base/Smelter';
import FoundryModel from './base/Foundry';
import AssemblerModel from './base/Assembler';
import TrainFreightModel from './base/TrainFreight';
import { getCustomModels } from './Library';

/**
 * Bibliothèque des blocs de base
 */
export const BASE_BLOCKS: Record<BlockType, BlockModel> = {
  Miner: MinerModel,
  Smelter: SmelterModel,
  Foundry: FoundryModel,
  Assembler: AssemblerModel,
  TrainFreight: TrainFreightModel
};

/**
 * Bibliothèque complète des blocs (base + personnalisés)
 */
export function getAllBlocks(): Record<string, BlockModel> {
  const customModels = getCustomModels();
  return {
    ...BASE_BLOCKS,
    ...customModels
  };
}

/**
 * Obtient un bloc de base par type
 */
export function getBaseBlock(type: BlockType): BlockModel {
  return BASE_BLOCKS[type];
}

/**
 * Liste tous les types de blocs disponibles
 */
export function getAvailableBlockTypes(): BlockType[] {
  return Object.keys(BASE_BLOCKS) as BlockType[];
}

/**
 * Crée une copie d'un bloc avec un nouvel ID
 */
export function cloneBlockModel(model: BlockModel, newName?: string): BlockModel {
  return {
    ...model,
    name: newName || `${model.name} (Copie)`,
    inputs: model.inputs.map(port => ({ ...port })),
    outputs: model.outputs.map(port => ({ ...port }))
  };
}

/**
 * Type MIME utilisé pour glisser-déposer un bloc depuis la sidebar
 */
export const DRAG_BLOCK_MIME = 'application/x-snp-block';

export default BASE_BLOCKS;


