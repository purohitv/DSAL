// components/ide/Timeline.tsx
'use client';

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/store/useSimulationStore';

interface TimelineProps {
  totalSteps: number;
  currentStep: number;
  onStepChange: (step: number) => void;
  onPlaybackComplete?: () => void;
  showMarkers?: boolean;
  autoReset?: boolean;
}

export default function Timeline({ 
  totalSteps, 
  currentStep, 
  onStepChange,
  onPlaybackComplete,
  showMarkers = true,
  autoReset = true
}: TimelineProps) {
  const { isPlaying, setIsPlaying, playbackSpeed, setPlaybackSpeed } = useSimulationStore();
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const scrubberRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number>();
  const lastStepRef = useRef<number>(currentStep);

  // Don't render if only 1 step
  if (totalSteps <= 1) return null;

  const progress = useMemo(() => (currentStep / totalSteps) * 100, [currentStep, totalSteps]);

  // Handle auto-advancement during playback
  useEffect(() => {
    if (!isPlaying) return;

    let lastTimestamp = 0;
    const stepDuration = (1000 / playbackSpeed); // milliseconds per step

    const advanceStep = (timestamp: number) => {
      if (!isPlaying) return;

      if (!lastTimestamp) {
        lastTimestamp = timestamp;
        animationFrameRef.current = requestAnimationFrame(advanceStep);
        return;
      }

      const elapsed = timestamp - lastTimestamp;
      
      if (elapsed >= stepDuration) {
        const nextStep = currentStep + 1;
        
        if (nextStep <= totalSteps) {
          onStepChange(nextStep);
          lastTimestamp = timestamp;
        } else {
          // Playback complete
          setIsPlaying(false);
          if (autoReset) {
            // Auto-reset to beginning after 500ms
            setTimeout(() => {
              onStepChange(1);
              onPlaybackComplete?.();
            }, 500);
          } else {
            onPlaybackComplete?.();
          }
          return;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(advanceStep);
    };

    animationFrameRef.current = requestAnimationFrame(advanceStep);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimestamp = 0;
    };
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, onStepChange, setIsPlaying, autoReset, onPlaybackComplete]);

  // Keyboard shortcuts for timeline
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Left/Right arrows for step navigation
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newStep = Math.max(1, currentStep - 1);
        onStepChange(newStep);
        if (isPlaying) setIsPlaying(false);
      }
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newStep = Math.min(totalSteps, currentStep + 1);
        onStepChange(newStep);
        if (isPlaying) setIsPlaying(false);
      }
      
      // Home/End keys
      if (e.key === 'Home') {
        e.preventDefault();
        onStepChange(1);
        if (isPlaying) setIsPlaying(false);
      }
      
      if (e.key === 'End') {
        e.preventDefault();
        onStepChange(totalSteps);
        if (isPlaying) setIsPlaying(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, totalSteps, onStepChange, isPlaying, setIsPlaying]);

  const handleScrub = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const step = parseInt(e.target.value);
    onStepChange(step);
    if (isPlaying) setIsPlaying(false);
  }, [onStepChange, isPlaying, setIsPlaying]);

  const handleScrubStart = useCallback(() => {
    setIsDragging(true);
    if (isPlaying) setIsPlaying(false);
  }, [isPlaying, setIsPlaying]);

  const handleScrubEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleStepClick = useCallback((step: number) => {
    onStepChange(step);
    if (isPlaying) setIsPlaying(false);
  }, [onStepChange, isPlaying, setIsPlaying]);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, [setPlaybackSpeed]);

  const formatStepDisplay = useCallback(() => {
    return `${currentStep} / ${totalSteps}`;
  }, [currentStep, totalSteps]);

  // Generate step markers
  const stepMarkers = useMemo(() => {
    if (!showMarkers) return null;
    
    const maxMarkers = Math.min(totalSteps, 20); // Limit to 20 markers for performance
    const stepInterval = Math.ceil(totalSteps / maxMarkers);
    
    return Array.from({ length: maxMarkers }).map((_, i) => {
      const stepNum = Math.min((i + 1) * stepInterval, totalSteps);
      const isActive = stepNum <= currentStep;
      const isHovered = hoveredStep === stepNum;
      
      return (
        <div 
          key={i} 
          className="relative flex flex-col items-center"
          style={{ left: `${(stepNum / totalSteps) * 100}%` }}
          onMouseEnter={() => setHoveredStep(stepNum)}
          onMouseLeave={() => setHoveredStep(null)}
        >
          <div 
            className={`w-0.5 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              isActive ? 'bg-primary scale-y-150 shadow-[0_0_8px_rgba(127,19,236,0.5)]' : 'bg-white/20 hover:bg-white/40'
            } ${isHovered ? 'scale-y-200' : ''}`}
            onClick={() => handleStepClick(stepNum)}
          />
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute -top-6 bg-surface-darker px-1.5 py-0.5 rounded border border-primary/30 text-[8px] font-black text-primary whitespace-nowrap"
              >
                Step {stepNum}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  }, [totalSteps, currentStep, showMarkers, hoveredStep, handleStepClick]);

  // Speed control buttons
  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' }
  ];

  return (
    <div className="w-full px-4 py-3 bg-surface-darker/80 border-t border-white/10 flex flex-col gap-2 relative group backdrop-blur-sm">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-text-secondary mb-0.5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-primary font-black flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">timeline</span>
            Timeline
          </span>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-1">
            <span className="text-white font-black">{formatStepDisplay()}</span>
            {isDragging && (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[7px] text-primary"
              >
                scrubbing
              </motion.span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Speed controls */}
          <div className="flex items-center gap-1 bg-black/20 rounded px-1 py-0.5">
            <span className="material-symbols-outlined text-[10px] opacity-50">speed</span>
            <div className="flex gap-0.5">
              {speedOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleSpeedChange(value)}
                  className={`px-1.5 py-0.5 text-[8px] font-black rounded transition-all ${
                    playbackSpeed === value 
                      ? 'bg-primary text-white shadow-[0_0_8px_rgba(127,19,236,0.5)]' 
                      : 'text-text-secondary hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Live indicator */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/20 border border-primary/40 shadow-[0_0_12px_rgba(127,19,236,0.3)]"
              >
                <span className="material-symbols-outlined text-[10px] text-primary animate-spin">sync</span>
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">Live</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress percentage */}
          <div className="flex items-center gap-1">
            <span className="opacity-40">Progress</span>
            <span className="text-accent-mint font-black tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Timeline track */}
      <div className="relative h-8 flex items-center group/track">
        {/* Track Background */}
        <div className="absolute inset-x-0 h-1.5 bg-white/5 rounded-full overflow-hidden cursor-pointer">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary via-primary to-secondary rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ 
              type: 'spring', 
              stiffness: isPlaying ? 100 : 300, 
              damping: isPlaying ? 20 : 30,
              mass: 0.5
            }}
          />
          
          {/* Progress glow effect */}
          <motion.div 
            className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md"
            animate={{ left: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Step Markers Container */}
        {stepMarkers && (
          <div className="absolute inset-x-0 h-full flex items-center pointer-events-none">
            {stepMarkers}
          </div>
        )}

        {/* Input Scrubber */}
        <input
          ref={scrubberRef}
          type="range"
          min="1"
          max={totalSteps}
          value={currentStep}
          onChange={handleScrub}
          onMouseDown={handleScrubStart}
          onMouseUp={handleScrubEnd}
          onTouchStart={handleScrubStart}
          onTouchEnd={handleScrubEnd}
          className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Timeline scrubber"
          title={`Step ${currentStep} of ${totalSteps}`}
        />

        {/* Thumb Indicator */}
        <motion.div 
          className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] border-2 border-primary cursor-pointer z-20 flex items-center justify-center"
          initial={false}
          animate={{ left: `calc(${progress}% - 8px)` }}
          transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.3 }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          style={{ boxShadow: isDragging ? '0 0 25px rgba(127,19,236,0.8)' : undefined }}
        >
          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
        </motion.div>

        {/* Step number tooltip on hover */}
        <AnimatePresence>
          {hoveredStep && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface-darker px-2 py-1 rounded border border-primary/30 shadow-lg z-30 pointer-events-none"
              style={{ left: `${(hoveredStep / totalSteps) * 100}%` }}
            >
              <div className="text-[10px] font-black text-primary whitespace-nowrap">
                Step {hoveredStep}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step indicators for small screens */}
      <div className="flex justify-between items-center gap-1 mt-1 xl:hidden">
        <button
          onClick={() => handleStepClick(Math.max(1, currentStep - 1))}
          disabled={currentStep <= 1}
          className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          Previous
        </button>
        <div className="flex gap-1 flex-wrap justify-center">
          {Array.from({ length: Math.min(totalSteps, 7) }).map((_, i) => {
            let stepNum: number;
            if (totalSteps <= 7) {
              stepNum = i + 1;
            } else {
              const steps = [1, 2, 3, Math.floor(totalSteps / 2) - 1, Math.floor(totalSteps / 2), Math.floor(totalSteps / 2) + 1, totalSteps - 2, totalSteps - 1, totalSteps];
              stepNum = steps[i] || i + 1;
            }
            if (stepNum > totalSteps) return null;
            
            return (
              <button
                key={i}
                onClick={() => handleStepClick(stepNum)}
                className={`w-6 h-4 text-[8px] font-black rounded transition-all ${
                  currentStep === stepNum 
                    ? 'bg-primary text-white shadow-[0_0_8px_rgba(127,19,236,0.5)]' 
                    : 'bg-white/5 text-text-secondary hover:bg-white/10'
                }`}
              >
                {stepNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => handleStepClick(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep >= totalSteps}
          className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          Next
        </button>
      </div>

      {/* Playback Status Glow Effect */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 pointer-events-none rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
