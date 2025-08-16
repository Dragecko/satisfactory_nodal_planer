# Satisfactory Nodal Planner

Prototype d’interface nodale inspirée de Blender pour planifier des usines Satisfactory.

## Démarrage rapide

- Prérequis: Node.js 18+
- Installer les dépendances:
  - Linux/macOS: `./install.sh`
  - Windows (PowerShell/CMD): `npm install`

### Développement

```bash
npm run dev
```
Ouvre `http://localhost:3000` avec une UI comprenant une sidebar et un canvas nodal (pan/zoom, mini-map, grille).

### Alternatives

- `start.sh` / `start-auto.sh` / `start.bat` démarrent Vite si disponible. Sinon, ils servent un build `dist/` via Python, ou à défaut le dossier courant.

### Build production

```bash
npm run build
```
Les fichiers statiques sont générés dans `dist/`.
