import React from 'react';

export default function AIButton({ onClick, loading, disabled, cooldownRemaining }) {
  const isDisabled = disabled || loading;
  const cooldownSeconds = Math.ceil(cooldownRemaining / 1000);
  
  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`fixed bottom-4 right-4 w-14 h-14 rounded-full text-white text-2xl flex items-center justify-center shadow-lg ${isDisabled ? 'z-40' : 'z-[9999]' } ${
        isDisabled 
          ? 'bg-gray-500 cursor-not-allowed' 
          : 'bg-gradient-to-br from-[#6C47FF] to-[#1D9E75] hover:scale-110 transition-transform'
      } ${
        loading ? 'animate-pulse' : ''
      }`}
      title={disabled && cooldownRemaining > 0 ? `Cooldown: ${cooldownSeconds}s` : 'AI Assistant'}
    >
      {cooldownRemaining > 0 ? (
        <span className="text-sm font-medium">{cooldownSeconds}</span>
      ) : loading ? (
        <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none">
          <path d="M12,2 L19,5.5 L19,12.5 L12,16 L5,12.5 L5,5.5 Z" fill="currentColor" opacity="0.7"/>
          <path d="M12,5 L19,8.5 L12,12 L5,8.5 Z" fill="currentColor"/>
          <path d="M5,8.5 L5,15.5 L12,19 L12,12 Z" fill="currentColor" opacity="0.5"/>
        </svg>
      ) : (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M12,2 L19,5.5 L19,12.5 L12,16 L5,12.5 L5,5.5 Z" fill="currentColor" opacity="0.7"/>
          <path d="M12,5 L19,8.5 L12,12 L5,8.5 Z" fill="currentColor"/>
          <path d="M5,8.5 L5,15.5 L12,19 L12,12 Z" fill="currentColor" opacity="0.5"/>
        </svg>
      )}
    </button>
  );
}