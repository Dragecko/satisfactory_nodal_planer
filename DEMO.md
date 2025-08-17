# Démonstration - Satisfactory Nodal Planner

## 🎯 Scénario de démonstration

Cette démonstration vous guide à travers les principales fonctionnalités de l'application en créant une chaîne de production simple : **Miner → Smelter → Assembler**.

## 🚀 Démarrage

1. **Lancer l'application** : `npm run dev`
2. **Ouvrir** `http://localhost:3000`
3. **Vérifier** que l'interface sombre s'affiche avec :
   - Sidebar à gauche avec "Blocs de base"
   - Zone principale vide avec grille
   - Barre d'outils en haut

## 📋 Étapes de démonstration

### 1. Création des nœuds

#### Étape 1.1 : Ajouter un Miner
- **Glisser-déposer** le bloc "Miner" depuis la sidebar vers le canvas
- **Vérifier** que le nœud apparaît avec :
  - Icône ⛏️ et nom "Miner Mk1"
  - 0 entrées (gauche), 1 sortie (droite)
  - Port de sortie "Minerai de fer" (60 items/min)
  - Couleur marron (#8B4513)

#### Étape 1.2 : Ajouter un Smelter
- **Glisser-déposer** le bloc "Smelter" à droite du Miner
- **Vérifier** que le nœud apparaît avec :
  - Icône 🔥 et nom "Smelter"
  - 1 entrée "Minerai de fer" (30 items/min)
  - 1 sortie "Lingot de fer" (30 items/min)
  - Couleur orange (#FF6B35)

#### Étape 1.3 : Ajouter un Assembler
- **Glisser-déposer** le bloc "Assembler" à droite du Smelter
- **Vérifier** que le nœud apparaît avec :
  - Icône ⚙️ et nom "Assembler"
  - 2 entrées : "Plaque de fer" et "Vis"
  - 1 sortie "Plaque renforcée" (5 items/min)
  - Couleur bleue (#4A90E2)

### 2. Connexions et calcul des flux

#### Étape 2.1 : Connecter Miner → Smelter
- **Cliquer** sur le port de sortie du Miner (droite)
- **Glisser** vers le port d'entrée du Smelter (gauche)
- **Vérifier** que la connexion se crée avec :
  - Ligne colorée entre les nœuds
  - Label "30/min • 50%" (flux réel / utilisation)
  - Couleur jaune-vert (50% d'utilisation)

#### Étape 2.2 : Connecter Smelter → Assembler
- **Cliquer** sur le port de sortie du Smelter
- **Glisser** vers le premier port d'entrée du Assembler
- **Vérifier** que la connexion se crée avec :
  - Label "30/min • 100%" (utilisation complète)
  - Couleur verte (100% d'utilisation)

### 3. Édition des nœuds

#### Étape 3.1 : Édition inline
- **Double-clic** sur le nom "Miner Mk1"
- **Taper** "Miner de fer principal"
- **Appuyer** sur Entrée
- **Vérifier** que le nom change

#### Étape 3.2 : Édition de description
- **Double-clic** sur la description du Smelter
- **Taper** "Transforme le minerai en lingots"
- **Appuyer** sur Entrée
- **Vérifier** que la description change

#### Étape 3.3 : Panneau de propriétés
- **Sélectionner** le nœud Assembler
- **Cliquer** sur "⚙️ Propriétés" dans la barre d'outils
- **Vérifier** que le panneau s'ouvre à droite avec :
  - Section "Général" (nom, description, type)
  - Section "Entrées" (2 ports)
  - Section "Sorties" (1 port)
  - Section "Performance" (surcadençage, puissance)
  - Section "Style" (couleur, icône)

### 4. Modification des ports

#### Étape 4.1 : Ajouter une entrée
- Dans le panneau de propriétés du Assembler
- **Cliquer** sur "+" dans la section "Entrées"
- **Vérifier** qu'une nouvelle entrée apparaît
- **Éditer** le nom en "Vis supplémentaires"

#### Étape 4.2 : Modifier un débit
- **Cliquer** sur l'icône ✏️ d'une entrée
- **Changer** le débit de 22.5 à 45 items/min
- **Cliquer** sur ✓ pour sauvegarder
- **Vérifier** que les flux se recalculent automatiquement

### 5. Modèles personnalisés

#### Étape 5.1 : Sauvegarder un modèle
- **Sélectionner** le nœud Assembler modifié
- **Cliquer** sur "💾 Modèle" dans la barre d'outils
- **Taper** "Assembler personnalisé" et valider
- **Vérifier** que le modèle apparaît dans "Bibliothèque personnalisée"

#### Étape 5.2 : Utiliser le modèle
- **Glisser-déposer** le modèle "Assembler personnalisé" vers le canvas
- **Vérifier** que le nouveau nœud a les mêmes propriétés

### 6. Historique et undo/redo

#### Étape 6.1 : Test d'annulation
- **Supprimer** un nœud (sélectionner + Del)
- **Cliquer** sur "↩️ Annuler"
- **Vérifier** que le nœud réapparaît

#### Étape 6.2 : Test de rétablissement
- **Cliquer** sur "↪️ Rétablir"
- **Vérifier** que le nœud disparaît à nouveau

### 7. Import/Export

#### Étape 7.1 : Export du graphe
- **Cliquer** sur "📤 Exporter" dans la barre d'outils
- **Taper** "demo-chaine-fer" et valider
- **Vérifier** que le fichier JSON se télécharge

#### Étape 7.2 : Import du graphe
- **Cliquer** sur "🗑️ Effacer" pour vider le canvas
- **Cliquer** sur "📥 Importer"
- **Sélectionner** le fichier JSON exporté
- **Vérifier** que le graphe se recharge

### 8. Statistiques

#### Étape 8.1 : Observer les statistiques
- **Regarder** la barre d'outils en haut à droite
- **Vérifier** les compteurs :
  - 📦 3 (nœuds)
  - 🔗 2 (connexions)
  - 🏭 3 (types de blocs)
  - ⚡ 65 (flux total en items/min)
  - ⚡ 23.0 (puissance totale en MW)

## 🎨 Fonctionnalités visuelles

### Couleurs dynamiques
- **Rouge** : 0% d'utilisation (pas de flux)
- **Jaune** : 50% d'utilisation (flux partiel)
- **Vert** : 100% d'utilisation (flux complet)

### Interface responsive
- **Redimensionner** la fenêtre pour voir l'adaptation
- **Zoom** avec la molette de souris
- **Pan** en maintenant le clic gauche
- **Mini-carte** en bas à droite pour la navigation

### Validation des connexions
- **Essayer** de connecter une entrée à une entrée → Rejeté
- **Essayer** de connecter une sortie à une sortie → Rejeté
- **Essayer** de connecter un nœud à lui-même → Rejeté

## 🔧 Fonctionnalités avancées

### Sauvegarde automatique
- **Fermer** l'onglet du navigateur
- **Rouvrir** l'application
- **Vérifier** que le graphe se recharge automatiquement

### Raccourcis clavier
- **Del** : Supprimer le nœud sélectionné
- **Ctrl+Z** : Annuler
- **Ctrl+Y** : Rétablir

### Performance
- **Ajouter** plusieurs nœuds (10+)
- **Vérifier** que l'interface reste fluide
- **Observer** que les calculs de flux sont instantanés

## 🎯 Points de démonstration clés

1. **Interface intuitive** : Glisser-déposer, édition inline
2. **Calculs automatiques** : Flux, utilisation, couleurs
3. **Validation robuste** : Connexions, types de ports
4. **Persistance** : Sauvegarde automatique, modèles personnalisés
5. **Performance** : Interface fluide, calculs rapides
6. **Extensibilité** : Architecture modulaire, types TypeScript

## 🚀 Prochaines étapes

Après cette démonstration, vous pouvez explorer :
- **Ajout de nouveaux blocs** dans `src/blocks/base/`
- **Modification des styles** dans `src/styles/global.css`
- **Tests unitaires** avec `npm run test`
- **Build de production** avec `npm run build`

---

*Cette démonstration couvre les fonctionnalités principales. L'application est conçue pour être extensible et peut être adaptée à d'autres jeux de gestion d'usine.*
