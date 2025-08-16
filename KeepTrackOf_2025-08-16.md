## Satisfactory Nodal Planner — Journal de suivi (2025-08-16)

### État actuel
- Stack: React 18, Vite, TypeScript, React Flow, CSS custom. Scripts de démarrage `start.sh` / `start-auto.sh` / `start.bat` (Vite prioritaire, fallback Python).
- UI nodale sombre, sidebar bibliothèque de blocs, zone principale avec pan/zoom/mini-map.

### Fonctionnalités en place
- Sidebar dynamique depuis `src/blocks/` (Miner, Smelter, Foundry, Assembler, Train Freight) + “Bibliothèque perso” (modèles sauvegardés via `localStorage`).
- Drag & drop d’un bloc vers le canvas pour créer un nœud.
- Type de nœud `block` avec:
  - Ports internes: entrées à gauche (cibles), sorties à droite (sources), 1 handle par port.
  - Nom et description éditables (double-clic sur l’entête/description).
  - Badge de débit (items/min) par port; clic sur un port → modification rapide du débit.
  - Mise en évidence claire du nœud sélectionné.
- Barre d’actions (haut-droite):
  - Supprimer nœud (et arêtes). Raccourci clavier Del/Backspace.
  - Ajuster nombre d’entrées/sorties (-/+) du nœud sélectionné (ports et tableaux de débit synchronisés).
  - Enregistrer le nœud comme modèle (apparaît dans “Bibliothèque perso”).
- Débit et utilisation sur les arêtes:
  - Calcul du flux réellement transféré par arête (min(capacité source, demande cible) distribué entre plusieurs consommateurs).
  - Label par arête: `flow/min • util%`.
  - Couleur par port source, uniforme pour toutes ses arêtes: 0% rouge → 100% vert.

### Fichiers importants
- `src/ui/App.tsx`: intégration React Flow, DnD, calcul des débits/labels, actions, sélection, suppression.
- `src/ui/nodes/BlockNode.tsx`: rendu visuel des nœuds (grille 3 colonnes, ports internes, édition nom/desc, clic débit par port).
- `src/styles/global.css`: styles généraux, styles des nœuds/ports.
- `src/blocks/*`: définitions des blocs de base + types.
- `start.sh` / `start-auto.sh` / `start.bat`: démarrage Vite ou fallback Python.

### Ce qui fonctionne
- Création/édition/suppression de nœuds, déplacements, pan/zoom.
- Ajustement du nombre de ports et des débits par port.
- Calcul et affichage des flux sur les liens, couleur d’utilisation uniforme côté source.
- Sauvegarde de modèles personnalisés et réutilisation via DnD.

### Limites actuelles / À valider
- Pas de validation stricte des connexions (autoriser seulement Sortie → Entrée; empêcher Entrée → Entrée, etc.).
- Pas de recette/process réel de Satisfactory (ratio, temps de craft, by-products, fluides, surcadençage, convoyeurs Mk1/2/3, etc.).
- Pas de persistance globale du graphe (uniquement modèles de nœuds). Pas d’import/export JSON.
- Pas de panneau de propriétés dédié (les réglages utilisent encore des prompts rapides).
- Pas de répartition avancée (priorités, fairness, splitters/mergers), seulement distribution par demandes décroissantes.
- Pas d’undo/redo, pas de multi-sélection, pas de copier-coller.

### Améliorations suggérées (prochaines étapes)
- Propriétés latérales (remplacer les prompts):
  - Liste des ports avec champs numériques (items/min), renommage de port, unité (items/min ou items/s), boutons +/−.
  - Surcadençage (%), consommation électrique estimée, qualité visuelle par type de bloc (couleur, icône).
- Validation et règles de connexion:
  - Autoriser uniquement `source → target`; empêcher le reste.
  - Afficher des warnings si capacité source < demande totale (saturation) ou si flux > capacité convoyeur sélectionné.
- Modèle Satisfactory:
  - Base de données recettes (minerais → lingots → pièces) avec ratios, temps de cycle, I/O exacts.
  - Convoyeurs Mk1/2/3 (60/120/270 items/min), Miners Mk1/2/3, Foundry/Assembler/Constructor, trains (logistique), fluides (pompes/pipe Mk).
  - Calcul descendant/ascendant: dimensionnement automatique de la chaîne à partir d’un objectif (ex: 60 plates/min).
- UX/ergonomie:
  - Context menu (clic droit): dupliquer, supprimer, aligner, verrouiller position.
  - Undo/redo (history), multi-sélection, auto-layout partiel.
  - Coloration par type de bloc, thèmes, grilles adaptatives.
- Persistance:
  - Sauvegarde/chargement du graphe (localStorage, fichier .json), versions nommées, export/import.
- Qualité code:
  - Extraire un store (Zustand) pour l’état (nodes/edges, sélection, préférences) et débrancher la logique de calcul.
  - Tests unitaires pour le calcul de flux et les règles de connexion.

### Notes techniques
- Les handles sont nommés `in-${idx}` / `out-${idx}`; les indices sont extraits depuis `edge.sourceHandle` / `edge.targetHandle` pour le calcul.
- La couleur des arêtes dépend de l’utilisation agrégée du port source (uniforme pour toutes les arêtes du groupe).
- Le calcul de flux distribue par demandes décroissantes; alternatives possibles: fair share, round-robin, priorité par port.
- Les modèles personnalisés sont stockés en `localStorage` sous la clé `snp:custom:<name>`.

### Problèmes connus / idées de correctifs
- Les prompts bloquants sont pratiques mais doivent être remplacés par un panneau latéral pour éviter l’interruption du flux.
- L’algorithme de distribution pourrait afficher la capacité restante du port source et signaler visuellement les saturations.
- Gestion des fluides et puissance: prévoir types de ports (`item`, `fluid`, `power`) avec styles/validations spécifiques.

### Changelog (résumé du jour)
- Ajout du DnD de la sidebar vers le canvas, nœud `block` avec ports internes.
- Édition du nom, description, nombre d’entrées/sorties; clic sur port → réglage du débit.
- Calcul des flux sur arêtes avec labels `flow/min • util%` et couleur uniforme par port source (0% rouge → 100% vert).
- Boutons: suppression nœud, réglages E/S, enregistrer nœud; “Bibliothèque perso” dans la sidebar.
- Amélioration styles (grille 3 colonnes, badges, hover) et scripts de démarrage.

### Démarrage
- Dev: `npm install` puis `npm run dev` (http://localhost:3000)
- Alternative: `./start.sh` (Vite si dispo; sinon serveur Python sur build `dist/`).


