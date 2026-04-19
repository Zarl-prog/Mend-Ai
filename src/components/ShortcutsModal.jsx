import React from 'react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { category: 'Canvas', items: [
      { key: 'V', description: 'Select tool' },
      { key: 'R', description: 'Rectangle tool' },
      { key: 'C', description: 'Circle tool' },
      { key: 'T', description: 'Text tool' },
      { key: 'S', description: 'Sticky note tool' },
      { key: 'A', description: 'Arrow tool' },
    ]},
    { category: 'Edit', items: [
      { key: 'Ctrl+C', description: 'Copy selected' },
      { key: 'Ctrl+V', description: 'Paste' },
      { key: 'Ctrl+D', description: 'Duplicate' },
      { key: 'Ctrl+Z', description: 'Undo' },
      { key: 'Ctrl+Y', description: 'Redo' },
      { key: 'Delete', description: 'Delete selected' },
      { key: 'Ctrl+A', description: 'Select all' },
    ]},
    { category: 'View', items: [
      { key: 'Ctrl+0', description: 'Fit to screen' },
      { key: 'Ctrl++', description: 'Zoom in' },
      { key: 'Ctrl+-', description: 'Zoom out' },
      { key: '#', description: 'Toggle snap to grid' },
    ]},
    { category: 'AI', items: [
      { key: 'Ctrl+Enter', description: 'Open AI panel' },
      { key: 'G', description: 'Generate diagram' },
    ]},
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={onClose}>
      <div 
        className="bg-[#1a1a1a] rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
          <button 
            onClick={onClose}
            className="text-[#888] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-medium text-[#6C47FF] mb-3">{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.key} className="flex justify-between items-center">
                    <span className="text-sm text-[#888]">{item.description}</span>
                    <kbd className="bg-[#2a2a2a] text-[#aaa] text-xs px-2 py-1 rounded">{item.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#333] text-center">
          <p className="text-[#666] text-sm">Press <kbd className="bg-[#2a2a2a] text-[#aaa] text-xs px-2 py-0.5 rounded">?</kbd> to close this modal</p>
        </div>
      </div>
    </div>
  );
}