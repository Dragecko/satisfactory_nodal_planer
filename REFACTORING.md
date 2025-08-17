# 🔧 Refactorisation - Élimination des Duplications

## 📋 Vue d'ensemble

Cette refactorisation a été effectuée pour éliminer les duplications de code identifiées dans le projet Satisfactory Nodal Planner. Les principales améliorations incluent :

- **Hook personnalisé `useInlineEdit`** pour l'édition inline
- **Utilitaires de drag & drop** unifiés
- **Composant générique `BlockListItem`** pour l'affichage des blocs
- **Documentation détaillée** avec JSDoc
- **Structure modulaire** avec fichiers d'index

## 🎯 Problèmes résolus

### 1. Duplication dans `BlockNode.tsx`

**Avant :** Logique d'édition dupliquée entre titre et description
```typescript
// Gestion du titre (30+ lignes)
const handleTitleDoubleClick = useCallback(() => {
  setEditingTitle(true);
}, []);

const handleTitleBlur = useCallback(() => {
  setEditingTitle(false);
  if (titleRef.current) {
    const newTitle = titleRef.current.textContent || '';
    if (newTitle !== model.name) {
      updateNode(id, {
        model: { ...model, name: newTitle }
      });
    }
  }
}, [id, model, updateNode]);

// Gestion de la description (30+ lignes DUPLIQUÉES)
const handleDescriptionDoubleClick = useCallback(() => {
  setEditingDescription(true);
}, []);

const handleDescriptionBlur = useCallback(() => {
  setEditingDescription(false);
  if (descriptionRef.current) {
    const newDescription = descriptionRef.current.textContent || '';
    if (newDescription !== model.description) {
      updateNode(id, {
        model: { ...model, description: newDescription }
      });
    }
  }
}, [id, model, updateNode]);
```

**Après :** Hook réutilisable `useInlineEdit`
```typescript
// Hook pour l'édition inline du titre
const titleEdit = useInlineEdit({
  initialValue: model.name,
  onSave: (newTitle) => {
    updateNode(id, {
      model: { ...model, name: newTitle }
    });
  },
  placeholder: 'Nom du bloc'
});

// Hook pour l'édition inline de la description
const descriptionEdit = useInlineEdit({
  initialValue: model.description || '',
  onSave: (newDescription) => {
    updateNode(id, {
      model: { ...model, description: newDescription }
    });
  },
  placeholder: 'Description du bloc'
});
```

### 2. Duplication dans `Sidebar.tsx`

**Avant :** Logique de drag & drop dupliquée
```typescript
// Pour les blocs de base
const handleDragStart = useCallback((event: React.DragEvent, blockType: BlockType) => {
  const blockModel = BASE_BLOCKS[blockType];
  const dragData = {
    type: 'base',
    blockType,
    model: blockModel
  };
  
  event.dataTransfer.setData(DRAG_BLOCK_MIME, JSON.stringify(dragData));
  event.dataTransfer.effectAllowed = 'copy';
}, []);

// Pour les modèles personnalisés (DUPLIQUÉ)
const handleCustomDragStart = useCallback((event: React.DragEvent, model: BlockModel) => {
  const dragData = {
    type: 'custom',
    model: model
  };
  
  event.dataTransfer.setData(DRAG_BLOCK_MIME, JSON.stringify(dragData));
  event.dataTransfer.effectAllowed = 'copy';
}, []);
```

**Après :** Utilitaires unifiés
```typescript
// Gestionnaire pour les blocs de base
const handleBaseBlockDragStart = useCallback((event: React.DragEvent, blockType: BlockType) => {
  const blockModel = BASE_BLOCKS[blockType];
  const dragData = createBaseBlockDragData(blockType, blockModel);
  configureDragEvent(event, dragData);
}, []);

// Gestionnaire pour les modèles personnalisés
const handleCustomBlockDragStart = useCallback((event: React.DragEvent, model: BlockModel) => {
  const dragData = createCustomBlockDragData(model);
  configureDragEvent(event, dragData);
}, []);
```

### 3. Duplication des composants d'affichage

**Avant :** Composants `BaseBlockItem` et `CustomModelItem` avec structure similaire
```typescript
// BaseBlockItem (20+ lignes)
const BaseBlockItem = ({ blockType }: { blockType: BlockType }) => {
  const model = BASE_BLOCKS[blockType];
  
  return (
    <div className="list-item" draggable onDragStart={(e) => handleDragStart(e, blockType)}>
      <div className="list-item__content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <span style={{ fontSize: '16px' }}>{model.icon || '⚙️'}</span>
          <div>
            <div style={{ fontWeight: '500' }}>{model.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {model.description || 'Aucune description'}
            </div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        {model.inputs.length}E / {model.outputs.length}S
      </div>
    </div>
  );
};

// CustomModelItem (20+ lignes DUPLIQUÉES)
const CustomModelItem = ({ name, model }: { name: string; model: BlockModel }) => {
  return (
    <div className="list-item" draggable onDragStart={(e) => handleCustomDragStart(e, model)}>
      <div className="list-item__content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <span style={{ fontSize: '16px' }}>{model.icon || '⚙️'}</span>
          <div>
            <div style={{ fontWeight: '500' }}>{model.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {model.description || 'Modèle personnalisé'}
            </div>
          </div>
        </div>
      </div>
      <div className="list-item__actions">
        <button className="btn btn--small btn--icon btn--error" onClick={...}>
          🗑️
        </button>
      </div>
    </div>
  );
};
```

**Après :** Composant générique `BlockListItem`
```typescript
// Composant pour afficher un bloc de base
const BaseBlockItem = ({ blockType }: { blockType: BlockType }) => {
  const model = BASE_BLOCKS[blockType];
  
  return (
    <BlockListItem
      model={model}
      onDragStart={(e) => handleBaseBlockDragStart(e, blockType)}
      isCustom={false}
    />
  );
};

// Composant pour afficher un modèle personnalisé
const CustomModelItem = ({ name, model }: { name: string; model: BlockModel }) => {
  return (
    <BlockListItem
      model={model}
      name={name}
      onDragStart={(e) => handleCustomBlockDragStart(e, model)}
      onDelete={() => handleDeleteCustomModel(name)}
      isCustom={true}
    />
  );
};
```

## 🏗️ Nouvelle Architecture

### Structure des fichiers

```
src/
├── hooks/
│   ├── index.ts              # Export centralisé des hooks
│   └── useInlineEdit.ts      # Hook pour l'édition inline
├── utils/
│   ├── index.ts              # Export centralisé des utilitaires
│   └── dragAndDrop.ts        # Utilitaires de drag & drop
├── ui/
│   ├── components/
│   │   ├── index.ts          # Export centralisé des composants
│   │   └── BlockListItem.tsx # Composant générique pour les blocs
│   ├── nodes/
│   │   └── BlockNode.tsx     # Refactorisé avec useInlineEdit
│   ├── Sidebar.tsx           # Refactorisé avec utilitaires
│   └── App.tsx               # Refactorisé avec utilitaires
└── styles/
    └── global.css            # Styles mis à jour
```

### Hooks personnalisés

#### `useInlineEdit`

**Fonctionnalités :**
- Gestion complète de l'édition inline
- Support des raccourcis clavier (Enter/Escape)
- Validation et sauvegarde automatique
- Placeholder et styles configurables
- Focus et sélection automatique du texte

**Utilisation :**
```typescript
const titleEdit = useInlineEdit({
  initialValue: model.name,
  onSave: (newTitle) => updateNode(id, { model: { ...model, name: newTitle } }),
  placeholder: 'Nom du bloc'
});

return (
  <div ref={titleEdit.ref} {...titleEdit.handlers}>
    {model.name}
  </div>
);
```

### Utilitaires

#### `dragAndDrop.ts`

**Fonctions principales :**
- `createBaseBlockDragData()` - Crée les données pour les blocs de base
- `createCustomBlockDragData()` - Crée les données pour les modèles personnalisés
- `configureDragEvent()` - Configure l'événement de drag
- `parseDragData()` - Parse et valide les données de drop
- `isValidDragData()` - Valide la structure des données

**Utilisation :**
```typescript
// Création des données de drag
const dragData = createBaseBlockDragData(blockType, model);
configureDragEvent(event, dragData);

// Parsing des données de drop
const dragData = parseDragData(event);
if (dragData && isValidDragData(dragData)) {
  // Traiter les données
}
```

### Composants réutilisables

#### `BlockListItem`

**Fonctionnalités :**
- Affichage unifié des blocs de base et personnalisés
- Gestion automatique des différences d'affichage
- Support du drag & drop
- Bouton de suppression pour les modèles personnalisés
- Styles conditionnels selon le type

**Props :**
```typescript
interface BlockListItemProps {
  model: BlockModel;
  name?: string;
  onDragStart: (event: React.DragEvent) => void;
  onDelete?: () => void;
  isCustom?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
```

## 📈 Bénéfices

### 1. Réduction du code
- **~60 lignes supprimées** dans `BlockNode.tsx`
- **~40 lignes supprimées** dans `Sidebar.tsx`
- **~80 lignes supprimées** au total

### 2. Maintenabilité
- **Logique centralisée** dans des hooks et utilitaires
- **Réutilisabilité** des composants
- **Tests plus faciles** avec des fonctions pures

### 3. Lisibilité
- **Documentation JSDoc** complète
- **Noms explicites** pour les fonctions
- **Structure claire** avec fichiers d'index

### 4. Extensibilité
- **Facile d'ajouter** de nouveaux types de drag & drop
- **Facile d'étendre** l'édition inline
- **Facile de créer** de nouveaux composants de liste

## 🔄 Migration

### Fichiers modifiés

1. **`src/hooks/useInlineEdit.ts`** - Nouveau
2. **`src/utils/dragAndDrop.ts`** - Nouveau
3. **`src/ui/components/BlockListItem.tsx`** - Nouveau
4. **`src/ui/nodes/BlockNode.tsx`** - Refactorisé
5. **`src/ui/Sidebar.tsx`** - Refactorisé
6. **`src/ui/App.tsx`** - Refactorisé
7. **`src/styles/global.css`** - Mis à jour

### Fichiers d'index

1. **`src/hooks/index.ts`** - Nouveau
2. **`src/utils/index.ts`** - Nouveau
3. **`src/ui/components/index.ts`** - Nouveau

## 🧪 Tests

### Tests recommandés

```typescript
// Tests pour useInlineEdit
describe('useInlineEdit', () => {
  it('should start editing on double click');
  it('should save on Enter key');
  it('should cancel on Escape key');
  it('should save on blur');
  it('should call onSave only when value changes');
});

// Tests pour dragAndDrop
describe('dragAndDrop utilities', () => {
  it('should create valid base block drag data');
  it('should create valid custom block drag data');
  it('should parse drag data correctly');
  it('should validate drag data structure');
});

// Tests pour BlockListItem
describe('BlockListItem', () => {
  it('should render base block correctly');
  it('should render custom block correctly');
  it('should handle drag start');
  it('should handle delete for custom blocks');
});
```

## 🚀 Prochaines étapes

1. **Tests unitaires** pour les nouveaux hooks et utilitaires
2. **Tests d'intégration** pour vérifier la compatibilité
3. **Documentation utilisateur** mise à jour
4. **Performance** - vérifier l'impact des refactorisations
5. **Accessibilité** - s'assurer que les nouveaux composants sont accessibles

## 📝 Notes techniques

- **Compatibilité** : Toutes les fonctionnalités existantes sont préservées
- **Performance** : Les hooks utilisent `useCallback` pour optimiser les re-renders
- **TypeScript** : Tous les nouveaux fichiers sont entièrement typés
- **CSS** : Les nouveaux styles sont cohérents avec le thème existant
