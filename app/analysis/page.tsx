// app/analysis/page.tsx
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import Editor from '@monaco-editor/react';

interface AnalysisResults {
  timeComplexity: string;
  timeExplanation: string;
  spaceComplexity: string;
  spaceExplanation: string;
  cyclomaticComplexity: number;
  halstead: {
    difficulty: number;
    effort: number;
    bugs: number;
    volume?: number;
    vocabulary?: number;
  };
  bottlenecks: Array<{
    line: number;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string;
  }>;
  cognitiveComplexity?: number;
  maintainabilityIndex?: number;
  recommendations?: string[];
}

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

const codeExamples: Record<string, string> = {
  bubbleSort: `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
  quickSort: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
  binarySearch: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  fibonacci: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  mergeSort: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}`
};

export default function ComplexityAnalysisDashboard() {
  const [code, setCode] = useState(codeExamples.bubbleSort);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('JavaScript');
  const [selectedExample, setSelectedExample] = useState<string>('bubbleSort');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState(14);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Handle example selection
  useEffect(() => {
    setCode(codeExamples[selectedExample as keyof typeof codeExamples]);
  }, [selectedExample]);

  // Get complexity color
  const getComplexityColor = (complexity: string): string => {
    if (complexity.includes('O(1)')) return 'text-green-400';
    if (complexity.includes('O(log n)')) return 'text-cyan-400';
    if (complexity.includes('O(n)')) return 'text-blue-400';
    if (complexity.includes('O(n log n)')) return 'text-yellow-400';
    if (complexity.includes('O(n²)')) return 'text-orange-400';
    if (complexity.includes('O(2ⁿ)') || complexity.includes('O(n!)')) return 'text-red-400';
    return 'text-white';
  };

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'low': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is missing. Please check your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `You are an expert code analyst. Analyze the following ${language} code and provide a comprehensive complexity analysis.

Code to analyze:
\`\`\`${language.toLowerCase()}
${code.substring(0, 3000)}
\`\`\`

Provide a detailed analysis including:
1. Time complexity (Big O notation) with clear explanation
2. Space complexity (Big O notation) with clear explanation
3. Cyclomatic complexity (number of independent paths)
4. Cognitive complexity (how hard it is to understand)
5. Halstead metrics (difficulty, effort, estimated bugs)
6. Specific bottlenecks with line numbers and severity levels
7. Optimization recommendations

Respond with a JSON object in this exact format:
{
  "timeComplexity": "O(...)",
  "timeExplanation": "Detailed explanation of time complexity...",
  "spaceComplexity": "O(...)",
  "spaceExplanation": "Detailed explanation of space complexity...",
  "cyclomaticComplexity": number,
  "cognitiveComplexity": number,
  "halstead": {
    "difficulty": number,
    "effort": number,
    "bugs": number,
    "volume": number,
    "vocabulary": number
  },
  "bottlenecks": [
    {
      "line": number,
      "issue": "Description of the issue",
      "severity": "low|medium|high",
      "suggestion": "How to fix it"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 1500
        }
      });

      if (response.text) {
        const parsedResult = JSON.parse(response.text);
        setResults(parsedResult);
      } else {
        throw new Error("Failed to generate analysis. Please try again.");
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      if (err.name !== 'AbortError') {
        setError(err.message || "An error occurred during analysis. Please check your API key and try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, language]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to analyze
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAnalyze();
      }
      
      // Ctrl/Cmd + 1-5 to load examples
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const examples = ['bubbleSort', 'quickSort', 'binarySearch', 'fibonacci', 'mergeSort'];
        const index = parseInt(e.key) - 1;
        if (examples[index]) {
          setSelectedExample(examples[index]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleAnalyze]);

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-6 py-3 bg-background-dark/95 backdrop-blur-xl border-b border-border-dark shrink-0 z-30"
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-text-secondary hover:text-white transition-colors group">
            <motion.div 
              whileHover={{ x: -4 }}
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Back</span>
            </motion.div>
          </Link>
          <div className="h-6 w-px bg-border-dark" />
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg shadow-lg"
            >
              <span className="material-symbols-outlined text-white text-xl">speed</span>
            </motion.div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase italic">Complexity Lab</h1>
              <p className="text-[8px] text-text-secondary font-mono uppercase tracking-widest">System Analysis Engine v5.0</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            title="Toggle theme"
          >
            <span className="material-symbols-outlined text-lg text-text-secondary">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
          
          {/* Font size control */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
            <span className="material-symbols-outlined text-xs text-text-secondary">text_increase</span>
            <input
              type="range"
              min="10"
              max="20"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          {/* Analyze button */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase tracking-widest py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                Analyzing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">analytics</span>
                Analyze (⌘+Enter)
              </>
            )}
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
          className="w-1/2 flex flex-col border-r border-border-dark bg-surface-darker/30"
        >
          <div className="px-4 py-2 bg-surface-darker border-b border-border-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest ml-2">algorithm.ts</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Example selector */}
              <select 
                value={selectedExample}
                onChange={(e) => setSelectedExample(e.target.value)}
                className="text-[9px] bg-surface-dark px-2 py-1 rounded text-primary font-black uppercase tracking-widest border border-primary/20 outline-none focus:border-primary cursor-pointer"
              >
                <option value="bubbleSort">Bubble Sort (O(n²))</option>
                <option value="quickSort">Quick Sort (O(n log n))</option>
                <option value="binarySearch">Binary Search (O(log n))</option>
                <option value="fibonacci">Fibonacci (O(2ⁿ))</option>
                <option value="mergeSort">Merge Sort (O(n log n))</option>
              </select>
              
              {/* Language selector */}
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-[9px] bg-surface-dark px-2 py-1 rounded text-primary font-black uppercase tracking-widest border border-primary/20 outline-none focus:border-primary cursor-pointer"
              >
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
                <option value="TypeScript">TypeScript</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none z-10" />
            <Editor
              height="100%"
              language={language.toLowerCase()}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                fontSize,
                fontFamily: 'monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                automaticLayout: true,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                renderWhitespace: 'selection',
                tabSize: 2,
              }}
            />
          </div>
        </motion.div>

        {/* Right: Analysis Results */}
        <div className="w-1/2 flex flex-col bg-gradient-to-br from-surface-dark to-background-dark overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center p-8"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md">
                  <span className="material-symbols-outlined text-red-500 text-4xl mb-3">error</span>
                  <h3 className="text-red-400 font-bold text-lg mb-2">Analysis Failed</h3>
                  <p className="text-red-400/70 text-sm">{error}</p>
                  <button
                    onClick={handleAnalyze}
                    className="mt-4 px-4 py-2 bg-red-500/20 rounded-lg text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            ) : results ? (
              <motion.div 
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="p-5 space-y-5"
              >
                {/* Complexity Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    className="bg-surface-darker border border-border-dark rounded-xl p-4 relative overflow-hidden group hover:border-primary/50 transition-all"
                  >
                    <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-all">
                      <span className="material-symbols-outlined text-6xl text-primary">schedule</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-wider">Time Complexity</h3>
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[7px] font-black rounded border border-primary/20">Runtime</span>
                    </div>
                    <div className={`text-3xl font-black font-mono tracking-tighter italic ${getComplexityColor(results.timeComplexity)}`}>
                      {results.timeComplexity}
                    </div>
                    <p className="text-[10px] text-text-secondary mt-2 leading-relaxed">
                      {results.timeExplanation}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    className="bg-surface-darker border border-border-dark rounded-xl p-4 relative overflow-hidden group hover:border-accent-mint/50 transition-all"
                  >
                    <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-all">
                      <span className="material-symbols-outlined text-6xl text-accent-mint">memory</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-wider">Space Complexity</h3>
                      <span className="px-1.5 py-0.5 bg-accent-mint/10 text-accent-mint text-[7px] font-black rounded border border-accent-mint/20">Memory</span>
                    </div>
                    <div className={`text-3xl font-black font-mono tracking-tighter italic ${getComplexityColor(results.spaceComplexity)}`}>
                      {results.spaceComplexity}
                    </div>
                    <p className="text-[10px] text-text-secondary mt-2 leading-relaxed">
                      {results.spaceExplanation}
                    </p>
                  </motion.div>
                </div>

                {/* Advanced Metrics */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-[10px] font-black text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-mint shadow-[0_0_8px_rgba(0,255,170,0.5)]" />
                    Advanced Metrics
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Cyclomatic', value: results.cyclomaticComplexity, icon: 'account_tree', color: 'primary' },
                      { label: 'Cognitive', value: results.cognitiveComplexity || results.cyclomaticComplexity, icon: 'psychology', color: 'cyan-400' },
                      { label: 'Halstead Diff', value: results.halstead.difficulty.toFixed(1), icon: 'analytics', color: 'yellow-400' },
                      { label: 'Est. Bugs', value: results.halstead.bugs.toFixed(2), icon: 'bug_report', color: 'accent-mint' },
                    ].map((metric, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -1 }}
                        className="bg-surface-darker/50 border border-border-dark rounded-lg p-2 hover:bg-surface-dark transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[7px] text-text-secondary font-black uppercase tracking-wider">{metric.label}</span>
                          <span className={`material-symbols-outlined text-xs text-${metric.color} opacity-50 group-hover:opacity-100 transition-opacity`}>
                            {metric.icon}
                          </span>
                        </div>
                        <div className={`text-lg font-black text-${metric.color} tracking-tighter`}>
                          {metric.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Bottlenecks */}
                {results.bottlenecks && results.bottlenecks.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <h3 className="text-[10px] font-black text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      Bottlenecks & Issues
                    </h3>
                    <div className="space-y-2">
                      {results.bottlenecks.map((bottleneck, i) => (
                        <motion.div 
                          key={i}
                          whileHover={{ x: 3 }}
                          className={`p-3 rounded-lg border ${getSeverityColor(bottleneck.severity)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                              <span className="text-red-400 font-mono font-black text-sm">L{bottleneck.line}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] font-black uppercase tracking-wider opacity-60">
                                  Severity: {bottleneck.severity.toUpperCase()}
                                </span>
                                <span className="material-symbols-outlined text-sm opacity-30">warning</span>
                              </div>
                              <p className="text-xs text-white/80 font-medium">{bottleneck.issue}</p>
                              {bottleneck.suggestion && (
                                <p className="text-[9px] text-text-secondary mt-1 italic">
                                  💡 {bottleneck.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recommendations */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <h3 className="text-[10px] font-black text-white mb-2 flex items-center gap-2 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Optimization Recommendations
                    </h3>
                    <div className="space-y-1">
                      {results.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-[10px] text-text-secondary">
                          <span className="text-primary text-xs">▹</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-surface-darker border-2 border-dashed border-border-dark flex items-center justify-center mb-4 relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl group-hover:scale-110 transition-transform" />
                  <span className="material-symbols-outlined text-2xl opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all">analytics</span>
                </div>
                <h2 className="text-base font-black text-white mb-1 uppercase tracking-tighter italic">Analysis Engine Ready</h2>
                <p className="max-w-xs text-[10px] font-medium leading-relaxed opacity-60">
                  Write or paste your algorithm code, then click <span className="text-primary">Analyze</span> or press <span className="text-primary">⌘+Enter</span>
                </p>
                <div className="mt-4 flex gap-2 text-[8px] text-text-secondary/40">
                  <span className="px-2 py-1 bg-white/5 rounded">⌘+1-5</span>
                  <span>Load examples</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="px-6 py-2 bg-surface-darker border-t border-border-dark flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-text-secondary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Engine Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[10px]">data_usage</span>
            <span>Gemini 2.0 Flash</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px]">code</span>
            {code.split('\n').filter(l => l.trim()).length} LOC
          </span>
          <span>© 2026 DSAL Analysis Lab</span>
        </div>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(127, 19, 236, 0.5);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
