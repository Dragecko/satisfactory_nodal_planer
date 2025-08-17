// @ts-nocheck
import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, Port } from '../../blocks/types';
import { useGraphStore } from '../../store/useGraphStore';
import { useInlineEdit } from '../../hooks';

/**
 * Composant de nœud de bloc Satisfactory
 * 
 * Ce composant affiche un nœud de bloc avec :
 * - Ports d'entrée et de sortie configurables
 * - Édition inline du nom et de la description
 * - Affichage des taux d'utilisation des ports
 * - Mise en évidence de la sélection
 * - Intégration avec le système de flux
 * - Boutons pour ajouter/supprimer des ports
 */
export default function BlockNode({ id, data, selected }: NodeProps<NodeData>) {
  const { model } = data;
  const { updateNode, selectNode, nodes, edges } = useGraphStore();

  // S'assurer que les propriétés existent
  const safeModel = {
    name: model.name || 'Bloc',
    description: model.description || '',
    type: model.type || 'Unknown',
    inputs: model.inputs || [],
    outputs: model.outputs || [],
    overclockPct: model.overclockPct || 100,
    color: model.color || '#4a9eff',
    icon: model.icon || '⚙️',
    powerEstimateMW: model.powerEstimateMW || 0
  };

  /**
   * Hook pour l'édition inline du titre
   */
  const titleEdit = useInlineEdit({
    initialValue: safeModel.name,
    onSave: (newTitle) => {
      updateNode(id, {
        model: { ...safeModel, name: newTitle }
      });
    },
    placeholder: 'Nom du bloc'
  });

  /**
   * Hook pour l'édition inline de la description
   */
  const descriptionEdit = useInlineEdit({
    initialValue: safeModel.description,
    onSave: (newDescription) => {
      updateNode(id, {
        model: { ...safeModel, description: newDescription }
      });
    },
    placeholder: 'Description du bloc'
  });

  /**
   * Gestionnaire pour le clic sur un port
   */
  const handlePortClick = useCallback((port: Port, isInput: boolean) => {
    selectNode(id);
  }, [id, selectNode]);

  /**
   * Gestionnaire pour ajouter un port d'entrée
   */
  const handleAddInput = useCallback(() => {
    const newPort: Port = {
      id: `input-${Date.now()}`,
      name: `Entrée ${safeModel.inputs.length + 1}`,
      kind: 'item',
      unit: 'items/min',
      rate: 30
    };
    
    updateNode(id, {
      model: {
        ...safeModel,
        inputs: [...safeModel.inputs, newPort]
      }
    });
  }, [id, safeModel, updateNode]);

  /**
   * Gestionnaire pour supprimer un port d'entrée
   */
  const handleRemoveInput = useCallback((index: number) => {
    const newInputs = safeModel.inputs.filter((_, i) => i !== index);
    updateNode(id, {
      model: {
        ...safeModel,
        inputs: newInputs
      }
    });
  }, [id, safeModel, updateNode]);

  /**
   * Gestionnaire pour ajouter un port de sortie
   */
  const handleAddOutput = useCallback(() => {
    const newPort: Port = {
      id: `output-${Date.now()}`,
      name: `Sortie ${safeModel.outputs.length + 1}`,
      kind: 'item',
      unit: 'items/min',
      rate: 30
    };
    
    updateNode(id, {
      model: {
        ...safeModel,
        outputs: [...safeModel.outputs, newPort]
      }
    });
  }, [id, safeModel, updateNode]);

  /**
   * Gestionnaire pour supprimer un port de sortie
   */
  const handleRemoveOutput = useCallback((index: number) => {
    const newOutputs = safeModel.outputs.filter((_, i) => i !== index);
    updateNode(id, {
      model: {
        ...safeModel,
        outputs: newOutputs
      }
    });
  }, [id, safeModel, updateNode]);

  /**
   * Calcule le taux d'utilisation d'un port
   */
  const getPortUtilization = useCallback((port: Port, isInput: boolean, portIndex: number) => {
    const handleId = isInput ? `in-${portIndex}` : `out-${portIndex}`;
    
    // Trouver les arêtes connectées à ce port
    const connectedEdges = edges.filter(edge => {
      if (isInput) {
        return edge.target === id && edge.targetHandle === handleId;
      } else {
        return edge.source === id && edge.sourceHandle === handleId;
      }
    });
    
    // Calculer le flux total
    const totalFlow = connectedEdges.reduce((sum, edge) => {
      return sum + (edge.data?.flowPerMin || 0);
    }, 0);
    
    // Calculer la capacité/demande
    const capacity = port.rate; // items/min
    
    // Retourner le pourcentage d'utilisation
    if (capacity > 0) {
      return Math.min(100, (totalFlow / capacity) * 100);
    }
    
    return 0;
  }, [id, edges]);

  return (
    <div 
      className={`block-node ${selected ? 'selected' : ''}`}
      style={{ 
        borderColor: safeModel.color,
        minWidth: Math.max(250, Math.max(safeModel.inputs.length, safeModel.outputs.length) * 90)
      }}
    >
      {/* En-tête du nœud */}
      <div className="block-node__header">
        <span className="block-node__icon">{safeModel.icon}</span>
        <div
          ref={titleEdit.ref}
          className={`block-node__title ${titleEdit.isEditing ? 'editing' : ''}`}
          {...titleEdit.handlers}
          style={{ 
            outline: titleEdit.isEditing ? '2px solid var(--accent-primary)' : 'none',
            padding: titleEdit.isEditing ? '2px 4px' : '0',
            borderRadius: titleEdit.isEditing ? 'var(--radius-sm)' : '0'
          }}
        >
          {safeModel.name}
        </div>
      </div>

      {/* Contenu du nœud */}
      <div className="block-node__content">
        {/* Ports d'entrée */}
        <div className="block-node__inputs">
          {safeModel.inputs.map((port, index) => {
            const utilization = getPortUtilization(port, true, index);
            return (
              <div key={port.id} className="port port--input">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`in-${index}`}
                  className="port__handle port__handle--input"
                />
                <div className="port__info">
                  <div className="port__name">{port.name}</div>
                  <div className="port__rate">{port.rate} {port.unit}</div>
                </div>
                <div 
                  className="port__badge"
                  onClick={() => handlePortClick(port, true)}
                  style={{
                    backgroundColor: utilization > 80 ? 'var(--accent-success)' : 
                                   utilization > 50 ? 'var(--accent-warning)' : 'var(--accent-primary)'
                  }}
                >
                  {utilization.toFixed(0)}%
                </div>
                {safeModel.inputs.length > 1 && (
                  <button
                    className="port__remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveInput(index);
                    }}
                    title="Supprimer cette entrée"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
          
          {/* Bouton pour ajouter une entrée */}
          <button
            className="port__add-btn port__add-btn--input"
            onClick={handleAddInput}
            title="Ajouter une entrée"
          >
            + Entrée
          </button>
        </div>

        {/* Centre du nœud */}
        <div className="block-node__center">
          <div
            ref={descriptionEdit.ref}
            className={`block-node__description ${descriptionEdit.isEditing ? 'editing' : ''}`}
            {...descriptionEdit.handlers}
            style={{ 
              outline: descriptionEdit.isEditing ? '2px solid var(--accent-primary)' : 'none',
              padding: descriptionEdit.isEditing ? '4px' : '0',
              borderRadius: descriptionEdit.isEditing ? 'var(--radius-sm)' : '0',
              minHeight: descriptionEdit.isEditing ? '60px' : 'auto'
            }}
          >
            {safeModel.description || 'Double-clic pour éditer'}
          </div>
          
          {/* Informations de performance */}
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
            {safeModel.overclockPct && safeModel.overclockPct !== 100 && (
              <div>Surcadençage: {safeModel.overclockPct}%</div>
            )}
            {safeModel.powerEstimateMW && (
              <div>Puissance: {safeModel.powerEstimateMW} MW</div>
            )}
          </div>
        </div>

        {/* Ports de sortie */}
        <div className="block-node__outputs">
          {safeModel.outputs.map((port, index) => {
            const utilization = getPortUtilization(port, false, index);
            return (
              <div key={port.id} className="port port--output">
                {safeModel.outputs.length > 1 && (
                  <button
                    className="port__remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOutput(index);
                    }}
                    title="Supprimer cette sortie"
                  >
                    ×
                  </button>
                )}
                <div 
                  className="port__badge"
                  onClick={() => handlePortClick(port, false)}
                  style={{
                    backgroundColor: utilization > 80 ? 'var(--accent-success)' : 
                                   utilization > 50 ? 'var(--accent-warning)' : 'var(--accent-primary)'
                  }}
                >
                  {utilization.toFixed(0)}%
                </div>
                <div className="port__info">
                  <div className="port__name">{port.name}</div>
                  <div className="port__rate">{port.rate} {port.unit}</div>
                </div>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`out-${index}`}
                  className="port__handle port__handle--output"
                />
              </div>
            );
          })}
          
          {/* Bouton pour ajouter une sortie */}
          <button
            className="port__add-btn port__add-btn--output"
            onClick={handleAddOutput}
            title="Ajouter une sortie"
          >
            + Sortie
          </button>
        </div>
      </div>
    </div>
  );
}


