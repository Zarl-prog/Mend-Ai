import React from 'react';

const presets = [
  'Linked list', 'Stack & Queue', 'Binary tree', 'Flowchart',
  'Network diagram', 'Water cycle', 'Solar system', 'OSI model',
  'TCP handshake', 'Food chain', 'Cell structure', 'Timeline'
];

export default function AIPanel({ 
  open, 
  onClose, 
  mode, 
  onModeChange, 
  onGenerate, 
  onImprove, 
  selectedCount,
  selectedLabels,
  prompt,
  onPromptChange,
  onSubmit,
  loading,
  canMakeRequest,
  isLimitReached,
  remainingRequests,
  cooldownRemaining
}) {
  const [inputRef, setInputRef] = React.useState(null);
  
  React.useEffect(() => {
    if (open && inputRef) {
      inputRef.focus();
    }
  }, [open]);
  
  if (!open) return null;
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      onSubmit();
    }
  };
  
  return (
    <div className="fixed bottom-0 left-14 right-60 bg-[#141414] border-t border-[#222] transition-all duration-300 overflow-hidden"
         style={{ height: mode === 'generate' ? '220px' : '260px' }}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#6C47FF]" viewBox="0 0 24 24" fill="none">
              <path d="M12,2 L19,5.5 L19,12.5 L12,16 L5,12.5 L5,5.5 Z" fill="currentColor" opacity="0.7"/>
              <path d="M12,5 L19,8.5 L12,12 L5,8.5 Z" fill="currentColor"/>
              <path d="M5,8.5 L5,15.5 L12,19 L12,12 Z" fill="currentColor" opacity="0.5"/>
            </svg>
            <span className="text-white font-medium">AI Assistant</span>
            {isLimitReached && (
              <span className="text-red-400 text-xs ml-2">
                (Limit reached)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onModeChange('generate')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                mode === 'generate' ? 'bg-[#6C47FF] text-white' : 'bg-[#222] text-[#888] hover:text-white'
              }`}
            >
              Generate New
            </button>
            <button
              onClick={() => onModeChange('improve')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                mode === 'improve' ? 'bg-[#1D9E75] text-white' : 'bg-[#222] text-[#888] hover:text-white'
              }`}
            >
              Improve Selected
            </button>
            
            <button
              onClick={onClose}
              className="ml-4 w-8 h-8 flex items-center justify-center text-[#888] hover:text-white rounded hover:bg-[#222]"
            >
              ×
            </button>
          </div>
        </div>
        
        {mode === 'generate' ? (
          <>
            <textarea
              ref={setInputRef}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe a diagram to generate...&#10;e.g. 'Draw a linked list with 5 nodes'&#10;or   'Show how photosynthesis works'"
              className="flex-1 bg-[#222] text-white text-sm px-3 py-2 rounded border border-[#333] resize-none focus:border-[#6C47FF] outline-none"
            />
            
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex-1 flex gap-2 overflow-x-auto">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      onPromptChange(preset);
                      onGenerate(preset);
                    }}
                    className="px-3 py-1 text-xs bg-[#222] text-[#888] rounded hover:text-white hover:bg-[#333] whitespace-nowrap"
                  >
                    {preset}
                  </button>
                ))}
</div>
              
              {remainingRequests <= 5 && !isLimitReached && (
                <span className="text-xs text-yellow-500 whitespace-nowrap">
                  {remainingRequests} left
                </span>
              )}
              
              <button
                onClick={() => onGenerate(prompt)}
                disabled={!prompt.trim() || loading || !canMakeRequest}
                className="px-6 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded hover:bg-[#5a3dd9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLimitReached 
                  ? 'Limit reached' 
                  : cooldownRemaining > 0 
                    ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s` 
                    : loading 
                      ? 'Generating...' 
                      : 'Generate'}
              </button>
            </div>
          </>
        ) : (
          <>
            {selectedCount === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-[#888] text-sm mb-3">Select one or more shapes on the canvas first, then describe how to improve them.</p>
                <button
                  onClick={() => { onClose(); }}
                  className="px-4 py-2 bg-[#222] text-white text-sm rounded hover:bg-[#333]"
                >
                  Select shapes
                </button>
              </div>
            ) : (
              <>
                <div className="mb-2 text-[#888] text-sm">
                  {selectedCount} shape{selectedCount > 1 ? 's' : ''} selected: {selectedLabels.slice(0, 3).join(', ')}{selectedLabels.length > 3 ? '...' : ''}
                </div>
                
                <textarea
                  ref={setInputRef}
                  value={prompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe how to improve the selection...&#10;e.g. 'Add two more nodes connected to the last one'&#10;or   'Connect all nodes in a circular pattern'"
                  className="flex-1 bg-[#222] text-white text-sm px-3 py-2 rounded border border-[#333] resize-none focus:border-[#1D9E75] outline-none"
                />
                
                <div className="mt-3 flex items-center justify-end gap-3">
                  {!isLimitReached && remainingRequests <= 5 && (
                    <span className="text-xs text-yellow-500">
                      {remainingRequests} left
                    </span>
                  )}
                  <button
                    onClick={() => onImprove(prompt)}
                    disabled={!prompt.trim() || loading || !canMakeRequest}
                    className="px-6 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded hover:bg-[#178a65] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLimitReached 
                      ? 'Limit reached' 
                      : cooldownRemaining > 0 
                        ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s` 
                        : loading 
                          ? 'Improving...' 
                          : 'Improve'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}