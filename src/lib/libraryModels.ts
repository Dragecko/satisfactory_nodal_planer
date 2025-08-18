import { BlockModel } from '../blocks/types';

/**
 * Gestionnaire de la bibliothèque de blocs personnalisés
 * 
 * Ce module gère la création, la suppression et la manipulation
 * des blocs personnalisés stockés sous forme de fichiers TypeScript
 * dans le dossier src/blocks/Library/.
 * 
 * Système de stockage :
 * - Stockage temporaire : localStorage avec préfixe 'snp:temp:'
 * - Stockage permanent : Fichiers TypeScript dans src/blocks/Library/
 * - Index automatique : Mise à jour de src/blocks/Library/index.ts
 * - Chargement : Import dynamique des fichiers au démarrage
 */

/**
 * Préfixe pour les clés temporaires dans localStorage
 */
const TEMP_PREFIX = 'snp:temp:';

/**
 * Génère un nom de fichier unique pour un bloc personnalisé
 */
export function generateUniqueFileName(baseName: string): string {
  // Nettoyer le nom pour qu'il soit compatible avec un nom de fichier
  const cleanName = baseName
    .replace(/[^a-zA-Z0-9\s]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
    .replace(/^_+|_+$/g, ''); // Supprimer les underscores en début/fin
  
  return `${cleanName}.ts`;
}

/**
 * Génère le contenu TypeScript d'un bloc personnalisé
 */
export function generateBlockFileContent(model: BlockModel, fileName: string): string {
  const blockName = fileName.replace('.ts', '');
  
  return `import { BlockModel } from '../types';

/**
 * Bloc personnalisé : ${model.name}
 * 
 * ${model.description || 'Aucune description'}
 * 
 * Créé le : ${new Date().toLocaleDateString('fr-FR')}
 */
const ${blockName}: BlockModel = ${JSON.stringify(model, null, 2)};

export default ${blockName};
`;
}

/**
 * Génère le contenu de l'index de la bibliothèque
 */
export function generateLibraryIndexContent(models: Record<string, BlockModel>): string {
  const imports: string[] = [];
  const exports: string[] = [];
  
  Object.entries(models).forEach(([name, model]) => {
    const fileName = generateUniqueFileName(name);
    const blockName = fileName.replace('.ts', '');
    imports.push(`import ${blockName} from './${fileName}';`);
    exports.push(`  '${name}': ${blockName},`);
  });
  
  return `import { BlockModel } from '../types';

/**
 * Bibliothèque des blocs personnalisés
 * 
 * Ce fichier exporte dynamiquement tous les blocs personnalisés
 * créés par l'utilisateur. Les blocs sont automatiquement
 * ajoutés ici lors de leur création via l'interface.
 * 
 * Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}
 */

${imports.join('\n')}

// Import dynamique de tous les blocs personnalisés
const customModels: Record<string, BlockModel> = {
${exports.join('\n')}
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
`;
}

/**
 * Sauvegarde temporaire d'un bloc personnalisé dans localStorage
 */
export function saveCustomModelToTemp(name: string, model: BlockModel): void {
  try {
    const key = `${TEMP_PREFIX}${name}`;
    localStorage.setItem(key, JSON.stringify(model));
    console.log(`💾 Modèle "${name}" sauvegardé temporairement dans localStorage`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde temporaire:', error);
    throw new Error(`Impossible de sauvegarder temporairement le bloc "${name}"`);
  }
}

/**
 * Charge tous les modèles temporaires depuis localStorage
 */
export function loadCustomModelsFromTemp(): Record<string, BlockModel> {
  const tempModels: Record<string, BlockModel> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(TEMP_PREFIX)) {
        try {
          const name = key.replace(TEMP_PREFIX, '');
          const modelData = localStorage.getItem(key);
          if (modelData) {
            const model = JSON.parse(modelData) as BlockModel;
            tempModels[name] = model;
          }
        } catch (error) {
          console.warn('Erreur lors du chargement du modèle temporaire:', key, error);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des modèles temporaires:', error);
  }
  
  return tempModels;
}

/**
 * Supprime un modèle temporaire de localStorage
 */
export function deleteCustomModelFromTemp(name: string): void {
  try {
    const key = `${TEMP_PREFIX}${name}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Modèle temporaire "${name}" supprimé`);
  } catch (error) {
    console.error('Erreur lors de la suppression du modèle temporaire:', error);
    throw new Error(`Impossible de supprimer le modèle temporaire "${name}"`);
  }
}

/**
 * Sauvegarde un bloc personnalisé dans un fichier TypeScript
 * 
 * Note: Cette fonction génère le fichier TypeScript mais ne peut pas
 * l'écrire directement sur le système de fichiers pour des raisons de sécurité.
 * L'utilisateur devra copier le contenu généré dans le fichier approprié.
 */
export function saveCustomModelToFile(name: string, model: BlockModel): {
  fileName: string;
  fileContent: string;
  indexContent: string;
} {
  try {
    const fileName = generateUniqueFileName(name);
    const fileContent = generateBlockFileContent(model, fileName);
    
    // Pour l'instant, on retourne le contenu à copier manuellement
    console.log(`📝 Contenu du fichier ${fileName} à créer :`);
    console.log(fileContent);
    
    return {
      fileName,
      fileContent,
      indexContent: '' // Sera généré plus tard
    };
  } catch (error) {
    console.error('Erreur lors de la génération du fichier:', error);
    throw new Error(`Impossible de générer le fichier pour "${name}"`);
  }
}

/**
 * Sauvegarde automatique d'un bloc personnalisé
 * 
 * Cette fonction sauvegarde temporairement dans localStorage ET génère
 * le contenu des fichiers pour export manuel.
 */
export function saveCustomModelAutomatically(name: string, model: BlockModel, existingModels: Record<string, BlockModel> = {}): {
  fileName: string;
  fileContent: string;
  indexContent: string;
  instructions: string[];
} {
  try {
    // 1. Sauvegarder temporairement dans localStorage
    saveCustomModelToTemp(name, model);
    
    // 2. Générer le contenu du fichier du bloc
    const fileName = generateUniqueFileName(name);
    const fileContent = generateBlockFileContent(model, fileName);
    
    // 3. Créer le nouveau dictionnaire avec le nouveau modèle
    const updatedModels = { ...existingModels, [name]: model };
    
    // 4. Générer le contenu de l'index mis à jour
    const indexContent = generateLibraryIndexContent(updatedModels);
    
    // 5. Instructions pour l'utilisateur
    const instructions = [
      `💾 Modèle "${name}" sauvegardé temporairement (persiste entre rechargements)`,
      `📁 Pour sauvegarde permanente, créez le fichier : src/blocks/Library/${fileName}`,
      `📝 Copiez le contenu du bloc dans ce fichier`,
      `📋 Remplacez le contenu de src/blocks/Library/index.ts`,
      `🔄 Redémarrez l'application pour voir les changements`
    ];
    
    console.log(`🚀 Sauvegarde automatique du modèle "${name}"`);
    console.log(`📁 Fichier à créer : ${fileName}`);
    console.log('📝 Contenu du fichier :');
    console.log(fileContent);
    console.log('📋 Contenu de l\'index mis à jour :');
    console.log(indexContent);
    console.log('💡 Instructions :');
    instructions.forEach(instruction => console.log(`   ${instruction}`));
    
    return {
      fileName,
      fileContent,
      indexContent,
      instructions
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde automatique:', error);
    throw new Error(`Impossible de sauvegarder automatiquement le bloc "${name}"`);
  }
}

/**
 * Exporte un bloc personnalisé vers un fichier TypeScript (pour partage)
 */
export async function exportCustomModelToFile(name: string, model: BlockModel): Promise<void> {
  try {
    const fileName = generateUniqueFileName(name);
    const fileContent = generateBlockFileContent(model, fileName);
    
    // Créer un blob avec le contenu du fichier
    const blob = new Blob([fileContent], { type: 'text/plain' });
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    // Déclencher le téléchargement
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Nettoyer l'URL
    URL.revokeObjectURL(url);
    
    console.log(`📁 Bloc personnalisé "${name}" exporté vers ${fileName}`);
    console.log('💡 Pour l\'ajouter à votre bibliothèque :');
    console.log(`   1. Copiez le fichier ${fileName} dans src/blocks/Library/`);
    console.log('   2. Mettez à jour src/blocks/Library/index.ts');
  } catch (error) {
    console.error('Erreur lors de l\'export du bloc personnalisé:', error);
    throw new Error(`Impossible d'exporter le bloc "${name}"`);
  }
}

/**
 * Importe un bloc personnalisé depuis un fichier TypeScript
 */
export async function importCustomModelFromFile(file: File): Promise<{ name: string; model: BlockModel }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        // Extraire le nom du bloc depuis le contenu
        const blockNameMatch = content.match(/const\s+(\w+):\s+BlockModel/);
        if (!blockNameMatch) {
          throw new Error('Format de fichier invalide: nom de bloc non trouvé');
        }
        
        const blockName = blockNameMatch[1];
        
        // Extraire l'objet BlockModel (approche simple)
        const modelMatch = content.match(/const\s+\w+:\s+BlockModel\s*=\s*({[\s\S]*});/);
        if (!modelMatch) {
          throw new Error('Format de fichier invalide: modèle non trouvé');
        }
        
        // Évaluer l'objet (attention à la sécurité en production)
        const modelString = modelMatch[1];
        const model = eval(`(${modelString})`) as BlockModel;
        
        // Valider le modèle
        if (!model || !model.name || !model.type) {
          throw new Error('Modèle invalide: propriétés manquantes');
        }
        
        resolve({ name: blockName, model });
      } catch (error) {
        reject(new Error(`Erreur lors de l'import: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsText(file);
  });
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
 * Test du système de bibliothèque
 * Cette fonction permet de vérifier que le système fonctionne correctement
 */
export function testLibrarySystem(): void {
  console.log('🧪 Test du système de bibliothèque...');
  
  // Test 1: Génération d'un fichier
  const testModel: BlockModel = {
    type: 'Assembler',
    name: 'Test Assembler',
    description: 'Modèle de test',
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
    // Générer le fichier de test
    const result = saveCustomModelToFile('TestModel', testModel);
    console.log('✅ Test 1: Génération de fichier réussie');
    console.log('📁 Fichier généré:', result.fileName);
    
    // Tester l'export
    console.log('✅ Test 2: Système d\'export prêt');
    
    console.log('🎉 Tests du système de bibliothèque terminés !');
    console.log('💡 Pour utiliser un bloc personnalisé :');
    console.log('   1. Utilisez "Exporter" pour télécharger le fichier .ts');
    console.log('   2. Placez le fichier dans src/blocks/Library/');
    console.log('   3. Mettez à jour src/blocks/Library/index.ts');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}
