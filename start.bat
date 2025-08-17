@echo off
chcp 65001 >nul
echo 🚀 Démarrage automatique de Satisfactory Nodal Planner
echo ======================================================

REM Se placer dans le répertoire du script
cd /d "%~dp0"
echo 📁 Répertoire: %CD%

REM Vérifier si npm est disponible
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm non trouvé
    echo 💡 Installez Node.js depuis https://nodejs.org/
    echo 📦 Ou exécutez: winget install OpenJS.NodeJS
    pause
    exit /b 1
)

echo ✅ npm détecté
npm --version

REM Vérifier si package.json existe
if not exist "package.json" (
    echo ❌ package.json non trouvé
    echo 💡 Assurez-vous d'être dans le bon répertoire
    pause
    exit /b 1
)

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de l'installation des dépendances
        pause
        exit /b 1
    )
)

REM Faire le build
echo 🔨 Construction de l'application...
npm run build
if %errorlevel% neq 0 (
    echo ⚠️  Build échoué, tentative de démarrage en mode développement...
)

echo ✅ Prêt !
echo 🌐 Lancement du serveur de développement sur http://localhost:3000
echo 📖 Le navigateur s'ouvrira automatiquement
echo.
echo 🛑 Pour arrêter le serveur, appuyez sur Ctrl+C
echo.

npm run dev
