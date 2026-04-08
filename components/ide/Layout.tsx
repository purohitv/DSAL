'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { CLASSIC_MENU, QUANTUM_MENU } from '@/lib/menu';

import { AuthButton } from '@/components/AuthButton';

import AnalysisModal from './AnalysisModal';

// DATA_STRUCTURES_MENU removed in favor of CLASSIC_MENU

export interface Operation {
  name: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface IDELayoutProps {
  children?: React.ReactNode;
  title: string;
  category: string;
  activeStep?: string;
  totalSteps?: number;
  currentStep?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onTogglePlayback?: () => void;
  isPlaying?: boolean;
  playbackSpeed?: number;
  onSetPlaybackSpeed?: (speed: number) => void;
  showTimeline?: boolean;
  operations?: Operation[];
  // New props for standardized layout
  leftPanel?: {
    title: string;
    subtitle?: string;
    icon?: string;
    content: React.ReactNode;
    extra?: React.ReactNode;
  };
  centerPanel?: {
    title: string;
    subtitle?: string;
    icon?: string;
    content: React.ReactNode;
    extra?: React.ReactNode;
  };
  bottomPanel?: {
    title: string;
    subtitle?: string;
    icon?: string;
    content: React.ReactNode;
    extra?: React.ReactNode;
  };
  rightPanelTop?: {
    title: string;
    subtitle?: string;
    icon?: string;
    content: React.ReactNode;
    extra?: React.ReactNode;
  };
  rightPanelBottom?: {
    title: string;
    subtitle?: string;
    icon?: string;
    content: React.ReactNode;
    extra?: React.ReactNode;
  };
  isSaving?: boolean;
}

function IDEPane({ title, subtitle, icon, children, extra, className }: { 
  title: string; 
  subtitle?: string; 
  icon?: string; 
  children: React.ReactNode; 
  extra?: React.ReactNode;
  className?: string;
}) {
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
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}

export default function IDELayout({
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
  leftPanel,
  centerPanel,
  bottomPanel,
  rightPanelTop,
  rightPanelBottom,
  isSaving = false,
  operations = [],
}: IDELayoutProps) {
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Panel visibility state removed as toggles were removed

  return (
    <div className="flex flex-col h-screen w-screen bg-background-dark text-white overflow-hidden font-display scanline">
      <AnalysisModal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} />
      
      {/* Desktop Only Overlay */}
      <div className="md:hidden fixed inset-0 z-[9999] bg-background-dark flex flex-col items-center justify-center p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-primary mb-4">desktop_windows</span>
        <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-2">Desktop Only</h2>
        <p className="text-text-secondary text-sm">The DSAL IDE requires a larger screen for the best experience. Please use a desktop or tablet device.</p>
      </div>

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
                <img src="/logo.png" alt="DSAL Logo" className="w-5 h-5 object-contain" />
                <h2 className="text-white text-sm font-black tracking-tighter italic uppercase leading-none group-hover:text-primary transition-colors glitch-hover">DSAL <span className="text-primary group-hover:text-white transition-colors">IDE</span></h2>
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
              {/* Data Structure Switcher Dropdown */}
              <div className="relative group/menu">
                <button className="hover:text-white cursor-pointer transition-all hover:translate-x-0.5 flex items-center gap-1 text-white font-black bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  <span className="material-symbols-outlined text-[12px] text-primary">schema</span>
                  {title}
                  <span className="material-symbols-outlined text-[10px]">arrow_drop_down</span>
                </button>
                <div className="absolute top-full left-0 pt-1 w-64 opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto transition-all z-50">
                  <div className="bg-surface-darker border border-border-dark rounded-md shadow-xl p-1 backdrop-blur-xl bg-opacity-95">
                    {CLASSIC_MENU.find(m => m.name === "Learn")?.categories?.map((cat) => (
                      <div key={cat.category} className="relative group/cat">
                        <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-white hover:bg-white/5 rounded cursor-pointer">
                          {cat.category}
                          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                        </div>
                        <div className="absolute top-0 left-full pl-1 w-64 opacity-0 pointer-events-none group-hover/cat:opacity-100 group-hover/cat:pointer-events-auto transition-all z-50">
                          <div className="bg-surface-darker border border-border-dark rounded-md shadow-xl p-1 backdrop-blur-xl bg-opacity-95">
                            {cat.subcategories ? (
                              cat.subcategories.map((sub) => (
                                <div key={sub.name} className="relative group/sub">
                                  <div className="flex items-center justify-between px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-text-secondary hover:text-white hover:bg-white/5 rounded cursor-pointer">
                                    {sub.name}
                                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                                  </div>
                                  <div className="absolute top-0 left-full pl-1 w-56 opacity-0 pointer-events-none group-hover/sub:opacity-100 group-hover/sub:pointer-events-auto transition-all z-50">
                                    <div className="bg-surface-darker border border-border-dark rounded-md shadow-xl p-1 backdrop-blur-xl bg-opacity-95">
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

              {operations && operations.length > 0 && (
                <>
                  <span className="material-symbols-outlined text-text-secondary text-[9px] opacity-30">chevron_right</span>
                  
                  {/* Operations Dropdown */}
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
                            className="w-full text-left px-2 py-1.5 text-[10px] text-text-secondary hover:text-white hover:bg-white/5 rounded transition-colors flex items-center gap-2 group/op"
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
                            <span className="truncate font-bold">{op.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
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
              >
                <span className="material-symbols-outlined text-xs opacity-60 group-hover:opacity-100">analytics</span>
                Analysis
              </button>
            </motion.div>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 relative z-10">
          {/* Timeline Controls */}
          {showTimeline && (
            <div className="hidden xl:flex items-center gap-2 mr-2 border-r border-border-dark pr-2">
              <div className="flex items-center gap-1 bg-surface-darker p-0.5 rounded border border-border-dark shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onPrev} 
                  title="Previous Step"
                  aria-label="Previous Step"
                  className="text-text-secondary hover:text-white transition-colors p-0.5 rounded relative z-10"
                >
                  <span className="material-symbols-outlined text-xs">skip_previous</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(127,19,236,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onTogglePlayback}
                  title={isPlaying ? "Pause" : "Play"}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className={`p-0.5 rounded transition-all relative z-10 border ${isPlaying ? 'bg-primary/20 text-primary border-primary/30 shadow-neon-sm' : 'bg-surface-dark text-white border-border-dark hover:border-primary/50'}`}
                >
                  <span className="material-symbols-outlined text-xs">{isPlaying ? 'pause' : 'play_arrow'}</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onNext} 
                  title="Next Step"
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
                    >
                      {speed}X
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <AuthButton />
        </div>
      </motion.header>

      {/* Sub-header: Timeline & Breadcrumbs */}
      {/* Removed as it has been merged into the main header */}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative pb-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(127,19,236,0.03),transparent_70%)] pointer-events-none"></div>
        
        {children ? children : (
          <main className="flex-1 flex overflow-hidden w-full">
            {/* Desktop View */}
            <PanelGroup direction="horizontal" className="flex w-full h-full">
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
                <PanelGroup direction="vertical">
                  {centerPanel && (
                    <Panel defaultSize={bottomPanel ? 70 : 100} minSize={20} className="relative overflow-hidden">
                      <IDEPane {...centerPanel} className="border-none">
                        {centerPanel.content}
                      </IDEPane>
                    </Panel>
                  )}
                  {bottomPanel && (
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
              {(rightPanelTop || rightPanelBottom) && (
                <>
                  <PanelResizeHandle className="w-1.5 bg-border-dark hover:bg-primary/50 transition-colors cursor-col-resize relative z-20">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/10"></div>
                  </PanelResizeHandle>
                  <Panel defaultSize={25} minSize={15} className="bg-background-dark flex flex-col z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.4)]">
                    <PanelGroup direction="vertical">
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

