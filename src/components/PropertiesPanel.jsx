import React from 'react';

export default function PropertiesPanel({ selectedShapes, selectedArrow, onUpdateShape, onUpdateArrow, onDuplicate, onDelete, onDeleteAll, onDuplicateAll, onAlign }) {
  const selectedShape = selectedShapes.length === 1 ? selectedShapes[0] : null;
  const multipleSelected = selectedShapes.length > 1;
  
  if (!selectedShape && !selectedArrow && selectedShapes.length === 0) {
    return (
      <div className="w-60 bg-[#141414] border-l border-[#222] p-4 flex items-center justify-center">
        <p className="text-[#666] text-sm text-center">Select a shape to edit its properties</p>
      </div>
    );
  }
  
  if (selectedArrow) {
    return (
      <div className="w-60 bg-[#141414] border-l border-[#222] p-4 overflow-y-auto">
        <h3 className="text-white font-medium mb-4">Arrow Properties</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-[#888] text-sm block mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedArrow.color}
                onChange={(e) => onUpdateArrow(selectedArrow.id, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedArrow.color}
                onChange={(e) => onUpdateArrow(selectedArrow.id, { color: e.target.value })}
                className="flex-1 bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-1">Stroke Width</label>
            <input
              type="range"
              min="1"
              max="6"
              value={selectedArrow.strokeWidth}
              onChange={(e) => onUpdateArrow(selectedArrow.id, { strokeWidth: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-1">Line Style</label>
            <div className="flex gap-1">
              {['solid', 'dashed', 'dotted'].map((style) => (
                <button
                  key={style}
                  onClick={() => onUpdateArrow(selectedArrow.id, { style })}
                  className={`flex-1 py-1.5 text-xs rounded capitalize ${
                    selectedArrow.style === style
                      ? 'bg-[#6C47FF] text-white'
                      : 'bg-[#222] text-[#888] hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-1">Arrow Head</label>
            <div className="flex gap-1">
              {[
                { id: 'end', label: 'End' },
                { id: 'both', label: 'Both' },
                { id: 'none', label: 'None' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateArrow(selectedArrow.id, { arrowHead: opt.id })}
                  className={`flex-1 py-1.5 text-xs rounded ${
                    selectedArrow.arrowHead === opt.id
                      ? 'bg-[#6C47FF] text-white'
                      : 'bg-[#222] text-[#888] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-1">Label</label>
            <input
              type="text"
              value={selectedArrow.label || ''}
              onChange={(e) => onUpdateArrow(selectedArrow.id, { label: e.target.value })}
              className="w-full bg-[#222] text-white text-sm px-2 py-1.5 rounded border border-[#333]"
            />
          </div>
          
          <button
            onClick={() => onDelete(selectedArrow.id)}
            className="w-full py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors mt-4"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }
  
  if (multipleSelected) {
    const allSameFill = selectedShapes.every(s => s.fillColor === selectedShapes[0].fillColor);
    const allSameStroke = selectedShapes.every(s => s.strokeColor === selectedShapes[0].strokeColor);
    const allSameOpacity = selectedShapes.every(s => s.opacity === selectedShapes[0].opacity);
    
    return (
      <div className="w-60 bg-[#141414] border-l border-[#222] p-4 overflow-y-auto">
        <h3 className="text-white font-medium mb-4">{selectedShapes.length} shapes selected</h3>
        
        <div className="space-y-4">
          {allSameFill && (
            <div>
              <label className="text-[#888] text-sm block mb-1">Fill Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedShapes[0].fillColor}
                  onChange={(e) => selectedShapes.forEach(s => onUpdateShape(s.id, { fillColor: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedShapes[0].fillColor}
                  onChange={(e) => selectedShapes.forEach(s => onUpdateShape(s.id, { fillColor: e.target.value }))}
                  className="flex-1 bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
                />
              </div>
            </div>
          )}
          
          {allSameStroke && (
            <div>
              <label className="text-[#888] text-sm block mb-1">Stroke Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedShapes[0].strokeColor}
                  onChange={(e) => selectedShapes.forEach(s => onUpdateShape(s.id, { strokeColor: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedShapes[0].strokeColor}
                  onChange={(e) => selectedShapes.forEach(s => onUpdateShape(s.id, { strokeColor: e.target.value }))}
                  className="flex-1 bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
                />
              </div>
            </div>
          )}
          
          {allSameOpacity && (
            <div>
              <label className="text-[#888] text-sm block mb-1">Opacity</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedShapes[0].opacity}
                  onChange={(e) => selectedShapes.forEach(s => onUpdateShape(s.id, { opacity: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-white text-sm w-10">{Math.round(selectedShapes[0].opacity * 100)}%</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={onDeleteAll}
              className="flex-1 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Delete All
            </button>
            <button
              onClick={onDuplicateAll}
              className="flex-1 py-2 bg-[#222] text-white text-sm rounded hover:bg-[#333] transition-colors"
            >
              Duplicate
            </button>
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-2">Align</label>
            <div className="flex gap-1">
              <button onClick={() => onAlign('left')} className="flex-1 py-1.5 bg-[#222] text-[#888] text-xs rounded hover:text-white">Left</button>
              <button onClick={() => onAlign('center')} className="flex-1 py-1.5 bg-[#222] text-[#888] text-xs rounded hover:text-white">Center</button>
              <button onClick={() => onAlign('right')} className="flex-1 py-1.5 bg-[#222] text-[#888] text-xs rounded hover:text-white">Right</button>
            </div>
            <div className="flex gap-1 mt-1">
              <button onClick={() => onAlign('top')} className="flex-1 py-1.5 bg-[#222] text-[#888] text-xs rounded hover:text-white">Top</button>
              <button onClick={() => onAlign('middle')} className="flex-1 py-1.5 bg-[#222] text-[#888] text-xs rounded hover:text-white">Middle</button>
              <button onClick={() => onAlign('bottom')} className="flex-1 py-1.5 bg-[#222] text-[#888] text-xs rounded hover:text-white">Bottom</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (selectedShape) {
    return (
      <div className="w-60 bg-[#141414] border-l border-[#222] p-4 overflow-y-auto">
        <h3 className="text-white font-medium mb-4">Shape Properties</h3>
        
        <div className="space-y-4">
          <div className="bg-[#1a1a2e] rounded-lg p-3 border border-[#6C47FF]">
            <label className="text-[#6C47FF] text-xs font-semibold uppercase tracking-wide block mb-2">Label</label>
            <input
              type="text"
              value={selectedShape.label || ''}
              onChange={(e) => onUpdateShape(selectedShape.id, { label: e.target.value })}
              className="w-full bg-[#222] text-white text-sm px-3 py-2 rounded border border-[#444] focus:border-[#6C47FF] focus:outline-none"
              placeholder="Enter label..."
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#888] text-xs block mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedShape.x)}
                onChange={(e) => onUpdateShape(selectedShape.id, { x: Number(e.target.value) })}
                className="w-full bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
              />
            </div>
            <div>
              <label className="text-[#888] text-xs block mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedShape.y)}
                onChange={(e) => onUpdateShape(selectedShape.id, { y: Number(e.target.value) })}
                className="w-full bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
              />
            </div>
            <div>
              <label className="text-[#888] text-xs block mb-1">Width</label>
              <input
                type="number"
                value={Math.round(selectedShape.width)}
                onChange={(e) => onUpdateShape(selectedShape.id, { width: Math.max(40, Number(e.target.value)) })}
                className="w-full bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
              />
            </div>
            <div>
              <label className="text-[#888] text-xs block mb-1">Height</label>
              <input
                type="number"
                value={Math.round(selectedShape.height)}
                onChange={(e) => onUpdateShape(selectedShape.id, { height: Math.max(40, Number(e.target.value)) })}
                className="w-full bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-1">Fill Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedShape.fillColor}
                onChange={(e) => onUpdateShape(selectedShape.id, { fillColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedShape.fillColor}
                onChange={(e) => onUpdateShape(selectedShape.id, { fillColor: e.target.value })}
                className="flex-1 bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
              />
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {['#6C47FF', '#4A9EFF', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6', '#22C55E', '#EAB308', '#F97316', '#6366F1'].map(color => (
                <button
                  key={color}
                  onClick={() => onUpdateShape(selectedShape.id, { fillColor: color })}
                  className="w-5 h-5 rounded border border-[#333] hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-1">Opacity</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedShape.opacity}
                onChange={(e) => onUpdateShape(selectedShape.id, { opacity: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-white text-sm w-10">{Math.round(selectedShape.opacity * 100)}%</span>
            </div>
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-1">Stroke Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedShape.strokeColor && selectedShape.strokeColor !== 'transparent' ? selectedShape.strokeColor : '#FFFFFF'}
                onChange={(e) => onUpdateShape(selectedShape.id, { strokeColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedShape.strokeColor === 'transparent' ? '' : selectedShape.strokeColor}
                onChange={(e) => onUpdateShape(selectedShape.id, { strokeColor: e.target.value || 'transparent' })}
                placeholder="transparent"
                className="flex-1 bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-1">Stroke Width</label>
            <input
              type="range"
              min="0"
              max="8"
              value={selectedShape.strokeWidth}
              onChange={(e) => onUpdateShape(selectedShape.id, { strokeWidth: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-1">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedShape.textColor}
                onChange={(e) => onUpdateShape(selectedShape.id, { textColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedShape.textColor}
                onChange={(e) => onUpdateShape(selectedShape.id, { textColor: e.target.value })}
                className="flex-1 bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[#888] text-sm block mb-1">Font Size</label>
            <input
              type="number"
              min="10"
              max="48"
              value={selectedShape.fontSize}
              onChange={(e) => onUpdateShape(selectedShape.id, { fontSize: Number(e.target.value) })}
              className="w-full bg-[#222] text-white text-sm px-2 py-1 rounded border border-[#333]"
            />
          </div>

          <div>
            <label className="text-[#888] text-sm block mb-1">Shape Style</label>
            <div className="flex gap-1">
              {[
                { id: 'rect', label: 'Rect' },
                { id: 'rounded', label: 'Rounded' },
                { id: 'circle', label: 'Circle' },
                { id: 'diamond', label: 'Diamond' }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => onUpdateShape(selectedShape.id, { shapeStyle: style.id })}
                  className={`flex-1 py-1.5 text-xs rounded ${
                    selectedShape.shapeStyle === style.id
                      ? 'bg-[#6C47FF] text-white'
                      : 'bg-[#222] text-[#888] hover:text-white'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[#888] text-sm block mb-1">Label Position</label>
            <div className="flex gap-1">
              {[
                { id: 'top', label: 'Top' },
                { id: 'center', label: 'Center' },
                { id: 'bottom', label: 'Bottom' },
                { id: 'inside', label: 'Inside' }
              ].map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => onUpdateShape(selectedShape.id, { labelPosition: pos.id })}
                  className={`flex-1 py-1.5 text-xs rounded ${
                    selectedShape.labelPosition === pos.id
                      ? 'bg-[#6C47FF] text-white'
                      : 'bg-[#222] text-[#888] hover:text-white'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onUpdateShape(selectedShape.id, { fontBold: !selectedShape.fontBold })}
              className={`flex-1 py-1.5 text-sm rounded ${
                selectedShape.fontBold ? 'bg-[#6C47FF] text-white' : 'bg-[#222] text-[#888] hover:text-white'
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => onUpdateShape(selectedShape.id, { fontItalic: !selectedShape.fontItalic })}
              className={`flex-1 py-1.5 text-sm rounded ${
                selectedShape.fontItalic ? 'bg-[#6C47FF] text-white' : 'bg-[#222] text-[#888] hover:text-white'
              }`}
            >
              Italic
            </button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onDuplicate(selectedShape)}
              className="flex-1 py-2 bg-[#222] text-white text-sm rounded hover:bg-[#333] transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={() => onDelete(selectedShape.id)}
              className="flex-1 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}