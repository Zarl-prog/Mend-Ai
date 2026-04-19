export function calculateArrowPath(fromShape, toShape) {
  if (!fromShape || !toShape) return '';
  
  const fromCx = fromShape.x + fromShape.width / 2;
  const fromCy = fromShape.y + fromShape.height / 2;
  const toCx = toShape.x + toShape.width / 2;
  const toCy = toShape.y + toShape.height / 2;
  
  const fromRight = { x: fromShape.x + fromShape.width, y: fromCy };
  const fromLeft = { x: fromShape.x, y: fromCy };
  const fromTop = { x: fromCx, y: fromShape.y };
  const fromBottom = { x: fromCx, y: fromShape.y + fromShape.height };
  
  const toRight = { x: toShape.x + toShape.width, y: toCy };
  const toLeft = { x: toShape.x, y: toCy };
  const toTop = { x: toCx, y: toShape.y };
  const toBottom = { x: toCx, y: toShape.y + toShape.height };
  
  let startPoint, endPoint;
  let dx = toCx - fromCx;
  let dy = toCy - fromCy;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      startPoint = fromRight;
      endPoint = toLeft;
    } else {
      startPoint = fromLeft;
      endPoint = toRight;
    }
  } else {
    if (dy > 0) {
      startPoint = fromBottom;
      endPoint = toTop;
    } else {
      startPoint = fromTop;
      endPoint = toBottom;
    }
  }
  
  const midX = (startPoint.x + endPoint.x) / 2;
  const midY = (startPoint.y + endPoint.y) / 2;
  
  const controlOffset = 80;
  const ctrl1x = startPoint.x + (midX - startPoint.x) * 0.5;
  const ctrl1y = startPoint.y + (dy > 0 ? controlOffset : dy < 0 ? -controlOffset : 0);
  const ctrl2x = endPoint.x + (midX - endPoint.x) * 0.5;
  const ctrl2y = endPoint.y + (dy > 0 ? -controlOffset : dy < 0 ? controlOffset : 0);
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return `M ${startPoint.x} ${startPoint.y} C ${startPoint.x + (dx > 0 ? controlOffset : -controlOffset)} ${startPoint.y}, ${endPoint.x + (dx > 0 ? -controlOffset : controlOffset)} ${endPoint.y}, ${endPoint.x} ${endPoint.y}`;
  } else {
    return `M ${startPoint.x} ${startPoint.y} C ${startPoint.x} ${startPoint.y + (dy > 0 ? controlOffset : -controlOffset)}, ${endPoint.x} ${endPoint.y + (dy > 0 ? -controlOffset : controlOffset)}, ${endPoint.x} ${endPoint.y}`;
  }
}

export function getArrowMidpoint(path) {
  const parts = path.match(/M\s*([\d.]+),([\d.]+)\s*C\s*([\d.]+),([\d.]+)\s*([\d.]+),([\d.]+)\s*([\d.]+),([\d.]+)/);
  if (!parts) return { x: 0, y: 0 };
  
  const [, x1, y1, , , , x2, y2] = parts.map(Number);
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2
  };
}