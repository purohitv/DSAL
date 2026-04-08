'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VisualizerContainer from './VisualizerContainer';

interface LinkedListVisualizerProps {
  data: {
    nodes?: any[];
    head?: string | number | null;
    activeNodeId?: string | number | null;
    showGrid?: boolean;
    showLabels?: boolean;
    title?: string;
    subtitle?: string;
    step?: number;
  };
}

export default function LinkedListVisualizer({ data }: LinkedListVisualizerProps) {
  const { nodes = [], head = null, activeNodeId = null, showGrid = true, showLabels = true, title, subtitle, step } = data;

  return (
    <VisualizerContainer title={title} subtitle={subtitle} showGrid={showGrid} step={step}>
      
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-16 w-full max-w-6xl overflow-x-auto pb-12 pt-12 px-4">
        <AnimatePresence mode="popLayout">
          {nodes.map((node, index) => {
            const isActive = node.id === activeNodeId;
            const isHead = node.id === head || index === 0;
            
            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.5, x: -50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center relative"
              >
                {/* Node */}
                <div className="flex flex-col items-center gap-2">
                  {showLabels && isHead && (
                    <div className="absolute -top-8 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded shadow-neon-sm uppercase tracking-widest animate-bounce">
                      Head
                    </div>
                  )}
                  <div 
                    className={`w-16 h-16 flex items-center justify-center rounded-2xl border-2 text-lg font-bold transition-all duration-500 ${
                      isActive 
                      ? 'bg-accent-mint/20 border-accent-mint text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110' 
                      : 'bg-surface-dark border-border-dark text-slate-300'
                    }`}
                  >
                    {node.value}
                  </div>
                  {showLabels && <div className="text-[9px] text-text-secondary font-mono opacity-40">{node.id}</div>}
                </div>

                {/* Arrow to Next */}
                {index < nodes.length - 1 && (
                  <div className="absolute -right-12 w-12 h-0.5 bg-border-dark flex items-center justify-end">
                    <div className="w-2 h-2 border-t-2 border-r-2 border-border-dark transform rotate-45 mr-[-1px]"></div>
                    {/* Animated Pulse on Arrow if active path */}
                    {isActive && (
                      <motion.div 
                        initial={{ x: -48 }}
                        animate={{ x: 0 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="absolute h-full w-4 bg-gradient-to-r from-transparent via-accent-mint to-transparent opacity-50"
                      />
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {nodes.length === 0 && (
          <div className="text-text-secondary italic">List is empty</div>
        )}
      </div>
    </VisualizerContainer>
  );
}
