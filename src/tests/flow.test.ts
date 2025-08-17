import { describe, it, expect } from 'vitest';
import { toItemsPerMin, fromItemsPerMin, utilToColor, calculateFlows } from '../engine/flow';
import { Node, Edge } from 'reactflow';
import { NodeData } from '../blocks/types';

describe('Flow Engine', () => {
  describe('toItemsPerMin', () => {
    it('should convert items/min to items/min', () => {
      expect(toItemsPerMin(60, 'items/min')).toBe(60);
    });

    it('should convert items/s to items/min', () => {
      expect(toItemsPerMin(1, 'items/s')).toBe(60);
    });

    it('should handle zero values', () => {
      expect(toItemsPerMin(0, 'items/min')).toBe(0);
      expect(toItemsPerMin(0, 'items/s')).toBe(0);
    });
  });

  describe('fromItemsPerMin', () => {
    it('should convert items/min to items/min', () => {
      expect(fromItemsPerMin(60, 'items/min')).toBe(60);
    });

    it('should convert items/min to items/s', () => {
      expect(fromItemsPerMin(60, 'items/s')).toBe(1);
    });

    it('should handle zero values', () => {
      expect(fromItemsPerMin(0, 'items/min')).toBe(0);
      expect(fromItemsPerMin(0, 'items/s')).toBe(0);
    });
  });

  describe('utilToColor', () => {
    it('should return red for 0% utilization', () => {
      expect(utilToColor(0)).toBe('#ff0000');
    });

    it('should return green for 100% utilization', () => {
      expect(utilToColor(100)).toBe('#00ff00');
    });

    it('should return yellow-green for 50% utilization', () => {
      expect(utilToColor(50)).toBe('#808000');
    });

    it('should clamp values between 0 and 100', () => {
      expect(utilToColor(-10)).toBe('#ff0000');
      expect(utilToColor(150)).toBe('#00ff00');
    });
  });

  describe('calculateFlows', () => {
    it('should calculate flows for a simple chain', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: 'source',
          type: 'block',
          position: { x: 0, y: 0 },
          data: {
            model: {
              type: 'Miner',
              name: 'Source',
              inputs: [],
              outputs: [
                {
                  id: 'out-0',
                  name: 'Output',
                  kind: 'item',
                  unit: 'items/min',
                  rate: 60
                }
              ]
            }
          }
        },
        {
          id: 'target',
          type: 'block',
          position: { x: 200, y: 0 },
          data: {
            model: {
              type: 'Smelter',
              name: 'Target',
              inputs: [
                {
                  id: 'in-0',
                  name: 'Input',
                  kind: 'item',
                  unit: 'items/min',
                  rate: 30
                }
              ],
              outputs: []
            }
          }
        }
      ];

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

      const result = calculateFlows(nodes, edges);

      expect(result).toHaveLength(1);
      expect(result[0].data?.flowPerMin).toBe(30);
      expect(result[0].data?.utilizationPct).toBe(50); // 30/60 = 50%
    });

    it('should handle multiple consumers with demand-based distribution', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: 'source',
          type: 'block',
          position: { x: 0, y: 0 },
          data: {
            model: {
              type: 'Miner',
              name: 'Source',
              inputs: [],
              outputs: [
                {
                  id: 'out-0',
                  name: 'Output',
                  kind: 'item',
                  unit: 'items/min',
                  rate: 100
                }
              ]
            }
          }
        },
        {
          id: 'target1',
          type: 'block',
          position: { x: 200, y: 0 },
          data: {
            model: {
              type: 'Smelter',
              name: 'Target1',
              inputs: [
                {
                  id: 'in-0',
                  name: 'Input',
                  kind: 'item',
                  unit: 'items/min',
                  rate: 30
                }
              ],
              outputs: []
            }
          }
        },
        {
          id: 'target2',
          type: 'block',
          position: { x: 200, y: 100 },
          data: {
            model: {
              type: 'Smelter',
              name: 'Target2',
              inputs: [
                {
                  id: 'in-0',
                  name: 'Input',
                  kind: 'item',
                  unit: 'items/min',
                  rate: 80
                }
              ],
              outputs: []
            }
          }
        }
      ];

      const edges: Edge[] = [
        {
          id: 'edge-1',
          source: 'source',
          target: 'target1',
          sourceHandle: 'out-0',
          targetHandle: 'in-0',
          type: 'smoothstep'
        },
        {
          id: 'edge-2',
          source: 'source',
          target: 'target2',
          sourceHandle: 'out-0',
          targetHandle: 'in-0',
          type: 'smoothstep'
        }
      ];

      const result = calculateFlows(nodes, edges);

      expect(result).toHaveLength(2);
      
      // Target2 should get priority (higher demand: 80 vs 30)
      const edge2 = result.find(e => e.id === 'edge-2');
      const edge1 = result.find(e => e.id === 'edge-1');
      
      expect(edge2?.data?.flowPerMin).toBe(80);
      expect(edge1?.data?.flowPerMin).toBe(20); // Remaining capacity: 100 - 80 = 20
    });

    it('should handle zero capacity gracefully', () => {
      const nodes: Node<NodeData>[] = [
        {
          id: 'source',
          type: 'block',
          position: { x: 0, y: 0 },
          data: {
            model: {
              type: 'Miner',
              name: 'Source',
              inputs: [],
              outputs: [
                {
                  id: 'out-0',
                  name: 'Output',
                  kind: 'item',
                  unit: 'items/min',
                  rate: 0
                }
              ]
            }
          }
        },
        {
          id: 'target',
          type: 'block',
          position: { x: 200, y: 0 },
          data: {
            model: {
              type: 'Smelter',
              name: 'Target',
              inputs: [
                {
                  id: 'in-0',
                  name: 'Input',
                  kind: 'item',
                  unit: 'items/min',
                  rate: 30
                }
              ],
              outputs: []
            }
          }
        }
      ];

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

      const result = calculateFlows(nodes, edges);

      expect(result).toHaveLength(1);
      expect(result[0].data?.flowPerMin).toBe(0);
      expect(result[0].data?.utilizationPct).toBe(0);
    });
  });
});
