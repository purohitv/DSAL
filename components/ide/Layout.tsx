// components/ide/Layout.tsx
'use client';

import React, { useState, useEffect, ReactNode, memo, useMemo, Suspense, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import dynamic from 'next/dynamic';

import { CLASSIC_MENU, QUANTUM_MENU } from '@/lib/menu';
import { AuthButton } from '@/components/AuthButton';

// Types
export interface Operation {
  name: string;
  onClick: () => void | Promise<void>;
  icon?: ReactNode | string;
  shortcut?: string;
  disabled?: boolean;
}

interface PanelConfig {
  title: string;
  subtitle?: string;
  icon?: string;
  content: React.ReactNode;
  extra?: React.ReactNode;
}

interface IDELayoutProps {
  children?: React.ReactNode;
  title: string;
  category: string;
  activeStep?: string;
  totalSteps?: number;
  currentStep?: number;
  onPrev?: () => void | Promise<void>;
  onNext?: () => void | Promise<void>;
  onTogglePlayback?: () => void | Promise<void>;
  isPlaying?: boolean;
  playbackSpeed?: number;
  onSetPlaybackSpeed?: (speed: number) => void | Promise<void>;
  showTimeline?: boolean;
  extraControls?: React.ReactNode;
  operations?: Operation[];
  leftPanel?: PanelConfig;
  centerPanel?: PanelConfig;
  bottomPanel?: PanelConfig;
  rightPanelTop?: PanelConfig;
  rightPanelBottom?: PanelConfig;
  isSaving?: boolean;
}

// Lazy load AnalysisModal for better performance
const AnalysisModal = dynamic(
  () => import('@/components/ide/AnalysisModal'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[10000]">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-primary border-b-2 border-secondary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-white animate-pulse">code</span>
          </div>
        </div>
      </div>
    )
  }
);

// Utility functions
const debounce = (fn: Function, ms: number) => {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};

// Custom hooks
const useKeyboardShortcuts = (
  onPrev?: () => void | Promise<void>,
  onNext?: () => void | Promise<void>,
  onTogglePlayback?: () => void | Promise<void>,
  onSetPlaybackSpeed?: (speed: number) => void | Promise<void>,
  setShowRightPanel?: (show: boolean) => void,
  setShowBottomPanel?: (show: boolean) => void,
  showRightPanel?: boolean,
  showBottomPanel?: boolean,
  setIsFullscreen?: (isFullscreen: boolean) => void,
  isFullscreen?: boolean
) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + B: Toggle right panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowRightPanel?.(!showRightPanel);
      }
      
      // Ctrl/Cmd + J: Toggle bottom panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setShowBottomPanel?.(!showBottomPanel);
      }
      
      // Ctrl/Cmd + Shift + F: Toggle fullscreen
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setIsFullscreen?.(!isFullscreen);
      }
      
      // Escape: Exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen?.(false);
      }
      
      // Space: Play/Pause
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        onTogglePlayback?.();
      }
      
      // Arrow keys for prev/next
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev?.();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext?.();
      }
      
      // Number keys for playback speed
      if (e.key === '1') {
        e.preventDefault();
        onSetPlaybackSpeed?.(1);
      }
      if (e.key === '2') {
        e.preventDefault();
        onSetPlaybackSpeed?.(2);
      }
      if (e.key === '4') {
        e.preventDefault();
        onSetPlaybackSpeed?.(4);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPrev, onNext, onTogglePlayback, onSetPlaybackSpeed, setShowRightPanel, setShowBottomPanel, showRightPanel, showBottomPanel, setIsFullscreen, isFullscreen]);
};

const usePanelVisibility = (key: string, defaultValue: boolean) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;
    const saved = localStorage.getItem(`ide-${key}`);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(`ide-${key}`, JSON.stringify(isVisible));
  }, [key, isVisible]);

  return [isVisible, setIsVisible] as const;
};

const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  return [isFullscreen, toggleFullscreen] as const;
};

// Memoized components
const IDEPane = memo(({ 
  title, 
  subtitle, 
  icon, 
  children, 
  extra, 
  className 
}: PanelConfig & { className?: string; children: React.ReactNode }) => {
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleResize = debounce(() => {
      setIsResizing(true);
      setTimeout(() => setIsResizing(false), 150);
    }, 100);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className || ''}`}>
      <div className="px-1.5 py-1 border-b border-border-dark flex justify-between items-center bg-surface-darker/80 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-1.5">
          {icon && (
            <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="material-symbols-outlined text-[10px] text-primary">{icon}</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">{title}</span>
            {subtitle && <span className="text-[7px] font-bold text-text-secondary uppercase tracking-widest">{subtitle}</span>}
          </div>
        </div>
        {extra}
      </div>
      <div className={`flex-1 overflow-hidden relative transition-opacity duration-150 ${isResizing ? 'opacity-50' : 'opacity-100'}`}>
        {children}
      </div>
    </div>
  );
});

IDEPane.displayName = 'IDEPane';

const MenuDropdown = memo(({ title, operations }: { title: string; operations?: Operation[] }) => {
  return (
    <div className="relative group/menu">
      <button className="hover:text-white cursor-pointer transition-all hover:translate-x-0.5 flex items-center gap-1 text-white font-black bg-white/5 px-2 py-0.5 rounded border border-white/10">
        <span className="material-symbols-outlined text-[12px] text-primary">schema</span>
        {title}
        <span className="material-symbols-outlined text-[10px]">arrow_drop_down</span>
      </button>
      <div className="absolute top-full left-0 pt-1 w-64 opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto transition-all z-50">
        <div className="bg-surface-darker border border-border-dark rounded-md shadow-xl p-1 backdrop-blur-xl bg-opacity-95 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {CLASSIC_MENU.find(m => m.name === "Learn")?.categories?.map((cat) => (
            <div key={cat.category} className="relative group/cat">
              <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-white hover:bg-white/5 rounded cursor-pointer">
                {cat.category}
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              </div>
              <div className="absolute top-0 left-full pl-1 w-64 opacity-0 pointer-events-none group-hover/cat:opacity-100 group-hover/cat:pointer-events-auto transition-all z-50">
                <div className="bg-surface-darker border border-border-dark rounded-md shadow-xl p-1 backdrop-blur-xl bg-opacity-95 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  {cat.subcategories ? (
                    cat.subcategories.map((sub) => (
                      <div key={sub.name} className="relative group/sub">
                        <div className="flex items-center justify-between px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-text-secondary hover:text-white hover:bg-white/5 rounded cursor-pointer">
                          {sub.name}
                          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                        </div>
                        <div className="absolute top-0 left-full pl-1 w-56 opacity-0 pointer-events-none group-hover/sub:opacity-100 group-hover/sub:pointer-events-auto transition-all z-50">
                          <div className="bg-surface-darker border border-border-dark rounded-md shadow-xl p-1 backdrop-blur-xl bg-opacity-95 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            {sub.items.map((item) => (
                              <Link 
                                key={item.name} 
                                href={item.href}
                                className={`block px-2 py-1.5 text-[10px] rounded transition-colors ${title === item.name ? 'text-primary bg-primary/10 font-bold' : 'text-text-secondary hover:text-primary hover:bg-primary/5'}`}
                              >
                                <div className="font-bold">{item.name}</div>
                                <div className="text-[7px] opacity-60 uppercase tracking-tighter">{item.desc}</div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    cat.items?.map((item) => (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`block px-2 py-1.5 text-[10px] rounded transition-colors ${title === item.name ? 'text-primary bg-primary/10 font-bold' : 'text-text-secondary hover:text-primary hover:bg-primary/5'}`}
                      >
                        <div className="font-bold">{item.name}</div>
                        <div className="text-[7px] opacity-60 uppercase tracking-tighter">{item.desc}</div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

MenuDropdown.displayName = 'MenuDropdown';

const OperationsDropdown = memo(({ operations }: { operations: Operation[] }) => {
  return (
    <div className="relative group/ops">
      <motion.button 
        layoutId="active-breadcrumb"
        className="text-primary font-black bg-primary/10 px-2 py-0.5 rounded border border-primary/30 text-[8px] tracking-[0.2em] uppercase shadow-inner italic relative overflow-hidden group flex items-center gap-1 hover:bg-primary/20 transition-colors"
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="material-symbols-outlined text-[12px]">settings_suggest</span>
        Operations
        <span className="material-symbols-outlined text-[10px]">arrow_drop_down</span>
      </motion.button>
      <div className="absolute top-full left-0 pt-1 w-max min-w-[160px] opacity-0 pointer-events-none group-hover/ops:opacity-100 group-hover/ops:pointer-events-auto transition-all z-50">
        <div className="bg-surface-darker border border-border-dark rounded-md shadow-xl p-1 backdrop-blur-xl bg-opacity-95">
          {operations.map((op, idx) => (
            <button 
              key={idx}
              onClick={op.onClick}
              disabled={op.disabled}
              className={`w-full text-left px-2 py-1.5 text-[10px] rounded transition-colors flex items-center gap-2 group/op ${
                op.disabled 
                  ? 'text-text-secondary/50 cursor-not-allowed' 
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              {op.icon && (
                <div className="flex items-center justify-center w-4 h-4 opacity-60 group-hover/op:opacity-100 transition-opacity">
                  {typeof op.icon === 'string' ? (
                    <span className="material-symbols-outlined text-[14px]">{op.icon}</span>
                  ) : (
                    op.icon
                  )}
                </div>
              )}
              <span className="truncate font-bold flex-1">{op.name}</span>
              {op.shortcut && (
                <span className="text-[7px] opacity-40 font-mono">{op.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

OperationsDropdown.displayName = 'OperationsDropdown';

// Error Boundary Component
class IDEErrorBoundary extends React.Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('IDE Error:', error, errorInfo);
    // You can send to Supabase analytics here
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="fixed inset-0 bg-background-dark flex items-center justify-center p-8 z-[10000]">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <h2 className="text-2xl font-black mb-2">IDE Error</h2>
            <p className="text-text-secondary mb-4">
              Something went wrong in the IDE layout.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary rounded font-bold hover:bg-primary/80 transition-colors"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 p-2 bg-red-500/10 rounded text-left text-xs overflow-auto">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main Layout Component
function IDELayoutContent({
  children,
  title,
  category,
  activeStep,
  totalSteps = 1,
  currentStep = 1,
  onPrev,
  onNext,
  onTogglePlayback,
  isPlaying = false,
  playbackSpeed = 1,
  onSetPlaybackSpeed,
  showTimeline = true,
  extraControls,
  leftPanel,
  centerPanel,
  bottomPanel,
  rightPanelTop,
  rightPanelBottom,
  isSaving = false,
  operations = [],
}: IDELayoutProps) {
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [showRightPanel, setShowRightPanel] = usePanelVisibility('show-right-panel', !!(rightPanelTop || rightPanelBottom));
  const [showBottomPanel, setShowBottomPanel] = usePanelVisibility('show-bottom-panel', !!bottomPanel);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, toggleFullscreen] = useFullscreen();
  const [mounted, setMounted] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Desktop-first: only show mobile warning below 1024px
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Setup keyboard shortcuts
  useKeyboardShortcuts(
    onPrev,
    onNext,
    onTogglePlayback,
    onSetPlaybackSpeed,
    setShowRightPanel,
    setShowBottomPanel,
    showRightPanel,
    showBottomPanel,
    toggleFullscreen,
    isFullscreen
  );

  // Memoized timeline controls
  const timelineControls = useMemo(() => {
    if (!showTimeline) return null;
    
    return (
      <div className="hidden xl:flex items-center gap-2 mr-2 border-r border-border-dark pr-2">
        <div className="flex items-center gap-1 bg-surface-darker p-0.5 rounded border border-border-dark shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPrev?.()} 
            title="Previous Step (←)"
            aria-label="Previous Step"
            className="text-text-secondary hover:text-white transition-colors p-0.5 rounded relative z-10"
          >
            <span className="material-symbols-outlined text-xs">skip_previous</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(127,19,236,0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTogglePlayback?.()}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={`p-0.5 rounded transition-all relative z-10 border ${isPlaying ? 'bg-primary/20 text-primary border-primary/30 shadow-neon-sm' : 'bg-surface-dark text-white border-border-dark hover:border-primary/50'}`}
          >
            <span className="material-symbols-outlined text-xs">{isPlaying ? 'pause' : 'play_arrow'}</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNext?.()} 
            title="Next Step (→)"
            aria-label="Next Step"
            className="text-text-secondary hover:text-white transition-colors p-0.5 rounded relative z-10"
          >
            <span className="material-symbols-outlined text-xs">skip_next</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-1.5 bg-surface-darker px-1.5 py-0.5 rounded border border-border-dark shadow-inner min-w-[120px]">
          <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest w-8 text-right opacity-50">Step</span>
          <div className="flex-1 h-1 bg-background-dark rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          <span className="text-[8px] font-mono font-black text-white w-10 text-left">
            <span className="text-primary">{currentStep}</span><span className="text-text-secondary opacity-50">/{totalSteps}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 bg-surface-darker p-0.5 rounded border border-border-dark shadow-md">
          <span className="text-[8px] text-text-secondary uppercase font-black tracking-widest ml-1 opacity-50">Spd</span>
          <div className="flex gap-0.5">
            {[1, 2, 4].map((speed) => (
              <motion.button 
                key={speed}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSetPlaybackSpeed?.(speed)} 
                className={`px-1.5 py-0.5 text-[10px] font-black rounded transition-all border ${playbackSpeed === speed ? 'text-white bg-primary border-white/20 shadow-sm shadow-primary/30' : 'text-text-secondary border-transparent hover:text-white hover:bg-surface-dark'}`}
                title={`${speed}X speed (${speed})`}
              >
                {speed}X
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }, [showTimeline, onPrev, onNext, onTogglePlayback, isPlaying, currentStep, totalSteps, playbackSpeed, onSetPlaybackSpeed]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // Desktop-only warning for small screens
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background-dark flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
        >
          <span className="material-symbols-outlined text-7xl text-primary mb-6 animate-pulse">desktop_windows</span>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Desktop Required
          </h2>
          <p className="text-text-secondary text-base max-w-md">
            The DSAL IDE is optimized for desktop experience. 
            Please switch to a computer with a larger screen (1024px or wider).
          </p>
          <div className="mt-8 flex gap-2 justify-center text-xs text-text-secondary/50">
            <span className="material-symbols-outlined text-sm">keyboard</span>
            <span>Keyboard shortcuts ready</span>
            <span className="material-symbols-outlined text-sm ml-2">stadia_controller</span>
            <span>Full IDE experience</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen w-screen bg-background-dark text-white overflow-hidden font-display ${isFullscreen ? 'fixed inset-0 z-[9999]' : ''}`}>
      <Suspense fallback={null}>
        <AnalysisModal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} />
      </Suspense>

      {/* Main Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="flex-none flex items-center justify-between border-b border-border-dark !bg-background-dark/95 backdrop-blur-xl px-1.5 py-0.5 h-8 z-50 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <Link href="/dashboard" className="flex items-center gap-1.5 group">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="size-5 flex items-center justify-center bg-primary rounded shadow-[0_0_10px_rgba(127,19,236,0.6)] border border-white/20"
            >
              <span className="material-symbols-outlined text-white text-xs">terminal</span>
            </motion.div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h2 className="text-white text-sm font-black tracking-tighter italic uppercase leading-none group-hover:text-primary transition-colors">
                  DSAL <span className="text-primary group-hover:text-white transition-colors">IDE</span>
                </h2>
                <AnimatePresence>
                  {isSaving && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-1 ml-2 px-1.5 py-0.5 bg-primary/20 rounded border border-primary/30"
                    >
                      <span className="material-symbols-outlined text-[10px] text-primary animate-spin">sync</span>
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">Saving...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-[7px] font-black text-text-secondary uppercase tracking-[0.4em] mt-0.5 opacity-60">v3.0.4</span>
            </div>
          </Link>
          
          <Link 
            className="flex items-center justify-center text-white transition-all hover:text-primary relative group px-1.5 py-0.5 rounded border border-transparent hover:border-primary/30 ml-1" 
            href="/dashboard"
            title="Dashboard"
          >
            <span className="material-symbols-outlined text-sm opacity-60 group-hover:opacity-100">home</span>
          </Link>

          {/* Breadcrumbs & Extra Controls */}
          <div className="hidden md:flex items-center gap-1 ml-2 border-l border-border-dark pl-2">
            <div className="flex items-center gap-1 text-text-secondary text-[8px] font-black uppercase tracking-widest relative">
              <MenuDropdown title={title} operations={operations} />

              {operations && operations.length > 0 && (
                <>
                  <span className="material-symbols-outlined text-text-secondary text-[9px] opacity-30">chevron_right</span>
                  <OperationsDropdown operations={operations} />
                </>
              )}
            </div>
            {extraControls && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 border-l border-border-dark pl-1 ml-1"
              >
                {extraControls}
              </motion.div>
            )}
          </div>

          <nav className="hidden lg:flex items-center gap-3 ml-3 h-full">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button 
                onClick={() => setIsAnalysisModalOpen(true)}
                className="flex items-center gap-1 text-white text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:text-secondary relative group px-1.5 py-0.5 rounded border border-transparent hover:border-secondary/30" 
                title="Open Analysis (Ctrl+Shift+A)"
              >
                <span className="material-symbols-outlined text-xs opacity-60 group-hover:opacity-100">analytics</span>
                Analysis
              </button>
            </motion.div>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 relative z-10">
          {timelineControls}

          {/* Panel Toggles */}
          <div className="flex items-center gap-0.5 bg-surface-darker p-0.5 rounded border border-border-dark mr-1">
            {bottomPanel && (
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }} 
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowBottomPanel(!showBottomPanel)}
                title="Toggle Terminal Panel (Ctrl+J)"
                aria-label="Toggle Terminal Panel"
                className={`transition-colors p-0.5 rounded flex items-center justify-center ${showBottomPanel ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-xs">terminal</span>
              </motion.button>
            )}
            {(rightPanelTop || rightPanelBottom) && (
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }} 
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowRightPanel(!showRightPanel)}
                title="Toggle Side Panel (Ctrl+B)"
                aria-label="Toggle Side Panel"
                className={`transition-colors p-0.5 rounded flex items-center justify-center ${showRightPanel ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-xs">right_panel_open</span>
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-0.5 bg-surface-darker p-0.5 rounded border border-border-dark">
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }} 
              whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen (Ctrl+Shift+F)"}
              aria-label="Fullscreen"
              className="text-text-secondary hover:text-white transition-colors p-0.5 rounded"
            >
              <span className="material-symbols-outlined text-xs">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }} 
              whileTap={{ scale: 0.9 }}
              title="Settings (Ctrl+,)"
              aria-label="Settings"
              className="text-text-secondary hover:text-white transition-colors p-0.5 rounded"
            >
              <span className="material-symbols-outlined text-xs">settings</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }} 
              whileTap={{ scale: 0.9 }}
              title="Notifications"
              aria-label="Notifications"
              className="text-text-secondary hover:text-white transition-colors p-0.5 rounded relative"
            >
              <span className="material-symbols-outlined text-xs">notifications</span>
              <span className="absolute top-0 right-0 size-1 bg-primary rounded-full shadow-[0_0_8px_rgba(127,19,236,0.8)] animate-pulse"></span>
            </motion.button>
          </div>

          <AuthButton />
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative pb-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(127,19,236,0.03),transparent_70%)] pointer-events-none"></div>
        
        {children ? children : (
          <main className="flex-1 flex overflow-hidden w-full">
            <PanelGroup autoSaveId="ide-main-layout" direction="horizontal" className="flex w-full h-full">

              {/* Left Sidebar */}
              {leftPanel && (
                <>
                  <Panel defaultSize={25} minSize={15} className="bg-background-dark flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
                    <IDEPane {...leftPanel}>
                      {leftPanel.content}
                    </IDEPane>
                  </Panel>
                  <PanelResizeHandle className="w-1.5 bg-border-dark hover:bg-primary/50 transition-colors cursor-col-resize relative z-20">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/10"></div>
                  </PanelResizeHandle>
                </>
              )}
              
              {/* Center Section */}
              <Panel defaultSize={leftPanel ? 50 : 75} minSize={30} className="flex flex-col relative bg-background-dark overflow-hidden">
                <PanelGroup id="ide-center-vertical" direction="vertical">

                  {centerPanel && (
                    <Panel defaultSize={bottomPanel && showBottomPanel ? 70 : 100} minSize={20} className="relative overflow-hidden">
                      <IDEPane {...centerPanel} className="border-none">
                        {centerPanel.content}
                      </IDEPane>
                    </Panel>
                  )}
                  {bottomPanel && showBottomPanel && (
                    <>
                      <PanelResizeHandle className="h-1.5 bg-border-dark hover:bg-primary/50 transition-colors cursor-row-resize relative z-20">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/10"></div>
                      </PanelResizeHandle>
                      <Panel defaultSize={30} minSize={15} className="bg-background-dark flex flex-col z-10 shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
                        <IDEPane {...bottomPanel}>
                          {bottomPanel.content}
                        </IDEPane>
                      </Panel>
                    </>
                  )}
                </PanelGroup>
              </Panel>
              
              {/* Right Sidebar */}
              {(rightPanelTop || rightPanelBottom) && showRightPanel && (
                <>
                  <PanelResizeHandle className="w-1.5 bg-border-dark hover:bg-primary/50 transition-colors cursor-col-resize relative z-20">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/10"></div>
                  </PanelResizeHandle>
                  <Panel defaultSize={25} minSize={15} className="bg-background-dark flex flex-col z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.4)]">
                    <PanelGroup id="ide-right-vertical" direction="vertical">

                      {rightPanelTop && (
                        <Panel defaultSize={rightPanelBottom ? 50 : 100} minSize={20} className="flex flex-col min-h-0">
                          <IDEPane {...rightPanelTop} className="border-b-2 border-border-dark">
                            {rightPanelTop.content}
                          </IDEPane>
                        </Panel>
                      )}
                      {rightPanelBottom && (
                        <>
                          {rightPanelTop && (
                            <PanelResizeHandle className="h-1.5 bg-border-dark hover:bg-primary/50 transition-colors cursor-row-resize relative z-20">
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/10"></div>
                            </PanelResizeHandle>
                          )}
                          <Panel defaultSize={rightPanelTop ? 50 : 100} minSize={20} className="flex flex-col min-h-0">
                            <IDEPane {...rightPanelBottom}>
                              {rightPanelBottom.content}
                            </IDEPane>
                          </Panel>
                        </>
                      )}
                    </PanelGroup>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </main>
        )}
      </div>

      {/* Footer Status Bar */}
      <motion.footer 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-none bg-background-dark border-t border-border-dark px-2 py-0.5 text-[9px] text-text-secondary flex justify-between items-center font-mono z-50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
        <div className="flex gap-4 items-center relative z-10">
          <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors group">
            <span className="material-symbols-outlined text-[10px] text-primary group-hover:rotate-12 transition-transform">account_tree</span> 
            <span className="font-black uppercase tracking-widest text-[9px]">main*</span>
          </span>
          <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors group">
            <span className="material-symbols-outlined text-[10px] text-yellow-500 group-hover:scale-110 transition-transform">warning</span> 
            <span className="font-black uppercase tracking-widest text-[9px]">0 Errors</span>
          </span>
          <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors group">
            <span className="material-symbols-outlined text-[10px] text-accent-mint group-hover:scale-110 transition-transform">info</span> 
            <span className="font-black uppercase tracking-widest text-[9px]">2 Hints</span>
          </span>
        </div>
        <div className="flex gap-3 items-center relative z-10">
          <span className="text-primary/70 font-black uppercase tracking-widest opacity-50">UTF-8</span>
          <span className="flex items-center gap-1 text-primary animate-pulse">
            <span className="material-symbols-outlined text-[10px]">cloud_done</span> 
            <span className="font-black uppercase tracking-widest">Connected</span>
          </span>
          <span className="bg-primary/10 text-primary px-1 py-0.5 rounded border border-primary/20 font-black uppercase tracking-widest italic shadow-neon-sm">
            v3.0.4
          </span>
        </div>
      </motion.footer>
    </div>
  );
}

// Wrapped export with Error Boundary
export default function IDELayout(props: IDELayoutProps) {
  return (
    <IDEErrorBoundary>
      <IDELayoutContent {...props} />
    </IDEErrorBoundary>
  );
}
