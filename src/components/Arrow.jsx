import React from 'react';
import { calculateArrowPath } from '../utils/arrowPath';

export default function Arrow({ arrow, fromShape, toShape, onSelect, isSelected, zoom }) {
  if (!fromShape || !toShape) return null;
  
  const path = calculateArrowPath(fromShape, toShape);
  
  if (!path) return null;
  
  const pathId = `arrow-${arrow.id}`;
  
  const getMidpoint = () => {
    const parts = path.match(/M\s*([\d.]+),([\d.]+)\s*C\s*([\d.]+),([\d.]+)\s*([\d.]+),([\d.]+)\s*([\d.]+),([\d.]+)/);
    if (!parts) return { x: 0, y: 0 };
    
    const [, x1, , , , , x2] = parts.map(Number);
    return { x: (x1 + x2) / 2, y: fromShape.y + fromShape.height / 2 };
  };

  const midpoint = getMidpoint();
  
  const getStrokeDasharray = () => {
    switch (arrow.style) {
      case 'dashed': return '8,4';
      case 'dotted': return '2,4';
      default: return 'none';
    }
  };

  const getArrowColor = () => {
    if (isSelected) return '#4A9EFF';
    if (arrow.color === '#AAAAAA' || !arrow.color) return 'rgba(140, 100, 255, 0.6)';
    const hex = arrow.color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  };

  const renderArrowhead = () => {
    if (arrow.arrowHead === 'none') return null;
    
    return (
      <defs>
        <marker
          id={pathId}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={getArrowColor()} />
        </marker>
        {arrow.arrowHead === 'both' && (
          <marker
            id={`${pathId}-start`}
            markerWidth="10"
            markerHeight="10"
            refX="1"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M9,0 L9,6 L0,3 z" fill={getArrowColor()} />
          </marker>
        )}
      </defs>
    );
  };

  return (
    <g onClick={(e) => { e.stopPropagation(); onSelect(arrow.id); }}>
      <path
        d={path}
        fill="none"
        stroke={getArrowColor()}
        strokeWidth={arrow.strokeWidth}
        strokeDasharray={getStrokeDasharray()}
        markerEnd={arrow.arrowHead !== 'none' ? `url(#${pathId})` : undefined}
        markerStart={arrow.arrowHead === 'both' ? `url(#${pathId}-start)` : undefined}
      />
      
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
      />
      
      {renderArrowhead()}
      
      {arrow.label && (
        <g>
          <rect
            x={midpoint.x - 20}
            y={midpoint.y - 10}
            width={40}
            height={20}
            fill="rgba(140, 100, 255, 0.15)"
            stroke="rgba(140, 100, 255, 0.3)"
            strokeWidth={1}
            rx={4}
          />
          <text
            x={midpoint.x}
            y={midpoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255, 255, 255, 0.85)"
            fontSize={11}
          >
            {arrow.label}
          </text>
        </g>
      )}
    </g>
  );
}