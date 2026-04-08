'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualizerControlsProps {
  onReset?: () => void;
  onToggleGrid?: () => void;
  onToggleLabels?: () => void;
  onFullscreen?: () => void;
  showGrid?: boolean;
  showLabels?: boolean;
  isFullscreen?: boolean;
}

export default function VisualizerControls({
  onReset,
  onToggleGrid,
  onToggleLabels,
  onFullscreen,
  showGrid = true,
  showLabels = true,
  isFullscreen = false,
}: VisualizerControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
      <div className="bg-surface-darker/80 backdrop-blur-md border border-border-dark rounded-lg p-1 shadow-2xl flex flex-col gap-1">
        <ControlButton 
          icon="restart_alt" 
          label="Reset View" 
          onClick={onReset} 
        />
        <div className="h-px bg-border-dark mx-1" />
        <ControlButton 
          icon={showGrid ? "grid_on" : "grid_off"} 
          label={showGrid ? "Hide Grid" : "Show Grid"} 
          onClick={onToggleGrid}
          active={showGrid}
        />
        <ControlButton 
          icon={showLabels ? "label" : "label_off"} 
          label={showLabels ? "Hide Labels" : "Show Labels"} 
          onClick={onToggleLabels}
          active={showLabels}
        />
        <div className="h-px bg-border-dark mx-1" />
        <ControlButton 
          icon={isFullscreen ? "fullscreen_exit" : "fullscreen"} 
          label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} 
          onClick={onFullscreen}
        />
      </div>
    </div>
  );
}

function ControlButton({ 
  icon, 
  label, 
  onClick, 
  active = false 
}: { 
  icon: string; 
  label: string; 
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div className="group relative">
      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
          active ? 'text-primary' : 'text-text-secondary hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </motion.button>
      
      {/* Tooltip */}
      <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-background-dark border border-border-dark rounded text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-2xl">
        {label}
      </div>
    </div>
  );
}
