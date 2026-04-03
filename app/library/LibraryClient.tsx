'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

interface LibraryClientProps {
  lessons: any[];
}

export default function LibraryClient({ lessons }: LibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Map database lessons to the UI structure
  const displayLessons = filteredLessons.map(lesson => ({
    title: lesson.title,
    desc: lesson.description || `Explore ${lesson.title} with interactive visualizations.`,
    complexity: lesson.difficulty === 'Beginner' ? 'O(n)' : 'O(log n)',
    space: 'O(n)',
    icon: lesson.visualizationType === 'tree' ? 'account_tree' : 
          lesson.visualizationType === 'graph' ? 'hub' : 
          lesson.visualizationType === 'sorting' ? 'sort' : 'list',
    color: lesson.type === 'classic' ? 'primary' : 'secondary',
    href: `/ide/${lesson.type}/${lesson.slug}`,
    status: 'Available',
    category: lesson.category,
    featured: lesson.slug === 'bst-insertion' // Mock featured
  }));

  const featured = displayLessons.find(l => l.featured) || displayLessons[0];
  const categories = Array.from(new Set(displayLessons.map(l => l.category)));

  return (
    <div className="flex h-screen w-full bg-background-dark text-white overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -64, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-64 bg-surface-darker border-r border-border-dark flex flex-col h-full shrink-0 z-20"
      >
        <div className="p-8 flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl shadow-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-white font-bold text-2xl">hub</span>
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-white text-3xl font-black leading-none tracking-tight uppercase italic">DSAL</h1>
            <p className="text-text-secondary text-sm font-bold mt-1 uppercase tracking-widest opacity-50">Registry</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 scrollbar-hide">
          <div className="mb-8">
            <p className="px-4 text-sm font-black text-primary uppercase tracking-[0.3em] mb-5 opacity-50">Navigation</p>
            <Link className="flex items-center gap-5 px-6 py-6 rounded-xl text-text-secondary hover:bg-surface-dark hover:text-white hover:translate-x-1 transition-all group" href="/">
              <span className="material-symbols-outlined text-[32px] group-hover:text-primary transition-colors">dashboard</span>
              <span className="text-2xl font-bold tracking-tight">Command Center</span>
            </Link>
            <Link className="flex items-center gap-5 px-6 py-6 rounded-xl bg-primary/10 border border-primary/30 text-white shadow-[0_0_20px_rgba(127,19,236,0.1)] transition-all group relative overflow-hidden mb-3" href="/library">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="material-symbols-outlined text-[32px] text-primary relative z-10">database</span>
              <span className="text-2xl font-black relative z-10 tracking-tight">Algorithm Registry</span>
            </Link>
          </div>

          <div className="mb-8">
            <p className="px-4 text-sm font-black text-secondary uppercase tracking-[0.3em] mb-5 opacity-50">Categories</p>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSearchQuery(cat)}
                className="w-full flex items-center gap-5 px-6 py-4 rounded-xl text-text-secondary hover:bg-surface-dark hover:text-white hover:translate-x-1 transition-all group text-left"
              >
                <span className="material-symbols-outlined text-xl group-hover:text-secondary transition-colors">folder</span>
                <span className="text-lg font-bold tracking-tight">{cat}</span>
              </button>
            ))}
          </div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-dark to-background-dark"
      >
        <header className="flex items-center justify-between px-12 py-10 bg-background-dark/80 backdrop-blur-xl border-b border-border-dark sticky top-0 z-30">
          <div className="flex items-center gap-8 flex-1">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 70 }}
              className="w-2.5 bg-primary rounded-full hidden md:block"
            ></motion.div>
            <div className="relative max-w-xl w-full group">
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary text-[32px] group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find algorithm modules..." 
                className="bg-black/40 border border-border-dark rounded-2xl pl-18 pr-8 py-6 text-2xl text-white focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all w-full font-black uppercase tracking-tight"
              />
            </div>
          </div>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-8 max-w-7xl mx-auto space-y-20"
        >
          {/* Featured Hero */}
          {featured && searchQuery === '' && (
            <motion.div 
              variants={itemVariants}
              className="relative rounded-[4rem] overflow-hidden border-b-8 border-r-8 border-black/40 border border-border-dark bg-surface-darker p-16 group shadow-3xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1 bg-primary/20 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/30">Featured Module</span>
                    <span className="w-2 h-2 rounded-full bg-accent-mint animate-pulse"></span>
                  </div>
                  <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none">{featured.title}</h2>
                  <p className="text-2xl text-text-secondary max-w-2xl leading-relaxed font-medium opacity-80 italic">"{featured.desc}"</p>
                  <div className="flex items-center gap-8 pt-6">
                    <Link href={featured.href}>
                      <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(127,19,236,0.4)' }}
                        whileTap={{ scale: 0.95 }}
                        className="px-12 py-6 bg-primary text-white font-black text-lg uppercase tracking-widest rounded-2xl shadow-2xl border-b-4 border-r-4 border-black/20"
                      >
                        Launch Simulation
                      </motion.button>
                    </Link>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Complexity</span>
                      <span className="text-2xl font-black text-primary font-mono italic">{featured.complexity}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-96 h-96 bg-surface-dark rounded-[3rem] border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-700 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(127,19,236,0.2),transparent_70%)]"></div>
                  <span className="material-symbols-outlined text-[180px] text-primary opacity-40 group-hover:opacity-100 transition-opacity group-hover:rotate-12 duration-700">{featured.icon}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Categorized Grid */}
          {categories.map(cat => {
            const catLessons = displayLessons.filter(l => l.category === cat);
            if (catLessons.length === 0) return null;

            return (
              <div key={cat} className="space-y-12">
                <div className="flex items-center gap-8">
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic shrink-0">{cat}</h2>
                  <div className="h-px bg-border-dark flex-1"></div>
                  <span className="text-sm font-black text-text-secondary uppercase tracking-widest opacity-50">{catLessons.length} Modules</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {catLessons.map((item) => (
                    <motion.div 
                      key={item.title} 
                      variants={itemVariants}
                      whileHover={{ y: -12, scale: 1.02 }}
                      className="group bg-surface-darker rounded-[2.5rem] border-b-8 border-r-8 border-black/40 border border-border-dark hover:border-white/20 transition-all flex flex-col overflow-hidden shadow-2xl"
                    >
                      <div className="h-56 w-full relative bg-surface-dark overflow-hidden flex items-center justify-center border-b border-border-dark">
                        <div className={`absolute inset-0 bg-gradient-to-b from-${item.color}/10 to-transparent`}></div>
                        <motion.div 
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          className={`w-28 h-28 rounded-[2rem] bg-gradient-to-br from-${item.color} to-surface-dark flex items-center justify-center shadow-2xl relative z-10 border border-white/10`}
                        >
                          <span className="material-symbols-outlined text-6xl text-white">{item.icon}</span>
                        </motion.div>
                      </div>
                      <div className="p-12 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-8">
                          <span className="text-sm font-black text-text-secondary uppercase tracking-[0.2em]">{item.category}</span>
                          <span className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-${item.color}/10 text-${item.color} border border-${item.color}/20 shadow-sm`}>
                            {item.status}
                          </span>
                        </div>
                        <h3 className="text-4xl font-black text-white mb-6 group-hover:text-primary transition-colors uppercase tracking-tighter italic leading-none">{item.title}</h3>
                        <p className="text-text-secondary text-xl mb-12 leading-relaxed font-medium opacity-70 line-clamp-2 italic">"{item.desc}"</p>
                        <div className="mt-auto grid grid-cols-2 gap-8 pt-10 border-t border-border-dark">
                          <Link href={item.href} className="col-span-2">
                            <motion.button 
                              whileHover={{ scale: 1.02, boxShadow: `0 0 20px rgba(var(--${item.color}-rgb), 0.3)` }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full py-6 rounded-2xl bg-${item.color} text-white font-black text-sm uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl border-b-4 border-r-4 border-black/20`}
                            >
                              Launch Module
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      </motion.main>
    </div>
  );
}
