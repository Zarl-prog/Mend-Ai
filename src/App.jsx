import React, { useState, useCallback, useRef, useEffect } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import TopBar from './components/TopBar';
import PropertiesPanel from './components/PropertiesPanel';
import TextEditor from './components/TextEditor';
import AIChatPanel from './components/AIChatPanel';
import AIChatButton from './components/AIChatButton';
import LoadingOverlay from './components/LoadingOverlay';
import Toast from './components/Toast';
import Home from './components/Home';
import ShortcutsModal from './components/ShortcutsModal';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import MobileTopBar from './components/MobileTopBar';
import BottomNav from './components/BottomNav';
import MobileProperties from './components/MobileProperties';
import { useAuth } from './contexts/AuthContext';
import { useCanvas } from './hooks/useCanvas';
import { useAIRateLimit } from './hooks/useAIRateLimit';
import { useExport } from './hooks/useExport';
import { useMobile } from './hooks/useMobile';
import { saveDiagram, loadDiagram } from './utils/saveLoad';
import { parseAIResponse, getAutoFitBounds } from './utils/aiShapeParser';
import { generateDiagram, improveDiagram } from './services/groqService';
import { saveToSupabase, loadFromSupabase, listDiagrams, deleteFromSupabase } from './services/database';
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
    snapToGrid,
    alignShapes,
    distributeShapes,
    bringForward,
    sendBackward,
    duplicateSelected,
    copySelected,
    pasteCopied,
    setDarkMode
  } = useCanvas();
  
const svgRef = useRef(null);
  const { exportSVG, exportPNG, exportPDF } = useExport();
  const { user, profile, addToast: authAddToast } = useAuth();
  const isMobile = useMobile();
  
  // Debug auth state
  useEffect(() => {
    console.log('=== AUTH DEBUG ===')
    console.log('User:', user)
    console.log('Profile:', profile)
    console.log('=================')
  }, [user, profile])
  
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
  const [showHome, setShowHome] = useState(true);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

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
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      
      if (key === '?' || (ctrl && key === '/')) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }
      
      if (showShortcutsModal) {
        if (key === 'escape') {
          e.preventDefault();
          setShowShortcutsModal(false);
        }
        return;
      }
      
      if (ctrl && key === 'c') {
        e.preventDefault();
        copySelected();
        return;
      }
      if (ctrl && key === 'v') {
        e.preventDefault();
        pasteCopied();
        return;
      }
      if (ctrl && key === 'd') {
        e.preventDefault();
        pushHistory();
        duplicateSelected();
        return;
      }
      if (ctrl && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if (ctrl && key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (ctrl && key === 'a') {
        e.preventDefault();
        selectAll();
        return;
      }
      if (key === 'escape') {
        e.preventDefault();
        deselectAll();
        cancelConnecting();
        setAiPanelOpen(false);
        return;
      }
      
      if (key === 'delete' || key === 'backspace') {
        if (state.selectedIds.length > 0) {
          e.preventDefault();
          pushHistory();
          deleteSelected();
        } else if (state.arrows.some(a => a.isSelected)) {
          e.preventDefault();
          pushHistory();
          const arrow = state.arrows.find(a => a.isSelected);
          if (arrow) deleteArrow(arrow.id);
        }
        return;
      }
      if (key === 'v') {
        e.preventDefault();
        setTool('select');
        return;
      }
      if (key === 'r') {
        e.preventDefault();
        setTool('rect');
        return;
      }
      if (key === 'c') {
        e.preventDefault();
        setTool('circle');
        return;
      }
      if (key === 't') {
        e.preventDefault();
        setTool('text');
        return;
      }
      if (key === 's' && !ctrl) {
        e.preventDefault();
        setTool('sticky');
        return;
      }
      if (key === 'a' && !ctrl) {
        e.preventDefault();
        setTool('arrow');
        return;
      }
      if (key === '#') {
        e.preventDefault();
        toggleSnapToGrid();
        return;
      }
      
      if (ctrl && (key === '=' || key === '+')) {
        e.preventDefault();
        const newZoom = Math.min(3, parseFloat((state.zoom + 0.25).toFixed(2)));
        handleZoom(newZoom, { x: state.panX, y: state.panY });
        return;
      }
      if (ctrl && key === '-') {
        e.preventDefault();
        const newZoom = Math.max(0.25, parseFloat((state.zoom - 0.25).toFixed(2)));
        handleZoom(newZoom, { x: state.panX, y: state.panY });
        return;
      }
      if (ctrl && key === '0') {
        e.preventDefault();
        handleZoom(1, { x: 0, y: 0 });
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcutsModal, state.selectedIds.length, state.arrows]);
  
  const pushHistory = useCallback(() => {
    setHistory(prev => ({
      past: [...prev.past.slice(-49), { shapes: state.shapes, arrows: state.arrows }],
      future: []
    }));
  }, [state.shapes, state.arrows]);

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
    clearCanvas();
    
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
      if (error.message === 'API_KEY_MISSING') {
        addToast('Set your Groq API key in the AI panel first', 'warning');
      } else {
        addToast(`AI error: ${error.message}`, 'error');
      }
    } finally {
      setAiLoading(false);
    }
  }, [canMakeRequest, recordRequest, startCooldown, addAiElements, addToast, pushHistory, setAiLoading, setAiPanelOpen, setTool, setZoom, setPan, clearCanvas]);
  
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
      
      // Map real UUIDs to simple IDs (s1, s2, ...) so the AI reliably returns them
      const toSimple = {};
      const fromSimple = {};
      selectedShapes.forEach((s, i) => {
        const simple = `s${i + 1}`;
        toSimple[s.id] = simple;
        fromSimple[simple] = s.id;
      });
      
      const mappedShapes = selectedShapes.map(s => ({ ...s, id: toSimple[s.id] }));
      const mappedArrows = selectedArrows.map(a => ({
        ...a,
        fromShapeId: toSimple[a.fromShapeId] || a.fromShapeId,
        toShapeId: toSimple[a.toShapeId] || a.toShapeId,
      }));
      
      const shapeJSON = JSON.stringify({ shapes: mappedShapes, arrows: mappedArrows });
      const response = await improveDiagram(prompt, shapeJSON);
      const { shapes: newShapes, arrows: newArrows } = parseAIResponse(response, 0, 0, true, true);
      
      // Map simple IDs back to real UUIDs
      newShapes.forEach(s => {
        if (fromSimple[s.id]) s.id = fromSimple[s.id];
      });
      newArrows.forEach(a => {
        if (fromSimple[a.fromShapeId]) a.fromShapeId = fromSimple[a.fromShapeId];
        if (fromSimple[a.toShapeId]) a.toShapeId = fromSimple[a.toShapeId];
      });
      
      const allShapes = [...state.shapes];
      
      newShapes.forEach(newShape => {
        const idx = allShapes.findIndex(s => s.id === newShape.id);
        if (idx >= 0) {
          allShapes[idx] = { ...newShape, x: allShapes[idx].x, y: allShapes[idx].y };
        }
      });
      
      const allArrows = [...state.arrows];
      newArrows.forEach(newArrow => {
        const existingIndex = allArrows.findIndex(a => a.id === newArrow.id);
        if (existingIndex >= 0) {
          allArrows[existingIndex] = newArrow;
        }
      });
      
      updateElements(allShapes, allArrows);
      addToast('✦ Diagram improved!', 'success');
      setAiPrompt('');
    } catch (error) {
      if (error.message === 'API_KEY_MISSING') {
        addToast('Set your Groq API key in the AI panel first', 'warning');
      } else {
        addToast(`AI error: ${error.message}`, 'error');
      }
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

  const [cloudDiagrams, setCloudDiagrams] = useState([]);
  const [showCloudModal, setShowCloudModal] = useState(false);
  
  const handleCloudSave = useCallback(async () => {
    if (!user) {
      setAuthMessage('Sign in to save diagrams — it\'s free!')
      setShowAuthModal(true)
      return
    }
    if (state.shapes.length === 0) {
      addToast('Nothing to save', 'warning');
      return;
    }
    try {
      await saveToSupabase(state.title, state.shapes, state.arrows, user.id);
      addToast('Saved to cloud!', 'success');
    } catch (error) {
      addToast('Cloud save failed', 'error');
    }
  }, [state.title, state.shapes, state.arrows, user, addToast]);
  
  const handleCloudLoad = useCallback(async () => {
    if (!user) {
      setAuthMessage('Sign in to access your diagrams')
      setShowAuthModal(true)
      return
    }
    try {
      const diagrams = await listDiagrams(user.id);
      setCloudDiagrams(diagrams);
      setShowCloudModal(true);
    } catch (error) {
      addToast('Failed to load diagrams', 'error');
    }
  }, [addToast]);
  
  const handleLoadFromCloud = useCallback(async (id) => {
    try {
      const data = await loadFromSupabase(id);
      loadDiagramState({
        title: data.title,
        shapes: data.shapes,
        arrows: data.arrows
      });
      setShowCloudModal(false);
      setShowHome(false);
      addToast('Loaded from cloud!', 'success');
    } catch (error) {
      addToast('Failed to load', 'error');
    }
  }, [loadDiagramState, addToast]);

  const handleNewProject = useCallback(() => {
    clearCanvas();
    setShowHome(false);
    setTitle('Untitled Diagram');
    setHistory({ past: [], future: [] });
  }, [clearCanvas, setTitle]);

  const handleHomeLoadProject = useCallback(async (id) => {
    try {
      const data = await loadFromSupabase(id);
      loadDiagramState({
        title: data.title,
        shapes: data.shapes,
        arrows: data.arrows
      });
      setShowHome(false);
      addToast('Project loaded!', 'success');
    } catch (error) {
      addToast('Failed to load project', 'error');
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

  const handleExportPDF = useCallback(() => {
    if (state.shapes.length === 0) {
      addToast('Nothing to export', 'warning');
      return;
    }
    const success = exportPDF(svgRef.current, state.title);
    if (success) addToast('Opening PDF for print...', 'success');
  }, [state.shapes, state.title, exportPDF, addToast]);
  
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

  if (showHome) {
    return (
      <Home 
        onNewProject={handleNewProject}
        onLoadProject={handleHomeLoadProject}
      />
    );
  }

  return (
    <div className={`h-screen flex flex-col ${state.darkMode ? 'dark' : ''}`}>
      {isMobile ? (
        <MobileTopBar
          title={state.title}
          onNew={handleNew}
          onSave={handleSave}
          onCloudSave={handleCloudSave}
          onCloudLoad={handleCloudLoad}
          onExportPNG={handleExportPNG}
          onExportSVG={handleExportSVG}
          onGoHome={() => setShowHome(true)}
          onToggleAI={() => setAiPanelOpen(!state.aiPanelOpen)}
          user={user}
          profile={profile}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      ) : (
        <TopBar
          title={state.title}
          onTitleChange={setTitle}
          onNew={handleNew}
          onSave={handleSave}
          onLoad={handleLoad}
          onCloudSave={handleCloudSave}
          onCloudLoad={handleCloudLoad}
          onExportPNG={handleExportPNG}
          onExportSVG={handleExportSVG}
          onExportPDF={handleExportPDF}
          onToggleTheme={() => setDarkMode(!state.darkMode)}
          darkMode={state.darkMode}
          onOpenTemplates={handleOpenTemplate}
          onGoHome={() => setShowHome(true)}
          templateList={getTemplateList()}
        />
      )}
      
      {showCloudModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000]">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#333] w-[450px] max-h-[500px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#333]">
              <h3 className="text-white font-semibold">Cloud Diagrams</h3>
              <button onClick={() => setShowCloudModal(false)} className="text-[#888] hover:text-white">✕</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[400px]">
              {cloudDiagrams.length === 0 ? (
                <p className="text-[#666] text-center py-8">No saved diagrams</p>
              ) : (
                <div className="space-y-2">
                  {cloudDiagrams.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleLoadFromCloud(d.id)}
                      className="w-full p-3 rounded-xl bg-[#252525] hover:bg-[#333] text-left flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{d.title}</p>
                        <p className="text-[#666] text-xs">{new Date(d.updated_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[#6C47FF]">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {!isMobile && (
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
            onAlignLeft={() => { pushHistory(); alignShapes('left'); }}
            onAlignCenter={() => { pushHistory(); alignShapes('center'); }}
            onAlignRight={() => { pushHistory(); alignShapes('right'); }}
            onAlignTop={() => { pushHistory(); alignShapes('top'); }}
            onAlignMiddle={() => { pushHistory(); alignShapes('middle'); }}
            onAlignBottom={() => { pushHistory(); alignShapes('bottom'); }}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            onDuplicate={() => { pushHistory(); duplicateSelected(); }}
            onCopy={copySelected}
            onPaste={pasteCopied}
            onToggleDarkMode={() => setDarkMode(!state.darkMode)}
            darkMode={state.darkMode}
            hasCopiedShapes={!!state.copiedShapes}
            onToggleShortcuts={() => setShowShortcutsModal(true)}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        )}
        
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
          isMobile={isMobile}
        />
        
        {!isMobile && (
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
        )}
      </div>
      
      {isMobile && selectedShapes.length > 0 && (
        <MobileProperties
          selectedShape={selectedShapes[0]}
          onUpdateShape={(id, updates) => {
            pushHistory();
            updateShape(id, updates);
          }}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}
      
      {isMobile && (
        <BottomNav
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
          onGoHome={() => setShowHome(true)}
        />
      )}
      
      <AIChatPanel
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
        isMobile={isMobile}
        onKeySaved={() => addToast('API key saved!', 'success')}
      />
      
      <AIChatButton
        onClick={() => setAiPanelOpen(!state.aiPanelOpen)}
        isOpen={state.aiPanelOpen}
        isMobile={isMobile}
      />
      
      <LoadingOverlay
        visible={state.aiLoading}
        messages={loadingMessages}
      />
      
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <ShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} message={authMessage} />
      
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );
}