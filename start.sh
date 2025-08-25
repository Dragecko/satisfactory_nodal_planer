#!/bin/bash

echo "🚀 Démarrage automatique de Satisfactory Nodal Planner"

# Se placer dans le répertoire du script
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo "📁 Répertoire: $(pwd)"

# Variables globales
ORIGINAL_DIR="$PWD"
TEMP_DIR=""
IS_WSL=false
MANUAL_MODE=false

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher une barre de progression
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    # Créer la barre
    local bar=""
    for ((i=0; i<filled; i++)); do
        bar+="█"
    done
    for ((i=0; i<empty; i++)); do
        bar+="░"
    done
    
    # Afficher la barre avec pourcentage
    printf "\r${CYAN}[${bar}]${NC} ${YELLOW}%3d%%${NC}" "$percentage"
    
    # Si terminé, aller à la ligne suivante
    if [ "$current" -eq "$total" ]; then
        echo ""
    fi
}

# Fonction pour afficher une barre de progression avec texte
show_progress_with_text() {
    local current=$1
    local total=$2
    local text="$3"
    local width=40
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    # Créer la barre
    local bar=""
    for ((i=0; i<filled; i++)); do
        bar+="█"
    done
    for ((i=0; i<empty; i++)); do
        bar+="░"
    done
    
    # Afficher la barre avec texte et pourcentage
    printf "\r${CYAN}[${bar}]${NC} ${GREEN}%-30s${NC} ${YELLOW}%3d%%${NC}" "$text" "$percentage"
    
    # Si terminé, aller à la ligne suivante
    if [ "$current" -eq "$total" ]; then
        echo ""
    fi
}

# Fonction pour afficher une barre de progression animée
show_spinner() {
    local text="$1"
    local pid=$2
    local delay=0.1
    local spinstr='|/-\'
    
    while kill -0 $pid 2>/dev/null; do
        local temp=${spinstr#?}
        printf "\r${CYAN}[%c]${NC} ${GREEN}%s${NC}" "$spinstr" "$text"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
    done
    printf "\r${GREEN}✅ %s terminé${NC}\n" "$text"
}

# Fonction pour nettoyer en cas d'erreur
cleanup() {
    echo -e "${BLUE}🧹 Nettoyage en cours...${NC}"
    
    if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        echo -e "${CYAN}📁 Suppression du répertoire temporaire...${NC}"
        
        # Simuler une barre de progression pour la suppression
        for i in {1..5}; do
            show_progress $i 5 "Suppression: $TEMP_DIR"
            sleep 0.1
        done
        echo ""
        
        # Supprimer le répertoire
        if rm -rf "$TEMP_DIR" 2>/dev/null; then
            echo -e "${GREEN}✅ Répertoire temporaire supprimé: $TEMP_DIR${NC}"
        else
            echo -e "${RED}❌ Erreur lors de la suppression: $TEMP_DIR${NC}"
        fi
    else
        echo -e "${GREEN}✅ Aucun répertoire temporaire à nettoyer${NC}"
    fi
    
    # Nettoyer les fichiers temporaires
    echo -e "${CYAN}🗑️  Nettoyage des fichiers temporaires...${NC}"
    local temp_files=(".vite-error.log" ".temp-marker" "node_modules/.cache")
    local cleaned=0
    
    for file in "${temp_files[@]}"; do
        if [ -e "$file" ]; then
            if rm -rf "$file" 2>/dev/null; then
                cleaned=$((cleaned + 1))
                echo -e "${GREEN}✅ Supprimé: $file${NC}"
            else
                echo -e "${YELLOW}⚠️  Impossible de supprimer: $file${NC}"
            fi
        fi
    done
    
    if [ $cleaned -gt 0 ]; then
        echo -e "${GREEN}✅ Nettoyage terminé - $cleaned fichiers supprimés${NC}"
    else
        echo -e "${GREEN}✅ Aucun fichier temporaire à nettoyer${NC}"
    fi
}

# Fonction pour gérer les erreurs
handle_error() {
    echo "❌ Erreur: $1"
    cleanup
    exit 1
}

# Trapper les erreurs et la sortie
trap 'handle_error "Erreur inattendue"' ERR
trap 'cleanup' EXIT

# Fonction pour détecter WSL
detect_wsl() {
    echo -e "${BLUE}🔍 Détection de l'environnement...${NC}"
    
    if [[ -f /proc/version ]] && grep -qi microsoft /proc/version; then
        IS_WSL=true
        echo -e "${GREEN}✅ WSL détecté${NC}"
        return 0
    fi
    
    # Détecter les chemins UNC
    if [[ "$PWD" == *"wsl.localhost"* ]] || [[ "$PWD" == *"\\"* ]] || [[ "$PWD" == *"\\\\"* ]]; then
        IS_WSL=true
        echo -e "${GREEN}✅ Chemin UNC détecté${NC}"
        return 0
    fi
    
    # Détecter si on est dans un répertoire Windows accessible via WSL
    if [[ "$PWD" == /mnt/* ]]; then
        IS_WSL=true
        echo -e "${GREEN}✅ Répertoire Windows détecté${NC}"
        return 0
    fi
    
    echo -e "${GREEN}✅ Environnement Linux natif détecté${NC}"
    return 1
}

# Fonction pour migrer vers Windows si on est dans WSL
migrate_to_windows() {
    if [ "$IS_WSL" = true ]; then
        echo -e "${YELLOW}⚠️  Migration vers un répertoire Windows pour éviter les problèmes WSL/UNC...${NC}"
        
        # Créer un répertoire temporaire dans Windows
        TEMP_DIR="/mnt/c/temp/satisfactory-nodal-planer"
        echo -e "${CYAN}📁 Copie vers: $TEMP_DIR${NC}"
        
        # Nettoyer l'ancien répertoire temporaire
        rm -rf "$TEMP_DIR"
        
        # Créer le nouveau répertoire
        mkdir -p "$TEMP_DIR"
        
        # Copier tous les fichiers nécessaires avec barre de progression
        echo -e "${BLUE}📋 Copie des fichiers...${NC}"
        local files_to_copy=(
            "src" 
            "package.json" 
            "package-lock.json" 
            "vite.config.ts" 
            "tsconfig.json" 
            "tsconfig.node.json" 
            "index.html" 
            "electron"
            "vitest.config.ts"
            ".gitignore"
            "README.md"
            "LICENSE"
        )
        local total_files=${#files_to_copy[@]}
        local copied=0
        local existing_files=0
        
        # Compter les fichiers existants
        for file in "${files_to_copy[@]}"; do
            if [ -e "$file" ]; then
                existing_files=$((existing_files + 1))
            fi
        done
        
        # Copier les fichiers existants
        for file in "${files_to_copy[@]}"; do
            if [ -e "$file" ]; then
                if cp -r "$file" "$TEMP_DIR/" 2>/dev/null; then
                    copied=$((copied + 1))
                    show_progress_with_text $copied $existing_files "Copie: $file"
                else
                    echo -e "\n${RED}❌ Erreur lors de la copie de: $file${NC}"
                fi
            fi
        done
        
        echo -e "\n${GREEN}✅ $copied/$existing_files fichiers copiés avec succès${NC}"
        
        # Vérifier l'intégrité des fichiers essentiels
        echo -e "${BLUE}🔍 Vérification de l'intégrité des fichiers...${NC}"
        local essential_files=("package.json" "src" "electron")
        local missing_files=()
        
        for file in "${essential_files[@]}"; do
            if [ ! -e "$TEMP_DIR/$file" ]; then
                missing_files+=("$file")
            fi
        done
        
        if [ ${#missing_files[@]} -gt 0 ]; then
            echo -e "${RED}❌ Fichiers essentiels manquants: ${missing_files[*]}${NC}"
            echo -e "${YELLOW}⚠️  Tentative de copie depuis le répertoire original...${NC}"
            
            for file in "${missing_files[@]}"; do
                if [ -e "$ORIGINAL_DIR/$file" ]; then
                    cp -r "$ORIGINAL_DIR/$file" "$TEMP_DIR/" 2>/dev/null && {
                        echo -e "${GREEN}✅ $file copié depuis l'original${NC}"
                    } || {
                        echo -e "${RED}❌ Impossible de copier $file${NC}"
                    }
                fi
            done
        else
            echo -e "${GREEN}✅ Tous les fichiers essentiels sont présents${NC}"
        fi
        
        echo ""
        
        # Aller dans le répertoire local
        cd "$TEMP_DIR" || handle_error "Impossible d'accéder au répertoire temporaire"
        echo -e "${GREEN}📁 Nouveau répertoire: $(pwd)${NC}"
        
        # Créer un fichier de marqueur pour indiquer qu'on est dans un répertoire temporaire
        echo "Temporary directory created by start-auto.sh" > .temp-marker
    fi
}

# Fonction pour installer Node.js/npm
install_nodejs() {
    echo -e "${BLUE}📦 Vérification de Node.js...${NC}"
    
    if ! command -v npm &> /dev/null; then
        echo -e "${YELLOW}❌ npm non trouvé - Tentative d'installation...${NC}"
        
        # Essayer d'installer Node.js
        if command -v apt &> /dev/null; then
            echo -e "${CYAN}📦 Installation de Node.js via apt...${NC}"
            
            # Mise à jour des paquets
            echo -e "${BLUE}🔄 Mise à jour des paquets...${NC}"
            sudo apt update > /dev/null 2>&1 &
            show_spinner "Mise à jour des paquets" $!
            
            # Installation de Node.js
            echo -e "${BLUE}📦 Installation de Node.js...${NC}"
            sudo apt install -y nodejs npm > /dev/null 2>&1 &
            show_spinner "Installation de Node.js" $!
            
            if ! command -v npm &> /dev/null; then
                echo -e "${YELLOW}⚠️  Installation apt échouée, tentative avec snap...${NC}"
                sudo snap install node --classic > /dev/null 2>&1 &
                show_spinner "Installation via snap" $!
            fi
        elif command -v snap &> /dev/null; then
            echo -e "${CYAN}📦 Installation de Node.js via snap...${NC}"
            sudo snap install node --classic > /dev/null 2>&1 &
            show_spinner "Installation via snap" $!
        else
            handle_error "Aucun gestionnaire de paquets trouvé pour installer Node.js"
        fi
        
        # Vérifier que l'installation a réussi
        if ! command -v npm &> /dev/null; then
            handle_error "Node.js installé mais npm toujours indisponible"
        fi
        
        echo -e "${GREEN}✅ Node.js installé: $(npm --version)${NC}"
    else
        echo -e "${GREEN}✅ Node.js déjà installé: $(npm --version)${NC}"
    fi
}

# Fonction pour créer package.json avec Electron
create_package_json() {
    if [ ! -f "package.json" ]; then
        echo -e "${YELLOW}❌ package.json manquant - Création d'un package.json complet...${NC}"
        cat > package.json << 'EOF'
{
  "name": "satisfactory-nodal-planner",
  "version": "0.1.0",
  "type": "module",
  "main": "electron/main.cjs",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "electron": "electron .",
    "electron:start": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && npm run electron\"",
    "electron:build": "npm run build && electron-builder"
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
    "jsdom": "^23.0.1",
    "electron": "^28.0.0",
    "electron-builder": "^24.6.4",
    "concurrently": "^8.2.2",
    "wait-on": "^7.2.0"
  },
  "build": {
    "appId": "com.satisfactory.nodalplanner",
    "productName": "Satisfactory Nodal Planner",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "mac": {
      "category": "public.app-category.productivity"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
EOF
        echo -e "${GREEN}✅ package.json créé avec support Electron${NC}"
    fi
}

# Fonction pour installer les dépendances
install_dependencies() {
    echo -e "${BLUE}📦 Vérification des dépendances...${NC}"
    
    # Installer les dépendances de base
    if [ ! -d "node_modules" ]; then
        echo -e "${CYAN}📦 Installation des dépendances...${NC}"
        npm install > /dev/null 2>&1 &
        show_spinner "Installation des dépendances npm" $!
        echo -e "${GREEN}✅ Dépendances installées${NC}"
    fi
    
    # Vérifier et installer Electron si nécessaire
    if [ ! -d "node_modules/electron" ]; then
        echo -e "${CYAN}📦 Installation d'Electron...${NC}"
        npm install --save-dev electron electron-builder > /dev/null 2>&1 &
        show_spinner "Installation d'Electron" $!
        echo -e "${GREEN}✅ Electron installé${NC}"
    fi
    
    # Vérifier et installer les dépendances de développement
    if [ ! -d "node_modules/concurrently" ]; then
        echo -e "${CYAN}📦 Installation des dépendances de développement...${NC}"
        npm install --save-dev concurrently wait-on > /dev/null 2>&1 &
        show_spinner "Installation des dépendances de développement" $!
        echo -e "${GREEN}✅ Dépendances de développement installées${NC}"
    fi
}

# Fonction pour créer les fichiers de configuration
create_config_files() {
    echo -e "${BLUE}⚙️  Création des fichiers de configuration...${NC}"
    
    # Créer index.html si nécessaire
    if [ ! -f "index.html" ]; then
        echo -e "${YELLOW}❌ index.html manquant - Création...${NC}"
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
        echo -e "${GREEN}✅ index.html créé${NC}"
    fi

    # Créer vite.config.ts si nécessaire
    if [ ! -f "vite.config.ts" ]; then
        echo -e "${YELLOW}❌ vite.config.ts manquant - Création...${NC}"
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
        echo -e "${GREEN}✅ vite.config.ts créé${NC}"
    fi

    # Créer tsconfig.json si nécessaire
    if [ ! -f "tsconfig.json" ]; then
        echo -e "${YELLOW}❌ tsconfig.json manquant - Création...${NC}"
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
        echo -e "${GREEN}✅ tsconfig.json créé${NC}"
    fi

    # Créer tsconfig.node.json si nécessaire
    if [ ! -f "tsconfig.node.json" ]; then
        echo -e "${YELLOW}❌ tsconfig.node.json manquant - Création...${NC}"
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
        echo -e "${GREEN}✅ tsconfig.node.json créé${NC}"
    fi

    # Créer la structure minimale si nécessaire
    if [ ! -f "src/main.tsx" ]; then
        echo -e "${YELLOW}❌ src/main.tsx manquant - Création de la structure minimale...${NC}"
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
        echo -e "${GREEN}✅ src/main.tsx créé${NC}"
    fi
}

# Fonction pour corriger les chemins dans index.html
fix_html_paths() {
    local html_path="dist/index.html"
    if [ -f "$html_path" ]; then
        echo -e "${BLUE}🔧 Correction des chemins dans index.html...${NC}"
        sed -i 's|src="/assets/|src="./assets/|g' "$html_path"
        sed -i 's|href="/assets/|href="./assets/|g' "$html_path"
        echo -e "${GREEN}✅ Chemins corrigés${NC}"
    fi
}

# Fonction pour démarrer l'application
start_application() {
    echo -e "${BLUE}🌐 Démarrage de l'application...${NC}"
    
    # Vérifier si on est en mode manuel
    if [ "$MANUAL_MODE" = true ]; then
        echo -e "${YELLOW}📖 Mode manuel activé${NC}"
        echo "Instructions:"
        echo "   1. Le serveur de développement va démarrer"
        echo "   2. Attendez que le serveur soit prêt (message 'Local: http://localhost:3000')"
        echo "   3. Ouvrez un nouveau terminal et exécutez: npm run electron"
        echo "   4. Ou utilisez Ctrl+C pour arrêter et relancer"
        echo ""
        echo -e "${CYAN}Démarrage du serveur de développement...${NC}"
        npm run dev
    else
        echo -e "${GREEN}🚀 Démarrage automatique de l'application Electron...${NC}"
        echo "L'application va se charger dans une fenêtre Electron"
        echo "Les outils de développement seront automatiquement ouverts"
        echo ""
        
        # Démarrer l'application avec gestion d'erreurs robuste
        if npm run electron:start; then
            echo -e "${GREEN}✅ Application démarrée avec succès${NC}"
        else
            echo -e "${YELLOW}⚠️  Erreur lors du démarrage automatique, tentative de démarrage en mode simple...${NC}"
            
            # Démarrer le serveur en arrière-plan
            echo -e "${CYAN}🌐 Démarrage du serveur de développement en arrière-plan...${NC}"
            npm run dev > /dev/null 2>&1 &
            local dev_pid=$!
            
            # Attendre que le serveur soit prêt avec barre de progression
            echo -e "${BLUE}⏳ Attente du démarrage du serveur...${NC}"
            for i in {1..10}; do
                show_progress $i 10 "Démarrage du serveur"
                sleep 0.5
            done
            echo ""
            
            # Démarrer Electron
            echo -e "${CYAN}🚀 Lancement d'Electron...${NC}"
            npm run electron
            
            # Nettoyer le processus de développement
            if kill -0 $dev_pid 2>/dev/null; then
                kill $dev_pid
                echo -e "${GREEN}🧹 Processus de développement arrêté${NC}"
            fi
        fi
    fi
}

# Fonction principale
main() {
    echo -e "${PURPLE}🚀 Démarrage du projet Satisfactory Nodal Planner${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo ""
    
    # Détecter l'environnement
    detect_wsl
    
    # Installer Node.js si nécessaire
    install_nodejs
    
    # Migrer vers Windows si on est dans WSL
    migrate_to_windows
    
    # Créer package.json avec support Electron
    create_package_json
    
    # Installer les dépendances
    install_dependencies
    
    # Créer les fichiers de configuration
    create_config_files
    
    # Faire le build
    echo -e "${BLUE}🔨 Construction de l'application...${NC}"
    echo -e "${CYAN}📦 Compilation TypeScript et build Vite...${NC}"
    
    # Démarrer le build en arrière-plan avec spinner
    npm run build > /dev/null 2>.vite-error.log &
    local build_pid=$!
    
    # Afficher un spinner pendant le build
    show_spinner "Build de l'application" $build_pid
    
    # Vérifier le résultat du build
    if wait $build_pid && [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build réussi !${NC}"
        rm -f .vite-error.log
        
        # Corriger les chemins après le build
        fix_html_paths
    else
        echo -e "${YELLOW}⚠️  Build échoué, tentative de démarrage en mode développement...${NC}"
        echo -e "${CYAN}📋 Log d'erreur disponible dans .vite-error.log${NC}"
        # Garder le log d'erreur pour la prochaine détection
    fi
    
    # Démarrer l'application
    start_application
}

# Vérifier les arguments
for arg in "$@"; do
    case $arg in
        --manual|-m)
            MANUAL_MODE=true
            shift
            ;;
        --help|-h)
            echo "Script de démarrage Satisfactory Nodal Planner"
            echo ""
            echo "Usage:"
            echo "  ./start-auto.sh              # Démarrage automatique (recommandé)"
            echo "  ./start-auto.sh --manual     # Mode manuel (serveur + Electron séparés)"
            echo "  ./start-auto.sh --help       # Affiche cette aide"
            echo ""
            echo "Options:"
            echo "  --manual, -m    : Démarre seulement le serveur de développement"
            echo "  --help, -h      : Affiche cette aide"
            echo ""
            exit 0
            ;;
    esac
done

# Exécuter la fonction principale
main "$@"
