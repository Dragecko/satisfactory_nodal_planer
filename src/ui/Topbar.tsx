import React, { useCallback, useRef } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { useSelectedNode, useGraphStats } from '../store/selectors';
import { exportGraphToJSON, downloadJSON, readFileAsJSON, importGraphFromJSON, validateImportedGraph } from '../lib/io';
import { saveGraphToStorage } from '../lib/persistence';

/**
 * Composant de barre d'outils supérieure
 */
export default function Topbar() {
  const { 
    nodes, 
    edges, 
    selectedNodeId,
    deleteNode, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    saveCustomModel,
    clearGraph,
    setPropertiesPanelOpen
  } = useGraphStore();
  
  const selectedNode = useSelectedNode();
  const stats = useGraphStats();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestion de la suppression du nœud sélectionné
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  }, [selectedNodeId, deleteNode]);

  // Gestion de l'ajout d'entrées/sorties
  const handleAddInput = useCallback(() => {
    if (selectedNode) {
      const newInput = {
        id: `in-${Date.now()}`,
        name: `Entrée ${selectedNode.data.model.inputs.length + 1}`,
        kind: 'item' as const,
        unit: 'items/min' as const,
        rate: 0
      };
      
      const updatedModel = {
        ...selectedNode.data.model,
        inputs: [...selectedNode.data.model.inputs, newInput]
      };
      
      // Mise à jour via le store
      // TODO: Implémenter updateNode dans le store
    }
  }, [selectedNode]);

  const handleAddOutput = useCallback(() => {
    if (selectedNode) {
      const newOutput = {
        id: `out-${Date.now()}`,
        name: `Sortie ${selectedNode.data.model.outputs.length + 1}`,
        kind: 'item' as const,
        unit: 'items/min' as const,
        rate: 0
      };
      
      const updatedModel = {
        ...selectedNode.data.model,
        outputs: [...selectedNode.data.model.outputs, newOutput]
      };
      
      // Mise à jour via le store
      // TODO: Implémenter updateNode dans le store
    }
  }, [selectedNode]);

  // Gestion de la sauvegarde comme modèle
  const handleSaveAsModel = useCallback(() => {
    if (selectedNode) {
      const name = prompt('Nom du modèle personnalisé:');
      if (name && name.trim()) {
        saveCustomModel(name.trim(), selectedNode.data.model);
        alert(`Modèle "${name}" sauvegardé !`);
      }
    }
  }, [selectedNode, saveCustomModel]);

  // Gestion de l'export
  const handleExport = useCallback(() => {
    const name = prompt('Nom du fichier d\'export:', 'graphe-satisfactory');
    if (name) {
      const jsonData = exportGraphToJSON(nodes, edges, name);
      downloadJSON(jsonData, name);
    }
  }, [nodes, edges]);

  // Gestion de l'import
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const jsonString = await readFileAsJSON(file);
      const importData = importGraphFromJSON(jsonString);
      const validation = validateImportedGraph(importData);

      if (!validation.isValid) {
        alert(`Erreurs de validation:\n${validation.errors.join('\n')}`);
        return;
      }

      if (validation.warnings.length > 0) {
        const warnings = validation.warnings.join('\n');
        if (!confirm(`Avertissements détectés:\n${warnings}\n\nContinuer l'import ?`)) {
          return;
        }
      }

      // TODO: Implémenter l'import dans le store
      alert('Import réussi !');
    } catch (error) {
      alert(`Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      // Réinitialiser l'input file
      if (event.target) {
        event.target.value = '';
      }
    }
  }, []);

  // Gestion de la sauvegarde automatique
  const handleSave = useCallback(() => {
    try {
      saveGraphToStorage(nodes, edges, 'Graphe actuel');
      alert('Graphe sauvegardé !');
    } catch (error) {
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }, [nodes, edges]);

  // Gestion du nettoyage
  const handleClear = useCallback(() => {
    if (confirm('Êtes-vous sûr de vouloir effacer tout le graphe ?')) {
      clearGraph();
    }
  }, [clearGraph]);

  // Gestion de l'ouverture du panneau de propriétés
  const handleOpenProperties = useCallback(() => {
    setPropertiesPanelOpen(true);
  }, [setPropertiesPanelOpen]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--spacing-md)',
      backgroundColor: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border-primary)',
      gap: 'var(--spacing-md)'
    }}>
      {/* Section gauche - Actions principales */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        <button 
          className="btn btn--primary" 
          onClick={handleSave}
          title="Sauvegarder le graphe"
        >
          💾 Sauvegarder
        </button>
        
        <button 
          className="btn" 
          onClick={handleExport}
          title="Exporter en JSON"
        >
          📤 Exporter
        </button>
        
        <button 
          className="btn" 
          onClick={handleImport}
          title="Importer depuis JSON"
        >
          📥 Importer
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Section centre - Actions sur le nœud sélectionné */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        <button 
          className="btn" 
          onClick={handleOpenProperties}
          disabled={!selectedNodeId}
          title="Ouvrir les propriétés"
        >
          ⚙️ Propriétés
        </button>
        
        <button 
          className="btn btn--error" 
          onClick={handleDeleteSelected}
          disabled={!selectedNodeId}
          title="Supprimer le nœud sélectionné"
        >
          🗑️ Supprimer
        </button>
        
        <button 
          className="btn" 
          onClick={handleAddInput}
          disabled={!selectedNodeId}
          title="Ajouter une entrée"
        >
          ➕ Entrée
        </button>
        
        <button 
          className="btn" 
          onClick={handleAddOutput}
          disabled={!selectedNodeId}
          title="Ajouter une sortie"
        >
          ➕ Sortie
        </button>
        
        <button 
          className="btn btn--success" 
          onClick={handleSaveAsModel}
          disabled={!selectedNodeId}
          title="Sauvegarder comme modèle"
        >
          💾 Modèle
        </button>
      </div>

      {/* Section droite - Historique et statistiques */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
        <button 
          className="btn" 
          onClick={undo}
          disabled={!canUndo()}
          title="Annuler (Ctrl+Z)"
        >
          ↩️ Annuler
        </button>
        
        <button 
          className="btn" 
          onClick={redo}
          disabled={!canRedo()}
          title="Rétablir (Ctrl+Y)"
        >
          ↪️ Rétablir
        </button>
        
        <button 
          className="btn btn--warning" 
          onClick={handleClear}
          title="Effacer tout le graphe"
        >
          🗑️ Effacer
        </button>
        
        {/* Statistiques */}
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-sm)', 
          fontSize: '12px', 
          color: 'var(--text-muted)',
          marginLeft: 'var(--spacing-md)'
        }}>
          <span title="Nombre de nœuds">📦 {stats.totalNodes}</span>
          <span title="Nombre de connexions">🔗 {stats.totalEdges}</span>
          <span title="Types de blocs uniques">🏭 {stats.uniqueBlockTypes}</span>
          <span title="Flux total">⚡ {stats.totalFlow.toFixed(0)}/min</span>
          <span title="Puissance totale">⚡ {stats.totalPower.toFixed(1)} MW</span>
        </div>
      </div>
    </div>
  );
}
