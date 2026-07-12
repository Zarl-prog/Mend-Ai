import { generateId } from './uid';

export const templates = {
  flowchart: (startX = 100, startY = 100) => {
    const shapes = [
      { type: 'rect', x: startX, y: startY, width: 140, height: 70, fillColor: '#8C64FF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Start', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX, y: startY + 100, width: 140, height: 70, fillColor: '#4A9EFF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Process', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'diamond', x: startX - 20, y: startY + 200, width: 180, height: 90, fillColor: '#F59E0B', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Decision?', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'diamond' },
      { type: 'rect', x: startX, y: startY + 330, width: 140, height: 70, fillColor: '#10B981', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Yes', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX + 220, y: startY + 330, width: 140, height: 70, fillColor: '#EF4444', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'No', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX, y: startY + 450, width: 140, height: 70, fillColor: '#8C64FF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'End', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
    ].map(s => ({ ...s, id: generateId('shape') }));
    
    const arrows = [
      { id: generateId('arrow'), fromShapeId: shapes[0].id, toShapeId: shapes[1].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[1].id, toShapeId: shapes[2].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[2].id, toShapeId: shapes[3].id, label: 'Yes', color: '#10B981', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[2].id, toShapeId: shapes[4].id, label: 'No', color: '#EF4444', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[3].id, toShapeId: shapes[5].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
    ];
    
    return { shapes, arrows };
  },
  
  orgChart: (startX = 150, startY = 80) => {
    const shapes = [
      { type: 'rect', x: startX + 80, y: startY, width: 150, height: 70, fillColor: '#8C64FF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'CEO', labelPosition: 'center', fontBold: true, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX, y: startY + 130, width: 130, height: 60, fillColor: '#4A9EFF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'CTO', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX + 150, y: startY + 130, width: 130, height: 60, fillColor: '#4A9EFF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'CFO', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX + 300, y: startY + 130, width: 130, height: 60, fillColor: '#4A9EFF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'COO', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
    ].map(s => ({ ...s, id: generateId('shape') }));
    
    const arrows = [
      { id: generateId('arrow'), fromShapeId: shapes[0].id, toShapeId: shapes[1].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[0].id, toShapeId: shapes[2].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[0].id, toShapeId: shapes[3].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
    ];
    
    return { shapes, arrows };
  },
  
  mindMap: (startX = 300, startY = 200) => {
    const shapes = [
      { type: 'circle', x: startX - 60, y: startY - 60, width: 120, height: 120, fillColor: '#8C64FF', strokeColor: '#FFFFFF', strokeWidth: 2, textColor: '#FFFFFF', fontSize: 16, label: 'Main\nTopic', labelPosition: 'center', fontBold: true, fontItalic: false, opacity: 1, shapeStyle: 'circle' },
      { type: 'rect', x: startX + 160, y: startY - 100, width: 140, height: 60, fillColor: '#4A9EFF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Branch 1', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX + 160, y: startY + 40, width: 140, height: 60, fillColor: '#10B981', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Branch 2', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX - 300, y: startY - 100, width: 140, height: 60, fillColor: '#F59E0B', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Branch 3', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
    ].map(s => ({ ...s, id: generateId('shape') }));
    
    const arrows = [
      { id: generateId('arrow'), fromShapeId: shapes[0].id, toShapeId: shapes[1].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[0].id, toShapeId: shapes[2].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[0].id, toShapeId: shapes[3].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
    ];
    
    return { shapes, arrows };
  },
  
  cycle: (startX = 200, startY = 150) => {
    const shapes = [
      { type: 'circle', x: startX + 120, y: startY, width: 110, height: 110, fillColor: '#8C64FF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Phase 1', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'circle' },
      { type: 'circle', x: startX + 220, y: startY + 120, width: 110, height: 110, fillColor: '#4A9EFF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Phase 2', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'circle' },
      { type: 'circle', x: startX + 120, y: startY + 240, width: 110, height: 110, fillColor: '#10B981', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Phase 3', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'circle' },
      { type: 'circle', x: startX, y: startY + 120, width: 110, height: 110, fillColor: '#F59E0B', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Phase 4', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'circle' },
    ].map(s => ({ ...s, id: generateId('shape') }));
    
    const arrows = [
      { id: generateId('arrow'), fromShapeId: shapes[0].id, toShapeId: shapes[1].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[1].id, toShapeId: shapes[2].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[2].id, toShapeId: shapes[3].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[3].id, toShapeId: shapes[0].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
    ];
    
    return { shapes, arrows };
  },
  
  timeline: (startX = 50, startY = 200) => {
    const shapes = [
      { type: 'rect', x: startX, y: startY, width: 130, height: 70, fillColor: '#8C64FF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Step 1', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX + 170, y: startY, width: 130, height: 70, fillColor: '#4A9EFF', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Step 2', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX + 340, y: startY, width: 130, height: 70, fillColor: '#10B981', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Step 3', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
      { type: 'rect', x: startX + 510, y: startY, width: 130, height: 70, fillColor: '#F59E0B', strokeColor: '#FFFFFF', strokeWidth: 1.5, textColor: '#FFFFFF', fontSize: 16, label: 'Step 4', labelPosition: 'center', fontBold: false, fontItalic: false, opacity: 1, shapeStyle: 'rounded' },
    ].map(s => ({ ...s, id: generateId('shape') }));
    
    const arrows = [
      { id: generateId('arrow'), fromShapeId: shapes[0].id, toShapeId: shapes[1].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[1].id, toShapeId: shapes[2].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
      { id: generateId('arrow'), fromShapeId: shapes[2].id, toShapeId: shapes[3].id, label: '', color: '#AAAAAA', strokeWidth: 1.5, style: 'solid', arrowHead: 'end', isSelected: false },
    ];
    
    return { shapes, arrows };
  },
  
  grid: (startX = 100, startY = 100, rows = 3, cols = 3) => {
    const shapes = [];
    const cellWidth = 130;
    const cellHeight = 80;
    const gap = 30;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        shapes.push({
          id: generateId('shape'),
          type: 'rect',
          x: startX + c * (cellWidth + gap),
          y: startY + r * (cellHeight + gap),
          width: cellWidth,
          height: cellHeight,
          fillColor: '#8C64FF',
          strokeColor: '#FFFFFF',
          strokeWidth: 1,
          textColor: '#FFFFFF',
          fontSize: 16,
          label: '',
          labelPosition: 'center',
          fontBold: false,
          fontItalic: false,
          opacity: 1,
          shapeStyle: 'rounded'
        });
      }
    }
    return { shapes, arrows: [] };
  }
};

export const getTemplateList = () => [
  { id: 'flowchart', name: 'Flowchart', icon: '◇', description: 'Decision flow diagram' },
  { id: 'orgChart', name: 'Org Chart', icon: '▣', description: 'Organization hierarchy' },
  { id: 'mindMap', name: 'Mind Map', icon: '✦', description: 'Brainstorming map' },
  { id: 'cycle', name: 'Cycle', icon: '○', description: 'Continuous process' },
  { id: 'timeline', name: 'Timeline', icon: '→', description: 'Step by step flow' },
  { id: 'grid', name: 'Grid', icon: '▦', description: '3x3 layout' },
];