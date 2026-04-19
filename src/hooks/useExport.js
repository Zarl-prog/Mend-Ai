import { useCallback } from 'react';

export function useExport() {
  const exportSVG = useCallback((svgElement, title) => {
    try {
      const svg = svgElement;
      if (!svg || svg.tagName !== 'svg') {
        console.error('Invalid SVG element');
        return false;
      }
      
      const clonedSvg = svg.cloneNode(true);
      
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(title || 'diagram').replace(/[^a-z0-9]/gi, '_')}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Export SVG error:', error);
      return false;
    }
  }, []);
  
  const exportPNG = useCallback((svgElement, title) => {
    try {
      const svg = svgElement;
      if (!svg || svg.tagName !== 'svg') {
        console.error('Invalid SVG element');
        return false;
      }
      
      const clonedSvg = svg.cloneNode(true);
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${(title || 'diagram').replace(/[^a-z0-9]/gi, '_')}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 'image/png');
      };
      
      img.onerror = () => {
        console.error('Failed to load SVG image');
      };
      
      const encoded = btoa(unescape(encodeURIComponent(svgString)));
      img.src = 'data:image/svg+xml;base64,' + encoded;
      
      return true;
    } catch (error) {
      console.error('Export PNG error:', error);
      return false;
    }
  }, []);

  return { exportSVG, exportPNG };
}