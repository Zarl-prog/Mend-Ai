import React, { useState } from 'react';
import BottomSheet from './BottomSheet';

const presetColors = ['#6C47FF', '#4A9EFF', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6', '#22C55E', '#EAB308', '#F97316', '#6366F1'];

export default function MobileProperties({ 
  selectedShape, 
  onUpdateShape, 
  onDuplicate, 
  onDelete,
  onLabelEdit
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLabelEditor, setShowLabelEditor] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [labelValue, setLabelValue] = useState('');

  if (!selectedShape) return null;

  const handleColorSelect = (color) => {
    onUpdateShape(selectedShape.id, { fillColor: color });
    setShowColorPicker(false);
  };

  const handleLabelSave = () => {
    onUpdateShape(selectedShape.id, { label: labelValue });
    setShowLabelEditor(false);
  };

  const handleLabelTap = () => {
    setLabelValue(selectedShape.label || '');
    setShowLabelEditor(true);
  };

  return (
    <>
      <div className="mobile-properties fixed bottom-14 left-2 right-2 z-20">
        <div className="h-11 bg-[#1A1A1A] border border-[#333] rounded-t-xl flex items-center justify-around px-2">
          <button
            onClick={() => setShowColorPicker(true)}
            className="flex-1 flex flex-col items-center justify-center h-full text-[#888] hover:text-white"
          >
            <div className="w-5 h-5 rounded border border-[#444]" style={{ backgroundColor: selectedShape.fillColor }} />
            <span className="text-[9px] mt-0.5">Color</span>
          </button>

          <button
            onClick={handleLabelTap}
            className="flex-1 flex flex-col items-center justify-center h-full text-[#888] hover:text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span className="text-[9px] mt-0.5">Label</span>
          </button>

          <button
            onClick={() => onDuplicate(selectedShape)}
            className="flex-1 flex flex-col items-center justify-center h-full text-[#888] hover:text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            <span className="text-[9px] mt-0.5">Duplicate</span>
          </button>

          <button
            onClick={() => onDelete(selectedShape.id)}
            className="flex-1 flex flex-col items-center justify-center h-full text-[#FC8181] hover:text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
            </svg>
            <span className="text-[9px] mt-0.5">Delete</span>
          </button>

          <button
            onClick={() => setShowMoreSheet(true)}
            className="flex-1 flex flex-col items-center justify-center h-full text-[#888] hover:text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="6" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="18" r="2"/>
            </svg>
            <span className="text-[9px] mt-0.5">More</span>
          </button>
        </div>
      </div>

      <BottomSheet
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        title="Fill Color"
        height="auto"
      >
        <div className="grid grid-cols-6 gap-2 mb-4">
          {presetColors.map(color => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={`w-full aspect-square rounded-lg border-2 ${
                selectedShape.fillColor === color ? 'border-white' : 'border-[#333]'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedShape.fillColor}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={selectedShape.fillColor}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="flex-1 bg-[#222] text-white text-sm px-3 py-2 rounded border border-[#333]"
          />
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={showLabelEditor}
        onClose={() => setShowLabelEditor(false)}
        title="Edit Label"
        height="auto"
      >
        <textarea
          value={labelValue}
          onChange={(e) => setLabelValue(e.target.value)}
          className="w-full bg-[#222] text-white text-base px-3 py-2 rounded border border-[#333] h-24 resize-none"
          placeholder="Enter label..."
          autoFocus
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowLabelEditor(false)}
            className="flex-1 py-2 bg-[#222] text-white rounded hover:bg-[#333]"
          >
            Cancel
          </button>
          <button
            onClick={handleLabelSave}
            className="flex-1 py-2 bg-[#6C47FF] text-white rounded hover:brightness-110"
          >
            Done
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={showMoreSheet}
        onClose={() => setShowMoreSheet(false)}
        title="Properties"
        height="60%"
      >
        <div className="space-y-4">
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
                value={selectedShape.strokeColor}
                onChange={(e) => onUpdateShape(selectedShape.id, { strokeColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedShape.strokeColor}
                onChange={(e) => onUpdateShape(selectedShape.id, { strokeColor: e.target.value })}
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

          <div className="flex gap-2 mt-6">
            <button
              onClick={() => { onDuplicate(selectedShape); setShowMoreSheet(false); }}
              className="flex-1 py-2 bg-[#222] text-white text-sm rounded hover:bg-[#333]"
            >
              Duplicate
            </button>
            <button
              onClick={() => { onDelete(selectedShape.id); setShowMoreSheet(false); }}
              className="flex-1 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}