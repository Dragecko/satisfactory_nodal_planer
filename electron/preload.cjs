const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loading...');

/**
 * Expose les API Electron au processus de rendu
 * de manière sécurisée avec contextIsolation
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // API pour les modèles personnalisés
  saveCustomModel: (name, model) => ipcRenderer.invoke('save-custom-model', name, model),
  deleteCustomModel: (name) => ipcRenderer.invoke('delete-custom-model', name),
  loadCustomModels: () => ipcRenderer.invoke('load-custom-models'),
  
  // API pour les actions du menu
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  },
  
  // API pour les notifications
  showNotification: (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
});

/**
 * Gestionnaire d'erreurs global
 */
window.addEventListener('error', (event) => {
  console.error('Erreur JavaScript:', event.error);
});

/**
 * Gestionnaire pour les promesses rejetées non gérées
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesse rejetée non gérée:', event.reason);
});

/**
 * Initialisation de l'application
 */
window.addEventListener('DOMContentLoaded', () => {
  console.log('Application Electron prête');
});

/**
 * Gestionnaire pour les actions du menu
 */
ipcRenderer.on('menu-action', (event, action) => {
  console.log('Action du menu:', action);
  
  // Dispatcher l'action vers l'application React
  window.dispatchEvent(new CustomEvent('menu-action', { detail: action }));
});

console.log('Preload script loaded successfully');
