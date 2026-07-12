import React, { useState, useRef, useEffect } from 'react';

export default function Shape({ 
  shape, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onStartDrag,
  onDrag,
  onEndDrag,
  onStartResize,
  onResize,
  onEndResize,
  showConnectionDots,
  onConnectionClick,
  zoom
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const groupRef = useRef(null);
  
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    onSelect(shape.id, e.shiftKey);
    
    if (!isResizing) {
      setIsDragging(true);
      onStartDrag(shape.id, e.clientX, e.clientY);
    }
  };
  
  const handleResizeStart = (e, handle) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    onStartResize(shape.id, handle, e.clientX, e.clientY);
  };
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        onDrag(shape.id, e.clientX, e.clientY);
      } else if (isResizing) {
        onResize(shape.id, resizeHandle, e.clientX, e.clientY);
      }
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onEndDrag();
      }
      if (isResizing) {
        setIsResizing(false);
        setResizeHandle(null);
        onEndResize();
      }
    };
    
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeHandle, shape.id]);
  
  const renderShape = () => {
    const { type, x, y, width, height, fillColor, strokeColor, strokeWidth, label, textColor, fontSize, fontBold, fontItalic, opacity, shapeStyle, labelPosition } = shape;
    
    const getTextPosition = () => {
      const pos = labelPosition || 'center';
      switch (pos) {
        case 'top': return { x: x + width / 2, y: y + fontSize + 12 };
        case 'bottom': return { x: x + width / 2, y: y + height - 12 };
        case 'inside': return { x: x + width / 2, y: y + height / 2 };
        case 'center': default: return { x: x + width / 2, y: y + height / 2 };
      }
    };
    
    const textPos = getTextPosition();
    const textStyle = {
      fill: textColor || '#FFFFFF',
      fontSize: `${fontSize}px`,
      fontWeight: fontBold ? '700' : '600',
      fontStyle: fontItalic ? 'italic' : 'normal',
      fontFamily: 'inherit',
      letterSpacing: '0.01em',
      textAnchor: 'middle',
      dominantBaseline: 'middle',
      paintOrder: 'stroke',
      stroke: textColor === '#FFFFFF' || !textColor ? 'rgba(0,0,0,0.15)' : 'transparent',
      strokeWidth: '0.5px',
      pointerEvents: 'none'
    };
    
    const getCornerRadius = () => {
      const style = shapeStyle || 'rect';
      switch (style) {
        case 'rounded': return 18;
        case 'circle': return width / 2;
        case 'diamond': return 0;
        case 'rect': default: return 12;
      }
    };
    
    const borderRadius = getCornerRadius();
    
    const getGlassColor = (color, alpha = 0.08) => {
      if (!color || color === 'transparent') {
        return `rgba(140, 100, 255, ${alpha})`;
      }
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    const glassFill = getGlassColor(fillColor, 0.08);
    const parseHexColor = (color) => {
      if (!color || color === 'transparent' || color.startsWith('rgba')) return null;
      const hex = color.replace('#', '');
      const parts = hex.match(/.{2}/g);
      if (!parts) return null;
      return parts.map(h => parseInt(h, 16));
    };
    const rgb = parseHexColor(strokeColor);
    const glassStroke = rgb ? `rgba(${rgb.join(',')}, 0.25)` : 'rgba(255, 255, 255, 0.12)';
    
    switch (type) {
      case 'rect':
        return (
          <g>
            <defs>
              <filter id={`glass-glow-${shape.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
                <feFlood floodColor="#8C64FF" floodOpacity="0.3" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id={`glass-grad-${shape.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)"/>
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)"/>
              </linearGradient>
            </defs>
            {shapeStyle === 'diamond' ? (
              <polygon
                points={`${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`}
                fill={glassFill}
                stroke={glassStroke}
                strokeWidth={strokeWidth || 1}
                opacity={opacity || 1}
                filter={`url(#glass-glow-${shape.id})`}
              />
            ) : shapeStyle === 'circle' ? (
              <ellipse
                cx={x + width / 2}
                cy={y + height / 2}
                rx={width / 2}
                ry={height / 2}
                fill={glassFill}
                stroke={glassStroke}
                strokeWidth={strokeWidth || 1}
                opacity={opacity || 1}
                filter={`url(#glass-glow-${shape.id})`}
              />
            ) : (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={borderRadius}
                fill={glassFill}
                stroke={glassStroke}
                strokeWidth={strokeWidth || 1}
                opacity={opacity || 1}
                filter={`url(#glass-glow-${shape.id})`}
              />
            )}
            <text x={textPos.x} y={textPos.y} style={textStyle}>
              {label}
            </text>
          </g>
        );
      
      case 'circle':
        return (
          <g>
            <defs>
              <filter id={`glass-glow-${shape.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
                <feFlood floodColor="#8C64FF" floodOpacity="0.3" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <ellipse
              cx={x + width / 2}
              cy={y + height / 2}
              rx={width / 2}
              ry={height / 2}
              fill={glassFill}
              stroke={glassStroke}
              strokeWidth={strokeWidth || 1}
              opacity={opacity || 1}
              filter={`url(#glass-glow-${shape.id})`}
            />
            <text x={textPos.x} y={textPos.y} style={textStyle}>
              {label}
            </text>
          </g>
        );
      
      case 'text':
        return (
          <text x={textPos.x} y={textPos.y} style={textStyle}>
            {label}
          </text>
        );
      
      case 'sticky':
        return (
          <g>
            <defs>
              <filter id={`glass-glow-${shape.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
                <feFlood floodColor="#F5A623" floodOpacity="0.25" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={6}
              fill={getGlassColor(fillColor, 0.12)}
              stroke={glassStroke}
              strokeWidth={strokeWidth || 1}
              opacity={opacity || 1}
              filter={`url(#glass-glow-${shape.id})`}
            />
            <text 
              x={textPos.x} 
              y={textPos.y} 
              style={textStyle}
              fontSize={`${fontSize}px`}
            >
              {label}
            </text>
          </g>
        );
      
      case 'diamond':
        return (
          <g>
            <defs>
              <filter id={`glass-glow-${shape.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
                <feFlood floodColor="#8C64FF" floodOpacity="0.3" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <polygon
              points={`${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`}
              fill={glassFill}
              stroke={glassStroke}
              strokeWidth={strokeWidth || 1}
              opacity={opacity || 1}
              filter={`url(#glass-glow-${shape.id})`}
            />
            <text x={textPos.x} y={textPos.y} style={textStyle}>
              {label}
            </text>
          </g>
        );
      
      case 'hexagon':
        return (
          <g>
            <defs>
              <filter id={`glass-glow-${shape.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
                <feFlood floodColor="#8C64FF" floodOpacity="0.3" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <polygon
              points={`${x + width * 0.25},${y} ${x + width * 0.75},${y} ${x + width},${y + height / 2} ${x + width * 0.75},${y + height} ${x + width * 0.25},${y + height} ${x},${y + height / 2}`}
              fill={glassFill}
              stroke={glassStroke}
              strokeWidth={strokeWidth || 1}
              opacity={opacity || 1}
              filter={`url(#glass-glow-${shape.id})`}
            />
            <text x={textPos.x} y={textPos.y} style={textStyle}>
              {label}
            </text>
          </g>
        );
      
      case 'cloud':
        return (
          <g>
            <defs>
              <filter id={`glass-glow-${shape.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
                <feFlood floodColor="#8C64FF" floodOpacity="0.3" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <ellipse cx={x + width * 0.3} cy={y + height * 0.4} rx={width * 0.25} ry={height * 0.35} fill={glassFill} stroke={glassStroke} strokeWidth={strokeWidth || 1} opacity={opacity || 1} filter={`url(#glass-glow-${shape.id})`}/>
            <ellipse cx={x + width * 0.7} cy={y + height * 0.4} rx={width * 0.25} ry={height * 0.35} fill={glassFill} stroke={glassStroke} strokeWidth={strokeWidth || 1} opacity={opacity || 1} filter={`url(#glass-glow-${shape.id})`}/>
            <ellipse cx={x + width * 0.5} cy={y + height * 0.35} rx={width * 0.3} ry={height * 0.4} fill={glassFill} stroke={glassStroke} strokeWidth={strokeWidth || 1} opacity={opacity || 1} filter={`url(#glass-glow-${shape.id})`}/>
            <text x={textPos.x} y={textPos.y} style={textStyle}>
              {label}
            </text>
          </g>
        );
      
      case 'cylinder':
        return (
          <g>
            <defs>
              <filter id={`glass-glow-${shape.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
                <feFlood floodColor="#8C64FF" floodOpacity="0.3" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <ellipse id={`cyl-top-${shape.id}`} cx={x + width / 2} cy={y + 10} rx={width / 2} ry={10}/>
            </defs>
            <path
              d={`M${x},${y + 10} L${x},${y + height - 10} Q${x},${y + height} ${x + width / 2},${y + height} Q${x + width},${y + height} ${x + width},${y + height - 10} L${x + width},${y + 10} Q${x + width},${y} ${x + width / 2},${y} Q${x},${y} ${x},${y + 10}`}
              fill={glassFill}
              stroke={glassStroke}
              strokeWidth={strokeWidth || 1}
              opacity={opacity || 1}
              filter={`url(#glass-glow-${shape.id})`}
            />
            <ellipse cx={x + width / 2} cy={y + 10} rx={width / 2} ry={10} fill={glassFill} stroke={glassStroke} strokeWidth={strokeWidth || 1} opacity={opacity || 1}/>
            <text x={textPos.x} y={textPos.y + height * 0.15} style={textStyle}>
              {label}
            </text>
          </g>
        );
      
      default:
        return null;
    }
  };
  
  const renderSelection = () => {
    if (!isSelected) return null;
    
    const cornerHandles = [
      { x: shape.x, y: shape.y, cursor: 'nw-resize', pos: 'nw' },
      { x: shape.x + shape.width, y: shape.y, cursor: 'ne-resize', pos: 'ne' },
      { x: shape.x, y: shape.y + shape.height, cursor: 'sw-resize', pos: 'sw' },
      { x: shape.x + shape.width, y: shape.y + shape.height, cursor: 'se-resize', pos: 'se' }
    ];
    
    return (
      <g>
        <defs>
          <filter id={`selection-shadow-${shape.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>
        {cornerHandles.map((h, i) => (
          <circle
            key={i}
            cx={h.x}
            cy={h.y}
            r={4}
            fill="white"
            stroke="#4A9EFF"
            strokeWidth={1.5}
            filter={`url(#selection-shadow-${shape.id})`}
            style={{ cursor: h.cursor }}
            onMouseDown={(e) => handleResizeStart(e, h.pos)}
          />
        ))}
      </g>
    );
  };
  
  const renderConnectionDots = () => {
    if (!showConnectionDots) return null;
    
    const midX = shape.x + shape.width / 2;
    const midY = shape.y + shape.height / 2;
    const dots = [
      { x: midX, y: shape.y },
      { x: midX, y: shape.y + shape.height },
      { x: shape.x, y: midY },
      { x: shape.x + shape.width, y: midY }
    ];
    
    return (
      <g>
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={6}
            fill="#4A9EFF"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onConnectionClick(shape.id);
            }}
          />
        ))}
      </g>
    );
  };
  
  return (
    <g
      ref={groupRef}
      data-shape-id={shape.id}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {renderShape()}
      {renderSelection()}
      {renderConnectionDots()}
    </g>
  );
}