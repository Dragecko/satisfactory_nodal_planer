import React from 'react';
import { EdgeLabelRenderer, BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import { EdgeData } from '../blocks/types';

/**
 * Composant pour afficher les labels de flow sur les connexions
 */
export default function EdgeLabel({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected
}: EdgeProps<EdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Couleur basée sur l'utilisation
  const getColor = (utilization: number) => {
    if (utilization >= 80) return 'var(--flow-red)'; // Rouge pour haute utilisation
    if (utilization >= 60) return 'var(--flow-orange)'; // Orange pour utilisation moyenne-haute
    if (utilization >= 40) return 'var(--flow-yellow)'; // Jaune pour utilisation moyenne
    return 'var(--flow-green)'; // Vert pour faible utilisation
  };

  const flowColor = data?.utilizationPct ? getColor(data.utilizationPct) : 'var(--text-primary)';
  const flowText = data?.flowPerMin ? `${data.flowPerMin.toFixed(1)}/min` : '0/min';
  const utilText = data?.utilizationPct ? `${data.utilizationPct.toFixed(0)}%` : '0%';

  return (
    <>
      <BaseEdge path={edgePath} style={{ 
        stroke: flowColor, 
        strokeWidth: selected ? 3 : 2,
        opacity: 0.8
      }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: 'all',
            backgroundColor: 'var(--bg-panel)',
            border: `1px solid ${flowColor}`,
            borderRadius: 'var(--radius-sm)',
            padding: '4px 8px',
            color: flowColor,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
          className="nodrag nopan"
        >
          <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600 }}>{flowText}</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>{utilText}</div>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
