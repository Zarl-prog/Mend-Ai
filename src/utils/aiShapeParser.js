import { generateId } from './uid';
import { applyLayout } from './layoutEngine';

export function parseAIResponse(rawText, offsetX = 0, offsetY = 0, preservePositions = false) {
  let cleanedText = rawText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (e) {
    throw new Error('AI response was malformed. Try again.');
  }

  if (!parsed.shapes || !Array.isArray(parsed.shapes)) {
    throw new Error('AI response missing shapes array');
  }

  if (!parsed.arrows || !Array.isArray(parsed.arrows)) {
    throw new Error('AI response missing arrows array');
  }

  const layoutType = parsed.layoutType || 'linear';
  
  const idMap = {};
  const shapes = parsed.shapes.map((shape, index) => {
    const newId = generateId('shape');
    idMap[shape.id || `s${index + 1}`] = newId;
    
    return {
      id: newId,
      type: shape.type || 'rect',
      width: shape.width || 160,
      height: shape.height || 60,
      label: shape.label || '',
      fillColor: shape.fillColor || '#4A5568',
      strokeColor: shape.strokeColor || 'rgba(255,255,255,0.15)',
      strokeWidth: shape.strokeWidth ?? 1,
      textColor: shape.textColor || '#FFFFFF',
      fontSize: shape.fontSize || 13,
      fontBold: shape.fontBold || false,
      fontItalic: shape.fontItalic || false,
      opacity: shape.opacity ?? 1,
      isSelected: false,
      aiGenerated: true
    };
  });

  const arrows = parsed.arrows.map((arrow, index) => {
    const fromId = idMap[arrow.fromShapeId] || arrow.fromShapeId;
    const toId = idMap[arrow.toShapeId] || arrow.toShapeId;
    
    return {
      id: generateId('arrow'),
      fromShapeId: fromId,
      toShapeId: toId,
      label: arrow.label || '',
      color: arrow.color || '#63B3ED',
      strokeWidth: arrow.strokeWidth ?? 1.5,
      style: arrow.style || 'solid',
      arrowHead: arrow.arrowHead || 'end',
      isSelected: false,
      aiGenerated: true
    };
  });

  let positionedShapes;
  if (preservePositions) {
    positionedShapes = shapes;
  } else {
    positionedShapes = applyLayout(shapes, layoutType);
  }
  
  const offsetShapes = offsetX !== 0 || offsetY !== 0
    ? positionedShapes.map(s => ({ ...s, x: s.x + offsetX, y: s.y + offsetY }))
    : positionedShapes;

  return { shapes: offsetShapes, arrows };
}

function arrangeShapesWithLayout(shapes, arrows, startX, startY) {
  if (shapes.length === 0) return shapes;

  const minPadding = 40;
  const horizontalGap = 60;
  const verticalGap = 80;
  const canvasPadding = 60;
  const startOffsetX = startX + canvasPadding;
  const startOffsetY = startY + canvasPadding;

  const arrowTargets = arrows.map(a => a.toShapeId);
  const arrowSources = arrows.map(a => a.fromShapeId);
  const hasArrows = arrows.length > 0 && arrowTargets.length > 0;

  if (hasArrows) {
    const levels = buildHierarchyLevels(shapes, arrows);
    const arranged = [];
    
    levels.forEach((levelShapes, levelIndex) => {
      levelShapes.forEach((shape, shapeIndex) => {
        const x = startOffsetX + shapeIndex * (Math.max(shape.width, 140) + horizontalGap + minPadding);
        const y = startOffsetY + levelIndex * (Math.max(shape.height, 70) + verticalGap);
        arranged.push({ ...shape, x, y });
      });
    });
    
    const sortedByOriginalId = arranged.sort((a, b) => {
      const aIdx = shapes.findIndex(s => s.id === a.id);
      const bIdx = shapes.findIndex(s => s.id === b.id);
      return aIdx - bIdx;
    });
    
    return sortedByOriginalId;
  }

  const maxPerRow = Math.max(1, Math.floor(Math.sqrt(shapes.length)));
  const rowsNeeded = Math.ceil(shapes.length / maxPerRow);
  
  return shapes.map((shape, index) => {
    const row = Math.floor(index / maxPerRow);
    const col = index % maxPerRow;
    const width = Math.max(shape.width, 140) + minPadding;
    const height = Math.max(shape.height, 70) + minPadding;
    const x = startOffsetX + col * (width + horizontalGap);
    const y = startOffsetY + row * (height + verticalGap);
    return { ...shape, x, y };
  });
}

function buildHierarchyLevels(shapes, arrows) {
  const childrenMap = {};
  const parentMap = {};
  
  arrows.forEach(arrow => {
    if (!childrenMap[arrow.fromShapeId]) {
      childrenMap[arrow.fromShapeId] = [];
    }
    childrenMap[arrow.fromShapeId].push(arrow.toShapeId);
    parentMap[arrow.toShapeId] = arrow.fromShapeId;
  });

  const rootShapes = shapes.filter(s => !parentMap[s.id]);
  const levels = [];
  
  function getDescendants(shapeId, visited = new Set()) {
    if (visited.has(shapeId)) return [];
    visited.add(shapeId);
    
    const children = childrenMap[shapeId] || [];
    let allDescendants = [...children];
    
    children.forEach(childId => {
      allDescendants = allDescendants.concat(getDescendants(childId, visited));
    });
    
    return allDescendants;
  }

  rootShapes.forEach(root => {
    const descendants = getDescendants(root.id);
    const level0 = [root];
    const remaining = shapes.filter(s => s.id !== root.id && !descendants.includes(s.id));
    
    levels.push(level0);
    
    if (remaining.length > 0) {
      const childLevel = [];
      descendants.forEach(descId => {
        const shape = shapes.find(s => s.id === descId);
        if (shape && !childLevel.includes(shape)) {
          childLevel.push(shape);
        }
      });
      if (childLevel.length > 0) {
        levels.push(childLevel);
      }
    }
  });

  const unvisited = shapes.filter(s => {
    return !rootShapes.includes(s) && !levels.flat().includes(s);
  });
  
  if (unvisited.length > 0) {
    levels.push(unvisited);
  }

  return levels.filter(level => level.length > 0);
}

export function getAutoFitBounds(shapes, arrows, padding = 50) {
  if (shapes.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  shapes.forEach(shape => {
    minX = Math.min(minX, shape.x);
    minY = Math.min(minY, shape.y);
    maxX = Math.max(maxX, shape.x + shape.width);
    maxY = Math.max(maxY, shape.y + shape.height);
  });

  arrows.forEach(arrow => {
    const fromShape = shapes.find(s => s.id === arrow.fromShapeId);
    const toShape = shapes.find(s => s.id === arrow.toShapeId);
    
    if (fromShape) {
      minX = Math.min(minX, fromShape.x);
      minY = Math.min(minY, fromShape.y);
      maxX = Math.max(maxX, fromShape.x + fromShape.width);
      maxY = Math.max(maxY, fromShape.y + fromShape.height);
    }
    
    if (toShape) {
      minX = Math.min(minX, toShape.x);
      minY = Math.min(minY, toShape.y);
      maxX = Math.max(maxX, toShape.x + toShape.width);
      maxY = Math.max(maxY, toShape.y + toShape.height);
    }
  });

  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}