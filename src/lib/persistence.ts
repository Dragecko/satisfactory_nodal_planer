import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from '../blocks/types';

/**
 * Interface pour les données sauvegardées
 */
export interface SavedGraph {
  nodes: Node<NodeData>[];
  edges: Edge[];
  version: string;
  timestamp: number;
  name?: string;
}

/**
 * Version actuelle du format de sauvegarde
 */
const CURRENT_VERSION = '1.0.0';

/**
 * Sauvegarde le graphe dans localStorage
 */
export function saveGraphToStorage(
  nodes: Node<NodeData>[],
  edges: Edge[],
  name?: string
): void {
  const savedGraph: SavedGraph = {
    nodes,
    edges,
    version: CURRENT_VERSION,
    timestamp: Date.now(),
    name
  };

  try {
    localStorage.setItem('snp:graph', JSON.stringify(savedGraph));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du graphe:', error);
    throw new Error('Impossible de sauvegarder le graphe');
  }
}

/**
 * Charge le graphe depuis localStorage
 */
export function loadGraphFromStorage(): SavedGraph | null {
  try {
    const saved = localStorage.getItem('snp:graph');
    if (!saved) return null;

    const savedGraph: SavedGraph = JSON.parse(saved);
    
    // Vérifier la version
    if (savedGraph.version !== CURRENT_VERSION) {
      console.warn('Version de sauvegarde différente, migration possible nécessaire');
    }

    return savedGraph;
  } catch (error) {
    console.error('Erreur lors du chargement du graphe:', error);
    return null;
  }
}

/**
 * Supprime la sauvegarde du graphe
 */
export function clearGraphStorage(): void {
  try {
    localStorage.removeItem('snp:graph');
  } catch (error) {
    console.error('Erreur lors de la suppression du graphe:', error);
  }
}

/**
 * Vérifie si une sauvegarde existe
 */
export function hasGraphStorage(): boolean {
  return localStorage.getItem('snp:graph') !== null;
}

/**
 * Obtient les métadonnées de la sauvegarde sans charger le graphe complet
 */
export function getGraphMetadata(): { timestamp: number; name?: string; version: string } | null {
  try {
    const saved = localStorage.getItem('snp:graph');
    if (!saved) return null;

    const savedGraph: SavedGraph = JSON.parse(saved);
    return {
      timestamp: savedGraph.timestamp,
      name: savedGraph.name,
      version: savedGraph.version
    };
  } catch (error) {
    console.error('Erreur lors de la lecture des métadonnées:', error);
    return null;
  }
}

/**
 * Sauvegarde automatique avec throttling
 */
export class AutoSaver {
  private timeoutId: NodeJS.Timeout | null = null;
  private lastSave = 0;
  private readonly throttleMs: number;

  constructor(throttleMs: number = 500) {
    this.throttleMs = throttleMs;
  }

  scheduleSave(
    nodes: Node<NodeData>[],
    edges: Edge[],
    name?: string
  ): void {
    const now = Date.now();
    
    // Si on a déjà programmé une sauvegarde, l'annuler
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Programmer une nouvelle sauvegarde
    this.timeoutId = setTimeout(() => {
      saveGraphToStorage(nodes, edges, name);
      this.lastSave = Date.now();
      this.timeoutId = null;
    }, this.throttleMs);
  }

  cancelPendingSave(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  getLastSaveTime(): number {
    return this.lastSave;
  }
}

/**
 * Instance globale de l'auto-saver
 */
export const globalAutoSaver = new AutoSaver();
