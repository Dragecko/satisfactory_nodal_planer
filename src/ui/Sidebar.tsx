// @ts-nocheck
import React, { useCallback, useEffect } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { useSortedCustomModels } from '../store/selectors';
import { BASE_BLOCKS } from '../blocks';
import { BlockModel, BlockType } from '../blocks/types';
import { cloneBlockModel } from '../blocks';
import { 
  createBaseBlockDragData, 
  createCustomBlockDragData, 
  configureDragEvent 
} from '../utils';
import { BlockListItem } from './components';

/**
 * Composant de sidebar avec bibliothèque de blocs
 * 
 * Ce composant affiche la bibliothèque de blocs disponibles dans la sidebar :
 * - Section "Blocs de base" avec les blocs prédéfinis
 * - Section "Bibliothèque personnalisée" avec les modèles sauvegardés
 * - Fonctionnalité de drag & drop pour créer des nœuds sur le canvas
 * - Gestion de la suppression des modèles personnalisés
 */
export default function Sidebar() {
  const { addNode, loadCustomModels, deleteCustomModel } = useGraphStore();
  const customModels = useSortedCustomModels();

  /**
   * Charge les modèles personnalisés au montage du composant
   */
  useEffect(() => {
    loadCustomModels();
  }, [loadCustomModels]);

  /**
   * Gestionnaire pour le drag & drop des blocs de base
   * 
   * Crée les données de drag appropriées pour un bloc de base
   * et configure l'événement de transfert
   */
  const handleBaseBlockDragStart = useCallback((event: React.DragEvent, blockType: BlockType) => {
    const blockModel = BASE_BLOCKS[blockType];
    const dragData = createBaseBlockDragData(blockType, blockModel);
    configureDragEvent(event, dragData);
  }, []);

  /**
   * Gestionnaire pour le drag & drop des modèles personnalisés
   * 
   * Crée les données de drag appropriées pour un modèle personnalisé
   * et configure l'événement de transfert
   */
  const handleCustomBlockDragStart = useCallback((event: React.DragEvent, model: BlockModel) => {
    const dragData = createCustomBlockDragData(model);
    configureDragEvent(event, dragData);
  }, []);

  /**
   * Gestionnaire pour la suppression d'un modèle personnalisé
   * 
   * Affiche une confirmation et supprime le modèle si confirmé
   */
  const handleDeleteCustomModel = useCallback((name: string) => {
    if (confirm(`Supprimer le modèle "${name}" ?`)) {
      deleteCustomModel(name);
    }
  }, [deleteCustomModel]);

  /**
   * Composant pour afficher un bloc de base
   * 
   * Utilise le composant générique BlockListItem pour unifier l'affichage
   */
  const BaseBlockItem = ({ blockType }: { blockType: BlockType }) => {
    const model = BASE_BLOCKS[blockType];
    
    return (
      <BlockListItem
        model={model}
        onDragStart={(e) => handleBaseBlockDragStart(e, blockType)}
        isCustom={false}
      />
    );
  };

  /**
   * Composant pour afficher un modèle personnalisé
   * 
   * Utilise le composant générique BlockListItem pour unifier l'affichage
   */
  const CustomModelItem = ({ name, model }: { name: string; model: BlockModel }) => {
    return (
      <BlockListItem
        model={model}
        name={name}
        onDragStart={(e) => handleCustomBlockDragStart(e, model)}
        onDelete={() => handleDeleteCustomModel(name)}
        isCustom={true}
      />
    );
  };

  return (
    <div className="panel" style={{ width: '280px', height: '100%' }}>
      <div className="panel__header">
        <div className="panel__title">Bibliothèque</div>
      </div>
      
      <div className="panel__content">
        {/* Section Blocs de base */}
        <div className="field-group">
          <div className="field-group__header">
            <div className="field-group__title">Blocs de base</div>
          </div>
          
          <div className="list">
            {Object.keys(BASE_BLOCKS).map((blockType) => (
              <BaseBlockItem 
                key={blockType} 
                blockType={blockType as BlockType} 
              />
            ))}
          </div>
        </div>

        {/* Section Bibliothèque personnalisée */}
        <div className="field-group">
          <div className="field-group__header">
            <div className="field-group__title">Bibliothèque personnalisée</div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {customModels.length} modèle{customModels.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="list">
            {customModels.map(({ name, model }) => (
              <CustomModelItem 
                key={name} 
                name={name} 
                model={model} 
              />
            ))}
            {customModels.length === 0 && (
              <div style={{ 
                color: 'var(--text-muted)', 
                textAlign: 'center', 
                padding: 'var(--spacing-md)',
                fontSize: '12px'
              }}>
                Aucun modèle personnalisé
                <br />
                <span style={{ fontSize: '11px' }}>
                  Créez des modèles en sélectionnant un nœud et en cliquant sur "💾 Modèle"
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section Aide */}
        <div className="field-group">
          <div className="field-group__header">
            <div className="field-group__title">Aide</div>
          </div>
          
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>Glisser-déposer :</strong> Faites glisser un bloc vers le canvas pour le créer.
            </div>
            
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>Connexions :</strong> Reliez les ports de sortie (droite) aux ports d'entrée (gauche).
            </div>
            
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>Édition :</strong> Double-clic sur le nom/description d'un nœud pour l'éditer.
            </div>
            
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>Propriétés :</strong> Sélectionnez un nœud et cliquez sur "⚙️ Propriétés".
            </div>
            
            <div>
              <strong>Raccourcis :</strong> Del/Backspace (supprimer), Ctrl+Z/Y (annuler/rétablir)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


