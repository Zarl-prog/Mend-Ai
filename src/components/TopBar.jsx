import React, { useState, useRef, useEffect } from 'react';

export default function TopBar({ title, onTitleChange, onNew, onSave, onLoad, onExportPNG, onExportSVG, onExportPDF, onToggleTheme, darkMode, onOpenTemplates, templateList, onGoHome }) {
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
    <div className="h-12 bg-panel border-b border-panel flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg className="w-6 h-6 text-[#6C47FF]" viewBox="0 0 24 24" fill="none">
            <path d="M12,2 L19,5.5 L19,12.5 L12,16 L5,12.5 L5,5.5 Z" fill="currentColor" opacity="0.7"/>
            <path d="M12,5 L19,8.5 L12,12 L5,8.5 Z" fill="currentColor"/>
            <path d="M5,8.5 L5,15.5 L12,19 L12,12 Z" fill="currentColor" opacity="0.5"/>
          </svg>
          <div className="text-body font-semibold">Mend AI</div>
        </button>
      </div>
      
      <div className="flex-1 max-w-md mx-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full bg-transparent text-body text-center border-none outline-none focus:ring-1 focus:ring-[#6C47FF] rounded px-2 py-1"
          placeholder="Untitled Diagram"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="px-3 py-1.5 text-sm text-secondary hover:text-body hover:bg-hover rounded transition-colors flex items-center gap-1"
          >
            Templates ▾
          </button>
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-card border border-card rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-card">
                <div className="text-xs text-muted uppercase tracking-wide px-2 py-1">Start with a template</div>
              </div>
              {templateList?.map((template) => (
                <button
                  key={template.id}
                  onClick={() => { onOpenTemplates(template.id); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left hover:bg-input flex items-center gap-3"
                >
                  <span className="text-lg">{template.icon}</span>
                  <div>
                    <div className="text-body text-sm">{template.name}</div>
                    <div className="text-muted text-xs">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={onNew}
          className="px-3 py-1.5 text-sm text-secondary hover:text-body hover:bg-hover rounded transition-colors"
        >
          New
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1.5 text-sm text-secondary hover:text-body hover:bg-hover rounded transition-colors flex items-center gap-1"
        >
          <span>↓</span> Save
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-sm text-secondary hover:text-body hover:bg-hover rounded transition-colors flex items-center gap-1"
        >
          <span>↑</span> Load
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleLoad}
          className="hidden"
        />
        
        <div className="w-px h-6 bg-hover mx-1" />
        
        <button
          onClick={onExportPNG}
          className="px-3 py-1.5 text-sm text-secondary hover:text-body hover:bg-hover rounded transition-colors"
        >
          Export PNG
        </button>
        <button
          onClick={onExportSVG}
          className="px-3 py-1.5 text-sm text-secondary hover:text-body hover:bg-hover rounded transition-colors"
        >
          SVG
        </button>
        <button
          onClick={onExportPDF}
          className="px-3 py-1.5 text-sm text-secondary hover:text-body hover:bg-hover rounded transition-colors"
        >
          PDF
        </button>
        
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 flex items-center justify-center text-lg text-secondary hover:text-body hover:bg-hover rounded transition-colors"
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? '☀' : '☾'}
        </button>
      </div>
    </div>
  );
}