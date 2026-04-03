'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useViewportScale } from '@/hooks/useViewportScale';

interface ViewportWrapperProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
}

export function ViewportWrapper({ children, width = 1280, height = 1080 }: ViewportWrapperProps) {
  const scale = useViewportScale(width, height);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (!entries || !entries.length) return;
        for (const entry of entries) {
          // Use scrollHeight to capture the full height of the content, including absolute elements
          setContentHeight(entry.target.scrollHeight);
        }
      });
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full min-h-screen overflow-x-hidden overflow-y-auto bg-black flex flex-col items-center">
      <div
        style={{
          width: `${width * scale}px`,
          height: `${contentHeight * scale}px`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: `${width}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: '#0a0d14', // Match the app's dark background
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
