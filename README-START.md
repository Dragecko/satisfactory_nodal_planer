# 🚀 Script de démarrage Satisfactory Nodal Planner

## 📋 **Utilisation simple**

### **Démarrage automatique (recommandé)**
```powershell
.\start.ps1
```

### **Mode manuel**
```powershell
.\start.ps1 -Manual
```

### **Forcer l'installation des dépendances**
```powershell
.\start.ps1 -Force
```

### **Afficher l'aide**
```powershell
.\start.ps1 -Help
```

## 🎯 **Ce que fait le script**

### ✅ **Détection automatique**
- **WSL** : Détecte et gère automatiquement les chemins UNC
- **Windows natif** : Fonctionne normalement
- **Node.js** : Vérifie la présence et la version
- **npm** : Vérifie la disponibilité

### ✅ **Installation automatique**
- **Dépendances** : Installe `node_modules` si nécessaire
- **Electron** : Installe Electron et ses dépendances
- **Outils de développement** : Installe `concurrently` et `wait-on`

### ✅ **Gestion WSL**
- **Migration automatique** : Copie les fichiers vers un répertoire local
- **Évitement des erreurs UNC** : Utilise des chemins Windows normaux
- **Nettoyage automatique** : Supprime les fichiers temporaires

### ✅ **Modes de démarrage**
- **Automatique** : Lance Electron avec hot reload
- **Manuel** : Lance seulement le serveur de développement
- **Fallback** : En cas d'erreur, essaie le mode simple

## 🔧 **Options disponibles**

| Option | Description |
|--------|-------------|
| `-Manual` | Mode manuel (serveur + Electron séparés) |
| `-Force` | Force l'installation des dépendances |
| `-Help` | Affiche l'aide |

## 🚨 **Résolution de problèmes**

### **Erreur "Node.js non trouvé"**
- Installez Node.js depuis https://nodejs.org/
- Assurez-vous qu'il est installé dans Windows (pas dans WSL)

### **Erreur de dépendances**
- Utilisez `.\start.ps1 -Force` pour forcer la réinstallation

### **Problèmes WSL**
- Le script gère automatiquement les chemins UNC
- Si problème persiste, utilisez `.\start.ps1 -Manual`

### **Erreur Electron**
- Le script essaie automatiquement le mode simple
- Si échec, utilisez le mode manuel

## 🎉 **Résultat**

Un seul script qui :
- ✅ **Fonctionne partout** (WSL, Windows natif)
- ✅ **Gère les erreurs** automatiquement
- ✅ **Installe tout** ce qui est nécessaire
- ✅ **Offre plusieurs modes** selon les besoins
- ✅ **Nettoie après lui** (fichiers temporaires)

**Plus besoin de plusieurs scripts !** 🎯
