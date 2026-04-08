'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import VisualizerContainer from './VisualizerContainer';

interface StackVisualizerProps {
  data: {
    items?: any[];
    activeIndex?: number;
    showGrid?: boolean;
    showLabels?: boolean;
    title?: string;
    subtitle?: string;
    step?: number;
  };
}

export default function StackVisualizer({ data }: StackVisualizerProps) {
  const { items = [], activeIndex = -1, showGrid = true, showLabels = true, title, subtitle, step } = data;
  
  // Default to top of stack if activeIndex is not provided
  const topIndex = activeIndex >= 0 ? activeIndex : items.length - 1;
  // Fixed capacity for visualization purposes
  const capacity = Math.max(7, items.length + 2);

  return (
    <VisualizerContainer title={title} subtitle={subtitle} showGrid={showGrid} step={step} disableZoom={true}>
      <div className="flex-1 flex items-center justify-center relative overflow-hidden h-full w-full">
        <div className="flex items-end gap-8 relative z-10">
          <div className="flex relative pr-12">
            {/* Indices */}
            {showLabels && (
              <div className="flex flex-col-reverse justify-start mr-2 gap-1 pb-1">
                {Array.from({ length: capacity }).map((_, i) => (
                  <div key={i} className={`h-8 flex items-center justify-end text-[9px] font-mono ${i === topIndex ? 'text-white font-bold' : 'text-gray-500'}`}>
                    {i}
                  </div>
                ))}
              </div>
            )}

            {/* Stack Container */}
            <div className="flex flex-col-reverse gap-1 bg-[#282e39] p-1.5 rounded-lg border border-[#3b4354] shadow-2xl min-h-[200px] justify-end relative overflow-hidden">
              <AnimatePresence mode="popLayout">
                {Array.from({ length: capacity }).map((_, i) => {
                  const value = items[i];
                  const isTop = i === topIndex;
                  
                  return (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.8, y: 30, rotateX: -45 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        rotateX: 0,
                        backgroundColor: isTop ? 'rgba(127, 19, 236, 1)' : 'rgba(28, 33, 44, 1)',
                        borderColor: isTop ? 'rgba(255, 255, 255, 0.2)' : 'rgba(59, 67, 84, 1)',
                        boxShadow: isTop ? '0 0 10px rgba(127, 19, 236, 0.5)' : 'none'
                      }}
                      transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                      className={`w-16 h-8 border rounded flex items-center justify-center font-mono text-xs shadow-sm transition-all relative group overflow-hidden ${isTop ? 'text-white font-bold transform scale-105 z-10' : 'text-white'}`}
                    >
                      {value !== undefined ? (
                        <motion.span 
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                        >
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </motion.span>
                      ) : (
                        <span className="text-[9px] font-mono text-gray-700/50">null</span>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Top Pointer */}
            {showLabels && (
              <div className="absolute right-0 bottom-0 h-full w-8 pointer-events-none">
                <AnimatePresence>
                  {topIndex >= 0 && topIndex < capacity && (
                    <motion.div 
                      key="top-pointer"
                      initial={{ opacity: 0, x: 30, scale: 0.5 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30, scale: 0.5 }}
                      className="absolute -right-2 flex items-center transition-all duration-300 animate-pulse" 
                      style={{ bottom: `${6 + (topIndex * 36)}px` }}
                    >
                      <span className="material-symbols-outlined text-primary rotate-180" style={{ fontSize: "16px" }}>arrow_right_alt</span>
                      <span className="ml-1 bg-primary text-white text-[8px] font-bold px-1 py-0.5 rounded shadow-lg uppercase tracking-wider">Top</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </VisualizerContainer>
  );
}
