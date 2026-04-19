import { useCallback } from 'react';

const MAX_HISTORY = 50;

export function useHistory(initialState) {
  const state = initialState || { shapes: [], arrows: [] };
  
  let history = [];
  let index = -1;
  
  const pushState = useCallback((newState) => {
    if (index < history.length - 1) {
      history = history.slice(0, index + 1);
    }
    
    history.push(JSON.parse(JSON.stringify(newState)));
    
    if (history.length > MAX_HISTORY) {
      history.shift();
    } else {
      index++;
    }
  }, []);
  
  const undo = useCallback(() => {
    if (index > 0) {
      index--;
      return JSON.parse(JSON.stringify(history[index]));
    }
    return null;
  }, []);
  
  const redo = useCallback(() => {
    if (index < history.length - 1) {
      index++;
      return JSON.parse(JSON.stringify(history[index]));
    }
    return null;
  }, []);
  
  const canUndo = index > 0;
  const canRedo = index < history.length - 1;
  
  const clear = useCallback(() => {
    history = [];
    index = -1;
  }, []);
  
  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear
  };
}