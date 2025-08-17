import React from 'react';
import { BlockModel } from '../../blocks/types';

/**
 * Interface pour les props du composant BlockListItem
 */
interface BlockListItemProps {
  /** Modèle du bloc à afficher */
  model: BlockModel;
  /** Nom du modèle (pour les modèles personnalisés) */
  name?: string;
  /** Fonction appelée lors du début du drag */
  onDragStart: (event: React.DragEvent) => void;
  /** Fonction appelée lors de la suppression (optionnel) */
  onDelete?: () => void;
  /** Indique si c'est un modèle personnalisé */
  isCustom?: boolean;
  /** Classes CSS supplémentaires */
  className?: string;
  /** Style inline supplémentaire */
  style?: React.CSSProperties;
}

/**
 * Composant générique pour afficher un élément de la liste des blocs
 * 
 * Ce composant unifie l'affichage des blocs de base et des modèles personnalisés
 * dans la sidebar, en gérant automatiquement les différences d'affichage
 * et les actions disponibles selon le type de bloc.
 * 
 * @param props - Propriétés du composant
 * @returns Élément JSX représentant le bloc dans la liste
 * 
 * @example
 * ```tsx
 * // Pour un bloc de base
 * <BlockListItem
 *   model={BASE_BLOCKS['Miner']}
 *   onDragStart={(e) => handleDragStart(e, 'Miner')}
 * />
 * 
 * // Pour un modèle personnalisé
 * <BlockListItem
 *   model={customModel}
 *   name="Mon Modèle"
 *   isCustom={true}
 *   onDragStart={(e) => handleCustomDragStart(e, customModel)}
 *   onDelete={() => handleDeleteCustomModel("Mon Modèle")}
 * />
 * ```
 */
export default function BlockListItem({
  model,
  name,
  onDragStart,
  onDelete,
  isCustom = false,
  className = '',
  style = {}
}: BlockListItemProps) {
  /**
   * Gestionnaire pour la suppression d'un modèle personnalisé
   */
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  /**
   * Détermine le texte de description à afficher
   */
  const getDescription = (): string => {
    if (model.description) {
      return model.description;
    }
    return isCustom ? 'Modèle personnalisé' : 'Aucune description';
  };

  /**
   * Détermine le texte du tooltip
   */
  const getTooltip = (): string => {
    return `Glisser-déposer pour créer un ${model.name}`;
  };

  /**
   * Détermine les classes CSS à appliquer
   */
  const getClassName = (): string => {
    const baseClass = 'list-item';
    const customClass = isCustom ? 'list-item--custom' : 'list-item--base';
    return `${baseClass} ${customClass} ${className}`.trim();
  };

  return (
    <div
      className={getClassName()}
      draggable
      onDragStart={onDragStart}
      style={{ cursor: 'grab', ...style }}
      title={getTooltip()}
    >
      {/* Contenu principal du bloc */}
      <div className="list-item__content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          {/* Icône du bloc */}
          <span 
            style={{ 
              fontSize: '16px',
              color: model.color || 'inherit'
            }}
            aria-hidden="true"
          >
            {model.icon || '⚙️'}
          </span>
          
          {/* Informations du bloc */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Nom du bloc */}
            <div 
              style={{ 
                fontWeight: '500',
                fontSize: '14px',
                lineHeight: '1.2'
              }}
            >
              {model.name}
            </div>
            
            {/* Description du bloc */}
            <div 
              style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)',
                lineHeight: '1.2',
                marginTop: '2px'
              }}
            >
              {getDescription()}
            </div>
          </div>
        </div>
      </div>

      {/* Actions et métadonnées */}
      <div className="list-item__actions">
        {/* Compteur de ports pour les blocs de base */}
        {!isCustom && (
          <div 
            style={{ 
              fontSize: '11px', 
              color: 'var(--text-muted)',
              padding: '2px 6px',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            {model.inputs.length}E / {model.outputs.length}S
          </div>
        )}
        
        {/* Bouton de suppression pour les modèles personnalisés */}
        {isCustom && onDelete && (
          <button
            className="btn btn--small btn--icon btn--error"
            onClick={handleDelete}
            title={`Supprimer le modèle "${name || model.name}"`}
            aria-label={`Supprimer le modèle ${name || model.name}`}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
