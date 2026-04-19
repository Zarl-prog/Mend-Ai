import React, { useState, useRef } from 'react';

const tools = [
  { id: 'select', icon: '✥', label: 'Select', shortcut: 'V' },
  { id: 'rect', icon: '▢', label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: '○', label: 'Circle', shortcut: 'C' },
  { id: 'text', icon: 'T', label: 'Text Box', shortcut: 'T' },
  { id: 'sticky', icon: '▤', label: 'Sticky Note', shortcut: 'S' },
  { id: 'arrow', icon: '⟶', label: 'Arrow', shortcut: 'A' },
];

function ToolButton({ tool, isActive, onClick, disabled, children }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShowTooltip(true), 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        className={`w-10 h-10 flex items-center justify-center text-lg rounded-lg transition-all ${
          isActive
            ? 'bg-[#6C47FF] text-white'
            : disabled
              ? 'text-[#444] cursor-not-allowed'
              : 'hover:bg-[#222] text-[#888] hover:text-white'
        }`}
      >
        {children}
      </button>
      {showTooltip && !disabled && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#222] text-white text-sm px-3 py-1.5 rounded-md whitespace-nowrap z-50">
          {tool.label} <span className="text-[#888] ml-1">({tool.shortcut})</span>
        </div>
      )}
    </div>
  );
}

export default function Toolbar({ tool, setTool, canUndo, canRedo, onUndo, onRedo, onDelete, onSelectAll, selectedCount, snapToGrid, onToggleSnap }) {
  return (
    <div className="w-14 bg-[#141414] border-r border-[#222] flex flex-col items-center py-3 gap-1">
      {tools.map((t) => (
        <ToolButton
          key={t.id}
          tool={t}
          isActive={tool === t.id}
          onClick={() => setTool(t.id)}
        >
          {t.icon}
        </ToolButton>
      ))}
      
      <div className="w-10 h-px bg-[#222] my-2" />
      
      <ToolButton tool={{ label: 'Snap to Grid', shortcut: '#' }} isActive={snapToGrid} onClick={onToggleSnap}>
        #
      </ToolButton>
      
      <ToolButton tool={{ label: 'Undo', shortcut: 'Ctrl+Z' }} isActive={false} onClick={onUndo} disabled={!canUndo}>
        <span className={canUndo ? '' : 'text-[#444]'}>↩</span>
      </ToolButton>
      <ToolButton tool={{ label: 'Redo', shortcut: 'Ctrl+Y' }} isActive={false} onClick={onRedo} disabled={!canRedo}>
        <span className={canRedo ? '' : 'text-[#444]'}>↪</span>
      </ToolButton>
      
      <div className="w-10 h-px bg-[#222] my-2" />
      
      <ToolButton tool={{ label: 'Delete', shortcut: 'Del' }} isActive={selectedCount > 0} onClick={onDelete}>
        <span className={selectedCount > 0 ? 'text-[#E05252]' : 'text-[#444]'}>🗑</span>
      </ToolButton>
      <ToolButton tool={{ label: 'Select All', shortcut: 'Ctrl+A' }} isActive={false} onClick={onSelectAll}>
        🔲
      </ToolButton>
    </div>
  );
}