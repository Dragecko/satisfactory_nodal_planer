import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData, BlockModel, GraphState, HistoryState } from '../blocks/types';
import { validateFullConnection } from '../engine/validate';
import { calculateFlows } from '../engine/flow';
import { addToHistory, canUndo, canRedo, undo, redo } from './history';
import { 
  saveCustomModelWithElectron,
  deleteCustomModelWithElectron,
  loadCustomModelsWithElectron,
  validateCustomBlock,
  isElectronApp
} from '../lib/electronModels';
import { getCustomModels } from '../blocks/Library';

/**
 * Store Zustand pour la gestion du graphe
 */
interface GraphStore extends GraphState {
  // Actions pour les nœuds
  addNode: (node: Node<NodeData>) => void;
  updateNode: (id: string, data: Partial<NodeData> | { position?: { x: number; y: number } }) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  
  // Actions pour les arêtes
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, data: Partial<EdgeData>) => void;
  deleteEdge: (id: string) => void;
  selectEdge: (id: string | null) => void;
  
  // Actions pour l'UI
  setPropertiesPanelOpen: (open: boolean) => void;
  
  // Actions pour l'historique
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Actions pour les modèles personnalisés
  saveCustomModel: (name: string, model: BlockModel) => Promise<void>;
  deleteCustomModel: (name: string) => void;
  loadCustomModels: () => void;
  importCustomModel: (file: File) => Promise<{ name: string; model: BlockModel }>;
  exportCustomModel: (name: string) => Promise<void>;
  
  // Actions utilitaires
  recalculateFlows: () => void;
  clearGraph: () => void;
}

const MAX_HISTORY = 25;

export const useGraphStore = create<GraphStore>((set, get) => ({
  // État initial
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  propertiesPanelOpen: false,
  history: [],
  historyIndex: -1,
  customModels: {},

  // Actions pour les nœuds
  addNode: (node: Node<NodeData>) => {
    set(state => {
      const newNodes = [...state.nodes, node];
      const newState = { ...state, nodes: newNodes };
      
      // Ajouter à l'historique
      addToHistory(newState, state.history, state.historyIndex, MAX_HISTORY);
      
      return newState;
    });
    
    // Recalculer les flux
    get().recalculateFlows();
  },

  updateNode: (id: string, data: Partial<NodeData> | { position?: { x: number; y: number } }) => {
    set(state => {
      const newNodes = state.nodes.map(node => {
        if (node.id === id) {
          // Si c'est une mise à jour de position
          if ('position' in data) {
            return { ...node, position: data.position };
          }
          // Sinon, mise à jour des données du nœud
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      });
      const newState = { ...state, nodes: newNodes };
      
      // Ajouter à l'historique
      addToHistory(newState, state.history, state.historyIndex, MAX_HISTORY);
      
      return newState;
    });
    
    // Recalculer les flux seulement si ce n'est pas une mise à jour de position
    // et seulement si il y a des arêtes
    if (!('position' in data)) {
      const state = get();
      if (state.edges.length > 0) {
        try {
          get().recalculateFlows();
        } catch (error) {
          console.error('Erreur lors du recalcul des flux:', error);
        }
      }
    }
  },

  deleteNode: (id: string) => {
    set(state => {
      // Supprimer le nœud et toutes ses arêtes
      const newNodes = state.nodes.filter(node => node.id !== id);
      const newEdges = state.edges.filter(
        edge => edge.source !== id && edge.target !== id
      );
      
      const newState = { 
        ...state, 
        nodes: newNodes, 
        edges: newEdges,
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
      };
      
      // Ajouter à l'historique
      addToHistory(newState, state.history, state.historyIndex, MAX_HISTORY);
      
      return newState;
    });
    
    // Recalculer les flux
    get().recalculateFlows();
  },

  selectNode: (id: string | null) => {
    set(state => ({
      ...state,
      selectedNodeId: id,
      selectedEdgeId: null // Désélectionner l'arête si on sélectionne un nœud
    }));
  },

  // Actions pour les arêtes
  addEdge: (edge: Edge) => {
    const state = get();
    
    // Valider la connexion
    const sourceNode = state.nodes.find(n => n.id === edge.source);
    const targetNode = state.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return;
    
    const validation = validateFullConnection(
      sourceNode,
      targetNode,
      edge.sourceHandle,
      edge.targetHandle,
      state.edges
    );
    
    if (!validation.isValid) {
      console.warn('Connexion invalide:', validation.reason);
      return;
    }
    
    set(state => {
      const newEdges = [...state.edges, edge];
      const newState = { ...state, edges: newEdges };
      
      // Ajouter à l'historique
      addToHistory(newState, state.history, state.historyIndex, MAX_HISTORY);
      
      return newState;
    });
    
    // Recalculer les flux
    get().recalculateFlows();
  },

  updateEdge: (id: string, data: Partial<EdgeData>) => {
    set(state => {
      const newEdges = state.edges.map(edge => 
        edge.id === id 
          ? { ...edge, data: { ...edge.data, ...data } }
          : edge
      );
      const newState = { ...state, edges: newEdges };
      
      // Ajouter à l'historique
      addToHistory(newState, state.history, state.historyIndex, MAX_HISTORY);
      
      return newState;
    });
  },

  deleteEdge: (id: string) => {
    set(state => {
      const newEdges = state.edges.filter(edge => edge.id !== id);
      const newState = { 
        ...state, 
        edges: newEdges,
        selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId
      };
      
      // Ajouter à l'historique
      addToHistory(newState, state.history, state.historyIndex, MAX_HISTORY);
      
      return newState;
    });
    
    // Recalculer les flux
    get().recalculateFlows();
  },

  selectEdge: (id: string | null) => {
    set(state => ({
      ...state,
      selectedEdgeId: id,
      selectedNodeId: null // Désélectionner le nœud si on sélectionne une arête
    }));
  },

  // Actions pour l'UI
  setPropertiesPanelOpen: (open: boolean) => {
    set(state => ({ ...state, propertiesPanelOpen: open }));
  },

  // Actions pour l'historique
  undo: () => {
    const state = get();
    if (!canUndo(state.history, state.historyIndex)) return;
    
    const newHistoryIndex = state.historyIndex - 1;
    const previousState = state.history[newHistoryIndex];
    
    set(state => ({
      ...state,
      nodes: previousState.nodes,
      edges: previousState.edges,
      historyIndex: newHistoryIndex
    }));
    
    // Recalculer les flux
    get().recalculateFlows();
  },

  redo: () => {
    const state = get();
    if (!canRedo(state.history, state.historyIndex)) return;
    
    const newHistoryIndex = state.historyIndex + 1;
    const nextState = state.history[newHistoryIndex];
    
    set(state => ({
      ...state,
      nodes: nextState.nodes,
      edges: nextState.edges,
      historyIndex: newHistoryIndex
    }));
    
    // Recalculer les flux
    get().recalculateFlows();
  },

  canUndo: () => {
    const state = get();
    return canUndo(state.history, state.historyIndex);
  },

  canRedo: () => {
    const state = get();
    return canRedo(state.history, state.historyIndex);
  },

  // Actions pour les modèles personnalisés (système Electron)
  saveCustomModel: async (name: string, model: BlockModel) => {
    try {
      // Valider le modèle avant sauvegarde
      const validation = validateCustomBlock(model);
      if (!validation.isValid) {
        throw new Error(`Modèle invalide: ${validation.errors.join(', ')}`);
      }
      
      // Vérifier si on est dans Electron
      if (isElectronApp()) {
        // Sauvegarde via Electron
        const result = await saveCustomModelWithElectron(name, model);
        
        if (result.success) {
          // Mettre à jour le store
          set(state => ({
            ...state,
            customModels: { ...state.customModels, [name]: model }
          }));
          
          console.log(`✅ Modèle "${name}" sauvegardé avec succès via Electron`);
        } else {
          throw new Error(result.message);
        }
        
        return result;
      } else {
        // Mode web - sauvegarde temporaire
        console.warn('⚠️ Mode web détecté, sauvegarde temporaire uniquement');
        
        set(state => ({
          ...state,
          customModels: { ...state.customModels, [name]: model }
        }));
        
        console.log(`💾 Modèle "${name}" sauvegardé temporairement (mode web)`);
        
        return {
          success: true,
          message: 'Modèle sauvegardé temporairement (mode web)'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du modèle:', error);
      throw error;
    }
  },

  deleteCustomModel: async (name: string) => {
    try {
      // Vérifier si on est dans Electron
      if (isElectronApp()) {
        // Suppression via Electron
        const result = await deleteCustomModelWithElectron(name);
        
        if (result.success) {
          // Supprimer du store
          set(state => {
            const newCustomModels = { ...state.customModels };
            delete newCustomModels[name];
            return { ...state, customModels: newCustomModels };
          });
          
          console.log(`🗑️ Modèle "${name}" supprimé avec succès via Electron`);
        } else {
          throw new Error(result.message);
        }
        
        return result;
      } else {
        // Mode web - suppression du store uniquement
        set(state => {
          const newCustomModels = { ...state.customModels };
          delete newCustomModels[name];
          return { ...state, customModels: newCustomModels };
        });
        
        console.log(`🗑️ Modèle "${name}" supprimé du store (mode web)`);
        
        return {
          success: true,
          message: 'Modèle supprimé du store (mode web)'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du modèle:', error);
      throw error;
    }
  },

  loadCustomModels: async () => {
    try {
      // Vérifier si on est dans Electron
      if (isElectronApp()) {
        // Charger via Electron
        const electronModels = await loadCustomModelsWithElectron();
        
        set(state => ({ ...state, customModels: electronModels }));
        console.log(`📚 ${Object.keys(electronModels).length} modèles chargés via Electron`);
      } else {
        // Mode web - charger depuis les fichiers statiques
        const fileModels = getCustomModels();
        
        set(state => ({ ...state, customModels: fileModels }));
        console.log(`📚 ${Object.keys(fileModels).length} modèles chargés depuis les fichiers (mode web)`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
    }
  },

  // Nouvelles actions pour la gestion des fichiers
  importCustomModel: async (file: File) => {
    try {
      const { name, model } = await importCustomModelFromFile(file);
      
      // Valider le modèle importé
      const validation = validateCustomBlock(model);
      if (!validation.isValid) {
        throw new Error(`Modèle invalide: ${validation.errors.join(', ')}`);
      }
      
      // Ajouter au store
      set(state => ({
        ...state,
        customModels: { ...state.customModels, [name]: model }
      }));
      
      console.log(`Modèle "${name}" importé avec succès`);
      return { name, model };
    } catch (error) {
      console.error('Erreur lors de l\'import du modèle:', error);
      throw error;
    }
  },

  exportCustomModel: async (name: string) => {
    const state = get();
    const model = state.customModels[name];
    
    if (!model) {
      throw new Error(`Modèle "${name}" non trouvé`);
    }
    
    try {
      await exportCustomModelToFile(name, model);
      console.log(`Modèle "${name}" exporté vers fichier avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'export du modèle:', error);
      throw error;
    }
  },

  // Actions utilitaires
  recalculateFlows: () => {
    try {
      const state = get();
      if (state.nodes.length === 0 || state.edges.length === 0) {
        return; // Pas besoin de recalculer si pas de nœuds ou d'arêtes
      }
      
      const updatedEdges = calculateFlows(state.nodes, state.edges);
      set(state => ({ ...state, edges: updatedEdges }));
    } catch (error) {
      console.error('Erreur lors du recalcul des flux:', error);
      // En cas d'erreur, on garde les arêtes existantes
    }
  },

  clearGraph: () => {
    set(state => {
      const newState = { 
        ...state, 
        nodes: [], 
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null
      };
      
      // Ajouter à l'historique
      addToHistory(newState, state.history, state.historyIndex, MAX_HISTORY);
      
      return newState;
    });
  }
}));
