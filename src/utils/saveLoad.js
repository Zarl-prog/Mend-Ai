import { generateId } from './uid';

export function saveDiagram(title, shapes, arrows) {
  const data = {
    version: '1.0',
    title,
    shapes,
    arrows
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadDiagram(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!data.shapes || !data.arrows) {
          throw new Error('Invalid file format');
        }
        
        const shapes = data.shapes.map(shape => ({
          id: shape.id || generateId('shape'),
          type: shape.type || 'rect',
          x: shape.x || 100,
          y: shape.y || 100,
          width: shape.width || 140,
          height: shape.height || 70,
          label: shape.label || '',
          fillColor: shape.fillColor || '#6C47FF',
          strokeColor: shape.strokeColor || '#FFFFFF',
          strokeWidth: shape.strokeWidth || 1.5,
          textColor: shape.textColor || '#FFFFFF',
          fontSize: shape.fontSize || 13,
          fontBold: shape.fontBold || false,
          fontItalic: shape.fontItalic || false,
          opacity: shape.opacity ?? 1,
          isSelected: false,
          aiGenerated: shape.aiGenerated || false
        }));
        
        const arrows = data.arrows.map(arrow => ({
          id: arrow.id || generateId('arrow'),
          fromShapeId: arrow.fromShapeId || '',
          toShapeId: arrow.toShapeId || '',
          label: arrow.label || '',
          color: arrow.color || '#AAAAAA',
          strokeWidth: arrow.strokeWidth || 1.5,
          style: arrow.style || 'solid',
          arrowHead: arrow.arrowHead || 'end',
          isSelected: false,
          aiGenerated: arrow.aiGenerated || false
        }));
        
        resolve({
          title: data.title || 'Untitled Diagram',
          shapes,
          arrows
        });
      } catch (err) {
        reject(new Error('Invalid file format'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}