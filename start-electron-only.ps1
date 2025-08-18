# Script pour lancer Electron directement
Write-Host "Lancement d'Electron..." -ForegroundColor Green

# Détecter l'environnement WSL
$currentPath = Get-Location
$currentPathString = $currentPath.ToString()

# Si on est en WSL, migrer vers le répertoire temporaire
if ($currentPathString.StartsWith("\\") -or $currentPathString.Contains("wsl.localhost")) {
    Write-Host "Migration vers le répertoire temporaire..." -ForegroundColor Yellow
    
    $tempDir = "C:\temp\satisfactory-nodal-planer"
    if (Test-Path $tempDir) {
        Set-Location $tempDir
        Write-Host "Répertoire temporaire: $(Get-Location)" -ForegroundColor Green
    } else {
        Write-Host "Répertoire temporaire non trouvé. Utilisez .\start.ps1" -ForegroundColor Red
        exit 1
    }
}

# Définir l'environnement de développement
$env:NODE_ENV = "development"

# Lancer Electron
Write-Host "Démarrage d'Electron..." -ForegroundColor Cyan
npm run electron

Write-Host "Electron fermé" -ForegroundColor Yellow
