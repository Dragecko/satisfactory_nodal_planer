# 🚀 Guide de Démarrage Rapide

## Démarrage en 1 commande

### Windows (PowerShell) - **RECOMMANDÉ**
```powershell
.\start.ps1
```

### Windows (Batch)
```cmd
start.bat
```

### Linux/WSL
```bash
./start-auto.sh
```

### Universel (détection automatique)
```bash
./start
```

## ✅ Ce que fait le script automatiquement

1. **Détecte l'environnement** (Windows/Linux/WSL/macOS)
2. **Résout les problèmes de chemins UNC** - Migration vers un répertoire local
3. **Vérifie et installe Node.js** si nécessaire
4. **Crée les fichiers manquants** (package.json, index.html, etc.)
5. **Installe les dépendances** (npm install)
6. **Construit l'application** (npm run build)
7. **Démarre le serveur** sur http://localhost:3000

## 🎯 Résultat

L'application s'ouvre automatiquement dans votre navigateur avec :
- ✅ Ports "Alimentation" supprimés
- ✅ Interface sombre moderne
- ✅ Drag & drop fonctionnel
- ✅ Édition inline des blocs
- ✅ Calcul des flux automatique

## 🛑 Pour arrêter

Appuyez sur `Ctrl+C` dans le terminal.

## 🔧 En cas de problème

### Problème de chemins UNC (Windows/WSL)
Le script `start.ps1` :
- Détecte automatiquement les chemins UNC
- Copie les fichiers vers `C:\temp\satisfactory-nodal-planer`
- Évite complètement les problèmes de chemins

### Problème de permissions PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problème de Node.js manquant
Le script installe automatiquement Node.js ou vous guide vers l'installation.

## 🚀 Workflow Recommandé

1. **Ouvrir PowerShell** dans le répertoire du projet
2. **Exécuter `.\start.ps1`**
3. **L'application démarre automatiquement** sur http://localhost:3000

**C'est tout !** Plus besoin de se soucier des dépendances, des fichiers manquants ou des problèmes de chemins.
