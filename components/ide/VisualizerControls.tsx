// components/ide/VisualizerControls.tsx
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ControlButtonConfig {
  id: string;
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  shortcut?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

interface VisualizerControlsProps {
  onReset?: () => void;
  onToggleGrid?: () => void;
  onToggleLabels?: () => void;
  onFullscreen?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenter?: () => void;
  onScreenshot?: () => void;
  onToggleWireframe?: () => void;
  onToggleLighting?: () => void;
  onResetCamera?: () => void;
  showGrid?: boolean;
  showLabels?: boolean;
  showWireframe?: boolean;
  showLighting?: boolean;
  isFullscreen?: boolean;
  zoomLevel?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  orientation?: 'vertical' | 'horizontal';
  showTooltips?: boolean;
  compact?: boolean;
}

// Position styles mapping
const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

// Orientation styles mapping
const orientationStyles = {
  vertical: 'flex-col',
  horizontal: 'flex-row',
};

// Variant colors mapping
const variantColors = {
  default: {
    active: 'text-primary bg-primary/20 border-primary/30',
    inactive: 'text-text-secondary hover:text-white hover:bg-white/5',
  },
  danger: {
    active: 'text-red-500 bg-red-500/20 border-red-500/30',
    inactive: 'text-text-secondary hover:text-red-500 hover:bg-red-500/10',
  },
  success: {
    active: 'text-green-500 bg-green-500/20 border-green-500/30',
    inactive: 'text-text-secondary hover:text-green-500 hover:bg-green-500/10',
  },
  warning: {
    active: 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30',
    inactive: 'text-text-secondary hover:text-yellow-500 hover:bg-yellow-500/10',
  },
};

export default function VisualizerControls({
  onReset,
  onToggleGrid,
  onToggleLabels,
  onFullscreen,
  onZoomIn,
  onZoomOut,
  onCenter,
  onScreenshot,
  onToggleWireframe,
  onToggleLighting,
  onResetCamera,
  showGrid = true,
  showLabels = true,
  showWireframe = false,
  showLighting = true,
  isFullscreen = false,
  zoomLevel = 1,
  position = 'top-right',
  orientation = 'vertical',
  showTooltips = true,
  compact = false,
}: VisualizerControlsProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [activeControl, setActiveControl] = useState<string | null>(null);

  // Auto-collapse on mobile
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // G key: Toggle grid
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        onToggleGrid?.();
      }
      
      // L key: Toggle labels
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        onToggleLabels?.();
      }
      
      // W key: Toggle wireframe
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        onToggleWireframe?.();
      }
      
      // F key: Fullscreen
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onFullscreen?.();
      }
      
      // R key: Reset view
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset?.();
      }
      
      // C key: Center view
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onCenter?.();
      }
      
      // +/- keys: Zoom
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        onZoomIn?.();
      }
      
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        onZoomOut?.();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onToggleGrid, onToggleLabels, onToggleWireframe, onFullscreen, onReset, onCenter, onZoomIn, onZoomOut]);

  // Build control buttons configuration
  const controlButtons = useMemo((): ControlButtonConfig[] => {
    const buttons: ControlButtonConfig[] = [];

    // Reset/Center section
    if (onReset || onCenter || onResetCamera) {
      if (onReset) {
        buttons.push({
          id: 'reset',
          icon: 'restart_alt',
          label: 'Reset View',
          onClick: onReset,
          shortcut: 'R',
          variant: 'warning',
        });
      }
      if (onCenter) {
        buttons.push({
          id: 'center',
          icon: 'center_focus_strong',
          label: 'Center View',
          onClick: onCenter,
          shortcut: 'C',
        });
      }
      if (onResetCamera) {
        buttons.push({
          id: 'reset-camera',
          icon: 'camera_rear',
          label: 'Reset Camera',
          onClick: onResetCamera,
        });
      }
    }

    // Zoom controls
    if (onZoomIn || onZoomOut) {
      if (buttons.length > 0 && buttons[buttons.length - 1].id !== 'divider') {
        buttons.push({ id: 'divider-1', icon: '', label: '', onClick: undefined } as ControlButtonConfig);
      }
      
      if (onZoomOut) {
        buttons.push({
          id: 'zoom-out',
          icon: 'zoom_out',
          label: 'Zoom Out',
          onClick: onZoomOut,
          shortcut: '-',
        });
      }
      
      // Zoom level indicator (not clickable)
      if (zoomLevel !== undefined) {
        buttons.push({
          id: 'zoom-level',
          icon: '',
          label: `${Math.round(zoomLevel * 100)}%`,
          onClick: undefined,
          disabled: true,
        } as ControlButtonConfig);
      }
      
      if (onZoomIn) {
        buttons.push({
          id: 'zoom-in',
          icon: 'zoom_in',
          label: 'Zoom In',
          onClick: onZoomIn,
          shortcut: '+',
        });
      }
    }

    // Visual toggles section
    if (onToggleGrid || onToggleLabels || onToggleWireframe || onToggleLighting) {
      if (buttons.length > 0 && buttons[buttons.length - 1].id !== 'divider') {
        buttons.push({ id: 'divider-2', icon: '', label: '', onClick: undefined } as ControlButtonConfig);
      }
      
      if (onToggleGrid) {
        buttons.push({
          id: 'grid',
          icon: showGrid ? 'grid_on' : 'grid_off',
          label: showGrid ? 'Hide Grid' : 'Show Grid',
          onClick: onToggleGrid,
          active: showGrid,
          shortcut: 'G',
        });
      }
      
      if (onToggleLabels) {
        buttons.push({
          id: 'labels',
          icon: showLabels ? 'label' : 'label_off',
          label: showLabels ? 'Hide Labels' : 'Show Labels',
          onClick: onToggleLabels,
          active: showLabels,
          shortcut: 'L',
        });
      }
      
      if (onToggleWireframe) {
        buttons.push({
          id: 'wireframe',
          icon: showWireframe ? 'view_in_ar' : 'view_in_ar',
          label: showWireframe ? 'Hide Wireframe' : 'Show Wireframe',
          onClick: onToggleWireframe,
          active: showWireframe,
          shortcut: 'W',
        });
      }
      
      if (onToggleLighting) {
        buttons.push({
          id: 'lighting',
          icon: showLighting ? 'light_mode' : 'dark_mode',
          label: showLighting ? 'Disable Lighting' : 'Enable Lighting',
          onClick: onToggleLighting,
          active: showLighting,
        });
      }
    }

    // Screenshot section
    if (onScreenshot) {
      if (buttons.length > 0 && buttons[buttons.length - 1].id !== 'divider') {
        buttons.push({ id: 'divider-3', icon: '', label: '', onClick: undefined } as ControlButtonConfig);
      }
      
      buttons.push({
        id: 'screenshot',
        icon: 'screenshot',
        label: 'Take Screenshot',
        onClick: onScreenshot,
        shortcut: 'Ctrl+S',
      });
    }

    // Fullscreen section
    if (onFullscreen) {
      if (buttons.length > 0 && buttons[buttons.length - 1].id !== 'divider') {
        buttons.push({ id: 'divider-4', icon: '', label: '', onClick: undefined } as ControlButtonConfig);
      }
      
      buttons.push({
        id: 'fullscreen',
        icon: isFullscreen ? 'fullscreen_exit' : 'fullscreen',
        label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
        onClick: onFullscreen,
        shortcut: 'F',
      });
    }

    return buttons;
  }, [
    onReset, onCenter, onResetCamera, onZoomIn, onZoomOut, onToggleGrid, onToggleLabels,
    onToggleWireframe, onToggleLighting, onScreenshot, onFullscreen,
    showGrid, showLabels, showWireframe, showLighting, isFullscreen, zoomLevel
  ]);

  const handleControlClick = useCallback((button: ControlButtonConfig) => {
    if (button.disabled || !button.onClick) return;
    
    setActiveControl(button.id);
    button.onClick();
    
    // Reset active state after animation
    setTimeout(() => setActiveControl(null), 200);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      className={`absolute ${positionStyles[position]} z-50`}
    >
      {/* Toggle button for compact mode */}
      {compact && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-2 w-8 h-8 rounded-lg bg-surface-darker/80 backdrop-blur-md border border-border-dark flex items-center justify-center shadow-2xl"
        >
          <span className="material-symbols-outlined text-sm text-primary">
            {isExpanded ? 'close' : 'tune'}
          </span>
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {(!compact || isExpanded) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: compact ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: compact ? -10 : 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`bg-surface-darker/90 backdrop-blur-md border border-border-dark rounded-lg shadow-2xl p-1 flex ${orientationStyles[orientation]} gap-1`}
          >
            {controlButtons.map((button, index) => {
              // Render divider
              if (button.id.includes('divider')) {
                return (
                  <div
                    key={button.id}
                    className={`${
                      orientation === 'vertical' ? 'h-px mx-1' : 'w-px my-1'
                    } bg-border-dark`}
                  />
                );
              }

              // Render zoom level indicator (non-interactive)
              if (button.id === 'zoom-level') {
                return (
                  <div
                    key={button.id}
                    className="px-2 h-8 flex items-center justify-center text-[9px] font-black text-text-secondary uppercase tracking-widest"
                  >
                    {button.label}
                  </div>
                );
              }

              // Render control button
              return (
                <ControlButton
                  key={button.id}
                  config={button}
                  isActive={activeControl === button.id}
                  showTooltip={showTooltips}
                  orientation={orientation}
                  onClick={() => handleControlClick(button)}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Sub-component for individual control button
function ControlButton({
  config,
  isActive,
  showTooltip,
  orientation,
  onClick,
}: {
  config: ControlButtonConfig;
  isActive: boolean;
  showTooltip: boolean;
  orientation: 'vertical' | 'horizontal';
  onClick: () => void;
}) {
  const colors = variantColors[config.variant || 'default'];
  
  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: config.disabled ? 1 : 1.05 }}
        whileTap={{ scale: config.disabled ? 1 : 0.95 }}
        onClick={onClick}
        disabled={config.disabled}
        className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-200 ${
          config.disabled
            ? 'opacity-30 cursor-not-allowed'
            : config.active
            ? colors.active
            : colors.inactive
        } ${isActive ? 'scale-90' : ''}`}
        aria-label={config.label}
        title={!showTooltip ? config.label : undefined}
      >
        {config.icon ? (
          <span className="material-symbols-outlined text-lg">{config.icon}</span>
        ) : null}
      </motion.button>

      {/* Tooltip */}
      {showTooltip && !config.disabled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute ${
            orientation === 'vertical'
              ? 'right-full mr-2 top-1/2 -translate-y-1/2'
              : 'bottom-full mb-2 left-1/2 -translate-x-1/2'
          } px-2 py-1 bg-background-dark border border-border-dark rounded text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-2xl z-50`}
        >
          {config.label}
          {config.shortcut && (
            <span className="ml-1 text-[8px] text-primary opacity-70">
              ({config.shortcut})
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}
