'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/store/useSimulationStore';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalysisModal({ isOpen, onClose }: AnalysisModalProps) {
  const { userCode, playgroundLanguage } = useSimulationStore();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const analyzeCode = async () => {
      if (!isOpen) return;
      if (!userCode || userCode.trim().length === 0) {
        setAnalysis("No code provided to analyze.");
        return;
      }

      setIsAnalyzing(true);
      setAnalysis(null);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: `Please provide a complete and detailed analysis of the following ${playgroundLanguage} code. 
          Include:
          1. A brief summary of what the code does.
          2. Time Complexity (Big O) with explanation.
          3. Space Complexity (Big O) with explanation.
          4. Potential edge cases or bugs.
          5. Suggestions for optimization or better practices.
          
          Code:
          \`\`\`${playgroundLanguage}
          ${userCode}
          \`\`\``,
        });

        setAnalysis(response.text || "No analysis generated.");
      } catch (err) {
        console.error("AI Analysis failed:", err);
        setAnalysis("Failed to generate analysis. Please check your API key and try again.");
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeCode();
  }, [isOpen, userCode, playgroundLanguage]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-background-dark border border-white/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-darker">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Code Analysis</h2>
                  <p className="text-xs text-text-secondary uppercase tracking-widest">AI-Powered Insights</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined text-4xl text-primary"
                  >
                    sync
                  </motion.span>
                  <p className="text-sm font-bold text-slate-300 animate-pulse uppercase tracking-widest">Analyzing Code...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-primary prose-strong:text-white prose-code:text-accent-mint prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-white/10">
                  <div className="markdown-body">
                    <Markdown>{analysis || ""}</Markdown>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
