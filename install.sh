#!/bin/bash

echo "🚀 Installation de Satisfactory Nodal Planner"
echo "=============================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord."
    exit 1
fi

echo "✅ Node.js détecté: $(node --version)"

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez installer npm d'abord."
    exit 1
fi

echo "✅ npm détecté: $(npm --version)"

# Nettoyer les installations précédentes
echo "🧹 Nettoyage des installations précédentes..."
rm -rf node_modules package-lock.json

# Installer les dépendances une par une
echo "📦 Installation des dépendances..."

echo "Installing React..."
npm install react@^18.2.0 react-dom@^18.2.0

echo "Installing React Flow..."
npm install reactflow@^11.10.1

echo "Installing Zustand..."
npm install zustand@^4.4.7

echo "Installing TypeScript..."
npm install -D typescript@^5.2.2

echo "Installing Vite..."
npm install -D vite@^5.0.8 @vitejs/plugin-react@^4.2.1

echo "Installing React types..."
npm install -D @types/react@^18.2.43 @types/react-dom@^18.2.17

echo "✅ Installation terminée !"
echo ""
echo "🎯 Pour démarrer l'application :"
echo "   npm run dev"
echo ""
echo "🌐 L'application sera accessible sur http://localhost:3000"
echo ""
echo "📖 Consultez le README.md pour plus d'informations"
