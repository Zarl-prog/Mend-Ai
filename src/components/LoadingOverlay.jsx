import React, { useState, useEffect } from 'react';

export default function LoadingOverlay({ visible, messages }) {
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [visible, messages.length]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <svg className="w-16 h-16 animate-spin" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#6C47FF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80 40"
          />
        </svg>
        <div className="text-body text-lg font-medium">
          {messages[messageIndex]}
        </div>
      </div>
    </div>
  );
}