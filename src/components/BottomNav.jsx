import React, { useState } from 'react';
import BottomSheet from './BottomSheet';

const tools = [
  { id: 'select', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 3l14 9-7 2-3 7z"/>
    </svg>
  ), label: 'Select' },
  { id: 'rect', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
    </svg>
  ), label: 'Rect' },
  { id: 'circle', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/>
    </svg>
  ), label: 'Circle' },
  { id: 'text', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7V4h16v3M12 4v16M8 20h8"/>
    </svg>
  ), label: 'Text' },
  { id: 'arrow', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M14 7l7 5-7 5"/>
    </svg>
  ), label: 'Arrow' },
];

export default function BottomNav({ 
  tool, setTool, canUndo, canRedo, onUndo, onRedo, 
  onDelete, onSelectAll, selectedCount,
  onGoHome 
}) {
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showAccountSheet, setShowAccountSheet] = useState(false);

  return (
    <>
      <div className="mobile-bottom-nav fixed bottom-0 left-0 right-0 h-14 bg-[#141414] border-t border-[#222] flex items-center justify-around px-2 z-30">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg transition-colors ${
              tool === t.id
                ? 'text-[#6C47FF] bg-[rgba(108,71,255,0.1)]'
                : 'text-[#666] hover:text-white'
            }`}
          >
            {t.icon}
            <span className="text-[9px]">{t.label}</span>
          </button>
        ))}
        
        <button
          onClick={() => setShowMoreSheet(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-[#666] hover:text-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="6" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="18" r="2"/>
          </svg>
          <span className="text-[9px]">More</span>
        </button>
      </div>

      <BottomSheet
        isOpen={showMoreSheet}
        onClose={() => setShowMoreSheet(false)}
        title="More Tools"
        height="60%"
      >
        <div className="flex flex-col gap-1">
          <button
            onClick={() => { setTool('sticky'); setShowMoreSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="1"/>
              <path d="M8 4v16M4 8h16"/>
            </svg>
            Sticky Note
          </button>
          
          <div className="h-px bg-[#333] my-1" />
          
          <button
            onClick={() => { onUndo(); setShowMoreSheet(false); }}
            disabled={!canUndo}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white disabled:opacity-30"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5"/>
            </svg>
            Undo
          </button>
          <button
            onClick={() => { onRedo(); setShowMoreSheet(false); }}
            disabled={!canRedo}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white disabled:opacity-30"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10H11a5 5 0 00-5 5v2M21 10l-5-5M21 10l-5 5"/>
            </svg>
            Redo
          </button>
          
          <div className="h-px bg-[#333] my-1" />
          
          <button
            onClick={() => { onDelete(); setShowMoreSheet(false); }}
            disabled={selectedCount === 0}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-[#FC8181] disabled:opacity-30"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
            </svg>
            Delete Selected
          </button>
          <button
            onClick={() => { onSelectAll(); setShowMoreSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
            </svg>
            Select All
          </button>
          <button
            onClick={() => { setShowMoreSheet(false); onGoHome?.(); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z"/>
            </svg>
            Clear Canvas
          </button>
        </div>
      </BottomSheet>
    </>
  );
}