import React, { useState, useCallback } from 'react';
import { clamp } from '../../utils/mathUtils';

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  icon: React.ReactNode;
  onChange: (delta: number) => void;
}

export function ResizeHandle({ direction, icon, onChange }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [delta, setDelta] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const currentPos = { x: e.clientX, y: e.clientY };
    const diff = direction === 'horizontal'
      ? Math.floor((currentPos.x - startPos.x) / 100)
      : Math.floor((currentPos.y - startPos.y) / 100);

    if (diff !== delta) {
      setDelta(diff);
      onChange(diff);
    }
  }, [isDragging, startPos, direction, delta, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDelta(0);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isHorizontal = direction === 'horizontal';
  
  return (
    <div
      className={`absolute cursor-${isHorizontal ? 'ew' : 'ns'}-resize group ${
        isHorizontal
          ? 'right-0 top-1/2 -translate-y-1/2'
          : 'bottom-0 left-1/2 -translate-x-1/2'
      }`}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`
          bg-blue-500 text-white p-1 rounded-full shadow-lg
          opacity-0 group-hover:opacity-100 transition-opacity
          ${isDragging ? 'opacity-100' : ''}
        `}
      >
        {icon}
      </div>
    </div>
  );
}