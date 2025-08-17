import { HistoryState } from '../blocks/types';

/**
 * Ajoute un état à l'historique
 */
export function addToHistory(
  currentState: { nodes: any[]; edges: any[] },
  history: HistoryState[],
  historyIndex: number,
  maxHistory: number
): { history: HistoryState[]; historyIndex: number } {
  const newHistoryState: HistoryState = {
    nodes: [...currentState.nodes],
    edges: [...currentState.edges],
    timestamp: Date.now()
  };

  // Supprimer les états après l'index actuel (si on fait undo puis une nouvelle action)
  const trimmedHistory = history.slice(0, historyIndex + 1);
  
  // Ajouter le nouvel état
  const newHistory = [...trimmedHistory, newHistoryState];
  
  // Limiter la taille de l'historique
  if (newHistory.length > maxHistory) {
    newHistory.shift();
  }
  
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
}

/**
 * Vérifie si on peut faire undo
 */
export function canUndo(history: HistoryState[], historyIndex: number): boolean {
  return historyIndex > 0;
}

/**
 * Vérifie si on peut faire redo
 */
export function canRedo(history: HistoryState[], historyIndex: number): boolean {
  return historyIndex < history.length - 1;
}

/**
 * Obtient l'état précédent pour undo
 */
export function undo(history: HistoryState[], historyIndex: number): HistoryState | null {
  if (!canUndo(history, historyIndex)) {
    return null;
  }
  
  return history[historyIndex - 1];
}

/**
 * Obtient l'état suivant pour redo
 */
export function redo(history: HistoryState[], historyIndex: number): HistoryState | null {
  if (!canRedo(history, historyIndex)) {
    return null;
  }
  
  return history[historyIndex + 1];
}

/**
 * Obtient le nombre d'actions dans l'historique
 */
export function getHistorySize(history: HistoryState[]): number {
  return history.length;
}

/**
 * Vide l'historique
 */
export function clearHistory(): { history: HistoryState[]; historyIndex: number } {
  return {
    history: [],
    historyIndex: -1
  };
}
