import React, { useState } from 'react';
import BottomSheet from './BottomSheet';

export default function MobileTopBar({ 
  title, onNew, onSave, 
  onExportPNG, onExportSVG, onGoHome,
  onToggleAI, profile,
  onOpenSettings 
}) {
  const [showMenuSheet, setShowMenuSheet] = useState(false);

  return (
    <>
      <div className="mobile-top-bar fixed top-0 left-0 right-0 h-12 bg-panel border-b border-panel flex items-center justify-between px-4 z-30">
        <button 
          onClick={onGoHome}
          className="flex items-center gap-2"
        >
          <svg className="w-6 h-6 text-[#6C47FF]" viewBox="0 0 24 24" fill="none">
            <path d="M12,2 L19,5.5 L19,12.5 L12,16 L5,12.5 L5,5.5 Z" fill="currentColor" opacity="0.7"/>
            <path d="M12,5 L19,8.5 L12,12 L5,8.5 Z" fill="currentColor"/>
            <path d="M5,8.5 L5,15.5 L12,19 L12,12 Z" fill="currentColor" opacity="0.5"/>
          </svg>
          <span className="text-body font-semibold">MendAI</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAI}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#6C47FF] text-white"
            title="AI Assistant"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a2 2 0 012 2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2z"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
          </button>

          <button
            onClick={() => setShowMenuSheet(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-secondary hover:text-body hover:bg-hover"
            title="Menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>
      </div>

      <BottomSheet
        isOpen={showMenuSheet}
        onClose={() => setShowMenuSheet(false)}
        title="Menu"
        height="60%"
      >
        <div className="flex flex-col gap-1">
          <button
            onClick={() => { onNew(); setShowMenuSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-input text-body"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <path d="M14 2v6h6M12 18v-6M9 15h6"/>
            </svg>
            New Diagram
          </button>
          
          <button
            onClick={() => { onSave(); setShowMenuSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-input text-body"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <path d="M17 21v-8H7v8M7 3v5h8"/>
            </svg>
            Save Diagram
          </button>
          
          <div className="h-px bg-hover my-1" />
          
          <button
            onClick={() => { onExportPNG(); setShowMenuSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-input text-body"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            Export PNG
          </button>
          
          <button
            onClick={() => { onExportSVG(); setShowMenuSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-input text-body"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            </svg>
            Export SVG
          </button>
        </div>
      </BottomSheet>
    </>
  );
}