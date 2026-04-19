import React, { useState, useEffect, useRef } from 'react';

export default function TextEditor({ shape, zoom = 1, panX = 0, panY = 0, onSave, onCancel }) {
  const [text, setText] = useState(shape.label || '');
  const textareaRef = useRef(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(text);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };
  
  const getStyle = () => {
    const base = {
      position: 'fixed',
      left: shape.x * zoom + panX,
      top: shape.y * zoom + panY,
      width: shape.width * zoom,
      height: shape.height * zoom,
      padding: '8px',
      fontSize: `${shape.fontSize * zoom}px`,
      fontWeight: shape.fontBold ? 'bold' : 'normal',
      fontStyle: shape.fontItalic ? 'italic' : 'normal',
      color: shape.textColor,
      background: shape.fillColor || 'transparent',
      border: '2px solid #4A9EFF',
      borderRadius: shape.type === 'sticky' ? '4px' : (shape.type === 'circle' ? '50%' : '8px'),
      resize: 'none',
      outline: 'none',
      fontFamily: 'inherit',
      zIndex: 9999,
      textAlign: 'center'
    };
    
    return base;
  };
  
  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSave(text)}
      style={getStyle()}
    />
  );
}