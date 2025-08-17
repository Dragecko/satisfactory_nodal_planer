# Demarrage automatique de Satisfactory Nodal Planner
Write-Host "Demarrage automatique de Satisfactory Nodal Planner" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Se placer dans le repertoire du script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Repertoire: $(Get-Location)" -ForegroundColor Cyan

# Fonction pour detecter si on est dans un environnement problematique
function Should-MigrateToLocal {
    # Detector les chemins UNC
    if ($PWD.Path -like "*wsl.localhost*" -or $PWD.Path -like "*\\*") {
        Write-Host "Chemin UNC detecte" -ForegroundColor Yellow
        return $true
    }
    
    # Detector si on a des erreurs de chemins dans les logs precedents
    if (Test-Path ".vite-error.log" -and (Get-Content ".vite-error.log" | Select-String "UNC")) {
        Write-Host "Erreur UNC precedente detectee" -ForegroundColor Yellow
        return $true
    }
    
    return $false
}

# 1. Verifier et resoudre les problemes de chemins UNC/WSL
if (Should-MigrateToLocal) {
    Write-Host "Migration vers un repertoire local pour eviter les problemes WSL/UNC..." -ForegroundColor Yellow
    
    $LocalPath = "C:\temp\satisfactory-nodal-planer"
    Write-Host "Copie vers: $LocalPath" -ForegroundColor Cyan
    
    # Nettoyer l'ancien repertoire temporaire
    if (Test-Path $LocalPath) {
        Remove-Item -Recurse -Force $LocalPath
    }
    
    # Creer le nouveau repertoire
    New-Item -ItemType Directory -Path $LocalPath -Force | Out-Null
    
    # Copier tous les fichiers necessaires
    Write-Host "Copie des fichiers..." -ForegroundColor Cyan
    try {
        Copy-Item -Path "src", "package.json", "package-lock.json", "vite.config.ts", "tsconfig.json", "tsconfig.node.json", "index.html" -Destination $LocalPath -Recurse -Force
    }
    catch {
        Write-Host "Certains fichiers manquent, copie minimale..." -ForegroundColor Yellow
        try {
            Copy-Item -Path "src", "package.json" -Destination $LocalPath -Recurse -Force
        }
        catch {
            Write-Host "Impossible de copier les fichiers" -ForegroundColor Red
            Read-Host "Appuyez sur Entree pour continuer"
            exit 1
        }
    }
    
    # Aller dans le repertoire local
    Set-Location $LocalPath
    Write-Host "Nouveau repertoire: $(Get-Location)" -ForegroundColor Cyan
    
    # Creer un fichier de marqueur
    "Temporary directory created by start.ps1" | Out-File -FilePath ".temp-marker" -Encoding UTF8
}

# 2. Verifier si npm est disponible
try {
    $npmVersion = npm --version
    Write-Host "npm detecte: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "npm non trouve" -ForegroundColor Red
    Write-Host "Installez Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entree pour continuer"
    exit 1
}

# 3. Verifier si package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "package.json non trouve" -ForegroundColor Red
    Write-Host "Assurez-vous d'etre dans le bon repertoire" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entree pour continuer"
    exit 1
}

# 4. Installer les dependances si necessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dependances" -ForegroundColor Red
        Read-Host "Appuyez sur Entree pour continuer"
        exit 1
    }
}

# 5. Faire le build
Write-Host "Construction de l'application..." -ForegroundColor Yellow
npm run build 2> .vite-error.log
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build reussi !" -ForegroundColor Green
    Remove-Item ".vite-error.log" -ErrorAction SilentlyContinue
}
else {
    Write-Host "Build echoue, tentative de demarrage en mode developpement..." -ForegroundColor Yellow
}

Write-Host "Pret !" -ForegroundColor Green
Write-Host "Lancement du serveur de developpement sur http://localhost:3000" -ForegroundColor Cyan
Write-Host "Le navigateur s'ouvrira automatiquement" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour arreter le serveur, appuyez sur Ctrl+C" -ForegroundColor Yellow
Write-Host ""

npm run dev
