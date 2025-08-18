# Satisfactory Nodal Planner - Application Electron

## 🚀 **Migration vers Electron**

L'application a été migrée vers Electron pour permettre la sauvegarde automatique des modèles personnalisés directement dans les fichiers du système.

## 📋 **Fonctionnalités Electron**

### ✅ **Avantages :**
- **Sauvegarde automatique** : Les modèles sont sauvegardés directement dans `src/blocks/Library/`
- **Interface native** : Application desktop avec menu et raccourcis clavier
- **Persistance complète** : Plus de problème de perte de données
- **Notifications** : Alertes de sauvegarde réussie
- **Menu contextuel** : Actions rapides via le menu

### 🔧 **Fonctionnalités techniques :**
- **Écriture de fichiers** : Sauvegarde automatique des modèles `.ts`
- **Mise à jour d'index** : Modification automatique de `src/blocks/Library/index.ts`
- **Gestion d'erreurs** : Logs et notifications d'erreur
- **Hot reload** : Rechargement automatique des modèles

## 🛠️ **Installation et démarrage**

### **Prérequis :**
- Node.js (version 16 ou supérieure)
- npm ou yarn

### **Installation :**
```bash
# Installer les dépendances
npm install

# Installer Electron (si pas déjà fait)
npm install --save-dev electron electron-builder
```

### **Démarrage :**

#### **Option 1 : Script PowerShell universel (recommandé)**
```powershell
# Démarrage automatique - Gère WSL et Windows automatiquement
.\start.ps1

# Mode manuel (serveur + Electron séparés)
.\start.ps1 -Manual

# Force l'installation des dépendances
.\start.ps1 -Force

# Afficher l'aide
.\start.ps1 -Help
```

#### **Option 2 : Commandes npm directes**
```bash
# Mode développement (avec hot reload)
npm run electron:dev

# Mode production
npm run build
npm run electron
```

#### **Option 3 : Commandes manuelles**
```bash
# Terminal 1 : Démarrer le serveur de développement
npm run dev

# Terminal 2 : Démarrer Electron (après 3 secondes)
npm run electron
```

## 📁 **Structure des fichiers**

```
satisfactory_nodal_planer/
├── electron/                    # Code Electron
│   ├── main.js                 # Processus principal
│   ├── preload.js              # Script de préchargement
│   └── assets/                 # Ressources (icônes, etc.)
├── src/                        # Code React existant
│   ├── blocks/Library/         # Modèles personnalisés
│   ├── lib/electronModels.ts   # API Electron
│   └── store/useGraphStore.ts  # Store mis à jour
├── package.json                # Configuration Electron
├── start.ps1                   # Script de démarrage universel
└── ELECTRON.md                 # Cette documentation
```

## 🔄 **Workflow de sauvegarde**

### **Création d'un modèle :**
1. **Interface** : Créer un modèle via l'interface React
2. **Validation** : Le modèle est validé automatiquement
3. **Sauvegarde** : Écriture automatique dans `src/blocks/Library/`
4. **Index** : Mise à jour automatique de `index.ts`
5. **Notification** : Confirmation de sauvegarde réussie

### **Suppression d'un modèle :**
1. **Interface** : Supprimer via l'interface ou le menu
2. **Fichier** : Suppression automatique du fichier `.ts`
3. **Index** : Mise à jour automatique de `index.ts`
4. **Notification** : Confirmation de suppression

## 🎯 **Différences avec la version web**

| Fonctionnalité | Version Web | Version Electron |
|----------------|-------------|------------------|
| **Sauvegarde** | localStorage temporaire | Fichiers `.ts` permanents |
| **Persistance** | Perdue au rechargement | Persistante entre sessions |
| **Interface** | Navigateur web | Application desktop |
| **Menu** | Aucun | Menu natif complet |
| **Raccourcis** | Limités | Raccourcis clavier natifs |
| **Notifications** | Navigateur | Notifications système |

## 🚨 **Résolution de problèmes**

### **Erreur "API Electron non disponible"**
- Vérifiez que l'application fonctionne dans Electron et non dans le navigateur
- Redémarrez l'application avec `npm run electron:dev`

### **Erreur de permissions de fichiers**
- Vérifiez les permissions du dossier `src/blocks/Library/`
- Assurez-vous que l'application a les droits d'écriture

### **Erreur de compilation TypeScript**
- Vérifiez que tous les types sont correctement déclarés
- Exécutez `npm run build` pour vérifier les erreurs

### **Problèmes WSL**
- **Script universel** : Utilisez `start.ps1` qui gère automatiquement WSL et Windows
- **Mode manuel** : Utilisez `start.ps1 -Manual` pour un contrôle total
- **Force** : Utilisez `start.ps1 -Force` pour forcer l'installation des dépendances
- Assurez-vous que Node.js est installé dans Windows (pas dans WSL)
- Les chemins UNC (`\\wsl.localhost\`) sont automatiquement gérés par le script

## 🔧 **Développement**

### **Ajouter une nouvelle fonctionnalité Electron :**

1. **Processus principal** (`electron/main.js`) :
```javascript
ipcMain.handle('nouvelle-fonction', async (event, data) => {
  // Logique de la fonction
  return { success: true, data: result };
});
```

2. **Script de préchargement** (`electron/preload.js`) :
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  nouvelleFonction: (data) => ipcRenderer.invoke('nouvelle-fonction', data)
});
```

3. **Module React** (`src/lib/electronModels.ts`) :
```typescript
export async function nouvelleFonction(data: any) {
  if (!window.electronAPI) return null;
  return await window.electronAPI.nouvelleFonction(data);
}
```

### **Build de production :**
```bash
# Créer l'exécutable
npm run dist

# L'exécutable sera dans dist-electron/
```

## 📝 **Notes importantes**

- **Sécurité** : L'application utilise `contextIsolation` pour la sécurité
- **Compatibilité** : Fonctionne sur Windows, macOS et Linux
- **Performance** : Plus rapide qu'une application web
- **Distribution** : Peut être packagée en exécutable autonome

## 🎉 **Résultat**

Avec Electron, les modèles personnalisés sont maintenant :
- ✅ **Sauvegardés automatiquement** dans les fichiers
- ✅ **Persistants** entre les sessions
- ✅ **Accessibles** via une interface native
- ✅ **Partageables** facilement via les fichiers `.ts`

Le problème de persistance est complètement résolu !
