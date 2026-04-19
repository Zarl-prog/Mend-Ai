import React, { useState, useCallback, useRef, useEffect } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import TopBar from './components/TopBar';
import PropertiesPanel from './components/PropertiesPanel';
import TextEditor from './components/TextEditor';
import AIPanel from './components/AIPanel';
import AIButton from './components/AIButton';
import LoadingOverlay from './components/LoadingOverlay';
import Toast from './components/Toast';
import { useCanvas } from './hooks/useCanvas';
import { useAIRateLimit } from './hooks/useAIRateLimit';
import { useExport } from './hooks/useExport';
import { saveDiagram, loadDiagram } from './utils/saveLoad';
import { parseAIResponse, getAutoFitBounds } from './utils/aiShapeParser';
import { generateDiagram, improveDiagram } from './services/groqService';
import { generateId } from './utils/uid';
import { templates, getTemplateList } from './utils/templates';

const loadingMessages = [
  '✦ Thinking visually...',
  '✦ Sketching your diagram...',
  '✦ Connecting the nodes...',
  '✦ Almost ready...'
];

export default function App() {
  const {
    state,
    dispatch,
    createShape,
    updateShape,
    deleteSelected,
    addArrow,
    updateArrow,
    deleteArrow,
    selectShape,
    selectArrow,
    deselectAll,
    selectAll,
    setTool,
    setZoom,
    setPan,
    startConnecting,
    cancelConnecting,
    setAiPanelOpen,
    setAiMode,
    setAiLoading,
    addAiElements,
    updateElements,
    setTitle,
    toggleDarkMode,
    loadDiagram: loadDiagramState,
    clearCanvas,
    multiSelect,
    toggleSnapToGrid,
    snapToGrid
  } = useCanvas();
  
  const svgRef = useRef(null);
  const { exportSVG, exportPNG } = useExport();
  
  const {
    recordRequest,
    startCooldown,
    canMakeRequest,
    isLimitReached,
    remainingRequests,
    cooldownRemaining,
    isOnCooldown
  } = useAIRateLimit();
  
  const [history, setHistory] = useState({ past: [], future: [] });
  const [toasts, setToasts] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  
const pushHistory = useCallback(() => {
    setHistory(prev => ({
      past: [...prev.past.slice(-49), { shapes: state.shapes, arrows: state.arrows }],
      future: []
    }));
  }, [state.shapes, state.arrows]);

  const addToast = useCallback((message, type = 'success') => {
    const id = generateId('toast');
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  }, []);
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const handleUndo = useCallback(() => {
    if (history.past.length === 0) return;
    
    const previous = history.past[history.past.length - 1];
    setHistory(prev => ({
      past: prev.past.slice(0, -1),
      future: [{ shapes: state.shapes, arrows: state.arrows }, ...prev.future]
    }));
    
    updateElements(previous.shapes, previous.arrows);
  }, [history.past, state.shapes, state.arrows, updateElements]);
  
  const handleRedo = useCallback(() => {
    if (history.future.length === 0) return;
    
    const next = history.future[0];
    setHistory(prev => ({
      past: [...prev.past, { shapes: state.shapes, arrows: state.arrows }],
      future: prev.future.slice(1)
    }));
    
    updateElements(next.shapes, next.arrows);
  }, [history.future, state.shapes, state.arrows, updateElements]);
  
  const handleGenerate = useCallback(async (prompt) => {
    if (!prompt.trim()) return;
    if (!canMakeRequest) return;
    
    recordRequest();
    startCooldown();
    setAiLoading(true);
    pushHistory();
    
    try {
      const response = await generateDiagram(prompt);
      const { shapes, arrows } = parseAIResponse(response, 200, 200);
      
      addAiElements(shapes, arrows);
      
      setTimeout(() => {
        const bounds = getAutoFitBounds(shapes, arrows, 80);
        const canvasWidth = window.innerWidth - 300;
        const canvasHeight = window.innerHeight - 100;
        const zoomX = canvasWidth / bounds.width;
        const zoomY = canvasHeight / bounds.height;
        const newZoom = Math.min(zoomX, zoomY, 1.5);
        const newPanX = -bounds.minX * newZoom + (canvasWidth - bounds.width * newZoom) / 2;
        const newPanY = -bounds.minY * newZoom + (canvasHeight - bounds.height * newZoom) / 2;
        setZoom(newZoom);
        setPan(newPanX, newPanY);
      }, 100);
      
      addToast('✦ Diagram generated! You can now edit it.', 'success');
      setAiPanelOpen(false);
      setTool('select');
      setAiPrompt('');
    } catch (error) {
      addToast(`AI error: ${error.message}`, 'error');
    } finally {
      setAiLoading(false);
    }
  }, [canMakeRequest, recordRequest, startCooldown, addAiElements, addToast, pushHistory, setAiLoading, setAiPanelOpen, setTool, setZoom, setPan]);
  
  const handleImprove = useCallback(async (prompt) => {
    if (!prompt.trim() || state.selectedIds.length === 0) return;
    if (!canMakeRequest) return;
    
    recordRequest();
    startCooldown();
    setAiLoading(true);
    pushHistory();
    
    try {
      const selectedShapes = state.shapes.filter(s => state.selectedIds.includes(s.id));
      const selectedArrows = state.arrows.filter(a => 
        selectedShapes.some(s => s.id === a.fromShapeId || s.id === a.toShapeId)
      );
      
      const shapeJSON = JSON.stringify({ shapes: selectedShapes, arrows: selectedArrows });
      const response = await improveDiagram(prompt, shapeJSON);
      const { shapes: newShapes, arrows: newArrows } = parseAIResponse(response, 0, 0);
      
      const allShapes = [...state.shapes];
      const allArrows = [...state.arrows];
      
      newShapes.forEach(newShape => {
        const existingIndex = allShapes.findIndex(s => s.id === newShape.id);
        if (existingIndex >= 0) {
          allShapes[existingIndex] = newShape;
        } else {
          allShapes.push(newShape);
        }
      });
      
      newArrows.forEach(newArrow => {
        const existingIndex = allArrows.findIndex(a => a.id === newArrow.id);
        if (existingIndex >= 0) {
          allArrows[existingIndex] = newArrow;
        } else {
          allArrows.push(newArrow);
        }
      });
      
      updateElements(allShapes, allArrows);
      addToast('✦ Diagram improved!', 'success');
      setAiPrompt('');
    } catch (error) {
      addToast(`AI error: ${error.message}`, 'error');
    } finally {
      setAiLoading(false);
    }
  }, [canMakeRequest, recordRequest, startCooldown, state.shapes, state.arrows, state.selectedIds, updateElements, addToast, pushHistory, setAiLoading]);
  
  const handleSave = useCallback(() => {
    saveDiagram(state.title, state.shapes, state.arrows);
    addToast('Diagram saved', 'success');
  }, [state.title, state.shapes, state.arrows, addToast]);
  
  const handleLoad = useCallback(async (file) => {
    try {
      const data = await loadDiagram(file);
      loadDiagramState(data);
      addToast('Diagram loaded', 'success');
    } catch (error) {
      addToast('Invalid file', 'error');
    }
  }, [loadDiagramState, addToast]);

const handleExportPNG = useCallback(() => {
    if (state.shapes.length === 0) {
      addToast('Nothing to export', 'warning');
      return;
    }
    const success = exportPNG(svgRef.current, state.title);
    if (success) addToast('Exported as PNG', 'success');
  }, [state.shapes, state.title, exportPNG, addToast]);

  const handleExportSVG = useCallback(() => {
    if (state.shapes.length === 0) {
      addToast('Nothing to export', 'warning');
      return;
    }
    const success = exportSVG(svgRef.current, state.title);
    if (success) addToast('Exported as SVG', 'success');
  }, [state.shapes, state.title, exportSVG, addToast]);
  
  const handleNew = useCallback(() => {
    if (state.shapes.length > 0 && !confirm('Clear the canvas?')) return;
    clearCanvas();
    setHistory({ past: [], future: [] });
  }, [state.shapes.length, clearCanvas]);
  
  const handleOpenTemplate = useCallback((templateId) => {
    const templateFn = templates[templateId];
    if (!templateFn) return;
    
    const { shapes: templateShapes, arrows: templateArrows } = templateFn(200, 150);
    
    pushHistory();
    clearCanvas();
    
    templateShapes.forEach(shape => {
      dispatch({ type: 'ADD_SHAPE', payload: shape });
    });
    
    templateArrows.forEach(arrow => {
      dispatch({ type: 'ADD_ARROW', payload: arrow });
    });
    
addToast('Template loaded!', 'success');
  }, [pushHistory, clearCanvas, dispatch]);

  const handleDuplicate = useCallback((shape) => {
    pushHistory();
    const newShape = {
      ...shape,
      id: generateId('shape'),
      x: shape.x + 20,
      y: shape.y + 20
    };
    createShape(newShape.type, newShape.x + newShape.width / 2, newShape.y + newShape.height / 2);
    updateShape(newShape.id, newShape);
  }, [pushHistory, createShape, updateShape]);
  
  const handleDelete = useCallback((id) => {
    pushHistory();
    if (state.selectedIds.length > 0) {
      deleteSelected();
    } else {
      deleteArrow(id);
    }
  }, [pushHistory, state.selectedIds, deleteSelected, deleteArrow]);
  
  const handleDeleteAll = useCallback(() => {
    pushHistory();
    deleteSelected();
  }, [pushHistory, deleteSelected]);
  
  const handleDuplicateAll = useCallback(() => {
    pushHistory();
    const selectedShapes = state.shapes.filter(s => state.selectedIds.includes(s.id));
    selectedShapes.forEach(shape => {
      const newShape = {
        ...shape,
        id: generateId('shape'),
        x: shape.x + 20,
        y: shape.y + 20
      };
      createShape(newShape.type, newShape.x + newShape.width / 2, newShape.y + newShape.height / 2);
      updateShape(newShape.id, newShape);
    });
  }, [pushHistory, state.shapes, state.selectedIds, createShape, updateShape]);
  
  const handleAlign = useCallback((alignment) => {
    const selected = state.shapes.filter(s => state.selectedIds.includes(s.id));
    if (selected.length < 2) return;
    
    pushHistory();
    
    let minX = Math.min(...selected.map(s => s.x));
    let maxX = Math.max(...selected.map(s => s.x + s.width));
    let minY = Math.min(...selected.map(s => s.y));
    let maxY = Math.max(...selected.map(s => s.y + s.height));
    
    switch (alignment) {
      case 'left':
        selected.forEach(s => updateShape(s.id, { x: minX }));
        break;
      case 'center':
        const centerX = (minX + maxX) / 2;
        selected.forEach(s => updateShape(s.id, { x: centerX - s.width / 2 }));
        break;
      case 'right':
        selected.forEach(s => updateShape(s.id, { x: maxX - s.width }));
        break;
      case 'top':
        selected.forEach(s => updateShape(s.id, { y: minY }));
        break;
      case 'middle':
        const centerY = (minY + maxY) / 2;
        selected.forEach(s => updateShape(s.id, { y: centerY - s.height / 2 }));
        break;
      case 'bottom':
        selected.forEach(s => updateShape(s.id, { y: maxY - s.height }));
        break;
    }
  }, [state.shapes, state.selectedIds, updateShape, pushHistory]);
  
  const handleZoom = useCallback((newZoom, newPan) => {
    setZoom(newZoom);
    setPan(newPan.x, newPan.y);
  }, [setZoom, setPan]);
  
  const selectedShapes = state.shapes.filter(s => state.selectedIds.includes(s.id));
  const selectedArrow = state.arrows.find(a => a.isSelected);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select');
          break;
        case 'r':
          setTool('rect');
          break;
        case 'c':
          setTool('circle');
          break;
        case 't':
          setTool('text');
          break;
        case 's':
          if (!e.ctrlKey) setTool('sticky');
          break;
case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selectAll();
          } else {
            setTool('arrow');
          }
          break;
        case 'delete':
        case 'backspace':
          if (state.selectedIds.length > 0 || state.arrows.some(a => a.isSelected)) {
            pushHistory();
            if (state.selectedIds.length > 0) {
              deleteSelected();
            } else {
              const arrow = state.arrows.find(a => a.isSelected);
              if (arrow) deleteArrow(arrow.id);
            }
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
          }
          break;
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleRedo();
          }
          break;
        case 'escape':
          deselectAll();
          cancelConnecting();
          setAiPanelOpen(false);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, deleteSelected, deleteArrow, selectAll, deselectAll, cancelConnecting, setAiPanelOpen, state.selectedIds, state.arrows, pushHistory, handleUndo, handleRedo]);

  return (
    <div className={`h-screen flex flex-col ${state.darkMode ? 'dark' : ''}`}>
      <TopBar
        title={state.title}
        onTitleChange={setTitle}
        onNew={handleNew}
        onSave={handleSave}
        onLoad={handleLoad}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        onToggleTheme={toggleDarkMode}
        darkMode={state.darkMode}
        onOpenTemplates={handleOpenTemplate}
        templateList={getTemplateList()}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Toolbar
          tool={state.tool}
          setTool={setTool}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDelete={() => {
            pushHistory();
            if (state.selectedIds.length > 0) deleteSelected();
          }}
          onSelectAll={selectAll}
          selectedCount={state.selectedIds.length}
          snapToGrid={state.snapToGrid}
          onToggleSnap={toggleSnapToGrid}
        />
        
        <Canvas
          ref={svgRef}
          shapes={state.shapes}
          arrows={state.arrows}
          selectedIds={state.selectedIds}
          tool={state.tool}
          zoom={state.zoom}
          panX={state.panX}
          panY={state.panY}
          isConnecting={state.isConnecting}
          connectFrom={state.connectFrom}
          onSelectShape={selectShape}
          onSelectArrow={selectArrow}
          onDeselectAll={deselectAll}
          onCreateShape={(type, x, y) => {
            pushHistory();
            return createShape(type, x, y);
          }}
          onUpdateShape={(id, updates) => {
            // Fix undo glitch: push history on every shape update
            pushHistory();
            updateShape(id, updates);
          }}
          onAddArrow={(fromId, toId) => {
            pushHistory();
            addArrow(fromId, toId);
          }}
          onStartConnecting={startConnecting}
          onCancelConnecting={cancelConnecting}
          onZoom={handleZoom}
          onPan={setPan}
          onMultiSelect={multiSelect}
          darkMode={state.darkMode}
          snapToGrid={state.snapToGrid}
          gridSize={state.gridSize}
        />
        
        <PropertiesPanel
          selectedShapes={selectedShapes}
          selectedArrow={selectedArrow}
          onUpdateShape={(id, updates) => {
            pushHistory();
            updateShape(id, updates);
          }}
          onUpdateArrow={(id, updates) => {
            pushHistory();
            updateArrow(id, updates);
          }}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
          onDuplicateAll={handleDuplicateAll}
          onAlign={handleAlign}
        />
      </div>
      
      <AIPanel
        open={state.aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        mode={state.aiMode}
        onModeChange={setAiMode}
        onGenerate={handleGenerate}
        onImprove={handleImprove}
        selectedCount={state.selectedIds.length}
        selectedLabels={selectedShapes.map(s => s.label || 'Untitled')}
        prompt={aiPrompt}
        onPromptChange={setAiPrompt}
        onSubmit={() => state.aiMode === 'generate' ? handleGenerate(aiPrompt) : handleImprove(aiPrompt)}
        loading={state.aiLoading}
        canMakeRequest={canMakeRequest}
        isLimitReached={isLimitReached}
        remainingRequests={remainingRequests}
        cooldownRemaining={cooldownRemaining}
      />
      
      <AIButton
        onClick={() => setAiPanelOpen(!state.aiPanelOpen)}
        loading={state.aiLoading}
        disabled={!canMakeRequest}
        cooldownRemaining={cooldownRemaining}
      />
      
      <LoadingOverlay
        visible={state.aiLoading}
        messages={loadingMessages}
      />
      
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}