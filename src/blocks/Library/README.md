# Bibliothèque de Blocs Personnalisés

Ce dossier contient tous les blocs personnalisés créés par l'utilisateur.

## Structure

- `index.ts` - Export centralisé de tous les blocs personnalisés
- `*.ts` - Fichiers individuels pour chaque bloc personnalisé

## Format d'un bloc personnalisé

Chaque fichier doit exporter un objet `BlockModel` par défaut :

```typescript
import { BlockModel } from '../types';

const MonBlocPersonnalise: BlockModel = {
  type: 'Assembler',
  name: 'Mon Bloc Personnalisé',
  description: 'Description du bloc',
  inputs: [
    {
      id: 'input-1',
      name: 'Entrée 1',
      kind: 'item',
      unit: 'items/min',
      rate: 60
    }
  ],
  outputs: [
    {
      id: 'output-1',
      name: 'Sortie 1', 
      kind: 'item',
      unit: 'items/min',
      rate: 30
    }
  ],
  overclockPct: 100,
  powerEstimateMW: 4.0,
  color: '#4a9eff',
  icon: '⚙️'
};

export default MonBlocPersonnalise;
```

## Gestion automatique

Les blocs sont automatiquement :
- Créés lors de la sauvegarde depuis l'interface
- Supprimés lors de la suppression depuis l'interface
- Chargés au démarrage de l'application

## Partage

Pour partager un bloc personnalisé, il suffit de copier le fichier `.ts` correspondant.
