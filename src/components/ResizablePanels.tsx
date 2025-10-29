'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizablePanelsProps {
  left: ReactNode;
  right: ReactNode;
  defaultSize?: number; // Pourcentage (0-100)
  minSize?: number;
  maxSize?: number;
}

export function ResizablePanels({
  left,
  right,
  defaultSize = 50,
  minSize = 30,
  maxSize = 70,
}: ResizablePanelsProps) {
  const [leftWidth, setLeftWidth] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;

      // Limiter entre minSize et maxSize
      const clampedWidth = Math.max(minSize, Math.min(maxSize, newWidth));
      setLeftWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minSize, maxSize]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* Panel gauche */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="flex-shrink-0 overflow-hidden"
      >
        {left}
      </div>

      {/* Diviseur redimensionnable */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1.5 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0 relative group ${
          isDragging ? 'bg-blue-600' : ''
        }`}
      >
        {/* Points de préhension */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
          <div className="w-1 h-1 bg-white rounded-full opacity-60" />
          <div className="w-1 h-1 bg-white rounded-full opacity-60" />
          <div className="w-1 h-1 bg-white rounded-full opacity-60" />
        </div>
        
        {/* Zone de drag plus large pour faciliter l'interaction */}
        <div className="absolute inset-y-0 -left-2 -right-2" />
      </div>

      {/* Panel droit */}
      <div className="flex-1 overflow-hidden">
        {right}
      </div>
    </div>
  );
}
