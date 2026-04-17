// app/analysis/page.tsx
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

  useEffect(() => {
    setCode(codeExamples[selectedExample as keyof typeof codeExamples]);
  }, [selectedExample]);

  const getComplexityColor = (complexity: string): string => {
    if (complexity.includes('O(1)')) return 'text-green-400';
    if (complexity.includes('O(log n)')) return 'text-cyan-400';
    if (complexity.includes('O(n)')) return 'text-blue-400';
    if (complexity.includes('O(n log n)')) return 'text-yellow-400';
    if (complexity.includes('O(n²)')) return 'text-orange-400';
    if (complexity.includes('O(2ⁿ)') || complexity.includes('O(n!)')) return 'text-red-400';
    return 'text-white';
  };

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
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is missing.");

      // NEW: Updated SDK initialization
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 1500
        }
      });
      
      const prompt = `You are an expert code analyst. Analyze the following ${language} code and provide a comprehensive complexity analysis.
      Code:
      \`\`\`${language.toLowerCase()}
      ${code.substring(0, 3000)}
      \`\`\`
      
      Respond with a JSON object:
      {
        "timeComplexity": "O(...)",
        "timeExplanation": "string",
        "spaceComplexity": "O(...)",
        "spaceExplanation": "string",
        "cyclomaticComplexity": number,
        "cognitiveComplexity": number,
        "halstead": { "difficulty": number, "effort": number, "bugs": number, "volume": number, "vocabulary": number },
        "bottlenecks": [ { "line": number, "issue": "string", "severity": "low|medium|high", "suggestion": "string" } ],
        "recommendations": ["string"]
      }`;

      const result = await model.generateContent(prompt);
      const resultText = result.response.text();
      if (resultText) {
        setResults(JSON.parse(resultText));
      } else {
        throw new Error("Failed to generate analysis.");
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || "An error occurred.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, language]);

  // Layout rendering (same as before but using the updated handleAnalyze)
  return (
    <div id="complexity-page" className="flex flex-col h-screen bg-background-dark text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-background-dark/95 border-b border-border-dark shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-text-secondary hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg"><span className="material-symbols-outlined">speed</span></div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic">Complexity Lab</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg disabled:opacity-50">
            {isAnalyzing ? <><span className="material-symbols-outlined animate-spin">sync</span>Analyzing...</> : <><span className="material-symbols-outlined">analytics</span>Analyze</>}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="w-1/2 flex flex-col border-r border-border-dark bg-surface-darker/30">
          <div className="px-4 py-2 border-b border-border-dark flex justify-between bg-surface-darker">
            <span className="text-[9px] font-mono text-text-secondary">ALGORITHM.TS</span>
            <select value={selectedExample} onChange={(e) => setSelectedExample(e.target.value)} className="bg-surface-dark text-[9px] px-2 py-1 rounded text-primary border border-primary/20">
              {Object.keys(codeExamples).map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>
          <Editor height="100%" language={language.toLowerCase()} value={code} onChange={(v) => setCode(v || '')} theme="vs-dark" options={{ fontSize, minimap: { enabled: false } }} />
        </div>

        {/* Results */}
        <div className="w-1/2 overflow-y-auto p-5 space-y-5 bg-gradient-to-br from-surface-dark to-background-dark custom-scrollbar">
          {error ? (
              <div className="p-6 text-center text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20">{error}</div>
          ) : results ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-darker border border-border-dark rounded-xl p-4">
                  <h3 className="text-[9px] font-black text-text-secondary mb-2">TIME COMPLEXITY</h3>
                  <div className={`text-3xl font-black italic ${getComplexityColor(results.timeComplexity)}`}>{results.timeComplexity}</div>
                  <p className="text-[10px] text-text-secondary mt-2">{results.timeExplanation}</p>
                </div>
                <div className="bg-surface-darker border border-border-dark rounded-xl p-4">
                  <h3 className="text-[9px] font-black text-text-secondary mb-2">SPACE COMPLEXITY</h3>
                  <div className={`text-3xl font-black italic ${getComplexityColor(results.spaceComplexity)}`}>{results.spaceComplexity}</div>
                  <p className="text-[10px] text-text-secondary mt-2">{results.spaceExplanation}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Cyclomatic', value: results.cyclomaticComplexity, color: 'text-primary' },
                  { label: 'Cognitive', value: results.cognitiveComplexity || 0, color: 'text-cyan-400' },
                  { label: 'Halstead Diff', value: results.halstead.difficulty.toFixed(1), color: 'text-yellow-400' },
                  { label: 'Est. Bugs', value: results.halstead.bugs.toFixed(2), color: 'text-accent-mint' }
                ].map((m, i) => (
                  <div key={i} className="bg-surface-darker/50 p-2 rounded-lg border border-border-dark">
                    <div className="text-[7px] text-text-secondary font-black">{m.label}</div>
                    <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
                  </div>
                ))}
              </div>

              {results.bottlenecks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black">BOTTLENECKS</h3>
                  {results.bottlenecks.map((b, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${getSeverityColor(b.severity)} flex gap-3`}>
                      <span className="font-mono text-sm">L{b.line}</span>
                      <div>
                        <p className="text-xs font-medium text-white/80">{b.issue}</p>
                        <p className="text-[9px] opacity-60 mt-1 italic">💡 {b.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <span className="material-symbols-outlined text-4xl mb-2">analytics</span>
              <p className="text-[10px] font-black tracking-widest uppercase">Select code and click analyze</p>
            </div>
          )}
        </div>
      </main>

      <footer className="px-6 py-2 bg-surface-darker border-t border-border-dark flex justify-between text-[8px] text-text-secondary font-black uppercase tracking-wider">
        <div className="flex gap-4"><span>Engine Online</span><span>Gemini 1.5 Flash</span></div>
        <span>© 2026 DSAL Analysis Lab</span>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(127, 19, 236, 0.5); border-radius: 4px; }
      `}</style>
    </div>
  );
}
