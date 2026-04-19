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
  gridSize: 20
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
    snapToGrid
  };
}