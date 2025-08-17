import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData, Unit } from '../blocks/types';
import { getSourcePort, getTargetPort } from './validate';

/**
 * Interface pour les données de flux calculées
 */
export interface FlowData {
  flowPerMin: number;
  utilizationPct: number;
  colorHex: string;
}

/**
 * Convertit une valeur d'une unité vers items/min
 */
export function toItemsPerMin(value: number, unit: Unit): number {
  switch (unit) {
    case 'items/min':
      return value;
    case 'items/s':
      return value * 60;
    default:
      return value;
  }
}

/**
 * Convertit une valeur de items/min vers une unité spécifique
 */
export function fromItemsPerMin(value: number, unit: Unit): number {
  switch (unit) {
    case 'items/min':
      return value;
    case 'items/s':
      return value / 60;
    default:
      return value;
  }
}

/**
 * Convertit un pourcentage d'utilisation en couleur hexadécimale
 * Rouge (0%) → Vert (100%)
 */
export function utilToColor(utilPct: number): string {
  // Clamper entre 0 et 100
  const clamped = Math.max(0, Math.min(100, utilPct));
  
  // Rouge à 0%, Vert à 100%
  const red = Math.round(255 * (1 - clamped / 100));
  const green = Math.round(255 * (clamped / 100));
  const blue = 0;
  
  return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
}

/**
 * Calcule les flux pour toutes les arêtes du graphe
 * Algorithme: distribution par "demandes décroissantes"
 */
export function calculateFlows(nodes: Node<NodeData>[], edges: Edge[]): Edge[] {
  // Créer une map des nœuds pour un accès rapide
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
  // Créer une map des ports sources avec leur capacité restante
  const sourceCapacities = new Map<string, number>();
  
  // Initialiser les capacités des ports sources
  nodes.forEach(node => {
    node.data.model.outputs.forEach((port, index) => {
      const handleId = `out-${index}`;
      const capacity = toItemsPerMin(port.rate, port.unit);
      sourceCapacities.set(`${node.id}:${handleId}`, capacity);
    });
  });
  
  // Créer une map des demandes par port cible
  const targetDemands = new Map<string, number>();
  
  // Calculer les demandes totales par port cible
  edges.forEach(edge => {
    if (edge.targetHandle) {
      const targetNode = nodeMap.get(edge.target);
      if (targetNode) {
        const targetPort = getTargetPort(targetNode, edge.targetHandle);
        if (targetPort) {
          const demand = toItemsPerMin(targetPort.rate, targetPort.unit);
          const key = `${edge.target}:${edge.targetHandle}`;
          targetDemands.set(key, (targetDemands.get(key) || 0) + demand);
        }
      }
    }
  });
  
  // Grouper les arêtes par port source
  const edgesBySource = new Map<string, Edge[]>();
  edges.forEach(edge => {
    if (edge.sourceHandle) {
      const key = `${edge.source}:${edge.sourceHandle}`;
      if (!edgesBySource.has(key)) {
        edgesBySource.set(key, []);
      }
      edgesBySource.get(key)!.push(edge);
    }
  });
  
  // Calculer les flux pour chaque groupe de port source
  edgesBySource.forEach((sourceEdges, sourceKey) => {
    const [sourceNodeId, sourceHandle] = sourceKey.split(':');
    const sourceNode = nodeMap.get(sourceNodeId);
    
    if (!sourceNode || !sourceHandle) return;
    
    const sourcePort = getSourcePort(sourceNode, sourceHandle);
    if (!sourcePort) return;
    
    const totalCapacity = toItemsPerMin(sourcePort.rate, sourcePort.unit);
    let remainingCapacity = totalCapacity;
    
    // Trier les arêtes par demande décroissante
    const sortedEdges = sourceEdges.sort((a, b) => {
      const demandA = targetDemands.get(`${a.target}:${a.targetHandle}`) || 0;
      const demandB = targetDemands.get(`${b.target}:${b.targetHandle}`) || 0;
      return demandB - demandA;
    });
    
    // Distribuer le flux selon les demandes décroissantes
    sortedEdges.forEach(edge => {
      if (!edge.targetHandle) return;
      
      const targetNode = nodeMap.get(edge.target);
      if (!targetNode) return;
      
      const targetPort = getTargetPort(targetNode, edge.targetHandle);
      if (!targetPort) return;
      
      const targetDemand = toItemsPerMin(targetPort.rate, targetPort.unit);
      const flow = Math.min(remainingCapacity, targetDemand);
      
      // Mettre à jour l'arête avec les données de flux
      const utilizationPct = totalCapacity > 0 ? ((totalCapacity - remainingCapacity + flow) / totalCapacity) * 100 : 0;
      const colorHex = utilToColor(utilizationPct);
      
      edge.data = {
        sourcePortId: sourceHandle,
        targetPortId: edge.targetHandle,
        flowPerMin: flow,
        utilizationPct,
        colorHex
      };
      
      remainingCapacity -= flow;
    });
  });
  
  return edges;
}

/**
 * Calcule l'utilisation d'un port source spécifique
 */
export function calculateSourceUtilization(
  node: Node<NodeData>,
  sourceHandle: string,
  edges: Edge[]
): number {
  const sourcePort = getSourcePort(node, sourceHandle);
  if (!sourcePort) return 0;
  
  const totalCapacity = toItemsPerMin(sourcePort.rate, sourcePort.unit);
  if (totalCapacity === 0) return 0;
  
  // Calculer le flux total sortant de ce port
  const totalFlow = edges
    .filter(edge => edge.source === node.id && edge.sourceHandle === sourceHandle)
    .reduce((sum, edge) => sum + (edge.data?.flowPerMin || 0), 0);
  
  return (totalFlow / totalCapacity) * 100;
}

/**
 * Calcule l'utilisation d'un port cible spécifique
 */
export function calculateTargetUtilization(
  node: Node<NodeData>,
  targetHandle: string,
  edges: Edge[]
): number {
  const targetPort = getTargetPort(node, targetHandle);
  if (!targetPort) return 0;
  
  const totalDemand = toItemsPerMin(targetPort.rate, targetPort.unit);
  if (totalDemand === 0) return 0;
  
  // Calculer le flux total entrant dans ce port
  const totalFlow = edges
    .filter(edge => edge.target === node.id && edge.targetHandle === targetHandle)
    .reduce((sum, edge) => sum + (edge.data?.flowPerMin || 0), 0);
  
  return (totalFlow / totalDemand) * 100;
}

/**
 * Hook pour utiliser le moteur de flux
 */
export function useFlowEngine() {
  return {
    calculateFlows,
    toItemsPerMin,
    fromItemsPerMin,
    utilToColor,
    calculateSourceUtilization,
    calculateTargetUtilization
  };
}
