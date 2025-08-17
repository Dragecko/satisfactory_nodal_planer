# Satisfactory Nodal Planner

Un planificateur nodal pour Satisfactory, inspiré de Blender, permettant de concevoir et optimiser des chaînes de production.

## 🚀 Fonctionnalités

### Interface utilisateur
- **Interface sombre** moderne et intuitive
- **Canvas interactif** avec pan/zoom et mini-carte
- **Sidebar** avec bibliothèque de blocs et modèles personnalisés
- **Panneau de propriétés** non-bloquant pour l'édition
- **Barre d'outils** complète avec actions rapides

### Blocs disponibles
- **Miner** - Extraction de minerais (60 items/min)
- **Smelter** - Transformation minerai → lingot (30 items/min)
- **Foundry** - Création d'alliages (45 items/min)
- **Assembler** - Assemblage de pièces (5 items/min)
- **Train Freight** - Logistique ferroviaire (1200 items/min)

### Fonctionnalités avancées
- **Drag & Drop** de blocs vers le canvas
- **Connexions validées** (sortie → entrée uniquement)
- **Calcul automatique des flux** avec distribution par demandes décroissantes
- **Affichage des taux d'utilisation** en temps réel
- **Couleurs dynamiques** (rouge → vert selon l'utilisation)
- **Édition inline** des nœuds (double-clic)
- **Modèles personnalisés** sauvegardés en localStorage
- **Historique** avec undo/redo (25 niveaux)
- **Import/Export JSON** pour partager les graphes
- **Sauvegarde automatique** du graphe

### Raccourcis clavier
- `Del` / `Backspace` - Supprimer le nœud sélectionné
- `Ctrl+Z` - Annuler
- `Ctrl+Y` / `Ctrl+Shift+Z` - Rétablir
- `Ctrl+D` - Dupliquer (à venir)

## 🛠️ Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd satisfactory_nodal_planer

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

### Scripts disponibles
```bash
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm run preview      # Prévisualisation du build
npm run test         # Exécution des tests
npm run test:ui      # Interface de tests
```

## 📁 Structure du projet

```
src/
├── blocks/          # Définitions des blocs
│   ├── base/        # Blocs de base (Miner, Smelter, etc.)
│   ├── types.ts     # Types TypeScript
│   └── index.ts     # Export des blocs
├── engine/          # Moteur de calcul
│   ├── flow.ts      # Calcul des flux
│   ├── validate.ts  # Validation des connexions
│   └── color.ts     # Utilitaires de couleur
├── store/           # Gestion d'état Zustand
│   ├── useGraphStore.ts  # Store principal
│   ├── history.ts   # Gestion de l'historique
│   └── selectors.ts # Sélecteurs optimisés
├── lib/             # Utilitaires
│   ├── persistence.ts # Sauvegarde/chargement
│   ├── io.ts        # Import/Export JSON
│   └── localModels.ts # Modèles personnalisés
├── ui/              # Composants React
│   ├── App.tsx      # Composant principal
│   ├── Sidebar.tsx  # Barre latérale
│   ├── Topbar.tsx   # Barre d'outils
│   ├── PropertiesPanel.tsx # Panneau de propriétés
│   └── nodes/       # Types de nœuds
├── styles/          # Styles CSS
│   └── global.css   # Styles globaux
└── tests/           # Tests unitaires
    ├── flow.test.ts # Tests du moteur de flux
    └── validate.test.ts # Tests de validation
```

## 🎯 Utilisation

### Création d'un graphe
1. **Glisser-déposer** un bloc depuis la sidebar vers le canvas
2. **Connecter** les ports de sortie (droite) aux ports d'entrée (gauche)
3. **Éditer** les propriétés en sélectionnant un nœud et ouvrant le panneau de propriétés

### Édition des nœuds
- **Double-clic** sur le nom/description pour éditer inline
- **Clic** sur un badge de port pour ouvrir les propriétés
- **Boutons +** dans le panneau de propriétés pour ajouter des ports

### Sauvegarde et partage
- **Sauvegarde automatique** en localStorage
- **Export JSON** via la barre d'outils
- **Import JSON** pour charger des graphes partagés
- **Modèles personnalisés** sauvegardés dans la bibliothèque

## 🔧 Architecture technique

### Stack technologique
- **React 18** avec hooks et composants fonctionnels
- **TypeScript** pour la sécurité des types
- **Vite** pour le build et le développement
- **React Flow** pour le canvas nodal
- **Zustand** pour la gestion d'état
- **CSS Variables** pour le thème sombre

### Moteur de flux
L'algorithme de calcul des flux utilise une distribution par **"demandes décroissantes"** :
1. Pour chaque port source, calculer la capacité totale
2. Trier les consommateurs par demande décroissante
3. Distribuer la capacité selon les priorités
4. Calculer les taux d'utilisation et appliquer les couleurs

### Validation des connexions
- **Sortie → Entrée** uniquement
- **Types de ports compatibles** (item, fluid, power)
- **Pas de self-loops**
- **Pas de connexions multiples** entre mêmes ports

## 🧪 Tests

```bash
# Exécuter tous les tests
npm run test

# Interface de tests interactive
npm run test:ui

# Tests en mode watch
npm run test -- --watch
```

Les tests couvrent :
- **Moteur de flux** : calculs, conversions d'unités, couleurs
- **Validation** : règles de connexion, détection de doublons
- **Utilitaires** : persistance, import/export

## 🚧 Développement

### Ajout d'un nouveau bloc
1. Créer le fichier dans `src/blocks/base/`
2. Définir le modèle avec ports et métadonnées
3. Ajouter à `src/blocks/index.ts`
4. Tester avec `npm run test`

### Styles et thème
- Variables CSS dans `src/styles/global.css`
- Thème sombre avec couleurs d'accent
- Composants stylés avec classes CSS

### Performance
- **Sélecteurs memoïsés** pour éviter les re-renders
- **Calculs optimisés** avec cache des résultats
- **Sauvegarde throttlée** (500ms)

## 📝 Roadmap

### Fonctionnalités à venir
- [ ] **Multi-sélection** et actions groupées
- [ ] **Menu contextuel** (clic droit)
- [ ] **Alignement automatique** des nœuds
- [ ] **Recettes Satisfactory** complètes
- [ ] **Convoyeurs Mk1/2/3** avec capacités
- [ ] **Fluides** et gestion des pipes
- [ ] **Surcadençage** avec calculs de puissance
- [ ] **Export SVG/PNG** des graphes
- [ ] **Collaboration** en temps réel

### Améliorations techniques
- [ ] **Tests E2E** avec Playwright
- [ ] **Storybook** pour les composants
- [ ] **CI/CD** automatisé
- [ ] **PWA** pour utilisation hors ligne
- [ ] **Plugins** pour blocs personnalisés

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Satisfactory** par Coffee Stain Studios
- **React Flow** pour le canvas nodal
- **Blender** pour l'inspiration de l'interface
- La communauté Satisfactory pour les idées et retours
