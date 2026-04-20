import React from 'react';

export default function BottomSheet({ isOpen, onClose, title, height = 'auto', children }) {
  if (!isOpen) return null;

  const heightClass = {
    'auto': 'max-h-[50vh]',
    '40%': 'h-[40vh]',
    '60%': 'h-[60vh]',
    '80%': 'h-[80vh]'
  }[height] || 'max-h-[50vh]';

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div 
        className={`fixed left-0 right-0 bottom-0 bg-[#1A1A1A] border-t border-[#333] rounded-t-2xl z-50 overflow-hidden flex flex-col ${heightClass}`}
        style={{
          transform: 'translateY(0)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          touchAction: 'none'
        }}
      >
        <div className="flex-shrink-0 flex flex-col items-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#444] rounded-full" />
          {title && <div className="text-white font-medium mt-3">{title}</div>}
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {children}
        </div>
      </div>
    </>
  );
}