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
      const svgEl = svgElement;
      if (!svgEl || svgEl.tagName !== 'svg') {
        console.error('Invalid SVG element');
        return false;
      }
      
      const clone = svgEl.cloneNode(true);
      
      clone.querySelectorAll('.resize-handle, .connection-dot, .selection-outline').forEach(el => el.remove());
      
      const allShapes = [...svgEl.querySelectorAll('[data-shape-id]'), ...svgEl.querySelectorAll('.canvas-shape, .canvas-arrow')];
      
      let minX = Infinity, minY = Infinity;
      let maxX = -Infinity, maxY = -Infinity;
      
      allShapes.forEach(shape => {
        const rect = shape.getBoundingClientRect();
        const svgRect = svgEl.getBoundingClientRect();
        minX = Math.min(minX, rect.left - svgRect.left);
        minY = Math.min(minY, rect.top - svgRect.top);
        maxX = Math.max(maxX, rect.right - svgRect.left);
        maxY = Math.max(maxY, rect.bottom - svgRect.top);
      });
      
      const padding = 40;
      const width = maxX - minX + padding * 2;
      const height = maxY - minY + padding * 2;
      
      const exportW = isFinite(width) ? width : svgEl.clientWidth;
      const exportH = isFinite(height) ? height : svgEl.clientHeight;
      
      clone.setAttribute('width', exportW);
      clone.setAttribute('height', exportH);
      clone.setAttribute('viewBox', isFinite(minX) ? `${minX - padding} ${minY - padding} ${exportW} ${exportH}` : `0 0 ${exportW} ${exportH}`);
      
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('width', '100%');
      bg.setAttribute('height', '100%');
      bg.setAttribute('fill', '#111111');
      clone.insertBefore(bg, clone.firstChild);
      
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = exportW * 2;
        canvas.height = exportH * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, exportW, exportH);
        ctx.drawImage(img, 0, 0, exportW, exportH);
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = (title || 'mendai-diagram').replace(/[^a-z0-9]/gi, '_') + '.png';
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          URL.revokeObjectURL(svgUrl);
        }, 'image/png');
      };
      
      img.onerror = () => {
        console.error('Export failed. Try again.');
        URL.revokeObjectURL(svgUrl);
      };
      
      img.src = svgUrl;
      
      return true;
    } catch (err) {
      console.error('Export error:', err);
      return false;
    }
  }, []);

  const exportPDF = useCallback((svgElement, title) => {
    try {
      const svg = svgElement;
      if (!svg || svg.tagName !== 'svg') {
        console.error('Invalid SVG element');
        return false;
      }
      
      const clonedSvg = svg.cloneNode(true);
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.style.backgroundColor = '#111111';
      
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const encoded = btoa(unescape(encodeURIComponent(svgString)));
      const dataUrl = 'data:image/svg+xml;base64,' + encoded;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        console.error('Could not open print window');
        return false;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title || 'diagram'}</title>
          <style>
            @page { margin: 0; }
            body { margin: 0; padding: 0; }
            svg { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" style="width:100%;height:100%;object-fit:contain;" onload="window.print();window.close();" />
        </body>
        </html>
      `);
      printWindow.document.close();
      
      return true;
    } catch (error) {
      console.error('Export PDF error:', error);
      return false;
    }
  }, []);

  return { exportSVG, exportPNG, exportPDF };
}