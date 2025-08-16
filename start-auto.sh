#!/bin/bash

echo "🚀 Démarrage de Satisfactory Nodal Planner"
echo "=========================================="

# 1) Si npm est dispo, on démarre Vite sur un port libre
if command -v npm &> /dev/null; then
    echo "✅ npm détecté: $(npm --version)"
    echo "🌐 Lancement du serveur de développement (Vite)"
    npm run dev
    exit $?
fi

# 2) Sinon, fallback: choisir un port libre et servir soit dist/, soit le dossier courant via Python
find_free_port() {
    local port=3000
    while netstat -tuln | grep -q ":$port "; do
        echo "⚠️  Port $port occupé, essai du port suivant..."
        port=$((port + 1))
    done
    echo $port
}

PORT=$(find_free_port)

if [ -d "dist" ]; then
    echo "📦 Build détecté dans ./dist"
    if command -v python3 &> /dev/null; then
        echo "🌐 Lancement sur http://localhost:$PORT (./dist)"
        (cd dist && python3 -m http.server $PORT)
        exit $?
    elif command -v python &> /dev/null; then
        echo "🌐 Lancement sur http://localhost:$PORT (./dist)"
        (cd dist && python -m http.server $PORT)
        exit $?
    fi
fi

if command -v python3 &> /dev/null; then
    echo "⚠️  npm non disponible, serveur statique simple sur http://localhost:$PORT"
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "⚠️  npm non disponible, serveur statique simple sur http://localhost:$PORT"
    python -m http.server $PORT
else
    echo "❌ Aucun serveur disponible"
    echo "💡 Installez Node.js (recommandé) ou Python 3"
fi
