'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSimulationStore } from '@/store/useSimulationStore';

interface TimelineProps {
  totalSteps: number;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function Timeline({ totalSteps, currentStep, onStepChange }: TimelineProps) {
  const { isPlaying, setIsPlaying, playbackSpeed } = useSimulationStore();

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const step = parseInt(e.target.value);
    onStepChange(step);
    if (isPlaying) setIsPlaying(false);
  };

  if (totalSteps <= 1) return null;

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full px-4 py-2 bg-surface-darker/50 border-t border-white/5 flex flex-col gap-2 relative group">
      <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-text-secondary mb-1">
        <div className="flex items-center gap-2">
          <span className="text-primary font-black">Timeline</span>
          <span className="opacity-40">|</span>
          <span className="text-white">Step {currentStep} / {totalSteps}</span>
        </div>
        <div className="flex items-center gap-3">
          {isPlaying && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20"
            >
              <span className="material-symbols-outlined text-[10px] text-primary animate-spin">sync</span>
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">Live</span>
            </motion.div>
          )}
          <span className="opacity-40">Progress</span>
          <span className="text-accent-mint font-black">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="relative h-6 flex items-center">
        {/* Track Background */}
        <div className="absolute inset-x-0 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary/50 to-primary shadow-[0_0_10px_rgba(127,19,236,0.5)]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ 
              type: 'spring', 
              stiffness: isPlaying ? 100 : 300, 
              damping: isPlaying ? 20 : 30 
            }}
          />
        </div>

        {/* Step Markers */}
        <div className="absolute inset-x-0 h-full flex justify-between items-center pointer-events-none px-0.5">
          {Array.from({ length: Math.min(totalSteps, 50) }).map((_, i) => {
            const stepNum = Math.floor((i / Math.min(totalSteps, 50)) * totalSteps) + 1;
            const isActive = stepNum <= currentStep;
            return (
              <div 
                key={i} 
                className={`w-0.5 h-1 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-primary scale-y-150' : 'bg-white/10'
                }`}
              />
            );
          })}
        </div>

        {/* Input Scrubber */}
        <input
          type="range"
          min="1"
          max={totalSteps}
          value={currentStep}
          onChange={handleScrub}
          className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Thumb Indicator */}
        <motion.div 
          className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] border-2 border-primary pointer-events-none z-20"
          initial={false}
          animate={{ left: `calc(${(currentStep / totalSteps) * 100}% - 6px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Playback Status Glow */}
      {isPlaying && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
