import { useMemo } from 'react';
import { useGraphStore } from './useGraphStore';
import { NodeData } from '../blocks/types';

/**
 * Sélecteur pour obtenir le nœud sélectionné
 */
export function useSelectedNode() {
  const { nodes, selectedNodeId } = useGraphStore();
  
  return useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find(node => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);
}

/**
 * Sélecteur pour obtenir l'arête sélectionnée
 */
export function useSelectedEdge() {
  const { edges, selectedEdgeId } = useGraphStore();
  
  return useMemo(() => {
    if (!selectedEdgeId) return null;
    return edges.find(edge => edge.id === selectedEdgeId) || null;
  }, [edges, selectedEdgeId]);
}

/**
 * Sélecteur pour obtenir les nœuds sélectionnés (pour multi-sélection future)
 */
export function useSelectedNodes() {
  const { nodes, selectedNodeId } = useGraphStore();
  
  return useMemo(() => {
    if (!selectedNodeId) return [];
    const selectedNode = nodes.find(node => node.id === selectedNodeId);
    return selectedNode ? [selectedNode] : [];
  }, [nodes, selectedNodeId]);
}

/**
 * Sélecteur pour obtenir les arêtes connectées à un nœud
 */
export function useNodeEdges(nodeId: string) {
  const { edges } = useGraphStore();
  
  return useMemo(() => {
    return edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    );
  }, [edges, nodeId]);
}

/**
 * Sélecteur pour obtenir les arêtes entrantes d'un nœud
 */
export function useIncomingEdges(nodeId: string) {
  const { edges } = useGraphStore();
  
  return useMemo(() => {
    return edges.filter(edge => edge.target === nodeId);
  }, [edges, nodeId]);
}

/**
 * Sélecteur pour obtenir les arêtes sortantes d'un nœud
 */
export function useOutgoingEdges(nodeId: string) {
  const { edges } = useGraphStore();
  
  return useMemo(() => {
    return edges.filter(edge => edge.source === nodeId);
  }, [edges, nodeId]);
}

/**
 * Sélecteur pour obtenir les arêtes d'un port spécifique
 */
export function usePortEdges(nodeId: string, handleId: string) {
  const { edges } = useGraphStore();
  
  return useMemo(() => {
    return edges.filter(edge => 
      (edge.source === nodeId && edge.sourceHandle === handleId) ||
      (edge.target === nodeId && edge.targetHandle === handleId)
    );
  }, [edges, nodeId, handleId]);
}

/**
 * Sélecteur pour obtenir les statistiques du graphe
 */
export function useGraphStats() {
  const { nodes, edges } = useGraphStore();
  
  return useMemo(() => {
    const totalNodes = nodes.length;
    const totalEdges = edges.length;
    
    // Calculer les types de blocs utilisés
    const blockTypes = new Set(nodes.map(node => node.data.model.type));
    const uniqueBlockTypes = blockTypes.size;
    
    // Calculer le flux total
    const totalFlow = edges.reduce((sum, edge) => 
      sum + (edge.data?.flowPerMin || 0), 0
    );
    
    // Calculer la puissance totale estimée
    const totalPower = nodes.reduce((sum, node) => 
      sum + (node.data.model.powerEstimateMW || 0), 0
    );
    
    return {
      totalNodes,
      totalEdges,
      uniqueBlockTypes,
      totalFlow,
      totalPower
    };
  }, [nodes, edges]);
}

/**
 * Sélecteur pour vérifier si un nœud a des connexions
 */
export function useNodeHasConnections(nodeId: string) {
  const nodeEdges = useNodeEdges(nodeId);
  
  return useMemo(() => {
    return nodeEdges.length > 0;
  }, [nodeEdges]);
}

/**
 * Sélecteur pour obtenir les modèles personnalisés triés par nom
 */
export function useSortedCustomModels() {
  const { customModels } = useGraphStore();
  
  return useMemo(() => {
    return Object.entries(customModels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, model]) => ({ name, model }));
  }, [customModels]);
}

/**
 * Sélecteur pour vérifier si le panneau de propriétés doit être ouvert
 */
export function useShouldShowPropertiesPanel() {
  const { propertiesPanelOpen, selectedNodeId, selectedEdgeId } = useGraphStore();
  
  return useMemo(() => {
    return propertiesPanelOpen && (selectedNodeId || selectedEdgeId);
  }, [propertiesPanelOpen, selectedNodeId, selectedEdgeId]);
}
