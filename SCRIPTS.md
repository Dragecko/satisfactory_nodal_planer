# 🚀 Scripts de Démarrage - Satisfactory Nodal Planner

Scripts simplifiés et robustes pour démarrer l'application automatiquement.

## 📋 Scripts Disponibles

### 🚀 Démarrage Automatique

#### `start-auto.sh` (Linux/WSL) - **RECOMMANDÉ**
- **Fonctionnalités :**
  - ✅ **Auto-réparation complète** - Crée les fichiers manquants automatiquement
  - ✅ **Installation automatique** de Node.js si nécessaire
  - ✅ **Résolution des chemins UNC** - Migration vers un répertoire local
  - ✅ **Gestion d'erreurs robuste** - Nettoyage automatique en cas d'échec
  - ✅ **Build automatique** avant démarrage
- **Utilisation :** `./start-auto.sh`

#### `start.bat` (Windows)
- **Fonctionnalités :**
  - ✅ Build automatique avant démarrage
  - ✅ Installation automatique des dépendances
  - ✅ Support Unicode (émojis)
  - ✅ Gestion d'erreurs
- **Utilisation :** Double-clic ou `start.bat`

## 🎯 Utilisation Simple

### Linux/WSL (Recommandé)
```bash
./start-auto.sh
```

### Windows
```cmd
start.bat
```

## 🔧 Fonctionnalités Automatiques

### ✅ Auto-réparation
- Création automatique de `package.json` si manquant
- Création automatique de `index.html` si manquant
- Création automatique de `vite.config.ts` si manquant
- Création automatique de `tsconfig.json` si manquant
- Création automatique de `src/main.tsx` si manquant

### ✅ Installation automatique
- Installation de Node.js via `apt` ou `snap` si nécessaire
- Installation des dépendances via `npm install`
- Vérification de tous les prérequis

### ✅ Résolution des problèmes
- Migration automatique des chemins UNC vers des chemins locaux
- Nettoyage automatique en cas d'erreur
- Gestion robuste des erreurs avec messages informatifs

### ✅ Build et démarrage
- Build automatique avant démarrage
- Démarrage du serveur de développement Vite
- Ouverture automatique du navigateur

## 🐛 Résolution de Problèmes

### Erreur "npm non trouvé"
Le script `start-auto.sh` installe automatiquement Node.js via :
- `apt` (Ubuntu/Debian)
- `snap` (fallback)

### Erreur UNC (Windows/WSL)
Le script `start-auto.sh` :
- Détecte automatiquement les chemins UNC
- Copie les fichiers vers `/tmp/satisfactory-nodal-planer`
- Évite complètement les problèmes de chemins

### Fichiers manquants
Le script `start-auto.sh` crée automatiquement :
- `package.json` avec toutes les dépendances
- `index.html` avec la structure HTML
- `vite.config.ts` avec la configuration Vite
- `tsconfig.json` avec la configuration TypeScript
- `src/main.tsx` avec le point d'entrée React

## 📝 Notes Techniques

- **Auto-réparation :** Le script peut réparer un projet complètement cassé
- **Chemins UNC :** Gestion automatique des problèmes Windows/WSL
- **Nettoyage :** Suppression automatique des fichiers temporaires
- **Robustesse :** Gestion d'erreurs avec messages informatifs
- **Simplicité :** Un seul script pour tout faire

## 🚀 Workflow Recommandé

1. **Cloner le projet**
2. **Exécuter `./start-auto.sh`** (Linux/WSL) ou `start.bat` (Windows)
3. **L'application démarre automatiquement** sur http://localhost:3000

C'est tout ! Plus besoin de se soucier des dépendances, des fichiers manquants ou des problèmes de chemins.
