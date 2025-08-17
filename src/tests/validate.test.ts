import { describe, it, expect } from 'vitest';
import { validateConnection, isConnectionDuplicate } from '../engine/validate';
import { Node, Edge } from 'reactflow';
import { NodeData } from '../blocks/types';

describe('Validation Engine', () => {
  const createTestNode = (id: string, inputs: any[] = [], outputs: any[] = []): Node<NodeData> => ({
    id,
    type: 'block',
    position: { x: 0, y: 0 },
    data: {
      model: {
        type: 'Miner',
        name: `Node ${id}`,
        inputs,
        outputs
      }
    }
  });

  describe('validateConnection', () => {
    it('should accept valid out->in connection', () => {
      const sourceNode = createTestNode('source', [], [
        { id: 'out-0', name: 'Output', kind: 'item', unit: 'items/min', rate: 60 }
      ]);
      
      const targetNode = createTestNode('target', [
        { id: 'in-0', name: 'Input', kind: 'item', unit: 'items/min', rate: 30 }
      ], []);

      const result = validateConnection(sourceNode, targetNode, 'out-0', 'in-0');

      expect(result.isValid).toBe(true);
    });

    it('should reject in->in connection', () => {
      const sourceNode = createTestNode('source', [
        { id: 'in-0', name: 'Input', kind: 'item', unit: 'items/min', rate: 30 }
      ], []);
      
      const targetNode = createTestNode('target', [
        { id: 'in-0', name: 'Input', kind: 'item', unit: 'items/min', rate: 30 }
      ], []);

      const result = validateConnection(sourceNode, targetNode, 'in-0', 'in-0');

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('sortie');
    });

    it('should reject out->out connection', () => {
      const sourceNode = createTestNode('source', [], [
        { id: 'out-0', name: 'Output', kind: 'item', unit: 'items/min', rate: 60 }
      ]);
      
      const targetNode = createTestNode('target', [], [
        { id: 'out-0', name: 'Output', kind: 'item', unit: 'items/min', rate: 60 }
      ]);

      const result = validateConnection(sourceNode, targetNode, 'out-0', 'out-0');

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('entrée');
    });

    it('should reject self-loop', () => {
      const node = createTestNode('node', [
        { id: 'in-0', name: 'Input', kind: 'item', unit: 'items/min', rate: 30 }
      ], [
        { id: 'out-0', name: 'Output', kind: 'item', unit: 'items/min', rate: 60 }
      ]);

      const result = validateConnection(node, node, 'out-0', 'in-0');

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('soi-même');
    });

    it('should reject connection with missing handles', () => {
      const sourceNode = createTestNode('source', [], [
        { id: 'out-0', name: 'Output', kind: 'item', unit: 'items/min', rate: 60 }
      ]);
      
      const targetNode = createTestNode('target', [
        { id: 'in-0', name: 'Input', kind: 'item', unit: 'items/min', rate: 30 }
      ], []);

      const result = validateConnection(sourceNode, targetNode, null, 'in-0');

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Handles manquants');
    });

    it('should reject connection with invalid handle format', () => {
      const sourceNode = createTestNode('source', [], [
        { id: 'out-0', name: 'Output', kind: 'item', unit: 'items/min', rate: 60 }
      ]);
      
      const targetNode = createTestNode('target', [
        { id: 'in-0', name: 'Input', kind: 'item', unit: 'items/min', rate: 30 }
      ], []);

      const result = validateConnection(sourceNode, targetNode, 'invalid-0', 'in-0');

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('sortie');
    });

    it('should reject connection with non-existent ports', () => {
      const sourceNode = createTestNode('source', [], [
        { id: 'out-0', name: 'Output', kind: 'item', unit: 'items/min', rate: 60 }
      ]);
      
      const targetNode = createTestNode('target', [
        { id: 'in-0', name: 'Input', kind: 'item', unit: 'items/min', rate: 30 }
      ], []);

      const result = validateConnection(sourceNode, targetNode, 'out-1', 'in-0');

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Ports inexistants');
    });

    it('should reject connection with incompatible port types', () => {
      const sourceNode = createTestNode('source', [], [
        { id: 'out-0', name: 'Output', kind: 'item', unit: 'items/min', rate: 60 }
      ]);
      
      const targetNode = createTestNode('target', [
        { id: 'in-0', name: 'Input', kind: 'fluid', unit: 'items/min', rate: 30 }
      ], []);

      const result = validateConnection(sourceNode, targetNode, 'out-0', 'in-0');

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Types incompatibles');
    });

    it('should accept connection with compatible port types', () => {
      const sourceNode = createTestNode('source', [], [
        { id: 'out-0', name: 'Output', kind: 'item', unit: 'items/min', rate: 60 }
      ]);
      
      const targetNode = createTestNode('target', [
        { id: 'in-0', name: 'Input', kind: 'item', unit: 'items/min', rate: 30 }
      ], []);

      const result = validateConnection(sourceNode, targetNode, 'out-0', 'in-0');

      expect(result.isValid).toBe(true);
    });
  });

  describe('isConnectionDuplicate', () => {
    it('should detect duplicate connections', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'source',
          target: 'target',
          sourceHandle: 'out-0',
          targetHandle: 'in-0',
          type: 'smoothstep'
        }
      ];

      const isDuplicate = isConnectionDuplicate(
        edges,
        'source',
        'target',
        'out-0',
        'in-0'
      );

      expect(isDuplicate).toBe(true);
    });

    it('should not detect non-duplicate connections', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'source',
          target: 'target',
          sourceHandle: 'out-0',
          targetHandle: 'in-0',
          type: 'smoothstep'
        }
      ];

      const isDuplicate = isConnectionDuplicate(
        edges,
        'source',
        'target',
        'out-0',
        'in-1'
      );

      expect(isDuplicate).toBe(false);
    });

    it('should not detect connections with different source/target', () => {
      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'source1',
          target: 'target1',
          sourceHandle: 'out-0',
          targetHandle: 'in-0',
          type: 'smoothstep'
        }
      ];

      const isDuplicate = isConnectionDuplicate(
        edges,
        'source2',
        'target2',
        'out-0',
        'in-0'
      );

      expect(isDuplicate).toBe(false);
    });

    it('should handle empty edges array', () => {
      const edges: Edge[] = [];

      const isDuplicate = isConnectionDuplicate(
        edges,
        'source',
        'target',
        'out-0',
        'in-0'
      );

      expect(isDuplicate).toBe(false);
    });
  });
});
