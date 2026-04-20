import React from 'react';

export default function AIChatButton({ onClick, isOpen, isMobile = false }) {
  if (isMobile) return null;
  
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#6C47FF] to-[#1D9E75] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-[9999] animate-pulse-slow"
    >
      <svg className={`w-7 h-7 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="currentColor" opacity="0.2"/>
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  );
}