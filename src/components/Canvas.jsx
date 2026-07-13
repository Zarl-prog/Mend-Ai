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
  gridSize = 20,
  isMobile = false
}, ref) {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);
  const animFrameRef = useRef(null);
  const mousePos = useRef({ x: -999, y: -999 });
  
  const pinchStartDist = useRef(0);
  const pinchStartZoom = useRef(1);
  const pinchCenter = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const isTwoFingerGesture = useRef(false);
  const initialPinchDist = useRef(0);
  
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
    
    if (e.target === canvasRef.current || e.target.id === 'canvas-bg' || e.target.id === 'canvas-grid') {
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
      onPan(panX + dx, panY + dy);
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
  
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' && !isPanning) {
      e.preventDefault();
      setIsPanning(true);
      setStartPan({ x: lastMousePosRef.current.x, y: lastMousePosRef.current.y });
    }
  }, [isPanning]);

  const handleKeyUp = useCallback((e) => {
    if (e.code === 'Space') {
      setIsPanning(false);
    }
  }, []);

  useEffect(() => {
    const container = canvasRef.current;
    const glowCanvas = glowRef.current;
    if (!container || !glowCanvas) return;
    
    const ctx = glowCanvas.getContext('2d');

    const resize = () => {
      glowCanvas.width = container.clientWidth;
      glowCanvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const onMouseLeave = () => {
      mousePos.current = { x: -999, y: -999 };
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    const draw = () => {
      const { x, y } = mousePos.current;
      const w = glowCanvas.width;
      const h = glowCanvas.height;

      ctx.clearRect(0, 0, w, h);

      if (x < 0 || y < 0) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Check if mouse is over a shape
      const rect = container.getBoundingClientRect();
      const target = document.elementFromPoint(x + rect.left, y + rect.top);
      const isOverShape = target && (target.closest('[data-shape-id]'));
      
      if (!isOverShape) {
        // Background glow - only when NOT over a shape
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
        gradient.addColorStop(0, 'rgba(255,255,255,0.04)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.015)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        const spacing = 24;
        const radius = 80;

        const startX = Math.floor((x - radius) / spacing) * spacing;
        const startY = Math.floor((y - radius) / spacing) * spacing;

        for (let dx = startX; dx <= x + radius; dx += spacing) {
          for (let dy = startY; dy <= y + radius; dy += spacing) {
            const dist = Math.sqrt((dx - x) ** 2 + (dy - y) ** 2);
            if (dist < radius) {
              const alpha = (1 - dist / radius) * 0.4;
              const dotR = (1 - dist / radius) * 1.5 + 0.3;
              ctx.beginPath();
              ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255,255,255,${alpha})`;
              ctx.fill();
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      ro.disconnect();
    };
  }, [shapes, zoom, panX, panY]);

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
    if (e.target === canvasRef.current || e.target.id === 'canvas-bg' || e.target.id === 'canvas-grid') {
      onZoom(1, { x: 0, y: 0 });
    }
  };
  
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    e.preventDefault();
    
    if (e.touches.length === 2) {
      isTwoFingerGesture.current = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      initialPinchDist.current = Math.sqrt(dx * dx + dy * dy);
      pinchStartDist.current = initialPinchDist.current;
      pinchStartZoom.current = zoom;
      pinchCenter.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
      setStartPan(pinchCenter.current);
      return;
    }
    
    isTwoFingerGesture.current = false;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: (touch.clientX - rect.left - panX) / zoom,
      y: (touch.clientY - rect.top - panY) / zoom
    };
    
    if (tool === 'select') {
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const shapeEl = target?.closest('[data-shape-id]');
      
      if (shapeEl) {
        onSelectShape(shapeEl.getAttribute('data-shape-id'));
      } else {
        onDeselectAll();
      }
    } else if (tool === 'arrow') {
      // Arrow tool requires clicking on shapes
    } else if (['rect', 'circle', 'text', 'sticky'].includes(tool)) {
      const shape = onCreateShape(tool, point.x, point.y);
      onSelectShape(shape.id);
    }
  }, [isMobile, zoom, panX, panY, tool, onDeselectAll, onCreateShape, onSelectShape]);
  
  const handleTouchMove = useCallback((e) => {
    if (!isMobile) return;
    e.preventDefault();
    
    if (e.touches.length === 2 && isTwoFingerGesture.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const scale = dist / pinchStartDist.current;
      const newZoom = Math.min(3, Math.max(0.25, pinchStartZoom.current * scale));
      onZoom(newZoom, { x: panX, y: panY });
      
      const currentCenter = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
      
      const panDx = currentCenter.x - pinchCenter.current.x;
      const panDy = currentCenter.y - pinchCenter.current.y;
      onPan(panX + panDx, panY + panDy);
      
      return;
    }
    
    if (isTwoFingerGesture.current) return;
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      
      if (selectionBox) {
        const rect = canvasRef.current.getBoundingClientRect();
        const point = {
          x: (touch.clientX - rect.left - panX) / zoom,
          y: (touch.clientY - rect.top - panY) / zoom
        };
        setSelectionBox({
          ...selectionBox,
          x: Math.min(point.x, selectionBox.startX),
          y: Math.min(point.y, selectionBox.startY),
          width: Math.abs(point.x - selectionBox.startX),
          height: Math.abs(point.y - selectionBox.startY)
        });
      }
    }
  }, [isMobile, zoom, panX, panY, selectionBox, onZoom, onPan]);
  
  const handleTouchEnd = useCallback((e) => {
    if (!isMobile) return;
    e.preventDefault();
    
    if (isTwoFingerGesture.current) {
      isTwoFingerGesture.current = false;
      return;
    }
    
    if (e.touches.length === 0) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap detected
        if (selectedIds.length > 0) {
          const selectedShape = shapes.find(s => selectedIds.includes(s.id));
          if (selectedShape) {
            // Emit event for label editing
            const event = new CustomEvent('editShapeLabel', { detail: { shapeId: selectedShape.id } });
            window.dispatchEvent(event);
          }
        }
      }
      lastTapRef.current = now;
      
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
    }
  }, [isMobile, selectedIds, shapes, selectionBox, onMultiSelect]);
  
  const getShapeById = (id) => shapes.find(s => s.id === id);
  const selectedShapes = shapes.filter(s => selectedIds.includes(s.id));
  const selectedArrow = arrows.find(a => a.isSelected);
  
  const dotColor = darkMode ? '#1E1E1E' : '#DEDEDE';
  
  return (
    <div className="flex-1 relative overflow-hidden canvas-container">
      <svg
        ref={canvasRef}
        id="main-canvas"
        className="w-full h-full canvas-svg"
        style={{ position: 'absolute', top: 0, left: 0, cursor: isPanning ? 'grabbing' : tool === 'arrow' ? 'crosshair' : 'default', zIndex: 1, touchAction: 'none' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleCanvasDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke={dotColor} strokeWidth="0.5" />
          </pattern>
        </defs>
        
        <rect id="canvas-bg" width="100%" height="100%" fill={darkMode ? '#111111' : '#FFFFFF'} />
        <rect id="canvas-grid" width="100%" height="100%" fill="url(#grid)" />
        
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
      
      <canvas
        ref={glowRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
      
      <div className="absolute bottom-2 left-2 text-[#888] text-sm">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
});

export default Canvas;