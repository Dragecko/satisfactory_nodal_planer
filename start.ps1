# Script de démarrage universel pour Satisfactory Nodal Planner
# Gère automatiquement WSL, Windows natif, et tous les cas d'erreur

param(
    [switch]$Manual,
    [switch]$Force,
    [switch]$Help
)

# Fonction d'aide
function Show-Help {
    Write-Host "Script de démarrage Satisfactory Nodal Planner" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  .\start.ps1              # Démarrage automatique (recommandé)" -ForegroundColor White
    Write-Host "  .\start.ps1 -Manual      # Mode manuel (serveur + Electron séparés)" -ForegroundColor White
    Write-Host "  .\start.ps1 -Force       # Force le redémarrage complet" -ForegroundColor White
    Write-Host "  .\start.ps1 -Help        # Affiche cette aide" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  -Manual    : Démarre seulement le serveur de développement" -ForegroundColor White
    Write-Host "  -Force     : Force l'installation des dépendances" -ForegroundColor White
    Write-Host "  -Help      : Affiche cette aide" -ForegroundColor White
    Write-Host ""
}

# Fonction pour corriger les chemins dans index.html
function Fix-HtmlPaths {
    $htmlPath = "dist\index.html"
    if (Test-Path $htmlPath) {
        Write-Host "Correction des chemins dans index.html..." -ForegroundColor Yellow
        $content = Get-Content $htmlPath -Raw
        $content = $content -replace 'src="/assets/', 'src="./assets/'
        $content = $content -replace 'href="/assets/', 'href="./assets/'
        Set-Content $htmlPath $content -NoNewline
        Write-Host "Chemins corrigés" -ForegroundColor Green
    }
}

# Afficher l'aide si demandé
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "Démarrage de Satisfactory Nodal Planner" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Gray

# Détecter l'environnement WSL de manière plus robuste
$isWsl = $false
$currentPath = Get-Location
$currentPathString = $currentPath.ToString()

# Vérifier si on est dans un chemin UNC (WSL)
if ($currentPathString.StartsWith("\\") -or $currentPathString.Contains("wsl.localhost") -or $currentPathString.Contains("wsl$")) {
    $isWsl = $true
    Write-Host "Environnement WSL détecté" -ForegroundColor Cyan
    Write-Host "Chemin actuel: $currentPathString" -ForegroundColor Yellow
} else {
    Write-Host "Mode Windows natif détecté" -ForegroundColor Cyan
}

# Vérifier les prérequis
Write-Host "Vérification des prérequis..." -ForegroundColor Cyan

# Vérifier Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js non trouvé"
    }
} catch {
    Write-Host "Node.js non trouvé" -ForegroundColor Red
    Write-Host "Veuillez installer Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Assurez-vous que Node.js est installé dans Windows (pas dans WSL)" -ForegroundColor Yellow
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "npm: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm non trouvé"
    }
} catch {
    Write-Host "npm non trouvé" -ForegroundColor Red
    exit 1
}

# Gestion spéciale pour WSL - TOUJOURS migrer vers un répertoire local
if ($isWsl) {
    Write-Host "Migration vers un répertoire local pour éviter les problèmes WSL/UNC..." -ForegroundColor Yellow
    
    # Créer un répertoire temporaire local
    $tempDir = "C:\temp\satisfactory-nodal-planer"
    if (-not (Test-Path $tempDir)) {
        try {
            New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
            Write-Host "Répertoire temporaire créé: $tempDir" -ForegroundColor Green
        } catch {
            Write-Host "Impossible de créer le répertoire temporaire" -ForegroundColor Red
            Write-Host "Essayez de créer manuellement: $tempDir" -ForegroundColor Yellow
            exit 1
        }
    }
    
    Write-Host "Copie des fichiers vers: $tempDir" -ForegroundColor Cyan
    
    # Copier les fichiers nécessaires
    $sourceDir = Get-Location
    try {
        Copy-Item -Path "$sourceDir\*" -Destination $tempDir -Recurse -Force -Exclude "node_modules"
        Write-Host "Fichiers copiés avec succès" -ForegroundColor Green
    } catch {
        Write-Host "Erreur lors de la copie des fichiers" -ForegroundColor Red
        Write-Host "Essayez le mode manuel: .\start.ps1 -Manual" -ForegroundColor Yellow
        exit 1
    }
    
    # Changer vers le répertoire temporaire
    Set-Location $tempDir
    Write-Host "Nouveau répertoire: $(Get-Location)" -ForegroundColor Green
}

# Vérifier si package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "package.json non trouvé" -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le bon répertoire" -ForegroundColor Yellow
    exit 1
}

# Installation des dépendances
Write-Host "Vérification des dépendances..." -ForegroundColor Cyan

if ($Force -or -not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dépendances" -ForegroundColor Red
        Write-Host "Essayez: .\start.ps1 -Force" -ForegroundColor Yellow
        exit 1
    }
}

# Vérifier et installer Electron si nécessaire
if ($Force -or -not (Test-Path "node_modules/electron")) {
    Write-Host "Installation d'Electron..." -ForegroundColor Yellow
    npm install --save-dev electron electron-builder
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation d'Electron" -ForegroundColor Red
        exit 1
    }
}

# Vérifier et installer les dépendances de développement
if ($Force -or -not (Test-Path "node_modules/concurrently")) {
    Write-Host "Installation des dépendances de développement..." -ForegroundColor Yellow
    npm install --save-dev concurrently wait-on
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dépendances de développement" -ForegroundColor Red
        exit 1
    }
}

# Définir la variable d'environnement
$env:NODE_ENV = "development"

# Mode de démarrage
if ($Manual) {
    Write-Host "Mode manuel activé" -ForegroundColor Green
    Write-Host "Instructions:" -ForegroundColor Cyan
    Write-Host "   1. Le serveur de développement va démarrer" -ForegroundColor White
    Write-Host "   2. Attendez que le serveur soit prêt (message 'Local: http://localhost:3000')" -ForegroundColor White
    Write-Host "   3. Ouvrez un nouveau terminal et exécutez: npm run electron" -ForegroundColor White
    Write-Host "   4. Ou utilisez Ctrl+C pour arrêter et relancer" -ForegroundColor White
    Write-Host ""
    Write-Host "Démarrage du serveur de développement..." -ForegroundColor Green
    
    try {
        npm run dev
    } catch {
        Write-Host "Erreur lors du démarrage du serveur" -ForegroundColor Red
        Write-Host "Vérifiez que le script 'dev' existe dans package.json" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "Démarrage automatique de l'application Electron..." -ForegroundColor Green
    Write-Host "L'application va se charger dans une fenêtre Electron" -ForegroundColor Cyan
    Write-Host "Les outils de développement seront automatiquement ouverts" -ForegroundColor Cyan
    Write-Host ""
    
    # Démarrer l'application avec gestion d'erreurs robuste
    try {
        Write-Host "Lancement de npm run electron:start..." -ForegroundColor Green
        npm run electron:start
        
        # Corriger les chemins après le build
        Fix-HtmlPaths
        
        # Relancer Electron avec les chemins corrigés
        Write-Host "Relancement d'Electron avec les chemins corrigés..." -ForegroundColor Green
        npm run electron
    } catch {
        Write-Host "Erreur lors du démarrage automatique" -ForegroundColor Red
        Write-Host "Tentative de démarrage en mode simple..." -ForegroundColor Yellow
        
        try {
            Write-Host "Démarrage du serveur de développement en arrière-plan..." -ForegroundColor Cyan
            $devProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden -PassThru
            
            Write-Host "Attente de 5 secondes pour le démarrage du serveur..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
            
            Write-Host "Lancement d'Electron..." -ForegroundColor Cyan
            npm run electron
            
            # Nettoyer le processus de développement
            if ($devProcess -and -not $devProcess.HasExited) {
                $devProcess.Kill()
            }
        } catch {
            Write-Host "Impossible de démarrer l'application" -ForegroundColor Red
            Write-Host "Essayez le mode manuel: .\start.ps1 -Manual" -ForegroundColor Yellow
            
            # Nettoyer les processus
            try {
                Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
                Get-Process -Name "electron" -ErrorAction SilentlyContinue | Stop-Process -Force
                Write-Host "Nettoyage des processus terminé" -ForegroundColor Green
            } catch {
                Write-Host "Impossible de nettoyer les processus" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "Application fermée" -ForegroundColor Green

# Nettoyer le répertoire temporaire si on était en mode WSL
if ($isWsl) {
    Write-Host "Nettoyage du répertoire temporaire..." -ForegroundColor Yellow
    try {
        # Retourner au répertoire original
        Set-Location $sourceDir
        
        # Supprimer le répertoire temporaire
        Remove-Item -Path $tempDir -Recurse -Force
        Write-Host "Nettoyage terminé" -ForegroundColor Green
    } catch {
        Write-Host "Impossible de nettoyer le répertoire temporaire" -ForegroundColor Yellow
        Write-Host "Répertoire temporaire: $tempDir" -ForegroundColor Cyan
    }
}

Write-Host "Script terminé" -ForegroundColor Green
