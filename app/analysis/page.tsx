'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function ComplexityAnalysisDashboard() {
  const [code, setCode] = useState(`function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Mock analysis delay
    setTimeout(() => {
      setResults({
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        cyclomaticComplexity: 4,
        halstead: {
          difficulty: 12.5,
          effort: 1500,
          bugs: 0.05
        },
        bottlenecks: [
          { line: 4, issue: 'Nested loop causes quadratic time complexity.' },
          { line: 5, issue: 'Frequent array access and swapping.' }
        ]
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-16 py-10 bg-background-dark/80 backdrop-blur-xl border-b border-border-dark shrink-0 z-30"
      >
        <div className="flex items-center gap-10">
          <Link href="/" className="text-text-secondary hover:text-white transition-colors group">
            <motion.div 
              whileHover={{ x: -4 }}
              className="flex items-center gap-4"
            >
              <span className="material-symbols-outlined text-4xl">arrow_back</span>
              <span className="text-base font-black uppercase tracking-widest hidden sm:inline">Back</span>
            </motion.div>
          </Link>
          <div className="h-12 w-px bg-border-dark mx-4"></div>
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="bg-gradient-to-br from-primary to-secondary p-5 rounded-xl shadow-lg"
            >
              <span className="material-symbols-outlined text-white text-4xl">speed</span>
            </motion.div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Complexity Lab</h1>
              <p className="text-base text-text-secondary font-mono uppercase tracking-widest mt-2">System Analysis Engine v4.2</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary-dark text-surface-darker font-black text-lg uppercase tracking-widest py-6 px-16 rounded-xl flex items-center gap-6 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 border-b-4 border-r-4 border-black/20"
          >
            {isAnalyzing ? (
              <span className="material-symbols-outlined animate-spin text-[32px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[32px]">analytics</span>
            )}
            {isAnalyzing ? 'Processing...' : 'Run Analysis'}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-1/2 flex flex-col border-r border-border-dark bg-surface-darker/50"
        >
          <div className="px-12 py-6 bg-surface-darker border-b border-border-dark flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="w-6 h-6 rounded-full bg-red-500/50"></span>
              <span className="w-6 h-6 rounded-full bg-yellow-500/50"></span>
              <span className="w-6 h-6 rounded-full bg-green-500/50"></span>
              <span className="text-base font-mono text-text-secondary uppercase tracking-widest ml-6">algorithm.js</span>
            </div>
            <span className="text-base bg-surface-dark px-6 py-3 rounded-lg text-primary font-black uppercase tracking-widest border border-primary/20">JavaScript</span>
          </div>
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-gray-300 font-mono text-2xl p-16 focus:outline-none resize-none leading-relaxed selection:bg-primary/30"
              spellCheck={false}
            />
          </div>
        </motion.div>

        {/* Right: Analysis Results */}
        <div className="w-1/2 flex flex-col bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-surface-dark to-background-dark overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div 
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="p-12 space-y-12"
              >
                {/* Big O Notation */}
                <div className="grid grid-cols-2 gap-16">
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="bg-surface-darker border-b-8 border-r-8 border-black/40 border border-border-dark rounded-[3rem] p-20 relative overflow-hidden group hover:border-primary/50 transition-all shadow-2xl"
                  >
                    <div className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12">
                      <span className="material-symbols-outlined text-[300px] text-primary">schedule</span>
                    </div>
                    <div className="flex items-center justify-between mb-12">
                      <h3 className="text-base font-black text-text-secondary uppercase tracking-[0.3em]">Time Complexity</h3>
                      <span className="px-6 py-3 bg-primary/10 text-primary text-sm font-black uppercase tracking-widest rounded-lg border border-primary/20 shadow-lg">Runtime Audit</span>
                    </div>
                    <div className="text-[10rem] font-black text-primary font-mono tracking-tighter italic drop-shadow-[0_10px_20px_rgba(127,19,236,0.3)]">{results.timeComplexity}</div>
                    <p className="text-2xl text-text-secondary mt-14 font-medium leading-relaxed opacity-80 italic">Quadratic time. Performance degrades significantly as input size grows. Optimization recommended.</p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="bg-surface-darker border-b-8 border-r-8 border-black/40 border border-border-dark rounded-[3rem] p-20 relative overflow-hidden group hover:border-secondary/50 transition-all shadow-2xl"
                  >
                    <div className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12">
                      <span className="material-symbols-outlined text-[300px] text-secondary">memory</span>
                    </div>
                    <div className="flex items-center justify-between mb-12">
                      <h3 className="text-base font-black text-text-secondary uppercase tracking-[0.3em]">Space Complexity</h3>
                      <span className="px-6 py-3 bg-secondary/10 text-secondary text-sm font-black uppercase tracking-widest rounded-lg border border-secondary/20 shadow-lg">Memory Audit</span>
                    </div>
                    <div className="text-[10rem] font-black text-secondary font-mono tracking-tighter italic drop-shadow-[0_10px_20px_rgba(217,19,236,0.3)]">{results.spaceComplexity}</div>
                    <p className="text-2xl text-text-secondary mt-14 font-medium leading-relaxed opacity-80 italic">Constant space. Operates directly on the input array. Memory footprint is minimal.</p>
                  </motion.div>
                </div>

                {/* Advanced Metrics */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-black text-white mb-16 flex items-center gap-8 uppercase tracking-[0.4em]">
                    <span className="w-5 h-5 rounded-full bg-accent-mint shadow-[0_0_10px_rgba(0,255,170,0.5)]"></span>
                    Advanced Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-12">
                    {[
                      { label: 'Cyclomatic', val: results.cyclomaticComplexity, color: 'text-white', icon: 'account_tree' },
                      { label: 'Halstead Diff', val: results.halstead.difficulty, color: 'text-white', icon: 'analytics' },
                      { label: 'Est. Bugs', val: results.halstead.bugs, color: 'text-accent-mint', icon: 'bug_report' },
                    ].map((m, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -5, scale: 1.05 }}
                        className="bg-surface-darker/50 border-b-4 border-r-4 border-black/20 border border-border-dark rounded-[2.5rem] p-16 hover:bg-surface-dark transition-all shadow-xl group"
                      >
                        <div className="flex items-center justify-between mb-10">
                          <div className="text-base text-text-secondary font-black uppercase tracking-widest">{m.label}</div>
                          <span className={`material-symbols-outlined text-[32px] ${m.color} opacity-30 group-hover:opacity-100 transition-opacity`}>{m.icon}</span>
                        </div>
                        <div className={`text-7xl font-black ${m.color} tracking-tighter italic`}>{m.val}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Bottlenecks */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-black text-white mb-16 flex items-center gap-8 uppercase tracking-[0.4em]">
                    <span className="w-5 h-5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                    System Bottlenecks
                  </h3>
                  <div className="space-y-12">
                    {results.bottlenecks.map((b: any, i: number) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ x: 15, scale: 1.01 }}
                        className="flex gap-16 bg-surface-darker/50 border-b-4 border-r-4 border-black/20 border border-red-500/20 rounded-[3rem] p-16 group hover:bg-red-500/5 transition-all shadow-xl"
                      >
                        <div className="w-32 h-32 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 shadow-inner group-hover:scale-110 transition-transform">
                          <span className="text-red-400 font-mono font-black text-4xl">L{b.line}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-6">
                            <span className="text-base font-black text-red-400/50 uppercase tracking-[0.2em]">Criticality: High</span>
                            <span className="material-symbols-outlined text-red-500/30 group-hover:text-red-500 transition-all group-hover:rotate-12 text-4xl">warning</span>
                          </div>
                          <p className="text-gray-300 text-3xl font-medium leading-relaxed italic">"{b.issue}"</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex-1 flex flex-col items-center justify-center text-text-secondary p-10 text-center"
              >
                <div className="w-32 h-32 rounded-3xl bg-surface-darker border-2 border-dashed border-border-dark flex items-center justify-center mb-8 relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-3xl group-hover:scale-110 transition-transform"></div>
                  <span className="material-symbols-outlined text-5xl opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all">analytics</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">Analysis Engine Standby</h2>
                <p className="max-w-md text-sm font-medium leading-relaxed opacity-60">
                  Inject your algorithm logic into the terminal on the left. The engine will perform a deep-trace complexity audit.
                </p>
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-10"
                >
                  <span className="material-symbols-outlined text-primary/50">keyboard_double_arrow_left</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="px-16 py-8 bg-surface-darker border-t border-border-dark flex items-center justify-between text-base font-black uppercase tracking-[0.2em] text-text-secondary">
        <div className="flex items-center gap-16">
          <div className="flex items-center gap-6">
            <span className="w-4 h-4 rounded-full bg-green-500"></span>
            <span>Engine: Online</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="w-4 h-4 rounded-full bg-primary animate-pulse"></span>
            <span>Memory: 12.4GB / 32GB</span>
          </div>
        </div>
        <div>
          <span>© 2026 DSAL Analysis Lab</span>
        </div>
      </footer>
    </div>
  );
}

