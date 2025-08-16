#!/bin/bash

echo "🚀 Démarrage de Satisfactory Nodal Planner"
echo "=========================================="

# Se placer dans le répertoire du script pour éviter les erreurs de répertoire courant (UNC, etc.)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$SCRIPT_DIR" || exit 1

# 1) Si Node/npm est dispo (Linux/WSL, pas depuis Windows /mnt/*), lancer le serveur de dev Vite
NPM_BIN="$(command -v npm || true)"
if [ -n "$NPM_BIN" ]; then
    if [[ "$NPM_BIN" == /mnt/* ]]; then
        echo "⚠️  npm détecté mais depuis Windows ($NPM_BIN)."
        echo "   Pour éviter les erreurs UNC, installez Node dans l'environnement Linux/WSL: 'sudo apt install nodejs npm'"
        echo "   Continuer avec le fallback statique si nécessaire."
    else
        echo "✅ npm détecté: $($NPM_BIN --version)"
        echo "🌐 Lancement du serveur de développement (Vite) sur http://localhost:3000"
        echo "📖 Le navigateur s'ouvrira automatiquement (selon config)"
        echo ""
        echo "🛑 Pour arrêter le serveur, appuyez sur Ctrl+C"
        echo ""
        "$NPM_BIN" run dev
        exit $?
    fi
fi

# 2) Sinon si un build existe, servir 'dist' via Python
if [ -d "dist" ]; then
    echo "📦 Build détecté dans ./dist"
    if command -v python3 &> /dev/null; then
        echo "🌐 Lancement du serveur statique sur http://localhost:3001 (./dist)"
        echo "📖 Ouvrez votre navigateur et allez sur http://localhost:3001"
        (cd dist && python3 -m http.server 3001)
        exit $?
    elif command -v python &> /dev/null; then
        echo "🌐 Lancement du serveur statique sur http://localhost:3001 (./dist)"
        echo "📖 Ouvrez votre navigateur et allez sur http://localhost:3001"
        (cd dist && python -m http.server 3001)
        exit $?
    fi
fi

# 3) Fallback: servir le répertoire courant (peu adapté à TypeScript sans build)
PORT=${PORT:-3001}
if command -v python3 &> /dev/null; then
    echo "⚠️  npm non disponible, fallback serveur statique simple sur http://localhost:$PORT"
    echo "💡 Recommandé: installer Node.js sous Linux/WSL et exécuter 'npm run dev'"
    python3 -m http.server "$PORT"
elif command -v python &> /dev/null; then
    echo "⚠️  npm non disponible, fallback serveur statique simple sur http://localhost:$PORT"
    echo "💡 Recommandé: installer Node.js sous Linux/WSL et exécuter 'npm run dev'"
    python -m http.server "$PORT"
else
    echo "❌ Aucun serveur disponible"
    echo "💡 Installez Node.js (recommandé) ou Python 3"
    echo "🎯 Alternative : Ouvrez manuellement index.html (limité sans bundler)"
fi
