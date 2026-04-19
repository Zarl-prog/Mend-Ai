import { useCallback, useReducer } from 'react';
import { generateId } from '../utils/uid';

const initialState = {
  shapes: [],
  arrows: [],
  selectedIds: [],
  tool: 'select',
  zoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  isConnecting: false,
  connectFrom: null,
  aiPanelOpen: false,
  aiLoading: false,
  aiMode: 'generate',
  title: 'Untitled Diagram',
  darkMode: true,
  snapToGrid: true,
  gridSize: 20,
  copiedShapes: null
};

function canvasReducer(state, action) {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, tool: action.payload, connectFrom: null, isConnecting: false };
    
    case 'ADD_SHAPE':
      return { ...state, shapes: [...state.shapes, action.payload] };
    
    case 'UPDATE_SHAPE':
      return {
        ...state,
        shapes: state.shapes.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s)
      };
    
    case 'DELETE_SHAPES':
      const idsToDelete = action.payload;
      return {
        ...state,
        shapes: state.shapes.filter(s => !idsToDelete.includes(s.id)),
        arrows: state.arrows.filter(a => !idsToDelete.includes(a.fromShapeId) && !idsToDelete.includes(a.toShapeId)),
        selectedIds: state.selectedIds.filter(id => !idsToDelete.includes(id))
      };
    
    case 'SELECT_SHAPE':
      const shapeId = action.payload;
      if (action.shiftKey) {
        if (state.selectedIds.includes(shapeId)) {
          return { ...state, selectedIds: state.selectedIds.filter(id => id !== shapeId) };
        } else {
          return { ...state, selectedIds: [...state.selectedIds, shapeId] };
        }
      }
      return { ...state, selectedIds: [shapeId] };
    
    case 'SELECT_ARROW':
      return { ...state, arrows: state.arrows.map(a => ({ ...a, isSelected: a.id === action.payload })), selectedIds: [] };
    
    case 'DESELECT_ALL':
      return { ...state, selectedIds: [], shapes: state.shapes.map(s => ({ ...s, isSelected: false })), arrows: state.arrows.map(a => ({ ...a, isSelected: false })) };
    
    case 'SELECT_ALL':
      return { ...state, selectedIds: state.shapes.map(s => s.id) };
    
    case 'ADD_ARROW':
      return { ...state, arrows: [...state.arrows, action.payload], connectFrom: null, isConnecting: false, tool: 'select' };
    
    case 'UPDATE_ARROW':
      return {
        ...state,
        arrows: state.arrows.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a)
      };
    
    case 'DELETE_ARROW':
      return { ...state, arrows: state.arrows.filter(a => a.id !== action.payload), selectedIds: [] };
    
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    
    case 'SET_PAN':
      return { ...state, panX: action.payload.x, panY: action.payload.y };
    
    case 'START_CONNECTING':
      return { ...state, isConnecting: true, connectFrom: action.payload };
    
    case 'CANCEL_CONNECTING':
      return { ...state, isConnecting: false, connectFrom: null };
    
    case 'SET_AI_PANEL':
      return { ...state, aiPanelOpen: action.payload };
    
    case 'SET_AI_MODE':
      return { ...state, aiMode: action.payload };
    
    case 'SET_AI_LOADING':
      return { ...state, aiLoading: action.payload };
    
    case 'ADD_AI_ELEMENTS':
      return {
        ...state,
        shapes: [...state.shapes, ...action.payload.shapes],
        arrows: [...state.arrows, ...action.payload.arrows]
      };
    
    case 'UPDATE_ELEMENTS':
      return {
        ...state,
        shapes: action.payload.shapes,
        arrows: action.payload.arrows
      };
    
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    
    case 'TOGGLE_SNAP_GRID':
      return { ...state, snapToGrid: !state.snapToGrid };
    
    case 'SET_GRID_SIZE':
      return { ...state, gridSize: action.payload };
    
    case 'LOAD_DIAGRAM':
      return {
        ...state,
        shapes: action.payload.shapes,
        arrows: action.payload.arrows,
        title: action.payload.title,
        selectedIds: []
      };
    
    case 'CLEAR_CANVAS':
      return { ...state, shapes: [], arrows: [], selectedIds: [], title: 'Untitled Diagram' };
    
    case 'MULTI_SELECT':
      return { ...state, selectedIds: action.payload };
    
    case 'ALIGN_SHAPES': {
      const { alignment, ids } = action.payload;
      const selectedShapes = state.shapes.filter(s => ids.includes(s.id));
      if (selectedShapes.length < 2) return state;
      
      let referenceX, referenceY;
      if (alignment.includes('left')) {
        referenceX = Math.min(...selectedShapes.map(s => s.x));
      } else if (alignment.includes('center')) {
        referenceX = Math.min(...selectedShapes.map(s => s.x + s.width / 2));
      } else if (alignment.includes('right')) {
        referenceX = Math.max(...selectedShapes.map(s => s.x + s.width));
      } else if (alignment.includes('top')) {
        referenceY = Math.min(...selectedShapes.map(s => s.y));
      } else if (alignment.includes('middle')) {
        referenceY = Math.min(...selectedShapes.map(s => s.y + s.height / 2));
      } else if (alignment.includes('bottom')) {
        referenceY = Math.max(...selectedShapes.map(s => s.y + s.height));
      }
      
      return {
        ...state,
        shapes: state.shapes.map(s => {
          if (!ids.includes(s.id)) return s;
          let newX = s.x, newY = s.y;
          if (alignment === 'left') newX = referenceX;
          else if (alignment === 'center') newX = referenceX - s.width / 2;
          else if (alignment === 'right') newX = referenceX - s.width;
          else if (alignment === 'top') newY = referenceY;
          else if (alignment === 'middle') newY = referenceY - s.height / 2;
          else if (alignment === 'bottom') newY = referenceY - s.height;
          return { ...s, x: newX, y: newY };
        })
      };
    }
    
    case 'DISTRIBUTE_SHAPES': {
      const { direction, ids } = action.payload;
      const selectedShapes = state.shapes.filter(s => ids.includes(s.id)).sort((a, b) => 
        direction === 'horizontal' ? a.x - b.x : a.y - b.y
      );
      if (selectedShapes.length < 3) return state;
      
      const gap = direction === 'horizontal' ? 60 : 80;
      const first = selectedShapes[0];
      const last = selectedShapes[selectedShapes.length - 1];
      
      const totalSpace = direction === 'horizontal' 
        ? last.x + last.width - first.x 
        : last.y + last.height - first.y;
      const totalShapes = direction === 'horizontal'
        ? selectedShapes.reduce((sum, s) => sum + s.width, 0)
        : selectedShapes.reduce((sum, s) => sum + s.height, 0);
      const spacing = (totalSpace - totalShapes) / (selectedShapes.length - 1);
      
      return {
        ...state,
        shapes: state.shapes.map(s => {
          if (!ids.includes(s.id)) return s;
          const idx = selectedShapes.findIndex(sh => sh.id === s.id);
          if (idx <= 0 || idx >= selectedShapes.length - 1) return s;
          let newX = s.x, newY = s.y;
          if (direction === 'horizontal') {
            newX = first.x + idx * spacing + idx * first.width - (first.x - first.x);
          } else {
            newY = first.y + idx * spacing + idx * first.height - (first.y - first.y);
          }
          return { ...s, x: newX, y: newY };
        })
      };
    }
    
    case 'BRING_FORWARD': {
      const { ids } = action.payload;
      return {
        ...state,
        shapes: [...state.shapes].sort((a, b) => {
          if (ids.includes(a.id) && !ids.includes(b.id)) return 1;
          if (!ids.includes(a.id) && ids.includes(b.id)) return -1;
          return 0;
        })
      };
    }
    
    case 'SEND_BACKWARD': {
      const { ids } = action.payload;
      return {
        ...state,
        shapes: [...state.shapes].sort((a, b) => {
          if (ids.includes(a.id) && !ids.includes(b.id)) return -1;
          if (!ids.includes(a.id) && ids.includes(b.id)) return 1;
          return 0;
        })
      };
    }
    
    case 'DUPLICATE_SHAPES': {
      const { ids, offsetX = 20, offsetY = 20 } = action.payload;
      const selectedShapes = state.shapes.filter(s => ids.includes(s.id));
      const selectedArrows = state.arrows.filter(a => ids.includes(a.fromShapeId) || ids.includes(a.toShapeId));
      const idMap = {};
      
      const newShapes = selectedShapes.map(s => {
        const newId = generateId('shape');
        idMap[s.id] = newId;
        return {
          ...s,
          id: newId,
          x: s.x + offsetX,
          y: s.y + offsetY,
          isSelected: false
        };
      });
      
      const newArrows = selectedArrows.map(a => ({
        ...a,
        id: generateId('arrow'),
        fromShapeId: idMap[a.fromShapeId] || a.fromShapeId,
        toShapeId: idMap[a.toShapeId] || a.toShapeId,
        isSelected: false
      })).filter(a => idMap[a.fromShapeId] && idMap[a.toShapeId]);
      
      return {
        ...state,
        shapes: [...state.shapes, ...newShapes],
        arrows: [...state.arrows, ...newArrows],
        selectedIds: newShapes.map(s => s.id)
      };
    }
    
    case 'COPY_SHAPES': {
      return { ...state, copiedShapes: action.payload };
    }
    
    case 'PASTE_SHAPES': {
      return {
        ...state,
        shapes: [...state.shapes, ...action.payload.shapes],
        arrows: [...state.arrows, ...action.payload.arrows],
        selectedIds: action.payload.shapes.map(s => s.id)
      };
    }
    
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
    
    default:
      return state;
  }
}

export function useCanvas() {
  const [state, dispatch] = useReducer(canvasReducer, initialState);
  
  const createShape = useCallback((type, x, y) => {
    const defaults = {
      rect: { width: 140, height: 70, fillColor: '#8C64FF', strokeColor: '#FFFFFF' },
      circle: { width: 100, height: 100, fillColor: '#8C64FF', strokeColor: '#FFFFFF' },
      text: { width: 140, height: 50, fillColor: 'transparent', strokeColor: 'transparent' },
      sticky: { width: 160, height: 120, fillColor: '#F5A623', strokeColor: '#FFFFFF' }
    };
    
    const config = defaults[type] || defaults.rect;
    
    const shape = {
      id: generateId('shape'),
      type,
      x: x - config.width / 2,
      y: y - config.height / 2,
      width: config.width,
      height: config.height,
      label: '',
      fillColor: config.fillColor,
      strokeColor: config.strokeColor,
      strokeWidth: 1.5,
      textColor: '#FFFFFF',
      fontSize: 13,
      fontBold: false,
      fontItalic: false,
      opacity: 1,
      isSelected: false,
      aiGenerated: false
    };
    
    dispatch({ type: 'ADD_SHAPE', payload: shape });
    return shape;
  }, []);
  
  const updateShape = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_SHAPE', payload: { id, ...updates } });
  }, []);
  
  const deleteSelected = useCallback(() => {
    if (state.selectedIds.length > 0) {
      dispatch({ type: 'DELETE_SHAPES', payload: state.selectedIds });
    }
  }, [state.selectedIds]);
  
  const addArrow = useCallback((fromId, toId) => {
    if (fromId === toId) return null;
    
    const arrow = {
      id: generateId('arrow'),
      fromShapeId: fromId,
      toShapeId: toId,
      label: '',
      color: '#AAAAAA',
      strokeWidth: 1.5,
      style: 'solid',
      arrowHead: 'end',
      isSelected: false,
      aiGenerated: false
    };
    
    dispatch({ type: 'ADD_ARROW', payload: arrow });
    return arrow;
  }, []);
  
  const updateArrow = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_ARROW', payload: { id, ...updates } });
  }, []);
  
  const deleteArrow = useCallback((id) => {
    dispatch({ type: 'DELETE_ARROW', payload: id });
  }, []);
  
  const selectShape = useCallback((id, shiftKey = false) => {
    dispatch({ type: 'SELECT_SHAPE', payload: id, shiftKey });
  }, []);
  
  const selectArrow = useCallback((id) => {
    dispatch({ type: 'SELECT_ARROW', payload: id });
  }, []);
  
  const deselectAll = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL' });
  }, []);
  
  const selectAll = useCallback(() => {
    dispatch({ type: 'SELECT_ALL' });
  }, []);
  
  const setTool = useCallback((tool) => {
    dispatch({ type: 'SET_TOOL', payload: tool });
  }, []);
  
  const setZoom = useCallback((zoom) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);
  
  const setPan = useCallback((x, y) => {
    dispatch({ type: 'SET_PAN', payload: { x, y } });
  }, []);
  
  const startConnecting = useCallback((shapeId) => {
    dispatch({ type: 'START_CONNECTING', payload: shapeId });
  }, []);
  
  const cancelConnecting = useCallback(() => {
    dispatch({ type: 'CANCEL_CONNECTING' });
  }, []);
  
  const setAiPanelOpen = useCallback((open) => {
    dispatch({ type: 'SET_AI_PANEL', payload: open });
  }, []);
  
  const setAiMode = useCallback((mode) => {
    dispatch({ type: 'SET_AI_MODE', payload: mode });
  }, []);
  
  const setAiLoading = useCallback((loading) => {
    dispatch({ type: 'SET_AI_LOADING', payload: loading });
  }, []);
  
  const addAiElements = useCallback((shapes, arrows) => {
    dispatch({ type: 'ADD_AI_ELEMENTS', payload: { shapes, arrows } });
  }, []);
  
  const updateElements = useCallback((shapes, arrows) => {
    dispatch({ type: 'UPDATE_ELEMENTS', payload: { shapes, arrows } });
  }, []);
  
  const setTitle = useCallback((title) => {
    dispatch({ type: 'SET_TITLE', payload: title });
  }, []);
  
  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  }, []);
  
  const toggleSnapToGrid = useCallback(() => {
    dispatch({ type: 'TOGGLE_SNAP_GRID' });
  }, []);
  
  const setGridSize = useCallback((size) => {
    dispatch({ type: 'SET_GRID_SIZE', payload: size });
  }, []);
  
  const loadDiagram = useCallback((data) => {
    dispatch({ type: 'LOAD_DIAGRAM', payload: data });
  }, []);
  
  const clearCanvas = useCallback(() => {
    dispatch({ type: 'CLEAR_CANVAS' });
  }, []);
  
  const multiSelect = useCallback((ids) => {
    dispatch({ type: 'MULTI_SELECT', payload: ids });
  }, []);
  
  const snapToGrid = useCallback((value, gridSize) => {
    return Math.round(value / gridSize) * gridSize;
  }, []);
  
  const alignShapes = useCallback((alignment) => {
    if (state.selectedIds.length < 2) return;
    dispatch({ type: 'ALIGN_SHAPES', payload: { alignment, ids: state.selectedIds } });
  }, [state.selectedIds]);
  
  const distributeShapes = useCallback((direction) => {
    if (state.selectedIds.length < 3) return;
    dispatch({ type: 'DISTRIBUTE_SHAPES', payload: { direction, ids: state.selectedIds } });
  }, [state.selectedIds]);
  
  const bringForward = useCallback(() => {
    if (state.selectedIds.length === 0) return;
    dispatch({ type: 'BRING_FORWARD', payload: { ids: state.selectedIds } });
  }, [state.selectedIds]);
  
  const sendBackward = useCallback(() => {
    if (state.selectedIds.length === 0) return;
    dispatch({ type: 'SEND_BACKWARD', payload: { ids: state.selectedIds } });
  }, [state.selectedIds]);
  
  const duplicateSelected = useCallback(() => {
    if (state.selectedIds.length === 0) return;
    dispatch({ type: 'DUPLICATE_SHAPES', payload: { ids: state.selectedIds } });
  }, [state.selectedIds]);
  
  const copySelected = useCallback(() => {
    const shapes = state.shapes.filter(s => state.selectedIds.includes(s.id));
    const arrows = state.arrows.filter(a => 
      state.selectedIds.includes(a.fromShapeId) && state.selectedIds.includes(a.toShapeId)
    );
    if (shapes.length > 0) {
      dispatch({ type: 'COPY_SHAPES', payload: { shapes, arrows } });
    }
  }, [state.selectedIds, state.shapes, state.arrows]);
  
  const pasteCopied = useCallback(() => {
    if (!state.copiedShapes) return;
    const idMap = {};
    const newShapes = state.copiedShapes.shapes.map(s => {
      const newId = generateId('shape');
      idMap[s.id] = newId;
      return { ...s, id: newId, x: s.x + 20, y: s.y + 20, isSelected: false };
    });
    const newArrows = state.copiedShapes.arrows.map(a => ({
      ...a,
      id: generateId('arrow'),
      fromShapeId: idMap[a.fromShapeId] || a.fromShapeId,
      toShapeId: idMap[a.toShapeId] || a.toShapeId,
      isSelected: false
    })).filter(a => idMap[a.fromShapeId] && idMap[a.toShapeId]);
    dispatch({ type: 'PASTE_SHAPES', payload: { shapes: newShapes, arrows: newArrows } });
  }, [state.copiedShapes]);
  
  const setDarkMode = useCallback((mode) => {
    dispatch({ type: 'SET_DARK_MODE', payload: mode });
  }, []);
  
  return {
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
    loadDiagram,
    clearCanvas,
    multiSelect,
    toggleSnapToGrid,
    setGridSize,
    snapToGrid,
    alignShapes,
    distributeShapes,
    bringForward,
    sendBackward,
    duplicateSelected,
    copySelected,
    pasteCopied,
    setDarkMode
  };
}