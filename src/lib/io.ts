import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData, BlockModel } from '../blocks/types';
import { SavedGraph } from './persistence';

/**
 * Interface pour l'export JSON
 */
export interface GraphExport {
  nodes: Node<NodeData>[];
  edges: Edge[];
  metadata: {
    version: string;
    timestamp: number;
    name: string;
    description?: string;
    author?: string;
    tags?: string[];
  };
}

/**
 * Interface pour l'import JSON
 */
export interface GraphImport {
  nodes: Node<NodeData>[];
  edges: Edge[];
  metadata?: {
    version?: string;
    timestamp?: number;
    name?: string;
    description?: string;
    author?: string;
    tags?: string[];
  };
}

/**
 * Exporte le graphe en JSON
 */
export function exportGraphToJSON(
  nodes: Node<NodeData>[],
  edges: Edge[],
  name: string = 'Graphe Satisfactory',
  description?: string,
  author?: string,
  tags?: string[]
): string {
  const exportData: GraphExport = {
    nodes,
    edges,
    metadata: {
      version: '1.0.0',
      timestamp: Date.now(),
      name,
      description,
      author,
      tags: tags || []
    }
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Importe un graphe depuis JSON
 */
export function importGraphFromJSON(jsonString: string): GraphImport {
  try {
    const importData: GraphImport = JSON.parse(jsonString);
    
    // Validation de base
    if (!importData.nodes || !Array.isArray(importData.nodes)) {
      throw new Error('Format invalide: nodes manquant ou invalide');
    }
    
    if (!importData.edges || !Array.isArray(importData.edges)) {
      throw new Error('Format invalide: edges manquant ou invalide');
    }
    
    return importData;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('JSON invalide');
    }
    throw error;
  }
}

/**
 * Valide un graphe importé
 */
export function validateImportedGraph(importData: GraphImport): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Vérifier les nœuds
  importData.nodes.forEach((node, index) => {
    if (!node.id) {
      errors.push(`Nœud ${index}: ID manquant`);
    }
    
    if (!node.data || !node.data.model) {
      errors.push(`Nœud ${node.id || index}: Données de modèle manquantes`);
    }
    
    if (node.data?.model && !node.data.model.type) {
      errors.push(`Nœud ${node.id || index}: Type de bloc manquant`);
    }
  });
  
  // Vérifier les arêtes
  importData.edges.forEach((edge, index) => {
    if (!edge.id) {
      errors.push(`Arête ${index}: ID manquant`);
    }
    
    if (!edge.source || !edge.target) {
      errors.push(`Arête ${edge.id || index}: Source ou cible manquante`);
    }
    
    // Vérifier que les nœuds référencés existent
    const sourceExists = importData.nodes.some(node => node.id === edge.source);
    const targetExists = importData.nodes.some(node => node.id === edge.target);
    
    if (!sourceExists) {
      errors.push(`Arête ${edge.id || index}: Nœud source inexistant (${edge.source})`);
    }
    
    if (!targetExists) {
      errors.push(`Arête ${edge.id || index}: Nœud cible inexistant (${edge.target})`);
    }
  });
  
  // Vérifier les versions
  if (importData.metadata?.version && importData.metadata.version !== '1.0.0') {
    warnings.push(`Version différente détectée: ${importData.metadata.version}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Télécharge un fichier JSON
 */
export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Lit un fichier JSON depuis un input file
 */
export function readFileAsJSON(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Erreur lors de la lecture du fichier'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Convertit un SavedGraph en GraphExport
 */
export function savedGraphToExport(savedGraph: SavedGraph): GraphExport {
  return {
    nodes: savedGraph.nodes,
    edges: savedGraph.edges,
    metadata: {
      version: savedGraph.version,
      timestamp: savedGraph.timestamp,
      name: savedGraph.name || 'Graphe sauvegardé',
      description: 'Graphe exporté depuis la sauvegarde locale'
    }
  };
}

/**
 * Convertit un GraphImport en SavedGraph
 */
export function importToSavedGraph(importData: GraphImport): SavedGraph {
  return {
    nodes: importData.nodes,
    edges: importData.edges,
    version: importData.metadata?.version || '1.0.0',
    timestamp: importData.metadata?.timestamp || Date.now(),
    name: importData.metadata?.name
  };
}
