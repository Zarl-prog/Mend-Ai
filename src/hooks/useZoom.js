import { useCallback } from 'react';

export function useZoom() {
  const handleZoom = useCallback((e, zoom, setZoom, setPan) => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.25, Math.min(3.0, zoom + delta));
    
    if (newZoom === zoom) return;
    
    const scale = newZoom / zoom;
    const newPanX = mouseX - (mouseX - 0) * scale;
    const newPanY = mouseY - (mouseY - 0) * scale;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, []);
  
  const resetZoom = useCallback((setZoom, setPan) => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);
  
  return { handleZoom, resetZoom };
}