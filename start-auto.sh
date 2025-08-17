#!/bin/bash

echo "🚀 Démarrage automatique de Satisfactory Nodal Planner"
echo "======================================================"

# Se placer dans le répertoire du script
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo "📁 Répertoire: $(pwd)"

# Fonction pour nettoyer en cas d'erreur
cleanup() {
    echo "🧹 Nettoyage en cours..."
    if [ -d "/tmp/satisfactory-nodal-planer" ]; then
        rm -rf "/tmp/satisfactory-nodal-planer"
    fi
}

# Fonction pour gérer les erreurs
handle_error() {
    echo "❌ Erreur: $1"
    cleanup
    exit 1
}

# Trapper les erreurs
trap 'handle_error "Erreur inattendue"' ERR

# Fonction pour détecter si on est dans un environnement WSL/UNC problématique
should_migrate_to_local() {
    # Détecter WSL
    if [[ -f /proc/version ]] && grep -qi microsoft /proc/version; then
        echo "🐧 WSL détecté"
        return 0
    fi
    
    # Détecter les chemins UNC
    if [[ "$PWD" == *"wsl.localhost"* ]] || [[ "$PWD" == *"\\"* ]] || [[ "$PWD" == *"\\\\"* ]]; then
        echo "🔗 Chemin UNC détecté"
        return 0
    fi
    
    # Détecter si on est dans un répertoire Windows accessible via WSL
    if [[ "$PWD" == /mnt/* ]]; then
        echo "💾 Répertoire Windows détecté"
        return 0
    fi
    
    # Détecter si on a des erreurs de chemins dans les logs précédents
    if [[ -f ".vite-error.log" ]] && grep -q "UNC" .vite-error.log; then
        echo "📝 Erreur UNC précédente détectée"
        return 0
    fi
    
    return 1
}

# 1. Vérifier et résoudre les problèmes de chemins UNC/WSL
if should_migrate_to_local; then
    echo "⚠️  Migration vers un répertoire local pour éviter les problèmes WSL/UNC..."
    
    LOCAL_PATH="/tmp/satisfactory-nodal-planer"
    echo "📁 Copie vers: $LOCAL_PATH"
    
    # Nettoyer l'ancien répertoire temporaire
    rm -rf "$LOCAL_PATH"
    
    # Créer le nouveau répertoire
    mkdir -p "$LOCAL_PATH"
    
    # Copier tous les fichiers nécessaires
    echo "📋 Copie des fichiers..."
    cp -r src package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json index.html "$LOCAL_PATH/" 2>/dev/null || {
        echo "⚠️  Certains fichiers manquent, copie minimale..."
        cp -r src package.json "$LOCAL_PATH/" 2>/dev/null || handle_error "Impossible de copier les fichiers"
    }
    
    # Aller dans le répertoire local
    cd "$LOCAL_PATH" || handle_error "Impossible d'accéder au répertoire temporaire"
    echo "📁 Nouveau répertoire: $(pwd)"
    
    # Créer un fichier de marqueur pour indiquer qu'on est dans un répertoire temporaire
    echo "Temporary directory created by start-auto.sh" > .temp-marker
fi

# 2. Vérifier et installer Node.js/npm si nécessaire
if ! command -v npm &> /dev/null; then
    echo "❌ npm non trouvé - Tentative d'installation..."
    
    # Essayer d'installer Node.js
    if command -v apt &> /dev/null; then
        echo "📦 Installation de Node.js via apt..."
        sudo apt update && sudo apt install -y nodejs npm || {
            echo "⚠️  Installation apt échouée, tentative avec snap..."
            sudo snap install node --classic || handle_error "Impossible d'installer Node.js"
        }
    elif command -v snap &> /dev/null; then
        echo "📦 Installation de Node.js via snap..."
        sudo snap install node --classic || handle_error "Impossible d'installer Node.js"
    else
        handle_error "Aucun gestionnaire de paquets trouvé pour installer Node.js"
    fi
    
    # Vérifier que l'installation a réussi
    if ! command -v npm &> /dev/null; then
        handle_error "Node.js installé mais npm toujours indisponible"
    fi
    
    echo "✅ Node.js installé: $(npm --version)"
fi

# 3. Vérifier package.json
if [ ! -f "package.json" ]; then
    echo "❌ package.json manquant - Création d'un package.json de base..."
    cat > package.json << 'EOF'
{
  "name": "satisfactory-nodal-planner",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.1",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "vitest": "^1.0.4",
    "jsdom": "^23.0.1"
  }
}
EOF
    echo "✅ package.json créé"
fi

# 4. Installer les dépendances
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install || handle_error "Échec de l'installation des dépendances"
    echo "✅ Dépendances installées"
fi

# 5. Vérifier et créer index.html si nécessaire
if [ ! -f "index.html" ]; then
    echo "❌ index.html manquant - Création..."
    cat > index.html << 'EOF'
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Satisfactory Nodal Planner</title>
    <meta name="description" content="Planificateur nodal pour Satisfactory" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>⚙️</text></svg>">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
    echo "✅ index.html créé"
fi

# 6. Vérifier et créer vite.config.ts si nécessaire
if [ ! -f "vite.config.ts" ]; then
    echo "❌ vite.config.ts manquant - Création..."
    cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: process.cwd(),
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  }
})
EOF
    echo "✅ vite.config.ts créé"
fi

# 7. Vérifier et créer tsconfig.json si nécessaire
if [ ! -f "tsconfig.json" ]; then
    echo "❌ tsconfig.json manquant - Création..."
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
    echo "✅ tsconfig.json créé"
fi

# 8. Vérifier et créer tsconfig.node.json si nécessaire
if [ ! -f "tsconfig.node.json" ]; then
    echo "❌ tsconfig.node.json manquant - Création..."
    cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
    echo "✅ tsconfig.node.json créé"
fi

# 9. Vérifier que src/main.tsx existe
if [ ! -f "src/main.tsx" ]; then
    echo "❌ src/main.tsx manquant - Création de la structure minimale..."
    mkdir -p src
    cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './ui/App.tsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF
    echo "✅ src/main.tsx créé"
fi

# 10. Faire le build
echo "🔨 Construction de l'application..."
if npm run build 2>.vite-error.log; then
    echo "✅ Build réussi !"
    rm -f .vite-error.log
else
    echo "⚠️  Build échoué, tentative de démarrage en mode développement..."
    # Garder le log d'erreur pour la prochaine détection
fi

# 11. Démarrer le serveur
echo "🌐 Lancement du serveur de développement..."
echo "📖 L'application sera disponible sur http://localhost:3000"
echo "🛑 Pour arrêter, appuyez sur Ctrl+C"
echo ""

# Démarrer le serveur de développement
npm run dev
