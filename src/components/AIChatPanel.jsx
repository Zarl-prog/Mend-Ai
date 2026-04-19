import React, { useState, useRef, useEffect } from 'react';

const presets = [
  { label: 'Linked List', icon: '⬡' },
  { label: 'Stack & Queue', icon: '▤' },
  { label: 'Binary Tree', icon: '⬢' },
  { label: 'Flowchart', icon: '◇' },
  { label: 'Network', icon: '◎' },
  { label: 'Water Cycle', icon: '⟳' },
];

export default function AIChatPanel({
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
  const [inputRef, setInputRef] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && inputRef) {
      inputRef.focus();
    }
  }, [open]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, prompt]);

  if (!open) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handlePresetClick = (preset) => {
    onPromptChange(preset);
    onGenerate(preset);
  };

  const isDisabled = !prompt.trim() || loading || !canMakeRequest;
  const buttonText = isLimitReached 
    ? 'Limit reached' 
    : cooldownRemaining > 0 
      ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s` 
      : loading 
        ? (mode === 'generate' ? 'Generating...' : 'Improving...')
        : mode === 'generate' ? 'Generate' : 'Improve';

  return (
    <div className="fixed bottom-24 right-6 w-96 max-h-[500px] bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#333] z-[9998] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#333] bg-gradient-to-r from-[#6C47FF]/10 to-[#1D9E75]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C47FF] to-[#1D9E75] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L19 6.5V12.5L12 17L5 12.5V6.5L12 2Z" fill="currentColor" opacity="0.7"/>
              <path d="M12 5L19 9.5L12 14L5 9.5L12 5Z" fill="currentColor"/>
              <path d="M5 9.5V16.5L12 21L12 14L5 9.5Z" fill="currentColor" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Diagram Assistant</h3>
            <p className="text-xs text-[#888]">
              {loading ? 'Thinking...' : 'Ready to create diagrams'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#888] hover:text-white hover:bg-[#333] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 bg-[#151515]">
        <button
          onClick={() => onModeChange('generate')}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            mode === 'generate' 
              ? 'bg-[#6C47FF] text-white shadow-lg shadow-purple-500/30' 
              : 'bg-[#252525] text-[#888] hover:text-white hover:bg-[#333]'
          }`}
        >
          + Generate New
        </button>
        <button
          onClick={() => onModeChange('improve')}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            mode === 'improve' 
              ? 'bg-[#1D9E75] text-white shadow-lg shadow-green-500/30' 
              : 'bg-[#252525] text-[#888] hover:text-white hover:bg-[#333]'
          }`}
        >
          ✎ Improve
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[280px]">
        {mode === 'improve' && selectedCount > 0 && (
          <div className="p-3 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/30">
            <p className="text-xs text-[#1D9E75] mb-1 font-medium">Selected elements:</p>
            <div className="flex flex-wrap gap-1">
              {selectedLabels.slice(0, 5).map((label, i) => (
                <span key={i} className="px-2 py-1 rounded-lg bg-[#1D9E75]/20 text-xs text-white">
                  {label}
                </span>
              ))}
              {selectedLabels.length > 5 && (
                <span className="px-2 py-1 rounded-lg bg-[#1D9E75]/20 text-xs text-[#888]">
                  +{selectedLabels.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {mode === 'generate' && (
          <div className="space-y-2">
            <p className="text-xs text-[#666]">Quick templates:</p>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.label)}
                  disabled={loading}
                  className="p-2 rounded-xl bg-[#252525] hover:bg-[#333] text-xs text-gray-300 hover:text-white transition-all flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <span className="text-lg">{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'improve' && selectedCount === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#252525] flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#888]" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="currentColor" opacity="0.3"/>
                <path d="M21 21H3M21 3L3 21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
              </svg>
            </div>
            <p className="text-[#888] text-sm mb-3">Select shapes on canvas first</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1D9E75] text-white text-sm hover:bg-[#178a65] transition-colors"
            >
              Select Shapes
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#333] bg-[#151515]">
        <div className="relative">
          <textarea
            ref={setInputRef}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'generate' ? "Describe a diagram to generate..." : "Describe how to improve the selection..."}
            className="w-full h-20 bg-[#252525] text-white text-sm px-4 py-3 rounded-xl border border-[#333] resize-none focus:border-[#6C47FF] focus:ring-2 focus:ring-purple-500/20 outline-none transition-all placeholder:text-[#666]"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#555]">Ctrl + Enter to send</span>
            <button
              onClick={onSubmit}
              disabled={isDisabled}
              className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${
                !isDisabled
                  ? mode === 'generate'
                    ? 'bg-gradient-to-r from-[#6C47FF] to-[#5a3dd9] text-white hover:shadow-lg hover:shadow-purple-500/30'
                    : 'bg-gradient-to-r from-[#1D9E75] to-[#178a65] text-white hover:shadow-lg hover:shadow-green-500/30'
                  : 'bg-[#333] text-[#666] cursor-not-allowed'
              }`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}