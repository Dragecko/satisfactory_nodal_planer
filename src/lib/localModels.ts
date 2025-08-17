import { BlockModel } from '../blocks/types';

/**
 * Préfixe pour les clés de modèles personnalisés
 */
const CUSTOM_MODEL_PREFIX = 'snp:custom:';

/**
 * Obtient tous les modèles personnalisés depuis localStorage
 */
export function loadCustomModels(): Record<string, BlockModel> {
  const customModels: Record<string, BlockModel> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CUSTOM_MODEL_PREFIX)) {
        try {
          const name = key.replace(CUSTOM_MODEL_PREFIX, '');
          const modelData = localStorage.getItem(key);
          if (modelData) {
            const model = JSON.parse(modelData) as BlockModel;
            customModels[name] = model;
          }
        } catch (error) {
          console.warn('Erreur lors du chargement du modèle personnalisé:', key, error);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des modèles personnalisés:', error);
  }
  
  return customModels;
}

/**
 * Sauvegarde un modèle personnalisé
 */
export function saveCustomModel(name: string, model: BlockModel): void {
  try {
    const key = `${CUSTOM_MODEL_PREFIX}${name}`;
    localStorage.setItem(key, JSON.stringify(model));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du modèle personnalisé:', error);
    throw new Error('Impossible de sauvegarder le modèle');
  }
}

/**
 * Supprime un modèle personnalisé
 */
export function deleteCustomModel(name: string): void {
  try {
    const key = `${CUSTOM_MODEL_PREFIX}${name}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Erreur lors de la suppression du modèle personnalisé:', error);
    throw new Error('Impossible de supprimer le modèle');
  }
}

/**
 * Vérifie si un modèle personnalisé existe
 */
export function hasCustomModel(name: string): boolean {
  try {
    const key = `${CUSTOM_MODEL_PREFIX}${name}`;
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error('Erreur lors de la vérification du modèle:', error);
    return false;
  }
}

/**
 * Obtient un modèle personnalisé spécifique
 */
export function getCustomModel(name: string): BlockModel | null {
  try {
    const key = `${CUSTOM_MODEL_PREFIX}${name}`;
    const modelData = localStorage.getItem(key);
    if (modelData) {
      return JSON.parse(modelData) as BlockModel;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du modèle:', error);
    return null;
  }
}

/**
 * Obtient la liste des noms de modèles personnalisés
 */
export function getCustomModelNames(): string[] {
  const names: string[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CUSTOM_MODEL_PREFIX)) {
        const name = key.replace(CUSTOM_MODEL_PREFIX, '');
        names.push(name);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des noms de modèles:', error);
  }
  
  return names.sort();
}

/**
 * Valide un modèle personnalisé
 */
export function validateCustomModel(model: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Vérifications de base
  if (!model || typeof model !== 'object') {
    errors.push('Le modèle doit être un objet');
    return { isValid: false, errors };
  }
  
  if (!model.type || typeof model.type !== 'string') {
    errors.push('Le type de bloc est requis');
  }
  
  if (!model.name || typeof model.name !== 'string') {
    errors.push('Le nom du bloc est requis');
  }
  
  if (!Array.isArray(model.inputs)) {
    errors.push('Les entrées doivent être un tableau');
  }
  
  if (!Array.isArray(model.outputs)) {
    errors.push('Les sorties doivent être un tableau');
  }
  
  // Vérifier les ports
  if (Array.isArray(model.inputs)) {
    model.inputs.forEach((port: any, index: number) => {
      if (!port || typeof port !== 'object') {
        errors.push(`Port d'entrée ${index}: doit être un objet`);
        return;
      }
      
      if (!port.id || typeof port.id !== 'string') {
        errors.push(`Port d'entrée ${index}: ID requis`);
      }
      
      if (!port.name || typeof port.name !== 'string') {
        errors.push(`Port d'entrée ${index}: nom requis`);
      }
      
      if (!port.kind || !['item', 'fluid', 'power'].includes(port.kind)) {
        errors.push(`Port d'entrée ${index}: kind invalide`);
      }
      
      if (!port.unit || !['items/min', 'items/s'].includes(port.unit)) {
        errors.push(`Port d'entrée ${index}: unité invalide`);
      }
      
      if (typeof port.rate !== 'number' || port.rate < 0) {
        errors.push(`Port d'entrée ${index}: rate doit être un nombre positif`);
      }
    });
  }
  
  if (Array.isArray(model.outputs)) {
    model.outputs.forEach((port: any, index: number) => {
      if (!port || typeof port !== 'object') {
        errors.push(`Port de sortie ${index}: doit être un objet`);
        return;
      }
      
      if (!port.id || typeof port.id !== 'string') {
        errors.push(`Port de sortie ${index}: ID requis`);
      }
      
      if (!port.name || typeof port.name !== 'string') {
        errors.push(`Port de sortie ${index}: nom requis`);
      }
      
      if (!port.kind || !['item', 'fluid', 'power'].includes(port.kind)) {
        errors.push(`Port de sortie ${index}: kind invalide`);
      }
      
      if (!port.unit || !['items/min', 'items/s'].includes(port.unit)) {
        errors.push(`Port de sortie ${index}: unité invalide`);
      }
      
      if (typeof port.rate !== 'number' || port.rate < 0) {
        errors.push(`Port de sortie ${index}: rate doit être un nombre positif`);
      }
    });
  }
  
  // Vérifier le surcadençage
  if (model.overclockPct !== undefined) {
    if (typeof model.overclockPct !== 'number' || model.overclockPct < 1 || model.overclockPct > 250) {
      errors.push('Le surcadençage doit être entre 1% et 250%');
    }
  }
  
  // Vérifier la puissance
  if (model.powerEstimateMW !== undefined) {
    if (typeof model.powerEstimateMW !== 'number' || model.powerEstimateMW < 0) {
      errors.push('La puissance estimée doit être un nombre positif');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Nettoie les modèles personnalisés invalides
 */
export function cleanupInvalidModels(): string[] {
  const removedModels: string[] = [];
  const names = getCustomModelNames();
  
  names.forEach(name => {
    const model = getCustomModel(name);
    if (model) {
      const validation = validateCustomModel(model);
      if (!validation.isValid) {
        try {
          deleteCustomModel(name);
          removedModels.push(name);
        } catch (error) {
          console.warn('Impossible de supprimer le modèle invalide:', name);
        }
      }
    }
  });
  
  return removedModels;
}
