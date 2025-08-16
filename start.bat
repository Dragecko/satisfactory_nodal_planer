@echo off
echo 🚀 Démarrage de Satisfactory Nodal Planner
echo ==========================================

REM 1) Si npm est dispo, lancer Vite
where npm >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
    echo ✅ npm détecté: %NPM_VER%
    echo 🌐 Démarrage du serveur de dev (Vite) sur http://localhost:3000
    echo 🛑 Pour arrêter, Ctrl+C
    call npm run dev
    goto :eof
)

REM 2) Sinon, si dossier dist existe, servir avec Python
if exist dist (
    where python >nul 2>&1
    if %errorlevel% == 0 (
        echo 📦 Build détecté, service statique depuis .\dist sur http://localhost:3001
        pushd dist
        python -m http.server 3001
        popd
        goto :eof
    ) else (
        echo ❌ Python indisponible. Ouvrez .\dist\index.html dans votre navigateur.
        pause
        goto :eof
    )
)

REM 3) Fallback: servir le dossier courant via Python si possible
where python >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠️  npm indisponible, serveur statique simple sur http://localhost:3001
    python -m http.server 3001
) else (
    echo ❌ Aucun serveur disponible
    echo 💡 Installez Node.js (recommandé) ou Python 3
    echo 🎯 Alternative : Ouvrez manuellement index.html (limité sans bundler)
    pause
)
