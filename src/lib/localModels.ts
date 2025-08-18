import { BlockModel } from '../blocks/types';

/**
 * Préfixe pour les clés de modèles personnalisés dans localStorage
 * Utilisé pour identifier et organiser les modèles personnalisés
 */
const CUSTOM_MODEL_PREFIX = 'snp:custom:';

/**
 * Obtient tous les modèles personnalisés depuis localStorage
 * 
 * Cette fonction parcourt tous les éléments du localStorage et récupère
 * ceux qui commencent par le préfixe CUSTOM_MODEL_PREFIX.
 * 
 * @returns {Record<string, BlockModel>} Un objet contenant tous les modèles personnalisés
 *          avec leur nom comme clé et le modèle comme valeur
 * 
 * @example
 * ```typescript
 * const models = loadCustomModels();
 * console.log(models); // { "MonModèle": { type: "assembler", name: "MonModèle", ... } }
 * ```
 */
export function loadCustomModels(): Record<string, BlockModel> {
  const customModels: Record<string, BlockModel> = {};
  
  try {
    // Parcourir tous les éléments du localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Vérifier si la clé correspond à un modèle personnalisé
      if (key && key.startsWith(CUSTOM_MODEL_PREFIX)) {
        try {
          // Extraire le nom du modèle en retirant le préfixe
          const name = key.replace(CUSTOM_MODEL_PREFIX, '');
          const modelData = localStorage.getItem(key);
          if (modelData) {
            // Parser les données JSON en objet BlockModel
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
 * Sauvegarde un modèle personnalisé dans localStorage
 * 
 * Le modèle est sérialisé en JSON et stocké avec une clé préfixée
 * pour éviter les conflits avec d'autres données.
 * 
 * @param {string} name - Le nom unique du modèle personnalisé
 * @param {BlockModel} model - Le modèle à sauvegarder
 * @throws {Error} Si la sauvegarde échoue (localStorage plein, etc.)
 * 
 * @example
 * ```typescript
 * const model = { type: "assembler", name: "MonAssembleur", ... };
 * saveCustomModel("MonAssembleur", model);
 * ```
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
 * Supprime un modèle personnalisé du localStorage
 * 
 * @param {string} name - Le nom du modèle à supprimer
 * @throws {Error} Si la suppression échoue
 * 
 * @example
 * ```typescript
 * deleteCustomModel("MonAssembleur");
 * ```
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
 * Vérifie si un modèle personnalisé existe dans localStorage
 * 
 * @param {string} name - Le nom du modèle à vérifier
 * @returns {boolean} true si le modèle existe, false sinon
 * 
 * @example
 * ```typescript
 * if (hasCustomModel("MonAssembleur")) {
 *   console.log("Le modèle existe");
 * }
 * ```
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
 * Obtient un modèle personnalisé spécifique depuis localStorage
 * 
 * @param {string} name - Le nom du modèle à récupérer
 * @returns {BlockModel | null} Le modèle s'il existe, null sinon
 * 
 * @example
 * ```typescript
 * const model = getCustomModel("MonAssembleur");
 * if (model) {
 *   console.log("Modèle trouvé:", model.name);
 * }
 * ```
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
 * Obtient la liste des noms de tous les modèles personnalisés
 * 
 * Cette fonction parcourt localStorage pour trouver toutes les clés
 * qui correspondent à des modèles personnalisés et retourne leurs noms.
 * 
 * @returns {string[]} Un tableau des noms de modèles, triés alphabétiquement
 * 
 * @example
 * ```typescript
 * const names = getCustomModelNames();
 * console.log("Modèles disponibles:", names); // ["Assembleur1", "Fonderie2", ...]
 * ```
 */
export function getCustomModelNames(): string[] {
  const names: string[] = [];
  
  try {
    // Parcourir tous les éléments du localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CUSTOM_MODEL_PREFIX)) {
        // Extraire le nom en retirant le préfixe
        const name = key.replace(CUSTOM_MODEL_PREFIX, '');
        names.push(name);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des noms de modèles:', error);
  }
  
  // Retourner les noms triés alphabétiquement
  return names.sort();
}

/**
 * Valide un modèle personnalisé selon les règles métier
 * 
 * Cette fonction vérifie que le modèle respecte la structure attendue :
 * - Présence des champs obligatoires (type, name, inputs, outputs)
 * - Validité des ports (entrées et sorties)
 * - Validité des valeurs numériques (surcadençage, puissance)
 * 
 * @param {any} model - Le modèle à valider
 * @returns {{ isValid: boolean, errors: string[] }} Résultat de validation avec liste d'erreurs
 * 
 * @example
 * ```typescript
 * const validation = validateCustomModel(myModel);
 * if (!validation.isValid) {
 *   console.log("Erreurs:", validation.errors);
 * }
 * ```
 */
export function validateCustomModel(model: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Vérifications de base sur la structure du modèle
  if (!model || typeof model !== 'object') {
    errors.push('Le modèle doit être un objet');
    return { isValid: false, errors };
  }
  
  // Vérification des champs obligatoires
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
  
  // Validation détaillée des ports d'entrée
  if (Array.isArray(model.inputs)) {
    model.inputs.forEach((port: any, index: number) => {
      if (!port || typeof port !== 'object') {
        errors.push(`Port d'entrée ${index}: doit être un objet`);
        return;
      }
      
      // Vérification des propriétés obligatoires du port
      if (!port.id || typeof port.id !== 'string') {
        errors.push(`Port d'entrée ${index}: ID requis`);
      }
      
      if (!port.name || typeof port.name !== 'string') {
        errors.push(`Port d'entrée ${index}: nom requis`);
      }
      
      // Vérification du type de ressource (item, fluid, power)
      if (!port.kind || !['item', 'fluid', 'power'].includes(port.kind)) {
        errors.push(`Port d'entrée ${index}: kind invalide`);
      }
      
      // Vérification de l'unité de mesure
      if (!port.unit || !['items/min', 'items/s'].includes(port.unit)) {
        errors.push(`Port d'entrée ${index}: unité invalide`);
      }
      
      // Vérification du débit (doit être positif)
      if (typeof port.rate !== 'number' || port.rate < 0) {
        errors.push(`Port d'entrée ${index}: rate doit être un nombre positif`);
      }
    });
  }
  
  // Validation détaillée des ports de sortie
  if (Array.isArray(model.outputs)) {
    model.outputs.forEach((port: any, index: number) => {
      if (!port || typeof port !== 'object') {
        errors.push(`Port de sortie ${index}: doit être un objet`);
        return;
      }
      
      // Vérification des propriétés obligatoires du port
      if (!port.id || typeof port.id !== 'string') {
        errors.push(`Port de sortie ${index}: ID requis`);
      }
      
      if (!port.name || typeof port.name !== 'string') {
        errors.push(`Port de sortie ${index}: nom requis`);
      }
      
      // Vérification du type de ressource (item, fluid, power)
      if (!port.kind || !['item', 'fluid', 'power'].includes(port.kind)) {
        errors.push(`Port de sortie ${index}: kind invalide`);
      }
      
      // Vérification de l'unité de mesure
      if (!port.unit || !['items/min', 'items/s'].includes(port.unit)) {
        errors.push(`Port de sortie ${index}: unité invalide`);
      }
      
      // Vérification du débit (doit être positif)
      if (typeof port.rate !== 'number' || port.rate < 0) {
        errors.push(`Port de sortie ${index}: rate doit être un nombre positif`);
      }
    });
  }
  
  // Validation du surcadençage (optionnel, entre 1% et 250%)
  if (model.overclockPct !== undefined) {
    if (typeof model.overclockPct !== 'number' || model.overclockPct < 1 || model.overclockPct > 250) {
      errors.push('Le surcadençage doit être entre 1% et 250%');
    }
  }
  
  // Validation de la puissance estimée (optionnel, doit être positive)
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
 * Nettoie les modèles personnalisés invalides du localStorage
 * 
 * Cette fonction parcourt tous les modèles personnalisés, les valide,
 * et supprime ceux qui ne respectent pas les règles de validation.
 * Utile pour maintenir l'intégrité des données.
 * 
 * @returns {string[]} Liste des noms des modèles supprimés
 * 
 * @example
 * ```typescript
 * const removedModels = cleanupInvalidModels();
 * console.log("Modèles supprimés:", removedModels);
 * ```
 */
export function cleanupInvalidModels(): string[] {
  const removedModels: string[] = [];
  const names = getCustomModelNames();
  
  // Vérifier chaque modèle et supprimer les invalides
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
