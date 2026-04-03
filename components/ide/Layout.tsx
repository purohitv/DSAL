'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { CLASSIC_MENU, QUANTUM_MENU } from '@/lib/menu';

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
  extraControls?: React.ReactNode;
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
  extraControls,
  leftPanel,
  centerPanel,
  bottomPanel,
  rightPanelTop,
  rightPanelBottom,
}: IDELayoutProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTopLevel, setActiveTopLevel] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<number | null>(null);
  const [menuDirection, setMenuDirection] = useState<'right' | 'left'>('right');

  // Panel visibility state
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState<'code' | 'visualizer' | 'stats'>('visualizer');

  // Check if menus would overflow the screen
  React.useEffect(() => {
    const checkOverflow = () => {
      if (typeof window !== 'undefined') {
        // If screen is smaller than 1400px, deep menus should open left
        if (window.innerWidth < 1400) {
          setMenuDirection('left');
        } else {
          setMenuDirection('right');
        }
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  const mobileTabs = [
    { id: 'code', label: 'Code', icon: 'code' },
    { id: 'visualizer', label: 'Stage', icon: 'science' },
    { id: 'stats', label: 'Stats', icon: 'analytics' },
  ] as const;

  return (
    <div className="flex flex-col h-screen w-screen bg-background-dark text-white overflow-hidden font-display scanline">
      {/* Mobile Tab Bar (Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background-dark/95 backdrop-blur-xl border-t border-border-dark z-[100] flex items-center justify-around px-4">
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobileActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              mobileActiveTab === tab.id ? 'text-primary scale-110' : 'text-text-secondary opacity-60'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{tab.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            {mobileActiveTab === tab.id && (
              <motion.div 
                layoutId="mobile-tab-indicator"
                className="absolute -bottom-2 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(127,19,236,0.8)]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="flex-none flex items-center justify-between border-b border-border-dark !bg-background-dark/95 backdrop-blur-xl px-1.5 py-0.5 h-8 z-50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <Link href="/" className="flex items-center gap-1.5 group">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="size-5 flex items-center justify-center bg-primary rounded shadow-[0_0_10px_rgba(127,19,236,0.6)] border border-white/20"
            >
              <span className="material-symbols-outlined text-white text-xs">terminal</span>
            </motion.div>
            <div className="flex flex-col">
              <h2 className="text-white text-sm font-black tracking-tighter italic uppercase leading-none group-hover:text-primary transition-colors glitch-hover">DSAL <span className="text-primary group-hover:text-white transition-colors">IDE</span></h2>
              <span className="text-[7px] font-black text-text-secondary uppercase tracking-[0.4em] mt-0.5 opacity-60">v3.0.4</span>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-3 ml-3 h-full">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link 
                className="flex items-center gap-1 text-white text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:tracking-[0.3em] relative group bg-primary/10 px-1.5 py-0.5 rounded border border-primary/30 shadow-neon-sm" 
                href="/"
              >
                <span className="material-symbols-outlined text-xs text-primary">dashboard</span>
                Dashboard
              </Link>
            </motion.div>

            {/* Classic IDE Dropdown */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('classic')}
              onMouseLeave={() => {
                setActiveMenu(null);
                setActiveTopLevel(null);
                setActiveCategory(null);
                setActiveSubCategory(null);
              }}
            >
              <button className="flex items-center gap-1 text-text-secondary hover:text-white text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:tracking-[0.3em] relative group px-1 py-1.5">
                Classic IDE
                <span className="material-symbols-outlined text-xs">expand_more</span>
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${activeMenu === 'classic' ? 'w-full' : 'w-0'}`}></span>
              </button>
              <AnimatePresence>
                {activeMenu === 'classic' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute top-full left-0 mt-2 w-72 glass-panel rounded-2xl overflow-visible shadow-2xl border-2 border-white/10 py-4 bg-background-dark/95 backdrop-blur-2xl"
                  >
                    {CLASSIC_MENU.map((top, tIdx) => (
                      <div 
                        key={tIdx} 
                        className="relative"
                        onMouseEnter={() => setActiveTopLevel(tIdx)}
                        onMouseLeave={() => {
                          setActiveTopLevel(null);
                          setActiveCategory(null);
                          setActiveSubCategory(null);
                        }}
                      >
                        <div className={`flex items-center justify-between px-6 py-3 text-sm font-black uppercase tracking-widest cursor-pointer transition-colors border-l-4 ${activeTopLevel === tIdx ? 'bg-white/5 text-primary border-primary' : 'text-slate-300 border-transparent hover:bg-white/5'}`}>
                          {top.name}
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </div>

                        <AnimatePresence>
                          {activeTopLevel === tIdx && (
                            <motion.div 
                              initial={{ opacity: 0, x: menuDirection === 'right' ? 10 : -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: menuDirection === 'right' ? 10 : -10 }}
                              className={`absolute top-0 ${menuDirection === 'right' ? 'left-full ml-1' : 'right-full mr-1'} w-72 rounded-2xl overflow-visible shadow-2xl border border-white/10 py-4 bg-background-dark z-50`}
                            >
                              {top.categories ? (
                                top.categories.map((section, sIdx) => (
                                  <div 
                                    key={sIdx} 
                                    className="relative"
                                    onMouseEnter={() => setActiveCategory(sIdx)}
                                    onMouseLeave={() => {
                                      setActiveCategory(null);
                                      setActiveSubCategory(null);
                                    }}
                                  >
                                    <div className={`flex items-center justify-between px-6 py-3 text-sm font-black uppercase tracking-widest cursor-pointer transition-colors border-l-4 ${activeCategory === sIdx ? 'bg-white/5 text-primary border-primary' : 'text-slate-300 border-transparent hover:bg-white/5'}`}>
                                      {section.category.split(' ')[0]}
                                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </div>

                                    <AnimatePresence>
                                      {activeCategory === sIdx && (
                                        <motion.div 
                                          initial={{ opacity: 0, x: menuDirection === 'right' ? 10 : -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: menuDirection === 'right' ? 10 : -10 }}
                                          className={`absolute top-0 ${menuDirection === 'right' ? 'left-full ml-1' : 'right-full mr-1'} w-64 rounded-2xl overflow-visible shadow-2xl border border-white/10 py-4 bg-background-dark z-50`}
                                        >
                                          {section.subcategories ? (
                                            section.subcategories.map((sub, subIdx) => (
                                              <div 
                                                key={subIdx} 
                                                className="relative"
                                                onMouseEnter={() => setActiveSubCategory(subIdx)}
                                                onMouseLeave={() => setActiveSubCategory(null)}
                                              >
                                                <div className={`flex items-center justify-between px-6 py-3 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors border-l-4 ${activeSubCategory === subIdx ? 'bg-white/5 text-primary border-primary' : 'text-slate-300 border-transparent hover:bg-white/5'}`}>
                                                  {sub.name}
                                                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                                                </div>

                                                <AnimatePresence>
                                                  {activeSubCategory === subIdx && (
                                                    <motion.div 
                                                      initial={{ opacity: 0, x: -10 }}
                                                      animate={{ opacity: 1, x: 0 }}
                                                      exit={{ opacity: 0, x: -10 }}
                                                      className={`absolute top-0 ${menuDirection === 'right' ? 'left-full ml-1' : 'right-full mr-1'} w-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10 py-4 bg-background-dark z-50`}
                                                    >
                                                      {sub.items.map((item, iIdx) => (
                                                        <Link key={iIdx} href={item.href} className="block px-6 py-3 group hover:bg-white/5 border-l-4 border-transparent hover:border-primary transition-all">
                                                          <div className="text-sm font-bold text-slate-300 group-hover:text-primary transition-colors">{item.name}</div>
                                                          <div className="text-[10px] text-text-secondary group-hover:text-white/60 transition-colors uppercase tracking-tighter">{item.desc}</div>
                                                        </Link>
                                                      ))}
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>
                                              </div>
                                            ))
                                          ) : (
                                            section.items?.map((item, iIdx) => (
                                              <Link key={iIdx} href={item.href} className="block px-6 py-3 group hover:bg-white/5 border-l-4 border-transparent hover:border-primary transition-all">
                                                <div className="text-sm font-bold text-slate-300 group-hover:text-primary transition-colors">{item.name}</div>
                                                <div className="text-[10px] text-text-secondary group-hover:text-white/60 transition-colors uppercase tracking-tighter">{item.desc}</div>
                                              </Link>
                                            ))
                                          )}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))
                              ) : (
                                top.items?.map((item, iIdx) => (
                                  <Link key={iIdx} href={item.href} className="block px-6 py-3 group hover:bg-white/5 border-l-4 border-transparent hover:border-primary transition-all">
                                    <div className="text-sm font-bold text-slate-300 group-hover:text-primary transition-colors">{item.name}</div>
                                    <div className="text-[10px] text-text-secondary group-hover:text-white/60 transition-colors uppercase tracking-tighter">{item.desc}</div>
                                  </Link>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quantum IDE Dropdown */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('quantum')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button className="flex items-center gap-1 text-text-secondary hover:text-white text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:tracking-[0.3em] relative group px-1 py-1.5">
                Quantum IDE
                <span className="material-symbols-outlined text-xs">expand_more</span>
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all ${activeMenu === 'quantum' ? 'w-full' : 'w-0'}`}></span>
              </button>
              <AnimatePresence>
                {activeMenu === 'quantum' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute top-full left-0 mt-2 w-72 glass-panel rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 p-6 bg-background-dark/95 backdrop-blur-2xl space-y-4"
                  >
                    <h3 className="text-secondary font-black text-sm uppercase tracking-[0.2em] border-b border-secondary/20 pb-2">Quantum Lab</h3>
                    {QUANTUM_MENU.map((item, iIdx) => (
                      <Link key={iIdx} href={item.href} className="group block">
                        <div className="text-sm font-bold text-slate-300 group-hover:text-secondary transition-colors">{item.name}</div>
                        <div className="text-[10px] text-text-secondary group-hover:text-white/60 transition-colors uppercase tracking-tighter">{item.desc}</div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {['Library', 'Lecture', 'Analysis'].map((item, idx) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (idx + 1) * 0.1 }}
              >
                <Link 
                  className="text-text-secondary hover:text-white text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:tracking-[0.3em] relative group" 
                  href={`/${item.toLowerCase()}`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 relative z-10">
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative hidden xl:block group"
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-1.5 pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-xs">search</span>
            </div>
            <input 
              className="block w-40 rounded border border-border-dark bg-surface-darker py-0.5 pl-6 pr-1.5 text-white placeholder:text-text-secondary focus:ring-1 focus:ring-primary/50 focus:border-primary text-[9px] transition-all font-black uppercase tracking-widest" 
              placeholder="SEARCH..." 
              type="text"
            />
          </motion.div>
          
          {/* Panel Toggles */}
          <div className="flex items-center gap-0.5 bg-surface-darker p-0.5 rounded border border-border-dark mr-1">
            {bottomPanel && (
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }} 
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowBottomPanel(!showBottomPanel)}
                title="Toggle Terminal Panel"
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
                title="Toggle Side Panel"
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
              title="Settings"
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

          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="size-5 rounded bg-gradient-to-br from-primary to-secondary border border-white/20 flex items-center justify-center text-white font-black text-[9px] cursor-pointer shadow-sm shadow-primary/20"
          >
            VP
          </motion.div>
        </div>
      </motion.header>

      {/* Sub-header: Timeline & Breadcrumbs */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-none flex flex-col xl:flex-row items-start xl:items-center justify-between px-1.5 py-0.5 bg-background-dark border-b border-border-dark gap-1.5 z-40 relative"
      >
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 text-text-secondary text-[8px] font-black uppercase tracking-widest">
            <Link className="hover:text-white cursor-pointer transition-all hover:translate-x-0.5" href="/library">{category}</Link>
            <span className="material-symbols-outlined text-text-secondary text-[9px] opacity-30">chevron_right</span>
            <motion.span 
              layoutId="active-breadcrumb"
              className="text-white font-black bg-surface-darker px-1 py-0.5 rounded border border-border-dark text-[8px] tracking-[0.2em] uppercase shadow-inner italic relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {title}
            </motion.span>
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

        {showTimeline && (
          <div className="flex flex-1 max-w-lg mx-auto w-full items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-darker p-0.5 rounded border border-border-dark shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onPrev} 
                title="Previous Step"
                aria-label="Previous Step"
                className="p-0.5 rounded text-text-secondary hover:text-white transition-all disabled:opacity-10"
                disabled={currentStep === 1}
              >
                <span className="material-symbols-outlined text-sm">skip_previous</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(127,19,236,0.5)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onTogglePlayback} 
                title={isPlaying ? "Pause Simulation" : "Play Simulation"}
                aria-label={isPlaying ? "Pause Simulation" : "Play Simulation"}
                className="size-6 rounded bg-primary text-white hover:bg-primary/90 transition-all shadow-sm shadow-primary/30 flex items-center justify-center active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="material-symbols-outlined text-base relative z-10">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onNext} 
                title="Next Step"
                aria-label="Next Step"
                className="p-0.5 rounded text-text-secondary hover:text-white transition-all disabled:opacity-10"
                disabled={currentStep === totalSteps}
              >
                <span className="material-symbols-outlined text-sm">skip_next</span>
              </motion.button>
            </div>

            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-50">Step</span>
                  <span className="text-white font-black text-xs tracking-tighter italic uppercase leading-none">
                    {currentStep} <span className="text-text-secondary text-[10px] not-italic opacity-30">/ {totalSteps}</span>
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-50">Op</span>
                  <motion.span 
                    key={activeStep}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-primary font-black text-[10px] tracking-widest uppercase animate-pulse"
                  >
                    {activeStep || 'EXEC...'}
                  </motion.span>
                </div>
              </div>
              <div className="relative h-1 bg-surface-darker rounded-full overflow-hidden w-full border border-border-dark shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-accent-mint to-primary rounded-full shadow-[0_0_5px_rgba(127,19,236,0.4)]" 
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:4px_4px] animate-[shimmer_2s_linear_infinite]"></div>
                </motion.div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-darker p-0.5 rounded border border-border-dark shadow-sm">
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

        <div className="flex items-center gap-1.5">
          <motion.div 
            animate={{ 
              opacity: [0.5, 1, 0.5],
              boxShadow: ['0 0 3px rgba(127,19,236,0.1)', '0 0 8px rgba(127,19,236,0.3)', '0 0 3px rgba(127,19,236,0.1)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-1.5 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-0.5 shadow-neon-sm italic"
          >
            <span className="material-symbols-outlined text-[10px]">sensors</span>
            Live
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.9 }}
            title="Share"
            aria-label="Share"
            className="size-6 rounded bg-surface-darker border border-border-dark flex items-center justify-center text-text-secondary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xs">share</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative pb-16 md:pb-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(127,19,236,0.03),transparent_70%)] pointer-events-none"></div>
        
        {children ? children : (
          <main className="flex-1 flex overflow-hidden w-full">
            {/* Mobile View */}
            <div className="md:hidden flex-1 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                {mobileActiveTab === 'code' && leftPanel && (
                  <motion.div 
                    key="mobile-code"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <IDEPane {...leftPanel} className="border-none">
                      {leftPanel.content}
                    </IDEPane>
                  </motion.div>
                )}
                {mobileActiveTab === 'visualizer' && centerPanel && (
                  <motion.div 
                    key="mobile-visualizer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <IDEPane {...centerPanel} className="border-none">
                      {centerPanel.content}
                    </IDEPane>
                  </motion.div>
                )}
                {mobileActiveTab === 'stats' && (
                  <motion.div 
                    key="mobile-stats"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col overflow-hidden p-2 gap-2"
                  >
                    {rightPanelTop && (
                      <div className="flex-1 min-h-0">
                        <IDEPane {...rightPanelTop}>
                          {rightPanelTop.content}
                        </IDEPane>
                      </div>
                    )}
                    {rightPanelBottom && (
                      <div className="flex-1 min-h-0">
                        <IDEPane {...rightPanelBottom}>
                          {rightPanelBottom.content}
                        </IDEPane>
                      </div>
                    )}
                    {bottomPanel && (
                      <div className="h-40 shrink-0">
                        <IDEPane {...bottomPanel}>
                          {bottomPanel.content}
                        </IDEPane>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop View */}
            <PanelGroup direction="horizontal" className="hidden md:flex w-full h-full">
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

