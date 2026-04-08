'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import VisualizerContainer from './VisualizerContainer';

interface LinearVisualizerProps {
  data: {
    items?: any[];
    activeIndices?: number[];
    pointers?: { [key: string]: number };
    showGrid?: boolean;
    showLabels?: boolean;
    title?: string;
    subtitle?: string;
    step?: number;
  };
}

export default function LinearVisualizer({ data }: LinearVisualizerProps) {
  const { items = [], activeIndices = [], pointers = {}, showGrid = true, showLabels = true, title, subtitle, step } = data;

  return (
    <VisualizerContainer title={title} subtitle={subtitle} showGrid={showGrid} step={step}>
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-5xl overflow-x-auto pb-12 pt-12 px-4">
        
        {/* Pointers (Top) */}
        {showLabels && (
          <div className="flex gap-2 relative w-full justify-center min-h-[40px]">
            {Object.entries(pointers).map(([label, index]) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0, x: (index * 72) - ((items.length * 72) / 2) + 36 }} // 64px width + 8px gap = 72px per item
                className="absolute top-0 flex flex-col items-center"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="bg-accent-mint text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-neon-sm mb-1">
                  {label}
                </div>
                <div className="w-0.5 h-4 bg-accent-mint"></div>
                <div className="w-2 h-2 border-l-2 border-b-2 border-accent-mint transform -rotate-45 mt-[-2px]"></div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Array Items */}
        <div className="flex gap-2 items-center justify-center">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const isActive = activeIndices.includes(index);
              return (
                <motion.div
                  key={`${index}-${typeof item === 'object' ? JSON.stringify(item) : item}`}
                  layout
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex flex-col items-center gap-2"
                >
                  {showLabels && <div className="text-[10px] text-text-secondary font-mono">{index}</div>}
                  <div 
                    className={`w-16 h-16 flex items-center justify-center rounded-xl border-2 text-lg font-bold transition-colors ${
                      isActive 
                      ? 'bg-blue-500/20 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                      : 'bg-surface-dark border-border-dark text-slate-300'
                    }`}
                  >
                    {typeof item === 'object' ? JSON.stringify(item) : item}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {items.length === 0 && (
            <div className="text-text-secondary italic">Array is empty</div>
          )}
        </div>

      </div>
    </VisualizerContainer>
  );
}
