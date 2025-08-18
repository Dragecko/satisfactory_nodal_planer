import { BlockModel } from '../blocks/types';

/**
 * Gestionnaire des modèles personnalisés pour Electron
 * 
 * Ce module utilise les API Electron pour sauvegarder et charger
 * les modèles personnalisés directement dans les fichiers du système.
 */

/**
 * Types pour les réponses des API Electron
 */
interface ElectronResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Sauvegarde un modèle personnalisé via Electron
 */
export async function saveCustomModelWithElectron(name: string, model: BlockModel): Promise<ElectronResponse> {
  try {
    // Vérifier que l'API Electron est disponible
    if (!window.electronAPI) {
      throw new Error('API Electron non disponible');
    }

    // Sauvegarder via l'API Electron
    const result = await window.electronAPI.saveCustomModel(name, model);
    
    if (result.success) {
      console.log(`✅ Modèle "${name}" sauvegardé avec succès via Electron`);
      
      // Afficher une notification
      if (window.electronAPI.showNotification) {
        window.electronAPI.showNotification(
          'Modèle sauvegardé',
          `Le modèle "${name}" a été sauvegardé avec succès`
        );
      }
    } else {
      console.error(`❌ Erreur lors de la sauvegarde: ${result.message}`);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde avec Electron:', error);
    return {
      success: false,
      message: `Erreur: ${error.message}`
    };
  }
}

/**
 * Supprime un modèle personnalisé via Electron
 */
export async function deleteCustomModelWithElectron(name: string): Promise<ElectronResponse> {
  try {
    // Vérifier que l'API Electron est disponible
    if (!window.electronAPI) {
      throw new Error('API Electron non disponible');
    }

    // Supprimer via l'API Electron
    const result = await window.electronAPI.deleteCustomModel(name);
    
    if (result.success) {
      console.log(`🗑️ Modèle "${name}" supprimé avec succès via Electron`);
      
      // Afficher une notification
      if (window.electronAPI.showNotification) {
        window.electronAPI.showNotification(
          'Modèle supprimé',
          `Le modèle "${name}" a été supprimé avec succès`
        );
      }
    } else {
      console.error(`❌ Erreur lors de la suppression: ${result.message}`);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la suppression avec Electron:', error);
    return {
      success: false,
      message: `Erreur: ${error.message}`
    };
  }
}

/**
 * Charge les modèles personnalisés via Electron
 */
export async function loadCustomModelsWithElectron(): Promise<Record<string, BlockModel>> {
  try {
    // Vérifier que l'API Electron est disponible
    if (!window.electronAPI) {
      console.warn('⚠️ API Electron non disponible, utilisation du mode web');
      return {};
    }

    // Charger via l'API Electron
    const result = await window.electronAPI.loadCustomModels();
    
    if (result.success) {
      console.log(`📚 ${Object.keys(result.models).length} modèles chargés via Electron`);
      return result.models;
    } else {
      console.error(`❌ Erreur lors du chargement: ${result.message}`);
      return {};
    }
  } catch (error) {
    console.error('Erreur lors du chargement avec Electron:', error);
    return {};
  }
}

/**
 * Valide un bloc personnalisé
 */
export function validateCustomBlock(model: any): {
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
  
  // Validation des ports
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
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Vérifie si l'application fonctionne dans Electron
 */
export function isElectronApp(): boolean {
  return !!(window.electronAPI && window.electronAPI.saveCustomModel);
}

/**
 * Test du système Electron
 */
export async function testElectronSystem(): Promise<void> {
  console.log('🧪 Test du système Electron...');
  
  if (!isElectronApp()) {
    console.log('⚠️ Application non détectée comme Electron');
    return;
  }
  
  console.log('✅ Application Electron détectée');
  
  // Test de sauvegarde
  const testModel: BlockModel = {
    type: 'Assembler',
    name: 'Test Electron',
    description: 'Modèle de test pour Electron',
    inputs: [
      {
        id: 'test-input',
        name: 'Test Input',
        kind: 'item',
        unit: 'items/min',
        rate: 60
      }
    ],
    outputs: [
      {
        id: 'test-output',
        name: 'Test Output',
        kind: 'item',
        unit: 'items/min',
        rate: 30
      }
    ],
    overclockPct: 100,
    powerEstimateMW: 4.0,
    color: '#4a9eff',
    icon: '🧪'
  };
  
  try {
    const saveResult = await saveCustomModelWithElectron('TestElectron', testModel);
    console.log('✅ Test de sauvegarde:', saveResult.success ? 'Réussi' : 'Échoué');
    
    const loadResult = await loadCustomModelsWithElectron();
    console.log('✅ Test de chargement:', Object.keys(loadResult).length > 0 ? 'Réussi' : 'Échoué');
    
    console.log('🎉 Tests Electron terminés !');
  } catch (error) {
    console.error('❌ Erreur lors des tests Electron:', error);
  }
}

// Déclaration des types pour TypeScript
declare global {
  interface Window {
    electronAPI?: {
      saveCustomModel: (name: string, model: BlockModel) => Promise<ElectronResponse>;
      deleteCustomModel: (name: string) => Promise<ElectronResponse>;
      loadCustomModels: () => Promise<{ success: boolean; models: Record<string, BlockModel> }>;
      showNotification: (title: string, body: string) => void;
    };
    electronUtils?: {
      generateFileName: (name: string) => string;
      validateFileName: (name: string) => boolean;
      formatDate: (date: Date) => string;
      copyToClipboard: (text: string) => void;
    };
  }
}
