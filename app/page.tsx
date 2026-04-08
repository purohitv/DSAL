'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { CLASSIC_MENU, QUANTUM_MENU } from '@/lib/menu';

import { AuthButton } from "@/components/AuthButton";

export default function Home() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [activeTopLevel, setActiveTopLevel] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [activeSubCategory, setActiveSubCategory] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMouseEnter = (menu: string) => {
        setActiveDropdown(menu);
    };

    const handleMouseLeave = () => {
        setActiveDropdown(null);
        setActiveTopLevel(null);
        setActiveCategory(null);
        setActiveSubCategory(null);
    };

    return (
        <main className="min-h-[1080px] bg-background-light dark:bg-background-dark text-slate-900 dark:text-white selection:bg-primary selection:text-white overflow-x-hidden">
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern grid-bg"></div>
                <div className="absolute inset-0 bg-radial-glow"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-[1080px]">
                <header className="absolute top-0 left-0 right-0 z-50 px-4 py-2">
                    <nav className="glass-panel !bg-panel-dark/95 rounded-full max-w-7xl mx-auto px-5 h-14 flex items-center justify-between shadow-lg shadow-primary/10 relative">
                        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <img src="/logo.png" alt="DSAL Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white group-hover:text-primary transition-colors italic uppercase">DSAL</span>
                        </Link>
                        
                        <div className="hidden md:flex items-center gap-4 h-full">
                            
                            {/* Classic Dropdown */}
                            <div 
                                className="relative h-full flex items-center"
                                onMouseEnter={() => handleMouseEnter('classic')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-black text-slate-300 hover:text-white transition-all hover:bg-white/10 rounded-full uppercase tracking-widest">
                                    Classic IDE <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                </button>
                                <AnimatePresence>
                                    {activeDropdown === 'classic' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 15 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 mt-2 w-72 glass-panel rounded-2xl overflow-visible shadow-2xl border-2 border-white/10 py-4 bg-panel-dark/95 backdrop-blur-2xl"
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
                                                                initial={{ opacity: 0, x: 10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 10 }}
                                                                className="absolute top-0 left-full w-72 rounded-2xl overflow-visible shadow-2xl border border-white/10 py-4 bg-panel-dark z-50"
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
                                                                                        initial={{ opacity: 0, x: 10 }}
                                                                                        animate={{ opacity: 1, x: 0 }}
                                                                                        exit={{ opacity: 0, x: 10 }}
                                                                                        className="absolute top-0 left-full w-64 rounded-2xl overflow-visible shadow-2xl border border-white/10 py-4 bg-panel-dark z-50"
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
                                                                                                                className="absolute top-0 right-full w-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10 py-4 bg-panel-dark z-50"
                                                                                                            >
                                                                                                                {sub.items.map((item, iIdx) => (
                                                                                                                    <Link key={iIdx} href={item.href} className="block px-6 py-3 group hover:bg-white/5 border-l-4 border-transparent hover:border-primary transition-all">
                                                                                                                        <div className="text-sm font-bold text-slate-300 group-hover:text-primary transition-colors">{item.name}</div>
                                                                                                                        <div className="text-[10px] text-slate-500 group-hover:text-white/60 transition-colors uppercase tracking-tighter">{item.desc}</div>
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
                                                                                                    <div className="text-[10px] text-slate-500 group-hover:text-white/60 transition-colors uppercase tracking-tighter">{item.desc}</div>
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
                                                                            <div className="text-[10px] text-slate-500 group-hover:text-white/60 transition-colors uppercase tracking-tighter">{item.desc}</div>
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

                            {/* Quantum Dropdown */}
                            <div 
                                className="relative h-full flex items-center"
                                onMouseEnter={() => handleMouseEnter('quantum')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-black text-slate-300 hover:text-white transition-all hover:bg-white/10 rounded-full uppercase tracking-widest">
                                    Quantum IDE <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                </button>
                                <AnimatePresence>
                                    {activeDropdown === 'quantum' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 15 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 mt-2 w-72 glass-panel rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 p-6 bg-panel-dark/95 backdrop-blur-2xl space-y-4"
                                        >
                                            <div className="space-y-6">
                                                {QUANTUM_MENU.map((category, cIdx) => (
                                                    <div key={cIdx} className="space-y-3">
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/60">{category.name}</h4>
                                                        <div className="space-y-2">
                                                            {category.items.map((item, iIdx) => (
                                                                <Link key={iIdx} href={item.href} className="group block">
                                                                    <div className="text-sm font-bold text-slate-300 group-hover:text-accent transition-colors">{item.name}</div>
                                                                    <div className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-tighter">{item.desc}</div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Modules Dropdown */}
                            <div 
                                className="relative h-full flex items-center"
                                onMouseEnter={() => handleMouseEnter('modules')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-black text-slate-300 hover:text-white transition-all hover:bg-white/10 rounded-full uppercase tracking-widest">
                                    Modules <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                </button>
                                <AnimatePresence>
                                    {activeDropdown === 'modules' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 15 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 mt-2 w-64 glass-panel rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 py-3 bg-panel-dark/95 backdrop-blur-2xl"
                                        >
                                            <Link href="/library" className="block px-6 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-primary">Algorithm Library</Link>
                                            <Link href="/lecture" className="block px-6 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-primary">Lecture Mode</Link>
                                            <Link href="/analysis" className="block px-6 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-primary">Complexity Analysis</Link>
                                            <Link href="/learning-path" className="block px-6 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-primary">Learning Path</Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <AuthButton />
                            <Link href="/library">
                                <button className="bg-primary hover:bg-primary/90 text-white text-sm font-black px-8 py-3 rounded-full transition-all hover:shadow-[0_0_30px_rgba(127,19,236,0.8)] uppercase tracking-widest">
                                    Launch App
                                </button>
                            </Link>
                        </div>
                    </nav>
                </header>

                <section className="relative min-h-full flex items-center justify-center pt-16 perspective-container overflow-hidden">
                    <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center relative z-10">
                        <div className="flex flex-col gap-4 z-10">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 w-fit backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">System Online v3.0</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">
                                Architects of <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent neon-text">Algorithm Mastery</span>
                            </h1>
                            <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
                                Merge intuition with computation. Explore the infinite landscape of data structures in a real-time, unified 3D laboratory.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 group">
                                <Link href="/ide/classic/bst-insertion">
                                    <button className="relative overflow-hidden bg-white text-black px-5 py-2.5 rounded-lg font-bold text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Start BST Lesson
                                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative h-[500px] w-full flex items-center justify-center perspective-container">
                            <div className="relative w-[400px] h-[400px] flex items-center justify-center animate-float">
                                <div className="absolute w-80 h-80 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl animate-pulse-slow"></div>
                                <div className="relative w-64 h-64 rounded-full border border-white/10 bg-black/20 backdrop-blur-sm animate-morph shadow-[0_0_50px_rgba(127,19,236,0.3)] overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-40 mix-blend-overlay animate-spin-slow" style={{ backgroundSize: "200%" }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-accent/40 mix-blend-color-dodge"></div>
                                </div>
                                <div className="absolute top-0 right-8 p-2 glass-panel rounded-lg flex items-center gap-2 animate-float" style={{ animationDelay: "1s" }}>
                                    <div className="h-7 w-7 rounded bg-primary/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-[12px]">memory</span>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-400 font-mono">HEAP_ALLOC</div>
                                        <div className="text-[10px] text-white font-bold">1024 MB</div>
                                    </div>
                                </div>
                                <div className="absolute bottom-8 left-0 p-2 glass-panel rounded-lg flex items-center gap-2 animate-float" style={{ animationDelay: "2.5s" }}>
                                    <div className="h-7 w-7 rounded bg-accent/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-accent text-[12px]">schema</span>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-slate-400 font-mono">NODES</div>
                                        <div className="text-[10px] text-white font-bold">5,402 Active</div>
                                    </div>
                                </div>
                                <div className="absolute w-[120%] h-[120%] border border-primary/20 rounded-full animate-spin-slow [animation-duration:20s]">
                                    <div className="absolute top-1/2 -right-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(127,19,236,1)]"></div>
                                </div>
                                <div className="absolute w-[140%] h-[140%] border border-accent/10 rounded-full animate-spin-slow [animation-duration:30s] [animation-direction:reverse]">
                                    <div className="absolute top-1/2 -left-1 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_rgba(217,19,236,1)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 relative z-10">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">Core Modules</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">Essential tools for the modern algorithm architect.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                            <div className="col-span-1 md:col-span-2 glass-panel rounded-2xl p-8 relative overflow-hidden group hover:border-primary/50 transition-colors">
                                <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-6xl text-primary">history</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 relative z-10">Timeline Engine</h3>
                                <p className="text-slate-400 max-w-sm mb-6 relative z-10">Scrub through execution history with frame-perfect precision. Debug complex logic by rewinding time.</p>
                                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end px-8 pb-8 gap-1">
                                    <div className="w-2 bg-primary/40 h-[40%] rounded-t-sm group-hover:h-[60%] transition-all duration-500"></div>
                                    <div className="w-2 bg-primary/60 h-[70%] rounded-t-sm group-hover:h-[40%] transition-all duration-500 delay-75"></div>
                                    <div className="w-2 bg-primary/80 h-[50%] rounded-t-sm group-hover:h-[80%] transition-all duration-500 delay-100"></div>
                                    <div className="w-2 bg-accent/80 h-[90%] rounded-t-sm group-hover:h-[50%] transition-all duration-500 delay-150"></div>
                                    <div className="w-2 bg-accent/60 h-[60%] rounded-t-sm group-hover:h-[70%] transition-all duration-500 delay-200"></div>
                                    <div className="w-2 bg-accent/40 h-[30%] rounded-t-sm group-hover:h-[90%] transition-all duration-500 delay-300"></div>
                                    <div className="flex-grow"></div>
                                    <div className="text-xs font-mono text-primary animate-pulse">RECORDING...</div>
                                </div>
                            </div>
                            <div className="col-span-1 glass-panel rounded-2xl p-8 relative overflow-hidden group hover:border-lecture-primary/50 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-br from-lecture-primary/5 to-transparent"></div>
                                <div className="w-12 h-12 rounded-lg bg-lecture-primary/20 flex items-center justify-center mb-4 text-lecture-primary">
                                    <span className="material-symbols-outlined">presentation_chart</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Lecture Mode</h3>
                                <p className="text-slate-400 text-sm">Interactive data structures and algorithms lectures with video and code integration.</p>
                                <div className="mt-8 flex items-center gap-2">
                                    <Link href="/lecture" className="text-xs font-bold text-lecture-primary hover:text-white transition-colors uppercase tracking-widest">Start Learning</Link>
                                </div>
                            </div>
                            <div className="col-span-1 glass-panel rounded-2xl p-8 relative overflow-hidden group hover:border-accent/50 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent"></div>
                                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 text-accent">
                                    <span className="material-symbols-outlined">analytics</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Complexity Lab</h3>
                                <p className="text-slate-400 text-sm">AI-powered Big O analysis. Paste your code and get instant time/space complexity metrics.</p>
                                <div className="mt-8 flex items-center gap-2">
                                    <Link href="/analysis" className="text-xs font-bold text-accent hover:text-white transition-colors uppercase tracking-widest">Analyze Code</Link>
                                </div>
                            </div>
                            <div className="col-span-1 glass-panel rounded-2xl p-8 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
                                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                                    <span className="material-symbols-outlined">library_books</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Algorithm Library</h3>
                                <p className="text-slate-400 text-sm">Access 500+ optimized implementations. Copy, paste, and deploy.</p>
                                <div className="absolute bottom-6 right-6">
                                    <button className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 text-xs font-bold px-3 py-1 rounded transition-colors">BROWSE</button>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
                                <div className="font-mono text-xs text-slate-500 mb-2">root@dsal-core:~$ ./optimize_path.sh</div>
                                <div className="font-mono text-sm text-green-400 mb-1">&gt; Analyzing graph topology...</div>
                                <div className="font-mono text-sm text-green-400 mb-1">&gt; Reducing complexity O(n^2) -&gt; O(n log n)</div>
                                <div className="font-mono text-sm text-white blink">&gt; Done.</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div>
                                <h2 className="text-sm font-bold text-accent uppercase tracking-widest mb-1">Snapshots of Logic</h2>
                                <h3 className="text-3xl md:text-4xl font-bold text-white">Algorithmic Mastery</h3>
                            </div>
                            <p className="text-slate-400 max-w-md text-right md:text-left">
                                Witness the beauty of efficiency. Interactive 3D visualizations of complex data structures and quantum algorithms.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-container">
                            <div className="group card-3d relative bg-surface-dark border border-slate-800 rounded-2xl overflow-hidden h-[450px]">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10"></div>
                                <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" data-alt="Abstract nodes connected in a tree structure glowing neon green" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAyFPKB-dalWqimdbwKNEr0F6m-5AmC5EfL2CXl4T3EuEZ6AVysQBGCvnCETh9u8PSvXdm84xGQ4_RWbjm-7CfK50QACyMvaGeGqZTH1aa1KkHhu9CF_Z8EsoTiBGOmz6ahGJhKxJ-HBuZGrNEndw6D0oEAeY-P9eA-hBijiG742Nj5V6iG5wjYjTAecLVT5knn9cq_LoosNmgB__qH-0uTIgh2v3I3nMMUKP7BJ6CAM_SLcWjKKT9dYEeyCDhuPCsD-Vspme5xASfZ')" }}></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col gap-2">
                                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-2">
                                        <span className="material-symbols-outlined">account_tree</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Self-Balancing Trees</h4>
                                    <p className="text-slate-400 text-sm">Real-time visualization of AVL Tree rotations and rebalancing under heavy load.</p>
                                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                                        <button className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            Simulate <span className="material-symbols-outlined text-sm">play_arrow</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="group card-3d relative bg-surface-dark border border-slate-800 rounded-2xl overflow-hidden h-[450px]">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10"></div>
                                <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" data-alt="Quantum computing interference patterns in purple and blue" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHxXh_CG1HyQw7qtEYXI0P6FcFkdtPnDYBFA12x26VzytU9FxHfW1xcfqScTSQQrBxMsM3HECyzd3DfXxrEi_UJXF_L2IdoXuFY0QOdKq2ce2J0Cvo9w7Cc7hJYf9bqpAPqEKNZlO8rESRuxa2gANamkFkEblILP3HZzACOosAdDDKH0u0DAbbH4BIyT8I2d55ArOPmUvXc77oLtCiR7dDHuv8UBThm9G3l0CdWzylBPEGIZbGg5QCAzzkCNiLREEWOlAAdnmW18g0')" }}></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col gap-2">
                                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent mb-2">
                                        <span className="material-symbols-outlined">waves</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white group-hover:text-accent transition-colors">Quantum Search</h4>
                                    <p className="text-slate-400 text-sm">Explore probability waves and amplitude amplification in Grover's Algorithm.</p>
                                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                                        <button className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            Simulate <span className="material-symbols-outlined text-sm">play_arrow</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="group card-3d relative bg-surface-dark border border-slate-800 rounded-2xl overflow-hidden h-[450px]">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10"></div>
                                <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" data-alt="Complex network of lines representing a pathfinding graph" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLqu89sfyQRTsa-Jha_FbqFvh2g8jVIXRTUmlncTGh9NjVhs5EW-zvXBV4FcMg09JOUsF5DIi1zqfqWNbZ07oFsQhols7vwDi34JXLxt08ceW3XR1dao6zXMWkWsCPreou-J2ikhH7PCROTHByVKHf5D3Z2JvhE-RKrIm4eyFqjs5cWG2sjehr7MFm7H2oleL6StRQIB9lcmhwe5-GI_A3rrPboFX-qh_aT2JTYaReaZl5mxhhTS8y0LmiFloq_p3netbaZOk00-Uw')" }}></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col gap-2">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                                        <span className="material-symbols-outlined">route</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">Pathfinding AI</h4>
                                    <p className="text-slate-400 text-sm">Watch Breadth-First Search ripple through complex graphs in search of the optimal path.</p>
                                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                                        <button className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            Simulate <span className="material-symbols-outlined text-sm">play_arrow</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-background-dark relative border-y border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">Live Simulation: <span className="text-primary">Dijkstra's Algorithm</span></h2>
                            <div className="flex items-center gap-3 bg-surface-dark px-4 py-2 rounded-full border border-white/10 mt-4 md:mt-0">
                                <button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">skip_previous</span></button>
                                <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/80"><span className="material-symbols-outlined">play_arrow</span></button>
                                <button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">skip_next</span></button>
                                <div className="w-24 h-1 bg-slate-700 rounded-full ml-2 relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-primary rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-surface-dark h-[600px]">
                            <div className="col-span-1 border-r border-white/10 bg-[#0d0b10] flex flex-col">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                                    <span className="text-xs font-mono text-slate-400">dijkstra.cpp</span>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                    </div>
                                </div>
                                <div className="p-4 overflow-y-auto custom-scrollbar flex-1 font-mono text-xs leading-relaxed text-slate-300">
                                    <pre><code><span className="text-primary">void</span> dijkstra(<span className="text-accent">int</span> startNode) {"{"}
                                        priority_queue&lt;pii, vector&lt;pii&gt;, greater&lt;pii&gt;&gt; pq;
                                        vector&lt;<span className="text-accent">int</span>&gt; dist(N, INF);
                                        pq.push({"{"}0, startNode{"}"});
                                        dist[startNode] = 0;
                                        <span className="text-primary">while</span> (!pq.empty()) {"{"}
                                        <span className="text-accent">int</span> u = pq.top().second;
                                        pq.pop();
                                        <span className="text-slate-500">// Visualizer Step: Highlight Node U</span>
                                        <span className="text-yellow-400">highlightNode(u);</span>
                                        <span className="text-primary">for</span> (<span className="text-primary">auto</span>&amp; edge : adj[u]) {"{"}
                                        <span className="text-accent">int</span> v = edge.first;
                                        <span className="text-accent">int</span> weight = edge.second;
                                        <span className="text-primary">if</span> (dist[u] + weight &lt; dist[v]) {"{"}
                                        dist[v] = dist[u] + weight;
                                        pq.push({"{"}dist[v], v{"}"});
                                        <span className="text-slate-500">// Update path color</span>
                                        <span className="text-green-400">updateEdge(u, v, ACTIVE);</span>
                                        {"}"}
                                        {"}"}
                                        {"}"}
                                        {"}"}</code></pre>
                                </div>
                            </div>
                            <div className="col-span-1 lg:col-span-2 relative bg-black">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full p-10">
                                    <div className="absolute top-[30%] left-[20%] w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(127,19,236,0.8)] z-10 animate-bounce">A</div>
                                    <div className="absolute top-[50%] left-[50%] w-10 h-10 rounded-full bg-surface-dark border-2 border-slate-600 flex items-center justify-center text-slate-400">B</div>
                                    <div className="absolute top-[20%] right-[30%] w-10 h-10 rounded-full bg-surface-dark border-2 border-slate-600 flex items-center justify-center text-slate-400">C</div>
                                    <div className="absolute bottom-[30%] right-[20%] w-10 h-10 rounded-full bg-surface-dark border-2 border-green-500 flex items-center justify-center text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]">D</div>
                                    <div className="absolute bottom-[20%] left-[30%] w-10 h-10 rounded-full bg-surface-dark border-2 border-slate-600 flex items-center justify-center text-slate-400">E</div>
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        <line stroke="#7f13ec" strokeWidth="2" x1="20%" x2="50%" y1="30%" y2="50%"></line>
                                        <line stroke="#334155" strokeDasharray="4" strokeWidth="1" x1="50%" x2="80%" y1="50%" y2="70%"></line>
                                        <line stroke="#334155" strokeWidth="1" x1="20%" x2="30%" y1="30%" y2="80%"></line>
                                    </svg>
                                </div>
                                <div className="absolute bottom-6 right-6 glass-panel px-4 py-2 rounded text-xs font-mono">
                                    <div className="flex justify-between w-40 mb-1">
                                        <span className="text-slate-400">Visited:</span>
                                        <span className="text-white">14/25</span>
                                    </div>
                                    <div className="flex justify-between w-40">
                                        <span className="text-slate-400">Current Cost:</span>
                                        <span className="text-primary font-bold">42</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 relative bg-surface-dark/50 backdrop-blur-sm border-b border-white/5">
                    <div className="container mx-auto px-4 text-center">
                        <div className="mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">Extend Your Workbench</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">Customize your laboratory with community-built skins, themes, and logic modules.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="glass-panel p-6 rounded-xl w-72 text-left hover:border-primary/50 transition-colors group cursor-pointer transform hover:-translate-y-2 duration-300">
                                <div className="h-40 rounded-lg bg-gradient-to-br from-purple-900 to-black mb-4 relative overflow-hidden border border-white/5">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-purple-400 group-hover:scale-125 transition-transform duration-500">terminal</span>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white uppercase">Skin</div>
                                </div>
                                <h4 className="font-bold text-white mb-1 text-lg">Cyberpunk Skin</h4>
                                <p className="text-xs text-slate-400 mb-4 line-clamp-2">Neon aesthetics for your code editor and graph visualizers. Includes custom font.</p>
                                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-700"></div>
                                        <span className="text-xs text-slate-300">NeonDev</span>
                                    </div>
                                    <span className="text-sm font-bold text-primary">FREE</span>
                                </div>
                            </div>
                            <div className="glass-panel p-6 rounded-xl w-72 text-left hover:border-accent/50 transition-colors group cursor-pointer transform hover:-translate-y-2 duration-300">
                                <div className="h-40 rounded-lg bg-gradient-to-br from-pink-900 to-black mb-4 relative overflow-hidden border border-white/5">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-pink-400 group-hover:scale-125 transition-transform duration-500">joystick</span>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white uppercase">Theme</div>
                                </div>
                                <h4 className="font-bold text-white mb-1 text-lg">Retro Arcade</h4>
                                <p className="text-xs text-slate-400 mb-4 line-clamp-2">8-bit sounds and pixel art nodes for a nostalgic debugging experience.</p>
                                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-700"></div>
                                        <span className="text-xs text-slate-300">PixelArtisan</span>
                                    </div>
                                    <span className="text-sm font-bold text-accent">$4.99</span>
                                </div>
                            </div>
                            <div className="glass-panel p-6 rounded-xl w-72 text-left hover:border-blue-500/50 transition-colors group cursor-pointer transform hover:-translate-y-2 duration-300">
                                <div className="h-40 rounded-lg bg-gradient-to-br from-blue-900 to-black mb-4 relative overflow-hidden border border-white/5">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-blue-400 group-hover:scale-125 transition-transform duration-500">extension</span>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white uppercase">Pack</div>
                                </div>
                                <h4 className="font-bold text-white mb-1 text-lg">Logic Plus Pack</h4>
                                <p className="text-xs text-slate-400 mb-4 line-clamp-2">Advanced graph algorithms including A* and Max-Flow Min-Cut visualizations.</p>
                                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-primary"></div>
                                        <span className="text-xs text-slate-300">DSAL Official</span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-400">PRO</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12">
                            <button className="text-white border border-white/20 hover:bg-white/10 px-8 py-3 rounded-full text-sm font-bold transition-colors flex items-center gap-2 mx-auto">
                                Explore Marketplace <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="py-32 relative flex justify-center items-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                    </div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 tracking-tighter mb-8 leading-[0.85]">
                            READY TO<br />COMPILE?
                        </h2>
                        <Link href="/dashboard">
                            <button className="bg-primary hover:bg-primary/90 text-white text-lg font-bold px-10 py-4 rounded-full shadow-[0_0_40px_rgba(127,19,236,0.5)] hover:shadow-[0_0_80px_rgba(127,19,236,0.8)] transition-all transform hover:-translate-y-1 animate-pulse">
                                Initialize System
                            </button>
                        </Link>
                    </div>
                </section>

                <footer className="mt-auto border-t border-white/5 bg-background-dark/80 backdrop-blur-md">
                    {/* Live System Ticker */}
                    <div className="bg-primary/5 border-b border-white/5 py-2 overflow-hidden whitespace-nowrap">
                        <motion.div 
                            animate={{ x: [0, -1000] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="inline-block"
                        >
                            <div className="flex gap-12 items-center">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 text-[10px] font-mono">
                                        <span className="text-primary font-black">SYSTEM_LOG_{1024 + i}</span>
                                        <span className="text-slate-500">STATUS:</span>
                                        <span className="text-green-400">OPTIMIZED</span>
                                        <span className="text-slate-500">LATENCY:</span>
                                        <span className="text-white">{mounted ? (Math.random() * 10 + 15).toFixed(2) : "18.15"}ms</span>
                                        <span className="text-slate-500">MEMORY:</span>
                                        <span className="text-accent">{mounted ? (Math.random() * 100 + 400).toFixed(0) : "450"}MB</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="container mx-auto px-6 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                            <div className="col-span-1 md:col-span-2 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-3xl">hub</span>
                                    <span className="text-2xl font-black tracking-tighter">DSAL LABORATORY</span>
                                </div>
                                <p className="text-slate-400 text-sm max-w-md leading-relaxed italic">
                                    "The intersection of theoretical computer science and high-fidelity visualization. Built for researchers, students, and architects of the digital age."
                                </p>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-sm">terminal</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-sm">code</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-sm">share</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Quick Access</h4>
                                <nav className="flex flex-col gap-2">
                                    <Link href="/library" className="text-sm text-slate-400 hover:text-white transition-colors">Algorithm Registry</Link>
                                    <Link href="/lecture" className="text-sm text-slate-400 hover:text-white transition-colors">Lecture Mode</Link>
                                    <Link href="/analysis" className="text-sm text-slate-400 hover:text-white transition-colors">Complexity Lab</Link>
                                    <Link href="/quantum" className="text-sm text-slate-400 hover:text-white transition-colors">Quantum Simulator</Link>
                                </nav>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-accent uppercase tracking-[0.3em]">Legal & Docs</h4>
                                <nav className="flex flex-col gap-2">
                                    <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">API Reference</Link>
                                    <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Protocol</Link>
                                    <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
                                    <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Security Audit</Link>
                                </nav>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">DSAL © 2026 // RESEARCH_GRADE_PLATFORM</span>
                            </div>
                            
                            <div className="flex items-center gap-6 bg-black/40 px-4 py-2 rounded-lg border border-white/5 shadow-inner">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase">Core Status</span>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-xs font-mono text-green-400">OPERATIONAL</span>
                                    </div>
                                </div>
                                <div className="hidden sm:flex flex-col items-end border-l border-white/10 pl-4">
                                    <span className="text-[10px] font-mono text-slate-500">ENVIRONMENT</span>
                                    <span className="text-xs font-mono text-white">PRODUCTION_V3</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </main>
    );
}
