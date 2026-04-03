'use client';

import { useState, useEffect } from 'react';

export function useViewportScale(targetWidth = 1024, targetHeight = 1080) {
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const newScale = windowWidth / targetWidth;
      setScale(newScale);
    };

    // Initial calculation
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [targetWidth, targetHeight]);

  if (!mounted) return 1;

  return scale;
}
