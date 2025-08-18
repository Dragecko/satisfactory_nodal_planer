import { BlockModel } from '../types';

/**
 * Bibliothèque des blocs personnalisés
 * 
 * Ce fichier exporte dynamiquement tous les blocs personnalisés
 * créés par l'utilisateur. Les blocs sont automatiquement
 * ajoutés ici lors de leur création via l'interface.
 */

// Import dynamique de tous les blocs personnalisés
// Cette section sera automatiquement mise à jour par le système
import CustomAssembler from './CustomAssembler';
import Yes from './Yes';
import Bread from './Bread';

const customModels: Record<string, BlockModel> = {
  // Exemple de bloc personnalisé
  'CustomAssembler': CustomAssembler,
  'Yes': Yes,
  'Bread': Bread,
  
  // Les autres blocs personnalisés seront ajoutés ici automatiquement
};

/**
 * Obtient tous les blocs personnalisés
 */
export function getCustomModels(): Record<string, BlockModel> {
  return customModels;
}

/**
 * Obtient un bloc personnalisé par nom
 */
export function getCustomModel(name: string): BlockModel | null {
  return customModels[name] || null;
}

/**
 * Vérifie si un bloc personnalisé existe
 */
export function hasCustomModel(name: string): boolean {
  return name in customModels;
}

/**
 * Obtient la liste des noms de blocs personnalisés
 */
export function getCustomModelNames(): string[] {
  return Object.keys(customModels).sort();
}

export default customModels;
