// components/ide/AnalysisModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/store/useSimulationStore';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalysisSection {
  title: string;
  content: string;
  icon: string;
  color: string;
}

export default function AnalysisModal({ isOpen, onClose }: AnalysisModalProps) {
  const { userCode, playgroundLanguage, complexityData } = useSimulationStore();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [copySuccess, setCopySuccess] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const getCodeStats = useCallback(() => {
    if (!userCode) return null;
    
    const lines = userCode.split('\n').filter(line => line.trim().length > 0);
    const codeLines = lines.filter(line => !line.trim().startsWith('//') && !line.trim().startsWith('/*'));
    const commentLines = lines.length - codeLines.length;
    const functions = (userCode.match(/function\s+\w+\s*\(/g) || []).length;
    const loops = (userCode.match(/for\s*\(|while\s*\(/g) || []).length;
    const conditionals = (userCode.match(/if\s*\(|else\s+if|switch\s*\(/g) || []).length;
    
    return {
      totalLines: lines.length,
      codeLines: codeLines.length,
      commentLines,
      functions,
      loops,
      conditionals,
      complexity: complexityData.length
    };
  }, [userCode, complexityData]);

  const parseSections = useCallback((markdown: string): AnalysisSection[] => {
    const sections: AnalysisSection[] = [];
    const lines = markdown.split('\n');
    let currentSection = '';
    let currentContent = '';
    
    const sectionMap: Record<string, { icon: string; color: string }> = {
      'overview': { icon: 'analytics', color: 'primary' },
      'summary': { icon: 'description', color: 'primary' },
      'time complexity': { icon: 'schedule', color: 'primary' },
      'space complexity': { icon: 'memory', color: 'accent-mint' },
      'edge cases': { icon: 'warning', color: 'yellow-500' },
      'optimization': { icon: 'rocket', color: 'cyan-400' },
      'bugs': { icon: 'bug_report', color: 'red-400' },
      'suggestions': { icon: 'lightbulb', color: 'yellow-500' },
      'best practices': { icon: 'thumb_up', color: 'green-400' }
    };
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      let matched = false;
      
      for (const [key] of Object.entries(sectionMap)) {
        if (lowerLine.includes(key) && (line.startsWith('#') || line.startsWith('**') || line.includes('📋') || line.includes('⏱️'))) {
          if (currentSection && currentContent) {
            sections.push({
              title: currentSection,
              content: currentContent.trim(),
              icon: sectionMap[currentSection.toLowerCase()]?.icon || 'article',
              color: sectionMap[currentSection.toLowerCase()]?.color || 'text-secondary'
            });
          }
          let cleanTitle = key.charAt(0).toUpperCase() + key.slice(1);
          if (lowerLine.includes('📋')) cleanTitle = 'Overview';
          if (lowerLine.includes('⏱️')) cleanTitle = 'Time Complexity';
          if (lowerLine.includes('💾')) cleanTitle = 'Space Complexity';
          
          currentSection = cleanTitle;
          currentContent = '';
          matched = true;
          break;
        }
      }
      if (!matched) currentContent += line + '\n';
    }
    if (currentSection && currentContent) {
      sections.push({
        title: currentSection,
        content: currentContent.trim(),
        icon: sectionMap[currentSection.toLowerCase()]?.icon || 'article',
        color: sectionMap[currentSection.toLowerCase()]?.color || 'text-secondary'
      });
    }
    return sections;
  }, []);

  const analyzeCode = useCallback(async () => {
    if (!isOpen || !userCode?.trim()) {
      if (isOpen) setAnalysis("## No Code Provided\n\nPlease write or paste some code to analyze.");
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key not configured.");
      
      // NEW: Explicit specialized SDK initialization
      const genAI = new GoogleGenerativeAI(apiKey);
      const stats = getCodeStats();
      
      const prompt = `You are an expert code reviewer. Provide a comprehensive analysis of the following ${playgroundLanguage} code.

Code Statistics:
- Total lines: ${stats?.totalLines || 0}
- Functions: ${stats?.functions || 0}
- Loops: ${stats?.loops || 0}
- Conditionals: ${stats?.conditionals || 0}

Analysis Requirements:
1. ## 📋 Overview
2. ## ⏱️ Time Complexity Analysis
3. ## 💾 Space Complexity Analysis  
4. ## ⚠️ Edge Cases
5. ## 🚀 Optimization Suggestions
6. ## 🐛 Potential Bugs
7. ## 💡 Best Practices

Code:
\`\`\`${playgroundLanguage}
${userCode.substring(0, 3000)}
\`\`\``;

      // NEW: Get Generative Model logic
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", // Using stable flash model
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2000,
          topP: 0.95
        }
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text() || "Analysis complete.";
      
      setAnalysis(responseText);
      setAnalysisError(null);
      
    } catch (err) {
      console.error("AI Analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Analysis failed";
      setAnalysisError(errorMessage);
      setAnalysis(`## Analysis Failed\n\n**Error:** ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isOpen, userCode, playgroundLanguage, getCodeStats]);

  useEffect(() => {
    if (isOpen) analyzeCode();
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [isOpen, analyzeCode, onClose]);

  const copyToClipboard = useCallback(async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) { console.error('Failed to copy:', err); }
  }, [analysis]);

  const sections = analysis ? parseSections(analysis) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="analysis-modal-backdrop" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            id="analysis-modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gradient-to-br from-background-dark to-surface-darker border border-white/10 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-darker/50">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <span className="material-symbols-outlined text-primary text-xl">analytics</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Code Analysis</h2>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest">AI-Powered Insights</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {analysis && !isAnalyzing && (
                  <button id="copy-analysis-btn" onClick={copyToClipboard} className="relative p-2 rounded-lg hover:bg-white/5 text-text-secondary">
                    <span className="material-symbols-outlined text-lg">{copySuccess ? 'check' : 'content_copy'}</span>
                  </button>
                )}
                <button id="close-modal-btn" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-text-secondary">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
              {/* Sidebar */}
              {sections.length > 0 && !isAnalyzing && (
                <div className="w-48 border-r border-white/10 bg-surface-darker/30 overflow-y-auto">
                  <div className="p-3 space-y-1">
                    <p className="text-[8px] text-text-secondary uppercase tracking-wider mb-2 px-2">Sections</p>
                    {sections.map((section, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSection(section.title.toLowerCase())}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all text-[11px] font-medium flex items-center gap-2 ${
                          activeSection === section.title.toLowerCase() ? `bg-${section.color}/10 text-${section.color}` : 'text-text-secondary hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">{section.icon}</span>
                        <span className="truncate">{section.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">Analyzing Code...</p>
                      <p className="text-[10px] text-text-secondary mt-1">Using Gemini 1.5 Flash AI</p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <Markdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        // FIXED: Proper type handling for inline results
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !match ? (
                            <code className="px-1.5 py-0.5 bg-primary/10 rounded text-accent-mint text-[11px] font-mono">
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-[#0d1117] border border-white/10 rounded-lg p-3 overflow-x-auto">
                              <code className={className}>{children}</code>
                            </pre>
                          );
                        }
                      }}
                    >
                      {analysis || "## Analysis Complete\n\nNo content generated."}
                    </Markdown>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            {!isAnalyzing && (
              <div className="px-6 py-2 border-t border-white/10 bg-surface-darker/30 flex justify-between items-center text-[8px] text-text-secondary">
                <div className="flex gap-3">
                  <span>{getCodeStats()?.codeLines} lines</span>
                  <span>{getCodeStats()?.functions} functions</span>
                </div>
                <div>Powered by Gemini 1.5 Flash</div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
