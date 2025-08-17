/**
 * Types de base pour les blocs Satisfactory
 */

export type BlockType = 'Miner' | 'Smelter' | 'Foundry' | 'Assembler' | 'TrainFreight';

export type PortKind = 'item' | 'fluid' | 'power';

export type Unit = 'items/min' | 'items/s';

export interface Port {
  id: string;
  name: string;
  kind: PortKind;
  unit: Unit;
  rate: number; // rate en unité choisie
}

export interface BlockModel {
  type: BlockType;
  name: string;
  description?: string;
  inputs: Port[];
  outputs: Port[];
  overclockPct?: number; // 100 -> nominal
  powerEstimateMW?: number;
  color?: string;
  icon?: string;
}

export interface NodeData {
  model: BlockModel;
  selected?: boolean;
}

export interface EdgeData {
  sourcePortId: string;
  targetPortId: string;
  flowPerMin: number;
  utilizationPct: number; // 0..100
  colorHex: string;
}

// Types pour le store Zustand
export interface GraphState {
  nodes: any[]; // ReactFlow nodes
  edges: any[]; // ReactFlow edges
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  propertiesPanelOpen: boolean;
  history: HistoryState[];
  historyIndex: number;
  customModels: Record<string, BlockModel>;
}

export interface HistoryState {
  nodes: any[];
  edges: any[];
  timestamp: number;
}

// Types pour les actions
export interface AddNodeAction {
  type: 'ADD_NODE';
  payload: {
    id: string;
    position: { x: number; y: number };
    data: NodeData;
  };
}

export interface UpdateNodeAction {
  type: 'UPDATE_NODE';
  payload: {
    id: string;
    data: Partial<NodeData>;
  };
}

export interface DeleteNodeAction {
  type: 'DELETE_NODE';
  payload: { id: string };
}

export interface AddEdgeAction {
  type: 'ADD_EDGE';
  payload: {
    id: string;
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
  };
}

export interface UpdateEdgeAction {
  type: 'UPDATE_EDGE';
  payload: {
    id: string;
    data: Partial<EdgeData>;
  };
}

export interface DeleteEdgeAction {
  type: 'DELETE_EDGE';
  payload: { id: string };
}

export type GraphAction = 
  | AddNodeAction 
  | UpdateNodeAction 
  | DeleteNodeAction 
  | AddEdgeAction 
  | UpdateEdgeAction 
  | DeleteEdgeAction;


