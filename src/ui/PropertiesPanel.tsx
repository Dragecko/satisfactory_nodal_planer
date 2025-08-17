import React, { useState, useCallback, useEffect } from 'react';
import { useSelectedNode } from '../store/selectors';
import { useGraphStore } from '../store/useGraphStore';
import { Port, Unit } from '../blocks/types';

/**
 * Composant de panneau de propriétés complet et robuste
 */
export default function PropertiesPanel() {
  const selectedNode = useSelectedNode();
  const { updateNode, setPropertiesPanelOpen } = useGraphStore();
  const [localName, setLocalName] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localOverclock, setLocalOverclock] = useState(100);
  const [localColor, setLocalColor] = useState('#4a9eff');
  const [localIcon, setLocalIcon] = useState('⚙️');

  // Initialiser les valeurs quand un nœud est sélectionné
  useEffect(() => {
    if (selectedNode?.data?.model) {
      const model = selectedNode.data.model;
      setLocalName(model.name || '');
      setLocalDescription(model.description || '');
      setLocalOverclock(model.overclockPct || 100);
      setLocalColor(model.color || '#4a9eff');
      setLocalIcon(model.icon || '⚙️');
    }
  }, [selectedNode]);

  // Gestion du changement de nom
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setLocalName(newName);
    
    if (selectedNode?.id && selectedNode?.data?.model) {
      updateNode(selectedNode.id, {
        model: { ...selectedNode.data.model, name: newName }
      });
    }
  }, [selectedNode?.id, selectedNode?.data?.model, updateNode]);

  // Gestion du changement de description
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setLocalDescription(newDescription);
    
    if (selectedNode?.id && selectedNode?.data?.model) {
      updateNode(selectedNode.id, {
        model: { ...selectedNode.data.model, description: newDescription }
      });
    }
  }, [selectedNode?.id, selectedNode?.data?.model, updateNode]);

  // Gestion du changement de surcadençage
  const handleOverclockChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(250, parseInt(e.target.value) || 100));
    setLocalOverclock(value);
    
    if (selectedNode?.id && selectedNode?.data?.model) {
      updateNode(selectedNode.id, {
        model: { ...selectedNode.data.model, overclockPct: value }
      });
    }
  }, [selectedNode?.id, selectedNode?.data?.model, updateNode]);

  // Gestion du changement de couleur
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setLocalColor(newColor);
    
    if (selectedNode?.id && selectedNode?.data?.model) {
      updateNode(selectedNode.id, {
        model: { ...selectedNode.data.model, color: newColor }
      });
    }
  }, [selectedNode?.id, selectedNode?.data?.model, updateNode]);

  // Gestion du changement d'icône
  const handleIconChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newIcon = e.target.value;
    setLocalIcon(newIcon);
    
    if (selectedNode?.id && selectedNode?.data?.model) {
      updateNode(selectedNode.id, {
        model: { ...selectedNode.data.model, icon: newIcon }
      });
    }
  }, [selectedNode?.id, selectedNode?.data?.model, updateNode]);

  // Gestion de l'ajout d'un port
  const handleAddPort = useCallback((portType: 'input' | 'output') => {
    try {
      if (!selectedNode?.id || !selectedNode?.data?.model) return;
      
      const model = selectedNode.data.model;
      const newPort: Port = {
        id: `${portType}-${Date.now()}`,
        name: `${portType === 'input' ? 'Entrée' : 'Sortie'} ${(model[portType === 'input' ? 'inputs' : 'outputs']?.length || 0) + 1}`,
        kind: 'item',
        unit: 'items/min',
        rate: 30
      };

      const ports = portType === 'input' ? [...(model.inputs || [])] : [...(model.outputs || [])];
      ports.push(newPort);

      updateNode(selectedNode.id, {
        model: {
          ...model,
          [portType === 'input' ? 'inputs' : 'outputs']: ports
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du port:', error);
    }
  }, [selectedNode?.id, selectedNode?.data?.model, updateNode]);

  // Gestion de la suppression d'un port
  const handleRemovePort = useCallback((portType: 'input' | 'output', index: number) => {
    try {
      if (!selectedNode?.id || !selectedNode?.data?.model) return;
      
      const model = selectedNode.data.model;
      const ports = portType === 'input' ? [...(model.inputs || [])] : [...(model.outputs || [])];
      if (ports.length > 1) { // Garder au moins un port
        ports.splice(index, 1);
        
        updateNode(selectedNode.id, {
          model: {
            ...model,
            [portType === 'input' ? 'inputs' : 'outputs']: ports
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du port:', error);
    }
  }, [selectedNode?.id, selectedNode?.data?.model, updateNode]);

  // Gestion de la fermeture
  const handleClose = useCallback(() => {
    setPropertiesPanelOpen(false);
  }, [setPropertiesPanelOpen]);

  // Si aucun nœud n'est sélectionné, ne pas afficher
  if (!selectedNode || !selectedNode.data?.model) {
    return null;
  }

  const model = selectedNode.data.model;

  // Composant pour afficher un port
  const PortDisplay = ({ port, portType, index }: { port: Port; portType: 'input' | 'output'; index: number }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(port.name);
    const [tempRate, setTempRate] = useState(port.rate.toString());
    const [tempUnit, setTempUnit] = useState<Unit>(port.unit);

    const handleSave = () => {
      try {
        const rate = parseFloat(tempRate) || 0;
        const ports = portType === 'input' ? [...(model.inputs || [])] : [...(model.outputs || [])];
        ports[index] = { ...port, name: tempName, rate, unit: tempUnit };
        
        updateNode(selectedNode.id, {
          model: {
            ...model,
            [portType === 'input' ? 'inputs' : 'outputs']: ports
          }
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du port:', error);
      }
    };

    const handleCancel = () => {
      setTempName(port.name);
      setTempRate(port.rate.toString());
      setTempUnit(port.unit);
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div style={{
          padding: '8px',
          border: '1px solid var(--border-primary)',
          borderRadius: '4px',
          backgroundColor: 'var(--bg-secondary)',
          marginBottom: '4px'
        }}>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid var(--border-primary)',
              borderRadius: '2px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              marginBottom: '4px'
            }}
            placeholder="Nom du port"
          />
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <input
              type="number"
              value={tempRate}
              onChange={(e) => setTempRate(e.target.value)}
              style={{
                flex: 1,
                padding: '4px 8px',
                border: '1px solid var(--border-primary)',
                borderRadius: '2px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '12px'
              }}
              placeholder="Débit"
              min="0"
              step="0.1"
            />
            <select
              value={tempUnit}
              onChange={(e) => setTempUnit(e.target.value as Unit)}
              style={{
                padding: '4px 8px',
                border: '1px solid var(--border-primary)',
                borderRadius: '2px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '12px'
              }}
            >
              <option value="items/min">items/min</option>
              <option value="items/s">items/s</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '2px 8px',
                border: '1px solid var(--accent-success)',
                borderRadius: '2px',
                backgroundColor: 'var(--accent-success)',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '2px 8px',
                border: '1px solid var(--accent-danger)',
                borderRadius: '2px',
                backgroundColor: 'var(--accent-danger)',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        padding: '8px',
        border: '1px solid var(--border-primary)',
        borderRadius: '4px',
        backgroundColor: 'var(--bg-secondary)',
        marginBottom: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontWeight: '500', fontSize: '12px', color: 'var(--text-primary)' }}>
            {port.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {port.rate} {port.unit}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '2px 6px',
              border: '1px solid var(--accent-primary)',
              borderRadius: '2px',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            title="Éditer"
          >
            ✏️
          </button>
          {(model[portType === 'input' ? 'inputs' : 'outputs']?.length || 0) > 1 && (
            <button
              onClick={() => handleRemovePort(portType, index)}
              style={{
                padding: '2px 6px',
                border: '1px solid var(--accent-danger)',
                borderRadius: '2px',
                backgroundColor: 'var(--accent-danger)',
                color: 'white',
                fontSize: '10px',
                cursor: 'pointer'
              }}
              title="Supprimer"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '300px',
      height: '100%',
      backgroundColor: 'var(--bg-panel)',
      borderLeft: '1px solid var(--border-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* En-tête */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Propriétés</h3>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            borderRadius: '4px'
          }}
          title="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Contenu */}
      <div style={{ padding: '16px', flex: 1, overflow: 'auto' }}>
        {/* Nom */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '4px',
            color: 'var(--text-primary)',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Nom
          </label>
          <input
            type="text"
            value={localName}
            onChange={handleNameChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
            placeholder="Nom du bloc"
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '4px',
            color: 'var(--text-primary)',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Description
          </label>
          <textarea
            value={localDescription}
            onChange={handleDescriptionChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical'
            }}
            placeholder="Description du bloc"
            rows={3}
          />
        </div>

        {/* Surcadençage */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '4px',
            color: 'var(--text-primary)',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Surcadençage (%)
          </label>
          <input
            type="number"
            value={localOverclock}
            onChange={handleOverclockChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
            min="1"
            max="250"
            step="1"
          />
        </div>

        {/* Couleur */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '4px',
            color: 'var(--text-primary)',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Couleur
          </label>
          <input
            type="color"
            value={localColor}
            onChange={handleColorChange}
            style={{
              width: '100%',
              height: '40px',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-secondary)'
            }}
          />
        </div>

        {/* Icône */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '4px',
            color: 'var(--text-primary)',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Icône
          </label>
          <input
            type="text"
            value={localIcon}
            onChange={handleIconChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
            placeholder="Icône (emoji)"
          />
        </div>

        {/* Type (lecture seule) */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '4px',
            color: 'var(--text-primary)',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            Type
          </label>
          <input
            type="text"
            value={model.type || 'Inconnu'}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              fontSize: '14px',
              cursor: 'not-allowed'
            }}
            disabled
          />
        </div>

        {/* Ports d'entrée */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <label style={{
              color: 'var(--text-primary)',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Entrées
            </label>
            <button
              onClick={() => handleAddPort('input')}
              style={{
                padding: '4px 8px',
                border: '1px solid var(--accent-success)',
                borderRadius: '4px',
                backgroundColor: 'var(--accent-success)',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              title="Ajouter une entrée"
            >
              ➕
            </button>
          </div>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {model.inputs?.map((port: Port, index: number) => (
              <PortDisplay key={port.id} port={port} portType="input" index={index} />
            ))}
            {(!model.inputs || model.inputs.length === 0) && (
              <div style={{
                padding: '8px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontStyle: 'italic'
              }}>
                Aucune entrée
              </div>
            )}
          </div>
        </div>

        {/* Ports de sortie */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <label style={{
              color: 'var(--text-primary)',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Sorties
            </label>
            <button
              onClick={() => handleAddPort('output')}
              style={{
                padding: '4px 8px',
                border: '1px solid var(--accent-success)',
                borderRadius: '4px',
                backgroundColor: 'var(--accent-success)',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              title="Ajouter une sortie"
            >
              ➕
            </button>
          </div>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {model.outputs?.map((port: Port, index: number) => (
              <PortDisplay key={port.id} port={port} portType="output" index={index} />
            ))}
            {(!model.outputs || model.outputs.length === 0) && (
              <div style={{
                padding: '8px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontStyle: 'italic'
              }}>
                Aucune sortie
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
