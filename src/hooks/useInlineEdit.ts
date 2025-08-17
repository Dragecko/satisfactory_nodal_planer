import { useState, useCallback, useRef } from 'react';

/**
 * Interface pour les options de configuration de l'édition inline
 */
interface InlineEditOptions {
  /** Valeur initiale du champ */
  initialValue: string;
  /** Fonction appelée lors de la sauvegarde */
  onSave: (newValue: string) => void;
  /** Fonction appelée lors de l'annulation (optionnel) */
  onCancel?: () => void;
  /** Placeholder à afficher quand le champ est vide */
  placeholder?: string;
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Hook personnalisé pour gérer l'édition inline d'un champ texte
 * 
 * Ce hook encapsule toute la logique d'édition inline :
 * - Gestion de l'état d'édition (édition active/inactive)
 * - Gestion des événements clavier (Enter pour sauvegarder, Escape pour annuler)
 * - Gestion de la perte de focus (blur)
 * - Référence vers l'élément DOM pour l'édition
 * 
 * @param options - Configuration de l'édition inline
 * @returns Objet contenant l'état et les gestionnaires d'événements
 * 
 * @example
 * ```tsx
 * const { isEditing, ref, handlers } = useInlineEdit({
 *   initialValue: model.name,
 *   onSave: (newName) => updateNode(id, { model: { ...model, name: newName } })
 * });
 * 
 * return (
 *   <div
 *     ref={ref}
 *     contentEditable={isEditing}
 *     {...handlers}
 *   >
 *     {model.name}
 *   </div>
 * );
 * ```
 */
export function useInlineEdit({
  initialValue,
  onSave,
  onCancel,
  placeholder = '',
  className = ''
}: InlineEditOptions) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const elementRef = useRef<HTMLDivElement>(null);

  /**
   * Active le mode d'édition
   */
  const startEditing = useCallback(() => {
    setIsEditing(true);
    setCurrentValue(initialValue);
    // Focus sur l'élément après le prochain rendu
    setTimeout(() => {
      elementRef.current?.focus();
      // Sélectionner tout le texte
      if (elementRef.current) {
        const range = document.createRange();
        range.selectNodeContents(elementRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  }, [initialValue]);

  /**
   * Sauvegarde les modifications et désactive l'édition
   */
  const saveChanges = useCallback(() => {
    setIsEditing(false);
    const newValue = elementRef.current?.textContent || '';
    
    // Ne sauvegarder que si la valeur a changé
    if (newValue !== initialValue) {
      onSave(newValue);
    }
  }, [initialValue, onSave]);

  /**
   * Annule les modifications et restaure la valeur initiale
   */
  const cancelChanges = useCallback(() => {
    setIsEditing(false);
    setCurrentValue(initialValue);
    if (elementRef.current) {
      elementRef.current.textContent = initialValue;
    }
    onCancel?.();
  }, [initialValue, onCancel]);

  /**
   * Gestionnaire pour le double-clic (démarre l'édition)
   */
  const handleDoubleClick = useCallback(() => {
    if (!isEditing) {
      startEditing();
    }
  }, [isEditing, startEditing]);

  /**
   * Gestionnaire pour la perte de focus (sauvegarde automatique)
   */
  const handleBlur = useCallback(() => {
    if (isEditing) {
      saveChanges();
    }
  }, [isEditing, saveChanges]);

  /**
   * Gestionnaire pour les événements clavier
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isEditing) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        saveChanges();
        break;
      case 'Escape':
        e.preventDefault();
        cancelChanges();
        break;
      case 'Tab':
        // Permettre la navigation par tabulation
        break;
      default:
        // Permettre tous les autres caractères
        break;
    }
  }, [isEditing, saveChanges, cancelChanges]);

  /**
   * Gestionnaire pour les événements de clic (empêcher l'édition lors d'un clic simple)
   */
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditing) {
      e.preventDefault();
    }
  }, [isEditing]);

  return {
    isEditing,
    ref: elementRef,
    currentValue,
    handlers: {
      onDoubleClick: handleDoubleClick,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onClick: handleClick,
      contentEditable: isEditing,
      suppressContentEditableWarning: true,
      className: `inline-edit ${className}`.trim(),
      'data-placeholder': placeholder
    }
  };
}
