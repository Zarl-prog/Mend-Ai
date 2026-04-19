import React, { useState, useRef, useEffect } from 'react';

export default function TopBar({ title, onTitleChange, onNew, onSave, onLoad, onCloudSave, onCloudLoad, onExportPNG, onExportSVG, onExportPDF, onToggleTheme, darkMode, onOpenTemplates, templateList, onGoHome }) {
  const fileInputRef = React.useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      onLoad(file);
    }
    e.target.value = '';
  };
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="h-12 bg-[#141414] border-b border-[#222] flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg className="w-6 h-6 text-[#6C47FF]" viewBox="0 0 24 24" fill="none">
            <path d="M12,2 L19,5.5 L19,12.5 L12,16 L5,12.5 L5,5.5 Z" fill="currentColor" opacity="0.7"/>
            <path d="M12,5 L19,8.5 L12,12 L5,8.5 Z" fill="currentColor"/>
            <path d="M5,8.5 L5,15.5 L12,19 L12,12 Z" fill="currentColor" opacity="0.5"/>
          </svg>
          <div className="text-white font-semibold">Mend AI</div>
        </button>
      </div>
      
      <div className="flex-1 max-w-md mx-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full bg-transparent text-white text-center border-none outline-none focus:ring-1 focus:ring-[#6C47FF] rounded px-2 py-1"
          placeholder="Untitled Diagram"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#222] rounded transition-colors flex items-center gap-1"
          >
            Templates ▾
          </button>
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-[#333]">
                <div className="text-xs text-[#666] uppercase tracking-wide px-2 py-1">Start with a template</div>
              </div>
              {templateList?.map((template) => (
                <button
                  key={template.id}
                  onClick={() => { onOpenTemplates(template.id); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left hover:bg-[#252525] flex items-center gap-3"
                >
                  <span className="text-lg">{template.icon}</span>
                  <div>
                    <div className="text-white text-sm">{template.name}</div>
                    <div className="text-[#666] text-xs">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={onNew}
          className="px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#222] rounded transition-colors"
        >
          New
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#222] rounded transition-colors flex items-center gap-1"
        >
          <span>↓</span> Save
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#222] rounded transition-colors flex items-center gap-1"
        >
          <span>↑</span> Load
        </button>
        
        <div className="w-px h-6 bg-[#222] mx-1" />
        
        <button
          onClick={onCloudSave}
          className="px-3 py-1.5 text-sm text-[#6C47FF] hover:text-white hover:bg-[#6C47FF]/20 rounded transition-colors flex items-center gap-1"
          title="Save to Cloud"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 8v9a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 2v9M8 6h8" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Cloud
        </button>
        <button
          onClick={onCloudLoad}
          className="px-3 py-1.5 text-sm text-[#6C47FF] hover:text-white hover:bg-[#6C47FF]/20 rounded transition-colors flex items-center gap-1"
          title="Load from Cloud"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 8v9a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 2v9M8 6h8" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Load
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleLoad}
          className="hidden"
        />
        
        <div className="w-px h-6 bg-[#222] mx-1" />
        
        <button
          onClick={onExportPNG}
          className="px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#222] rounded transition-colors"
        >
          Export PNG
        </button>
        <button
          onClick={onExportSVG}
          className="px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#222] rounded transition-colors"
        >
          SVG
        </button>
        <button
          onClick={onExportPDF}
          className="px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#222] rounded transition-colors"
        >
          PDF
        </button>
        
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 flex items-center justify-center text-lg text-[#888] hover:text-white hover:bg-[#222] rounded transition-colors"
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? '☀' : '☾'}
        </button>
      </div>
    </div>
  );
}