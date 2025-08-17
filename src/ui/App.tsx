import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeChange,
  EdgeChange,
  ConnectionMode,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useGraphStore } from '../store/useGraphStore';
import { NodeData, EdgeData } from '../blocks/types';
import { validateFullConnection } from '../engine/validate';
import { calculateFlows } from '../engine/flow';
import { loadGraphFromStorage, saveGraphToStorage } from '../lib/persistence';
import { globalAutoSaver } from '../lib/persistence';
import { parseDragData, isValidDragData } from '../utils';

import nodeTypes from './nodes/nodeTypes';
import edgeTypes from './edges/edgeTypes';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PropertiesPanel from './PropertiesPanel';

/**
 * Composant principal de l'application
 */
function AppContent() {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    propertiesPanelOpen,
    addNode,
    updateNode,
    deleteNode,
    selectNode,
    selectEdge,
    addEdge: addEdgeToStore,
    updateEdge,
    deleteEdge,
    recalculateFlows,
    loadCustomModels
  } = useGraphStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Charger les données au démarrage
  useEffect(() => {
    // Charger les modèles personnalisés
    loadCustomModels();

    // Charger le graphe sauvegardé
    const savedGraph = loadGraphFromStorage();
    if (savedGraph) {
      // TODO: Implémenter le chargement dans le store
      console.log('Graphe chargé:', savedGraph);
    }
  }, [loadCustomModels]);

  // Sauvegarde automatique
  useEffect(() => {
    globalAutoSaver.scheduleSave(nodes, edges);
  }, [nodes, edges]);

  // Gestion des changements de nœuds
  const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach((change) => {
      switch (change.type) {
        case 'position':
          if (change.position && change.id) {
            updateNode(change.id, { position: change.position });
          }
          break;
        case 'select':
          if (change.selected !== undefined) {
            if (change.selected) {
              selectNode(change.id);
            } else {
              selectNode(null);
            }
          }
          break;
        case 'remove':
          deleteNode(change.id);
          break;
      }
    });
  }, [updateNode, selectNode, deleteNode]);

  // Gestion des changements d'arêtes
  const onEdgesChange: OnEdgesChange = useCallback((changes: EdgeChange[]) => {
    changes.forEach((change) => {
      switch (change.type) {
        case 'select':
          if (change.selected !== undefined) {
            if (change.selected) {
              selectEdge(change.id);
            } else {
              selectEdge(null);
            }
          }
          break;
        case 'remove':
          deleteEdge(change.id);
          break;
      }
    });
  }, [selectEdge, deleteEdge]);

  // Gestion des nouvelles connexions
  const onConnect: OnConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
      return;
    }

    // Trouver les nœuds source et cible
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) {
      return;
    }

    // Valider la connexion
    const validation = validateFullConnection(
      sourceNode,
      targetNode,
      connection.sourceHandle,
      connection.targetHandle,
      edges
    );

    if (!validation.isValid) {
      console.warn('Connexion invalide:', validation.reason);
      return;
    }

    // Créer la nouvelle arête
    const newEdge: Edge<EdgeData> = {
      id: `edge-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'flow', // Utiliser notre type d'arête personnalisé
      data: {
        sourcePortId: connection.sourceHandle,
        targetPortId: connection.targetHandle,
        flowPerMin: 0,
        utilizationPct: 0,
        colorHex: '#808080'
      }
    };

    addEdgeToStore(newEdge);
  }, [nodes, edges, addEdgeToStore]);

  /**
   * Gestionnaire pour le drop de blocs sur le canvas
   * 
   * Parse les données de drag & drop et crée un nouveau nœud
   * à la position du drop sur le canvas
   */
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    if (!reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const dragData = parseDragData(event);

    if (!dragData || !isValidDragData(dragData)) {
      console.warn('Données de drag invalides');
      return;
    }

    // Extraire le modèle du bloc selon le type
    const model = dragData.model;

    // Calculer la position du drop dans le système de coordonnées du canvas
    // Ajuster pour le zoom et le pan du canvas
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    };

    // Créer le nouveau nœud
    const newNode: Node<NodeData> = {
      id: `node-${Date.now()}`,
      type: 'block',
      position,
      data: {
        model: { ...model },
        selected: false
      },
      draggable: true,
      selectable: true
    };

    addNode(newNode);
  }, [addNode]);

  // Gestion du drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Supprimer le nœud sélectionné
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault();
        deleteNode(selectedNodeId);
      }

      // Undo/Redo
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          // TODO: Implémenter undo
        } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          // TODO: Implémenter redo
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, deleteNode]);

  // Recalculer les flux quand les nœuds ou arêtes changent
  useEffect(() => {
    recalculateFlows();
  }, [nodes, edges, recalculateFlows]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Zone principale */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Barre d'outils */}
        <Topbar />

        {/* Canvas React Flow */}
        <div 
          ref={reactFlowWrapper}
          style={{ flex: 1, position: 'relative' }}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={false}
          panOnScrollMode="free"
          zoomOnDoubleClick={true}
          preventScrolling={true}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          selectionKeyCode="Shift"
          snapToGrid={false}
          snapGrid={[15, 15]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.1}
          maxZoom={4}
          style={{
            backgroundColor: 'var(--bg-primary)'
          }}
        >
            <Background />
            <Controls />
            <MiniMap 
              style={{
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-primary)'
              }}
              nodeColor="var(--accent-primary)"
            />
          </ReactFlow>
              </div>
              </div>

      {/* Panneau de propriétés */}
      {propertiesPanelOpen && (
        <div style={{ 
          position: 'absolute', 
          right: 0, 
          top: 0, 
          bottom: 0, 
          zIndex: 1000 
        }}>
          <PropertiesPanel />
              </div>
      )}
            </div>
  );
}

/**
 * Wrapper avec ReactFlowProvider
 */
export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}


