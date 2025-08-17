import { Node, Edge } from 'reactflow';
import { NodeData, PortKind } from '../blocks/types';

/**
 * Résultat de validation d'une connexion
 */
export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Valide une connexion entre deux nœuds
 * Règles:
 * - sourceHandle doit commencer par 'out-'
 * - targetHandle doit commencer par 'in-'
 * - Les types de ports doivent être compatibles
 * - Pas de self-loop
 */
export function validateConnection(
  source: Node<NodeData>,
  target: Node<NodeData>,
  sourceHandle: string | null,
  targetHandle: string | null
): ValidationResult {
  // Vérifier que les handles sont présents
  if (!sourceHandle || !targetHandle) {
    return {
      isValid: false,
      reason: 'Handles manquants'
    };
  }

  // Vérifier le format des handles
  if (!sourceHandle.startsWith('out-')) {
    return {
      isValid: false,
      reason: 'Le handle source doit être une sortie (out-*)'
    };
  }

  if (!targetHandle.startsWith('in-')) {
    return {
      isValid: false,
      reason: 'Le handle cible doit être une entrée (in-*)'
    };
  }

  // Vérifier qu'il n'y a pas de self-loop
  if (source.id === target.id) {
    return {
      isValid: false,
      reason: 'Impossible de se connecter à soi-même'
    };
  }

  // Extraire les indices des handles
  const sourceIndex = parseInt(sourceHandle.replace('out-', ''));
  const targetIndex = parseInt(targetHandle.replace('in-', ''));

  // Vérifier que les indices sont valides
  if (isNaN(sourceIndex) || isNaN(targetIndex)) {
    return {
      isValid: false,
      reason: 'Indices de handles invalides'
    };
  }

  // Vérifier que les ports existent
  const sourcePort = source.data.model.outputs[sourceIndex];
  const targetPort = target.data.model.inputs[targetIndex];

  if (!sourcePort || !targetPort) {
    return {
      isValid: false,
      reason: 'Ports inexistants'
    };
  }

  // Vérifier la compatibilité des types de ports
  if (sourcePort.kind !== targetPort.kind) {
    return {
      isValid: false,
      reason: `Types incompatibles: ${sourcePort.kind} → ${targetPort.kind}`
    };
  }

  return { isValid: true };
}

/**
 * Vérifie si une connexion existe déjà
 */
export function isConnectionDuplicate(
  edges: Edge[],
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string
): boolean {
  return edges.some(edge => 
    edge.source === source &&
    edge.target === target &&
    edge.sourceHandle === sourceHandle &&
    edge.targetHandle === targetHandle
  );
}

/**
 * Valide une connexion complète (avec vérification des doublons)
 */
export function validateFullConnection(
  source: Node<NodeData>,
  target: Node<NodeData>,
  sourceHandle: string | null,
  targetHandle: string | null,
  existingEdges: Edge[]
): ValidationResult {
  // Validation de base
  const baseValidation = validateConnection(source, target, sourceHandle, targetHandle);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  // Vérification des doublons
  if (isConnectionDuplicate(existingEdges, source.id, target.id, sourceHandle!, targetHandle!)) {
    return {
      isValid: false,
      reason: 'Cette connexion existe déjà'
    };
  }

  return { isValid: true };
}

/**
 * Obtient le port source à partir d'un handle
 */
export function getSourcePort(node: Node<NodeData>, sourceHandle: string): any {
  const index = parseInt(sourceHandle.replace('out-', ''));
  return node.data.model.outputs[index];
}

/**
 * Obtient le port cible à partir d'un handle
 */
export function getTargetPort(node: Node<NodeData>, targetHandle: string): any {
  const index = parseInt(targetHandle.replace('in-', ''));
  return node.data.model.inputs[index];
}

/**
 * Vérifie si un port est compatible avec un autre
 */
export function arePortsCompatible(port1: any, port2: any): boolean {
  return port1.kind === port2.kind;
}
