import { BlockModel, BlockType } from '../blocks/types';
import { DRAG_BLOCK_MIME } from '../blocks';

/**
 * Types de données de drag & drop supportés
 */
export type DragDataType = 'base' | 'custom';

/**
 * Interface pour les données de drag & drop d'un bloc de base
 */
export interface BaseBlockDragData {
  type: 'base';
  blockType: BlockType;
  model: BlockModel;
}

/**
 * Interface pour les données de drag & drop d'un modèle personnalisé
 */
export interface CustomBlockDragData {
  type: 'custom';
  model: BlockModel;
}

/**
 * Union des types de données de drag & drop
 */
export type BlockDragData = BaseBlockDragData | CustomBlockDragData;

/**
 * Interface pour les options de configuration du drag & drop
 */
export interface DragOptions {
  /** Type de drag (copy, move, link) */
  effectAllowed?: 'copy' | 'move' | 'link' | 'none';
  /** Données supplémentaires à inclure */
  additionalData?: Record<string, any>;
}

/**
 * Crée les données de drag & drop pour un bloc de base
 * 
 * Cette fonction encapsule la logique de création des données de drag & drop
 * pour les blocs de base, en incluant le type de bloc et le modèle associé.
 * 
 * @param blockType - Type du bloc de base
 * @param model - Modèle du bloc
 * @param options - Options de configuration du drag
 * @returns Données de drag & drop pour un bloc de base
 * 
 * @example
 * ```tsx
 * const dragData = createBaseBlockDragData('Miner', minerModel);
 * event.dataTransfer.setData(DRAG_BLOCK_MIME, JSON.stringify(dragData));
 * ```
 */
export function createBaseBlockDragData(
  blockType: BlockType,
  model: BlockModel,
  options: DragOptions = {}
): BaseBlockDragData {
  return {
    type: 'base',
    blockType,
    model,
    ...options.additionalData
  };
}

/**
 * Crée les données de drag & drop pour un modèle personnalisé
 * 
 * Cette fonction encapsule la logique de création des données de drag & drop
 * pour les modèles personnalisés, en incluant uniquement le modèle.
 * 
 * @param model - Modèle personnalisé du bloc
 * @param options - Options de configuration du drag
 * @returns Données de drag & drop pour un modèle personnalisé
 * 
 * @example
 * ```tsx
 * const dragData = createCustomBlockDragData(customModel);
 * event.dataTransfer.setData(DRAG_BLOCK_MIME, JSON.stringify(dragData));
 * ```
 */
export function createCustomBlockDragData(
  model: BlockModel,
  options: DragOptions = {}
): CustomBlockDragData {
  return {
    type: 'custom',
    model,
    ...options.additionalData
  };
}

/**
 * Configure un événement de drag & drop avec les données appropriées
 * 
 * Cette fonction unifie la logique de configuration des événements de drag & drop,
 * en définissant les données de transfert et l'effet autorisé.
 * 
 * @param event - Événement de drag & drop
 * @param dragData - Données à transférer
 * @param options - Options de configuration
 * 
 * @example
 * ```tsx
 * const handleDragStart = (event: React.DragEvent, blockType: BlockType) => {
 *   const model = BASE_BLOCKS[blockType];
 *   const dragData = createBaseBlockDragData(blockType, model);
 *   configureDragEvent(event, dragData);
 * };
 * ```
 */
export function configureDragEvent(
  event: React.DragEvent,
  dragData: BlockDragData,
  options: DragOptions = {}
): void {
  event.dataTransfer.setData(DRAG_BLOCK_MIME, JSON.stringify(dragData));
  event.dataTransfer.effectAllowed = options.effectAllowed || 'copy';
}

/**
 * Parse les données de drag & drop depuis un événement
 * 
 * Cette fonction extrait et valide les données de drag & drop depuis
 * un événement de drop, en gérant les erreurs de parsing.
 * 
 * @param event - Événement de drop
 * @returns Données parsées ou null si invalides
 * 
 * @example
 * ```tsx
 * const onDrop = (event: React.DragEvent) => {
 *   const dragData = parseDragData(event);
 *   if (dragData) {
 *     // Traiter les données
 *   }
 * };
 * ```
 */
export function parseDragData(event: React.DragEvent): BlockDragData | null {
  try {
    const data = event.dataTransfer.getData(DRAG_BLOCK_MIME);
    if (!data) return null;
    
    const parsed = JSON.parse(data) as BlockDragData;
    
    // Validation basique des données
    if (!parsed.type || !parsed.model) {
      console.warn('Données de drag invalides:', parsed);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Erreur lors du parsing des données de drag:', error);
    return null;
  }
}

/**
 * Vérifie si les données de drag & drop sont valides
 * 
 * Cette fonction valide la structure et le contenu des données
 * de drag & drop avant leur utilisation.
 * 
 * @param dragData - Données à valider
 * @returns true si les données sont valides
 * 
 * @example
 * ```tsx
 * const dragData = parseDragData(event);
 * if (dragData && isValidDragData(dragData)) {
 *   // Utiliser les données
 * }
 * ```
 */
export function isValidDragData(dragData: any): dragData is BlockDragData {
  if (!dragData || typeof dragData !== 'object') return false;
  
  // Vérifier le type
  if (dragData.type !== 'base' && dragData.type !== 'custom') return false;
  
  // Vérifier la présence du modèle
  if (!dragData.model || typeof dragData.model !== 'object') return false;
  
  // Vérifier les propriétés essentielles du modèle
  const requiredProps = ['type', 'name', 'inputs', 'outputs'];
  for (const prop of requiredProps) {
    if (!(prop in dragData.model)) return false;
  }
  
  // Vérifications spécifiques selon le type
  if (dragData.type === 'base') {
    if (!dragData.blockType || typeof dragData.blockType !== 'string') return false;
  }
  
  return true;
}
