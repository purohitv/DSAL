'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';

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
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('JavaScript');

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is missing.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following code written in ${language} and determine its time complexity, space complexity, cyclomatic complexity, halstead metrics, and bottlenecks.
Code:
${code}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              timeComplexity: { type: Type.STRING, description: "e.g., O(n²)" },
              timeExplanation: { type: Type.STRING, description: "Explanation of the time complexity" },
              spaceComplexity: { type: Type.STRING, description: "e.g., O(1)" },
              spaceExplanation: { type: Type.STRING, description: "Explanation of the space complexity" },
              cyclomaticComplexity: { type: Type.NUMBER, description: "Estimated cyclomatic complexity" },
              halstead: {
                type: Type.OBJECT,
                properties: {
                  difficulty: { type: Type.NUMBER },
                  effort: { type: Type.NUMBER },
                  bugs: { type: Type.NUMBER }
                }
              },
              bottlenecks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    line: { type: Type.NUMBER, description: "Line number of the bottleneck" },
                    issue: { type: Type.STRING, description: "Description of the issue" }
                  }
                }
              }
            },
            required: ["timeComplexity", "timeExplanation", "spaceComplexity", "spaceExplanation", "cyclomaticComplexity", "halstead", "bottlenecks"]
          }
        }
      });

      if (response.text) {
        const parsedResult = JSON.parse(response.text);
        setResults(parsedResult);
      } else {
        throw new Error("Failed to generate analysis.");
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-8 py-4 bg-background-dark/80 backdrop-blur-xl border-b border-border-dark shrink-0 z-30"
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="text-text-secondary hover:text-white transition-colors group">
            <motion.div 
              whileHover={{ x: -4 }}
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Back</span>
            </motion.div>
          </Link>
          <div className="h-8 w-px bg-border-dark mx-4"></div>
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="bg-gradient-to-br from-primary to-secondary p-3 rounded-lg shadow-lg"
            >
              <span className="material-symbols-outlined text-white text-2xl">speed</span>
            </motion.div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">Complexity Lab</h1>
              <p className="text-xs text-text-secondary font-mono uppercase tracking-widest mt-1">System Analysis Engine v4.2</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary-dark text-surface-darker font-black text-sm uppercase tracking-widest py-3 px-8 rounded-lg flex items-center gap-3 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 border-b-2 border-r-2 border-black/20"
          >
            {isAnalyzing ? (
              <span className="material-symbols-outlined animate-spin text-[24px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[24px]">analytics</span>
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
          <div className="px-4 py-2 bg-surface-darker border-b border-border-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/50"></span>
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest ml-3">algorithm</span>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-[10px] bg-surface-dark px-2 py-1 rounded text-primary font-black uppercase tracking-widest border border-primary/20 outline-none focus:border-primary cursor-pointer appearance-none"
            >
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>
          </div>
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-gray-300 font-mono text-sm p-6 focus:outline-none resize-none leading-relaxed selection:bg-primary/30"
              spellCheck={false}
            />
          </div>
        </motion.div>

        {/* Right: Analysis Results */}
        <div className="w-1/2 flex flex-col bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-surface-dark to-background-dark overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center p-12"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                  <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
                  <h3 className="text-red-400 font-bold text-xl mb-2">Analysis Failed</h3>
                  <p className="text-red-400/70">{error}</p>
                </div>
              </motion.div>
            ) : results ? (
              <motion.div 
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="p-6 space-y-6"
              >
                {/* Big O Notation */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="bg-surface-darker border-b-2 border-r-2 border-black/40 border border-border-dark rounded-xl p-4 relative overflow-hidden group hover:border-primary/50 transition-all shadow-md"
                  >
                    <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700 group-hover:-rotate-12">
                      <span className="material-symbols-outlined text-[80px] text-primary">schedule</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Time Complexity</h3>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded border border-primary/20">Runtime</span>
                    </div>
                    <div className="text-4xl font-black text-primary font-mono tracking-tighter italic drop-shadow-[0_2px_5px_rgba(127,19,236,0.3)]">{results.timeComplexity}</div>
                    <p className="text-xs text-text-secondary mt-2 font-medium leading-relaxed opacity-80 italic">{results.timeExplanation}</p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="bg-surface-darker border-b-2 border-r-2 border-black/40 border border-border-dark rounded-xl p-4 relative overflow-hidden group hover:border-secondary/50 transition-all shadow-md"
                  >
                    <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700 group-hover:-rotate-12">
                      <span className="material-symbols-outlined text-[80px] text-secondary">memory</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Space Complexity</h3>
                      <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[8px] font-black uppercase tracking-widest rounded border border-secondary/20">Memory</span>
                    </div>
                    <div className="text-4xl font-black text-secondary font-mono tracking-tighter italic drop-shadow-[0_2px_5px_rgba(217,19,236,0.3)]">{results.spaceComplexity}</div>
                    <p className="text-xs text-text-secondary mt-2 font-medium leading-relaxed opacity-80 italic">{results.spaceExplanation}</p>
                  </motion.div>
                </div>

                {/* Advanced Metrics */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-xs font-black text-white mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
                    <span className="w-2 h-2 rounded-full bg-accent-mint shadow-[0_0_10px_rgba(0,255,170,0.5)]"></span>
                    Advanced Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Cyclomatic', val: results.cyclomaticComplexity, color: 'text-white', icon: 'account_tree' },
                      { label: 'Halstead Diff', val: results.halstead.difficulty, color: 'text-white', icon: 'analytics' },
                      { label: 'Est. Bugs', val: results.halstead.bugs, color: 'text-accent-mint', icon: 'bug_report' },
                    ].map((m, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -1, scale: 1.01 }}
                        className="bg-surface-darker/50 border-b border-r border-black/20 border border-border-dark rounded-xl p-3 hover:bg-surface-dark transition-all shadow-sm group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{m.label}</div>
                          <span className={`material-symbols-outlined text-[16px] ${m.color} opacity-30 group-hover:opacity-100 transition-opacity`}>{m.icon}</span>
                        </div>
                        <div className={`text-2xl font-black ${m.color} tracking-tighter italic`}>{m.val}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Bottlenecks */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-sm font-black text-white mb-6 flex items-center gap-3 uppercase tracking-[0.4em]">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                    System Bottlenecks
                  </h3>
                  <div className="space-y-4">
                    {results.bottlenecks.map((b: any, i: number) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ x: 5, scale: 1.01 }}
                        className="flex gap-6 bg-surface-darker/50 border-b-2 border-r-2 border-black/20 border border-red-500/20 rounded-3xl p-6 group hover:bg-red-500/5 transition-all shadow-md"
                      >
                        <div className="w-16 h-16 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 shadow-inner group-hover:scale-110 transition-transform">
                          <span className="text-red-400 font-mono font-black text-base">L{b.line}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-red-400/50 uppercase tracking-[0.2em]">Criticality: High</span>
                            <span className="material-symbols-outlined text-red-500/30 group-hover:text-red-500 transition-all group-hover:rotate-12 text-xl">warning</span>
                          </div>
                          <p className="text-gray-300 text-base font-medium leading-relaxed italic">"{b.issue}"</p>
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
                <div className="w-20 h-20 rounded-2xl bg-surface-darker border-2 border-dashed border-border-dark flex items-center justify-center mb-4 relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl group-hover:scale-110 transition-transform"></div>
                  <span className="material-symbols-outlined text-3xl opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all">analytics</span>
                </div>
                <h2 className="text-lg font-black text-white mb-2 uppercase tracking-tighter italic">Analysis Engine Standby</h2>
                <p className="max-w-md text-xs font-medium leading-relaxed opacity-60">
                  Inject your algorithm logic into the terminal on the left. The engine will perform a deep-trace complexity audit.
                </p>
                <motion.div 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-6"
                >
                  <span className="material-symbols-outlined text-primary/50">keyboard_double_arrow_left</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="px-8 py-4 bg-surface-darker border-t border-border-dark flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-text-secondary">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Engine: Online</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
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

