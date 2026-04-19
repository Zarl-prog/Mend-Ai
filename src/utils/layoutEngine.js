export function applyLayout(shapes, layoutType) {
  const SHAPE_W = 160
  const SHAPE_H = 60
  const CANVAS_W = 800
  const CANVAS_H = 520

  switch(layoutType) {
    case 'linear':   return linearLayout(shapes, SHAPE_W, SHAPE_H, CANVAS_W, CANVAS_H)
    case 'tree':     return treeLayout(shapes, SHAPE_W, SHAPE_H, CANVAS_W, CANVAS_H)
    case 'circle':   return circleLayout(shapes, SHAPE_W, SHAPE_H, CANVAS_W, CANVAS_H)
    case 'cluster':  return clusterLayout(shapes, SHAPE_W, SHAPE_H, CANVAS_W, CANVAS_H)
    default:        return linearLayout(shapes, SHAPE_W, SHAPE_H, CANVAS_W, CANVAS_H)
  }
}

function linearLayout(shapes, W, H, CW, CH) {
  const COL_GAP = 200
  const ROW_GAP = 160
  const COLS    = 4
  const START_X = 60
  const START_Y = 140

  return shapes.map((shape, i) => {
    const row = Math.floor(i / COLS)
    const col = row % 2 === 0
      ? i % COLS
      : COLS - 1 - (i % COLS)
    return {
      ...shape,
      x: START_X + col * COL_GAP,
      y: START_Y + row * ROW_GAP,
      width: W,
      height: H
    }
  })
}

function treeLayout(shapes, W, H, CW, CH) {
  const total = shapes.length
  if (total === 0) return shapes

  const rows = [[0], [], []]
  for (let i = 1; i < total; i++) {
    if (i <= 3) rows[1].push(i)
    else        rows[2].push(i)
  }

  const ROW_Y  = [60, 220, 380]
  const result = [...shapes]

  rows.forEach((row, rowIdx) => {
    const count   = row.length
    const totalW  = count * W + (count - 1) * 60
    const startX  = (CW - totalW) / 2
    row.forEach((shapeIdx, colIdx) => {
      result[shapeIdx] = {
        ...shapes[shapeIdx],
        x: startX + colIdx * (W + 60),
        y: ROW_Y[rowIdx],
        width: W,
        height: H
      }
    })
  })
  return result
}

function circleLayout(shapes, W, H, CW, CH) {
  const cx     = CW / 2 - W / 2
  const cy     = CH / 2 - H / 2
  const radius = Math.min(CW, CH) * 0.32
  const total  = shapes.length

  return shapes.map((shape, i) => {
    const angle = (2 * Math.PI / total) * i - Math.PI / 2
    return {
      ...shape,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      width: W,
      height: H
    }
  })
}

function clusterLayout(shapes, W, H, CW, CH) {
  const cx      = CW / 2 - W / 2
  const cy      = CH / 2 - H / 2
  const radius  = 200
  const result  = [...shapes]

  result[0] = { ...shapes[0], x: cx, y: cy, width: W, height: H }

  const surrounding = shapes.length - 1
  for (let i = 1; i < shapes.length; i++) {
    const angle = (2 * Math.PI / surrounding) * (i - 1) - Math.PI / 2
    result[i] = {
      ...shapes[i],
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      width: W,
      height: H
    }
  }
  return result
}