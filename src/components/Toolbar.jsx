import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const tools = [
  { id: 'select', icon: '✥', label: 'Select', shortcut: 'V' },
  { id: 'rect', icon: '▢', label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: '○', label: 'Circle', shortcut: 'C' },
  { id: 'text', icon: 'T', label: 'Text Box', shortcut: 'T' },
  { id: 'sticky', icon: '▤', label: 'Sticky Note', shortcut: 'S' },
  { id: 'arrow', icon: '⟶', label: 'Arrow', shortcut: 'A' },
];

const shapeTypes = [
  { id: 'rect', label: 'Rectangle' },
  { id: 'circle', label: 'Circle' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'cylinder', label: 'Cylinder' },
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

export default function Toolbar({ 
  tool, setTool, canUndo, canRedo, onUndo, onRedo, 
  onDelete, onSelectAll, selectedCount, snapToGrid, onToggleSnap,
  onAlignLeft, onAlignCenter, onAlignRight, onAlignTop, onAlignMiddle, onAlignBottom,
  onDistributeH, onDistributeV, onBringForward, onSendBackward,
  onDuplicate, onCopy, onPaste, onToggleDarkMode, darkMode,
  hasCopiedShapes, onToggleShortcuts,
  onOpenAuth, onOpenSettings
}) {
  const { user, profile, signOut } = useAuth()
  
  const getInitial = () => {
    return (profile?.display_name || user?.email?.[0] || 'U').toUpperCase()[0]
  }
  
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

      <div className="w-10 h-px bg-[#222] my-2" />

      <ToolButton tool={{ label: 'Copy', shortcut: 'Ctrl+C' }} isActive={selectedCount > 0} onClick={onCopy}>
        ⧉
      </ToolButton>
      <ToolButton tool={{ label: 'Paste', shortcut: 'Ctrl+V' }} isActive={!!hasCopiedShapes} onClick={onPaste}>
        ⎘
      </ToolButton>
      <ToolButton tool={{ label: 'Duplicate', shortcut: 'Ctrl+D' }} isActive={selectedCount > 0} onClick={onDuplicate}>
        ⊕
      </ToolButton>

      <div className="w-10 h-px bg-[#222] my-2" />

      <button
        onClick={onAlignLeft}
        disabled={selectedCount < 2}
        className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all disabled:opacity-30 ${
          selectedCount >= 2 ? 'hover:bg-[#222] text-[#888] hover:text-white' : 'text-[#444] cursor-not-allowed'
        }`}
        title="Align Left"
      >
        ⬌
      </button>
      <button
        onClick={onAlignCenter}
        disabled={selectedCount < 2}
        className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all disabled:opacity-30 ${
          selectedCount >= 2 ? 'hover:bg-[#222] text-[#888] hover:text-white' : 'text-[#444] cursor-not-allowed'
        }`}
        title="Align Center"
      >
        ⊘
      </button>
      <button
        onClick={onAlignRight}
        disabled={selectedCount < 2}
        className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all disabled:opacity-30 ${
          selectedCount >= 2 ? 'hover:bg-[#222] text-[#888] hover:text-white' : 'text-[#444] cursor-not-allowed'
        }`}
        title="Align Right"
      >
        ⇥
      </button>

      <div className="w-10 h-px bg-[#222] my-1" />

      <button
        onClick={onAlignTop}
        disabled={selectedCount < 2}
        className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all disabled:opacity-30 ${
          selectedCount >= 2 ? 'hover:bg-[#222] text-[#888] hover:text-white' : 'text-[#444] cursor-not-allowed'
        }`}
        title="Align Top"
      >
        ⬍
      </button>
      <button
        onClick={onAlignMiddle}
        disabled={selectedCount < 2}
        className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all disabled:opacity-30 ${
          selectedCount >= 2 ? 'hover:bg-[#222] text-[#888] hover:text-white' : 'text-[#444] cursor-not-allowed'
        }`}
        title="Align Middle"
      >
        ⦿
      </button>
      <button
        onClick={onAlignBottom}
        disabled={selectedCount < 2}
        className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all disabled:opacity-30 ${
          selectedCount >= 2 ? 'hover:bg-[#222] text-[#888] hover:text-white' : 'text-[#444] cursor-not-allowed'
        }`}
        title="Align Bottom"
      >
        ⬎
      </button>

      <div className="w-10 h-px bg-[#222] my-2" />

      <button
        onClick={onBringForward}
        disabled={selectedCount === 0}
        className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all disabled:opacity-30 ${
          selectedCount > 0 ? 'hover:bg-[#222] text-[#888] hover:text-white' : 'text-[#444] cursor-not-allowed'
        }`}
        title="Bring to Front"
      >
        ⇧
      </button>
      <button
        onClick={onSendBackward}
        disabled={selectedCount === 0}
        className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all disabled:opacity-30 ${
          selectedCount > 0 ? 'hover:bg-[#222] text-[#888] hover:text-white' : 'text-[#444] cursor-not-allowed'
        }`}
        title="Send to Back"
      >
        ⇩
      </button>

      <div className="w-10 h-px bg-[#222] my-2" />

      <ToolButton tool={{ label: 'Dark Mode', shortcut: '' }} isActive={darkMode} onClick={onToggleDarkMode}>
        {darkMode ? '🌙' : '☀'}
      </ToolButton>
      <ToolButton tool={{ label: 'Keyboard Shortcuts', shortcut: '?' }} isActive={false} onClick={onToggleShortcuts}>
        ?
      </ToolButton>

      <div className="w-10 h-px bg-[#222] my-2" />

      {!user ? (
        <button
          onClick={onOpenAuth}
          className="w-10 h-10 flex items-center justify-center text-lg text-[#888] hover:text-white rounded-lg hover:bg-[#222]"
          title="Sign in"
        >
          👤
        </button>
      ) : (
        <>
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full bg-[#6C47FF] text-white flex items-center justify-center text-sm font-semibold hover:brightness-110"
            title={profile?.display_name || user?.email}
          >
            {getInitial()}
          </button>
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 flex items-center justify-center text-lg text-[#888] hover:text-white rounded-lg hover:bg-[#222]"
            title="Settings"
          >
            ⚙
          </button>
          <button
            onClick={signOut}
            className="w-10 h-10 flex items-center justify-center text-lg text-[#888] hover:text-[#FC8181] rounded-lg hover:bg-[#222]"
            title="Sign out"
          >
            ⏻
          </button>
        </>
      )}
    </div>
  );
}

export { shapeTypes };