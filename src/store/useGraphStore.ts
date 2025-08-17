import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData, BlockModel, GraphState, HistoryState } from '../blocks/types';
import { validateFullConnection } from '../engine/validate';
import { calculateFlows } from '../engine/flow';
import { addToHistory, canUndo, canRedo, undo, redo } from './history';

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
  saveCustomModel: (name: string, model: BlockModel) => void;
  deleteCustomModel: (name: string) => void;
  loadCustomModels: () => void;
  
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

  // Actions pour les modèles personnalisés
  saveCustomModel: (name: string, model: BlockModel) => {
    const key = `snp:custom:${name}`;
    localStorage.setItem(key, JSON.stringify(model));
    
    set(state => ({
      ...state,
      customModels: { ...state.customModels, [name]: model }
    }));
  },

  deleteCustomModel: (name: string) => {
    const key = `snp:custom:${name}`;
    localStorage.removeItem(key);
    
    set(state => {
      const newCustomModels = { ...state.customModels };
      delete newCustomModels[name];
      return { ...state, customModels: newCustomModels };
    });
  },

  loadCustomModels: () => {
    const customModels: Record<string, BlockModel> = {};
    
    // Charger tous les modèles personnalisés depuis localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('snp:custom:')) {
        try {
          const name = key.replace('snp:custom:', '');
          const model = JSON.parse(localStorage.getItem(key)!);
          customModels[name] = model;
        } catch (error) {
          console.warn('Erreur lors du chargement du modèle personnalisé:', key);
        }
      }
    }
    
    set(state => ({ ...state, customModels }));
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
