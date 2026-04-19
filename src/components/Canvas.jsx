import React, { useRef, useState, useCallback, useEffect, forwardRef } from 'react';
import Shape from './Shape';
import Arrow from './Arrow';

const Canvas = forwardRef(function Canvas({
  shapes,
  arrows,
  selectedIds,
  tool,
  zoom,
  panX,
  panY,
  isConnecting,
  connectFrom,
  onSelectShape,
  onSelectArrow,
  onDeselectAll,
  onCreateShape,
  onUpdateShape,
  onAddArrow,
  onStartConnecting,
  onCancelConnecting,
  onZoom,
  onPan,
  onMultiSelect,
  darkMode,
  snapToGrid = true,
  gridSize = 20
}, ref) {
  const canvasRef = useRef(null);
  
  React.useImperativeHandle(ref, () => canvasRef.current, []);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  const getCanvasPoint = useCallback((clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - panX) / zoom,
      y: (clientY - rect.top - panY) / zoom
    };
  }, [panX, panY, zoom]);
  
  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    
    const point = getCanvasPoint(e.clientX, e.clientY);
    
    if (e.target === canvasRef.current || e.target.tagName === 'rect') {
      if (tool === 'select') {
        if (e.shiftKey) {
          setSelectionBox({ x: point.x, y: point.y, width: 0, height: 0, startX: point.x, startY: point.y });
        } else {
          onDeselectAll();
        }
      } else if (tool === 'arrow') {
        // Do nothing - arrow tool requires clicking on shapes
      } else if (['rect', 'circle', 'text', 'sticky'].includes(tool)) {
        const shape = onCreateShape(tool, point.x, point.y);
        onSelectShape(shape.id);
      }
    }
  };
  
  const handleCanvasMouseMove = useCallback((e) => {
    if (selectionBox) {
      const point = getCanvasPoint(e.clientX, e.clientY);
      setSelectionBox({
        ...selectionBox,
        x: Math.min(point.x, selectionBox.startX),
        y: Math.min(point.y, selectionBox.startY),
        width: Math.abs(point.x - selectionBox.startX),
        height: Math.abs(point.y - selectionBox.startY)
      });
    }
    
    if (isPanning) {
      const dx = e.clientX - startPan.x;
      const dy = e.clientY - startPan.y;
      onPan({ x: panX + dx, y: panY + dy });
    }
  }, [selectionBox, isPanning, startPan, panX, panY, getCanvasPoint, onPan]);
  
  const handleCanvasMouseUp = useCallback((e) => {
    if (selectionBox && selectionBox.width > 5 && selectionBox.height > 5) {
      const selectedShapes = shapes.filter(s => 
        s.x >= selectionBox.x &&
        s.y >= selectionBox.y &&
        s.x + s.width <= selectionBox.x + selectionBox.width &&
        s.y + s.height <= selectionBox.y + selectionBox.height
      );
      onMultiSelect(selectedShapes.map(s => s.id));
    }
    
    setSelectionBox(null);
    setIsPanning(false);
  }, [selectionBox, shapes, onMultiSelect]);
  
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.25, Math.min(3.0, zoom + delta));
    
    if (newZoom !== zoom) {
      const scale = newZoom / zoom;
      const newPanX = mouseX - (mouseX - panX) * scale;
      const newPanY = mouseY - (mouseY - panY) * scale;
      onZoom(newZoom, { x: newPanX, y: newPanY });
    }
  }, [zoom, panX, panY, onZoom]);
  
  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' && !isPanning) {
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning]);
  
  const handleKeyUp = useCallback((e) => {
    if (e.code === 'Space') {
      setIsPanning(false);
    }
  }, []);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
  
  const handleShapeDrag = (shapeId, clientX, clientY) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    let newX = (clientX - dragOffset.x - panX) / zoom;
    let newY = (clientY - dragOffset.y - panY) / zoom;
    
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }
    
    onUpdateShape(shapeId, { x: newX, y: newY });
  };
  
  const handleShapeStartDrag = (shapeId, clientX, clientY) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    
    const shape = shapes.find(s => s.id === shapeId);
    if (shape) {
      // Fix drag glitch: proper offset including pan
      const screenX = shape.x * zoom + panX;
      const screenY = shape.y * zoom + panY;
      setDragOffset({ x: clientX - screenX, y: clientY - screenY });
    }
  };
  
  const handleShapeEndDrag = () => {
    setIsDragging(false);
  };
  
  const handleResizeStart = (shapeId, handle, clientX, clientY) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    setResizeStart({
      shapeId,
      handle,
      startX: clientX,
      startY: clientY,
      startWidth: shape.width,
      startHeight: shape.height,
      startXPos: shape.x,
      startYPos: shape.y
    });
  };
  
  const handleResize = useCallback((shapeId, handle, clientX, clientY) => {
    if (!resizeStart || resizeStart.shapeId !== shapeId) return;
    
    let dx = (clientX - resizeStart.startX) / zoom;
    let dy = (clientY - resizeStart.startY) / zoom;
    
    if (snapToGrid) {
      dx = Math.round(dx / gridSize) * gridSize;
      dy = Math.round(dy / gridSize) * gridSize;
    }
    
    let newWidth = resizeStart.startWidth;
    let newHeight = resizeStart.startHeight;
    let newX = resizeStart.startXPos;
    let newY = resizeStart.startYPos;
    
    switch (handle) {
      case 'se':
        newWidth = Math.max(40, resizeStart.startWidth + dx);
        newHeight = Math.max(40, resizeStart.startHeight + dy);
        break;
      case 'sw':
        newWidth = Math.max(40, resizeStart.startWidth - dx);
        newHeight = Math.max(40, resizeStart.startHeight + dy);
        newX = resizeStart.startXPos + dx;
        break;
      case 'ne':
        newWidth = Math.max(40, resizeStart.startWidth + dx);
        newHeight = Math.max(40, resizeStart.startHeight - dy);
        newY = resizeStart.startYPos + dy;
        break;
      case 'nw':
        newWidth = Math.max(40, resizeStart.startWidth - dx);
        newHeight = Math.max(40, resizeStart.startHeight - dy);
        newX = resizeStart.startXPos + dx;
        newY = resizeStart.startYPos + dy;
        break;
      case 'n':
        newHeight = Math.max(40, resizeStart.startHeight - dy);
        newY = resizeStart.startYPos + dy;
        break;
      case 's':
        newHeight = Math.max(40, resizeStart.startHeight + dy);
        break;
      case 'e':
        newWidth = Math.max(40, resizeStart.startWidth + dx);
        break;
      case 'w':
        newWidth = Math.max(40, resizeStart.startWidth - dx);
        newX = resizeStart.startXPos + dx;
        break;
    }
    
    onUpdateShape(shapeId, { width: newWidth, height: newHeight, x: newX, y: newY });
  }, [resizeStart, zoom, onUpdateShape]);
  
  const handleResizeEnd = () => {
    setResizeStart(null);
  };
  
  const handleConnectionClick = (shapeId) => {
    if (isConnecting && connectFrom) {
      // Fix arrow connection glitch: prevent self-loop
      if (connectFrom !== shapeId) {
        onAddArrow(connectFrom, shapeId);
      }
      // Reset connection state after clicking
      // (handled by onAddArrow in parent which clears isConnecting)
    } else {
      onStartConnecting(shapeId);
    }
  };
  
  const handleCanvasDoubleClick = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === 'rect') {
      onZoom(1, { x: 0, y: 0 });
    }
  };
  
  const getShapeById = (id) => shapes.find(s => s.id === id);
  const selectedShapes = shapes.filter(s => selectedIds.includes(s.id));
  const selectedArrow = arrows.find(a => a.isSelected);
  
  const dotColor = darkMode ? '#1E1E1E' : '#DEDEDE';
  
  return (
    <div className="flex-1 relative overflow-hidden">
      <svg
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: isPanning ? 'grabbing' : tool === 'arrow' ? 'crosshair' : 'default' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleCanvasDoubleClick}
      >
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke={dotColor} strokeWidth="0.5" />
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill={darkMode ? '#111111' : '#FFFFFF'} />
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
          {arrows.map(arrow => (
            <Arrow
              key={arrow.id}
              arrow={arrow}
              fromShape={getShapeById(arrow.fromShapeId)}
              toShape={getShapeById(arrow.toShapeId)}
              onSelect={onSelectArrow}
              isSelected={arrow.isSelected}
              zoom={zoom}
            />
          ))}
          
          {shapes.map(shape => (
            <Shape
              key={shape.id}
              shape={shape}
              isSelected={selectedIds.includes(shape.id)}
              onSelect={onSelectShape}
              onUpdate={onUpdateShape}
              onStartDrag={handleShapeStartDrag}
              onDrag={handleShapeDrag}
              onEndDrag={handleShapeEndDrag}
              onStartResize={handleResizeStart}
              onResize={handleResize}
              onEndResize={handleResizeEnd}
              showConnectionDots={tool === 'arrow' || isConnecting}
              onConnectionClick={handleConnectionClick}
              zoom={zoom}
            />
          ))}
          
          {selectionBox && (
            <rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(74, 158, 255, 0.1)"
              stroke="#4A9EFF"
              strokeWidth={1 / zoom}
              strokeDasharray="4,4"
            />
          )}
        </g>
      </svg>
      
      <div className="absolute bottom-2 left-2 text-[#888] text-sm">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
});

export default Canvas;