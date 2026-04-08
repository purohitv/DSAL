'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function ProgressiveLearningPath() {
  const paths = [
    {
      id: 'classical-foundations',
      title: 'Classical Foundations',
      description: 'Master the fundamental data structures and algorithms that power traditional computing.',
      icon: 'data_object',
      color: 'text-primary',
      accentColor: 'primary',
      modules: [
        { name: 'Array', link: '/ide/linear', status: 'completed' },
        { name: 'Array Reversal', link: '/ide/classic/array-reversal', status: 'available' },
        { name: 'Valid Parentheses (Stack)', link: '/ide/classic/valid-parentheses', status: 'available' },
        { name: 'Binary Search Trees', link: '/ide/classic/bst-insertion', status: 'completed' },
        { name: 'Red-Black Trees', link: '/ide/bst/2', status: 'completed' },
        { name: 'AVL Trees', link: '/ide/bst/3', status: 'in-progress' },
      ]
    },
    {
      id: 'advanced-classical',
      title: 'Advanced Classical',
      description: 'Explore complex graph algorithms, dynamic programming, and advanced heuristics.',
      icon: 'hub',
      color: 'text-secondary',
      accentColor: 'secondary',
      modules: [
        { name: 'Graph Traversals (BFS/DFS)', link: '#', status: 'locked' },
        { name: 'Shortest Path (Dijkstra/A*)', link: '#', status: 'locked' },
        { name: 'Dynamic Programming', link: '#', status: 'locked' },
      ]
    },
    {
      id: 'quantum-bridge',
      title: 'The Quantum Bridge',
      description: 'Transition from classical bits to quantum qubits. Understand superposition and entanglement.',
      icon: 'blur_on',
      color: 'text-accent-mint',
      accentColor: 'accent-mint',
      modules: [
        { name: 'Qubits & Superposition', link: '/ide/quantum/qubits', status: 'available' },
        { name: 'Quantum Gates (H, X, CNOT)', link: '/ide/quantum/gates', status: 'available' },
        { name: 'Entanglement & Bell States', link: '/ide/quantum/entanglement', status: 'available' },
      ]
    },
    {
      id: 'quantum-algorithms',
      title: 'Quantum Algorithms',
      description: 'Implement and visualize groundbreaking quantum algorithms that outperform classical counterparts.',
      icon: 'science',
      color: 'text-pink-400',
      accentColor: 'pink-500',
      modules: [
        { name: 'Grover\'s Search Algorithm', link: '/ide/quantum/grovers-search', status: 'available' },
        { name: 'Shor\'s Factoring Algorithm', link: '/ide/quantum/shors', status: 'available' },
        { name: 'Quantum Fourier Transform', link: '/ide/quantum/qft', status: 'available' },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden selection:bg-primary/30">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-16 py-10 bg-background-dark/80 backdrop-blur-2xl border-b border-border-dark sticky top-0 z-30 shrink-0"
      >
        <div className="flex items-center gap-12">
          <Link href="/" className="group">
            <motion.div 
              whileHover={{ x: -5 }}
              className="flex items-center gap-5 text-text-secondary hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-4xl">arrow_back</span>
              <span className="text-sm font-black uppercase tracking-[0.3em]">Back to Hub</span>
            </motion.div>
          </Link>
          <div className="h-12 w-px bg-white/10"></div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-6">
              <span className="material-symbols-outlined text-primary text-5xl">route</span>
              Evolution Path
            </h1>
            <p className="text-sm text-text-secondary font-mono uppercase tracking-[0.4em] mt-2">From Classical Bits to Quantum Qubits</p>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="text-right">
            <span className="text-sm font-black text-primary uppercase tracking-widest block">Total Progress</span>
            <span className="text-3xl font-black tracking-tighter italic">42% Complete</span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-surface-darker border border-border-dark flex items-center justify-center shadow-xl">
            <span className="material-symbols-outlined text-primary text-3xl">military_tech</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide p-12 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-dark to-background-dark">
        <div className="max-w-7xl mx-auto relative">
          {/* Connecting Line */}
          <div className="absolute left-20 top-10 bottom-10 w-2 bg-white/5 rounded-full hidden lg:block z-0">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: '60%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="w-full bg-gradient-to-b from-primary via-secondary to-pink-500 rounded-full shadow-[0_0_20px_rgba(127,19,236,0.5)]"
            />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-20 relative z-10"
          >
            {paths.map((path, index) => (
              <motion.div 
                key={path.id} 
                variants={itemVariants}
                className="flex flex-col lg:flex-row gap-16 items-start"
              >
                {/* Node Icon */}
                <div className="hidden lg:flex w-16 h-16 rounded-2xl bg-surface-darker border-b-4 border-r-4 border-black/40 border border-border-dark items-center justify-center shrink-0 mt-10 shadow-2xl z-10 relative group">
                  <div className={`absolute inset-0 bg-${path.accentColor}/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  <span className={`material-symbols-outlined ${path.color} text-3xl group-hover:scale-110 transition-transform`}>{path.icon}</span>
                </div>

                {/* Content Card */}
                <div className={`flex-1 bg-surface-darker border-b-8 border-r-8 border-black/40 border border-border-dark rounded-[3.5rem] p-16 relative overflow-hidden group hover:border-${path.accentColor}/50 transition-all shadow-2xl`}>
                  <div className="absolute top-0 right-0 p-16 opacity-[0.02] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none">
                    <span className={`material-symbols-outlined text-[280px] ${path.color}`}>{path.icon}</span>
                  </div>
                  
                  <div className="flex items-center gap-8 mb-10">
                    <div className={`w-16 h-16 rounded-xl bg-${path.accentColor}/10 flex items-center justify-center lg:hidden`}>
                      <span className={`material-symbols-outlined ${path.color} text-3xl`}>{path.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">{path.title}</h2>
                      <div className="flex items-center gap-4 mt-4">
                        <span className={`w-3 h-3 rounded-full bg-${path.accentColor}`}></span>
                        <span className="text-sm font-black text-text-secondary uppercase tracking-widest">Stage 0{index + 1}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-text-secondary text-xl mb-14 max-w-5xl leading-relaxed font-medium opacity-80 italic">{path.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {path.modules.map((mod, i) => (
                      <motion.div
                        key={i}
                        whileHover={mod.status !== 'locked' ? { x: 10, scale: 1.02 } : {}}
                        whileTap={mod.status !== 'locked' ? { scale: 0.98 } : {}}
                      >
                        <Link 
                          href={mod.link !== '#' ? mod.link : '#'}
                          className={`flex items-center justify-between p-10 rounded-[2.5rem] border-b-4 border-r-4 border-black/20 border transition-all h-full ${
                            mod.status === 'completed' ? 'bg-primary/10 border-primary/30 hover:bg-primary/20' :
                            mod.status === 'in-progress' ? 'bg-secondary/10 border-secondary/30 hover:bg-secondary/20' :
                            mod.status === 'available' ? 'bg-surface-dark border-border-dark hover:border-white/30 shadow-xl' :
                            'bg-surface-dark/50 border-border-dark/50 opacity-40 cursor-not-allowed'
                          }`}
                          onClick={(e) => mod.status === 'locked' && e.preventDefault()}
                        >
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                              mod.status === 'completed' ? 'bg-primary/20' :
                              mod.status === 'in-progress' ? 'bg-secondary/20' :
                              mod.status === 'available' ? 'bg-white/10' :
                              'bg-black/20'
                            }`}>
                              <span className={`material-symbols-outlined text-[28px] ${
                                mod.status === 'completed' ? 'text-primary' :
                                mod.status === 'in-progress' ? 'text-secondary' :
                                mod.status === 'available' ? 'text-white' :
                                'text-gray-600'
                              }`}>
                                {mod.status === 'completed' ? 'check_circle' :
                                 mod.status === 'in-progress' ? 'pending' :
                                 mod.status === 'available' ? 'play_circle' :
                                 'lock'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-xl font-black uppercase tracking-tight ${mod.status === 'locked' ? 'text-gray-500' : 'text-white'}`}>
                                {mod.name}
                              </span>
                              <span className="text-xs font-black text-text-secondary uppercase tracking-widest mt-1.5">
                                {mod.status}
                              </span>
                            </div>
                          </div>
                          {mod.status !== 'locked' && (
                            <span className="material-symbols-outlined text-text-secondary group-hover:text-white transition-colors text-3xl">chevron_right</span>
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <footer className="mt-24 text-center text-text-secondary text-sm pb-12 font-black uppercase tracking-[0.4em] opacity-30">
          <p>© 2026 DSAL Institute. The Path to Mastery.</p>
        </footer>
      </main>
    </div>
  );
}
