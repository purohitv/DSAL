// components/ide/AnalysisModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/store/useSimulationStore';
import { GoogleGenAI } from "@google/genai";
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
  const { userCode, playgroundLanguage, complexityData, currentStep } = useSimulationStore();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [copySuccess, setCopySuccess] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Extract code statistics
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

  // Generate sections from markdown analysis
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
      
      for (const [key, config] of Object.entries(sectionMap)) {
        if (lowerLine.includes(key) && (line.startsWith('#') || line.startsWith('**') || line.includes('📋') || line.includes('⏱️') || line.includes('💾') || line.includes('⚠️') || line.includes('🚀') || line.includes('🐛') || line.includes('💡'))) {
          if (currentSection && currentContent) {
            sections.push({
              title: currentSection,
              content: currentContent.trim(),
              icon: sectionMap[currentSection.toLowerCase()]?.icon || 'article',
              color: sectionMap[currentSection.toLowerCase()]?.color || 'text-secondary'
            });
          }
          // Extract clean title without emojis
          let cleanTitle = key.charAt(0).toUpperCase() + key.slice(1);
          if (lowerLine.includes('📋')) cleanTitle = 'Overview';
          if (lowerLine.includes('⏱️')) cleanTitle = 'Time Complexity';
          if (lowerLine.includes('💾')) cleanTitle = 'Space Complexity';
          if (lowerLine.includes('⚠️')) cleanTitle = 'Edge Cases';
          if (lowerLine.includes('🚀')) cleanTitle = 'Optimization';
          if (lowerLine.includes('🐛')) cleanTitle = 'Potential Bugs';
          if (lowerLine.includes('💡')) cleanTitle = 'Best Practices';
          
          currentSection = cleanTitle;
          currentContent = '';
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        currentContent += line + '\n';
      }
    }
    
    // Add last section
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

  // AI-powered code analysis
  const analyzeCode = useCallback(async () => {
    if (!isOpen) return;
    
    if (!userCode || userCode.trim().length === 0) {
      setAnalysis("## No Code Provided\n\nPlease write or paste some code to analyze.");
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const stats = getCodeStats();
      
      const prompt = `You are an expert code reviewer. Provide a comprehensive analysis of the following ${playgroundLanguage} code.

Code Statistics:
- Total lines: ${stats?.totalLines || 0} (${stats?.codeLines || 0} actual code, ${stats?.commentLines || 0} comments)
- Functions: ${stats?.functions || 0}
- Loops: ${stats?.loops || 0}
- Conditionals: ${stats?.conditionals || 0}
- Execution steps tracked: ${stats?.complexity || 0}

Please provide a detailed analysis with the following sections (use markdown formatting):

## 📋 Overview
Brief summary of what the code does and its main purpose.

## ⏱️ Time Complexity Analysis
- Big O notation with detailed explanation
- Best case, average case, worst case scenarios
- Identify bottlenecks

## 💾 Space Complexity Analysis  
- Big O notation with explanation
- Memory usage patterns
- Data structure efficiency

## ⚠️ Edge Cases & Potential Issues
- Input validation concerns
- Off-by-one errors
- Null/undefined handling
- Recursion depth issues

## 🚀 Optimization Suggestions
- Specific improvements with code examples
- Alternative approaches
- Performance enhancements

## 🐛 Potential Bugs
- Logic errors
- Type safety issues
- Race conditions (if applicable)

## 💡 Best Practices
- Code style improvements
- Readability suggestions
- Maintainability tips

Code to analyze:
\`\`\`${playgroundLanguage}
${userCode.substring(0, 3000)} // Limit for API
\`\`\`

Provide the analysis in clear markdown format with emojis for visual appeal. Be specific, actionable, and educational.`;

      // FIXED: Using stable model instead of experimental
      const response = await ai.models.generateContent({
        model: "gemini-1.5-pro", // Changed from gemini-2.0-flash-exp to stable model
        contents: prompt,
        config: {
          temperature: 0.4,
          maxOutputTokens: 2000,
          topP: 0.95
        }
      });

      const analysisText = response.text || "Analysis generated successfully.";
      setAnalysis(analysisText);
      setAnalysisError(null);
      
    } catch (err) {
      console.error("AI Analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Analysis failed";
      
      // Provide more helpful error messages
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        userFriendlyMessage = "The AI model is temporarily unavailable. Please try again in a few minutes.";
      } else if (errorMessage.includes('API key')) {
        userFriendlyMessage = "API key configuration issue. Please check your environment variables.";
      } else if (errorMessage.includes('quota')) {
        userFriendlyMessage = "API quota exceeded. Please try again later.";
      }
      
      setAnalysisError(userFriendlyMessage);
      setAnalysis(`## Analysis Failed\n\n**Error:** ${userFriendlyMessage}\n\n### Troubleshooting:\n1. Check that your Gemini API key is valid\n2. Ensure you have API credits available\n3. Try again in a few minutes\n\nIf the problem persists, please contact support.`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isOpen, userCode, playgroundLanguage, getCodeStats]);

  // Trigger analysis when modal opens
  useEffect(() => {
    if (isOpen) {
      analyzeCode();
    }
    
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, analyzeCode, onClose]);

  // Copy analysis to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!analysis) return;
    
    try {
      await navigator.clipboard.writeText(analysis);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [analysis]);

  // Parse sections for navigation
  const sections = analysis ? parseSections(analysis) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-gradient-to-br from-background-dark to-surface-darker border border-white/10 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-darker/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                  <div className="relative w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined text-primary text-xl">analytics</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Code Analysis</h2>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                    AI-Powered Insights
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Copy button */}
                {analysis && !isAnalyzing && (
                  <button
                    onClick={copyToClipboard}
                    className="relative p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
                    title="Copy analysis"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {copySuccess ? 'check' : 'content_copy'}
                    </span>
                    {copySuccess && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary rounded text-[8px] font-black whitespace-nowrap"
                      >
                        Copied!
                      </motion.span>
                    )}
                  </button>
                )}
                
                {/* Close button */}
                <button 
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
                  title="Close (Esc)"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>
            
            {/* Content area with sidebar navigation */}
            <div className="flex-1 overflow-hidden flex">
              {/* Sidebar navigation (visible when sections exist) */}
              {sections.length > 0 && !isAnalyzing && (
                <div className="w-48 border-r border-white/10 bg-surface-darker/30 overflow-y-auto custom-scrollbar">
                  <div className="p-3 space-y-1">
                    <p className="text-[8px] text-text-secondary uppercase tracking-wider mb-2 px-2">Sections</p>
                    {sections.map((section, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSection(section.title.toLowerCase())}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all text-[11px] font-medium flex items-center gap-2 ${
                          activeSection === section.title.toLowerCase()
                            ? `bg-${section.color}/10 text-${section.color} border-l-2 border-${section.color}`
                            : 'text-text-secondary hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">{section.icon}</span>
                        <span className="truncate">{section.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Main content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-2xl text-primary">auto_awesome</span>
                      </motion.div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">
                        Analyzing Code...
                      </p>
                      <p className="text-[10px] text-text-secondary mt-1">
                        Using Gemini 1.5 Pro AI
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="markdown-body">
                      <Markdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-black mt-6 mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => {
                            const text = String(children);
                            const emoji = text.match(/[📋⏱️💾⚠️🚀🐛💡]/)?.[0] || '';
                            const title = text.replace(/[📋⏱️💾⚠️🚀🐛💡]/g, '').trim();
                            return (
                              <h2 className="text-lg font-bold mt-5 mb-3 text-primary flex items-center gap-2">
                                {emoji && <span className="text-xl">{emoji}</span>}
                                {title}
                              </h2>
                            );
                          },
                          h3: ({ children }) => (
                            <h3 className="text-md font-bold mt-4 mb-2 text-accent-mint">
                              {children}
                            </h3>
                          ),
                          code: ({ inline, className, children }) => {
                            if (inline) {
                              return (
                                <code className="px-1.5 py-0.5 bg-primary/10 rounded text-accent-mint text-[11px] font-mono">
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <pre className="bg-[#0d1117] border border-white/10 rounded-lg p-3 overflow-x-auto">
                                <code className={className}>
                                  {children}
                                </code>
                              </pre>
                            );
                          },
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary pl-4 py-2 my-3 bg-primary/5 rounded-r">
                              {children}
                            </blockquote>
                          ),
                          ul: ({ children }) => (
                            <ul className="space-y-1 my-2 list-disc pl-5">
                              {children}
                            </ul>
                          ),
                          li: ({ children }) => (
                            <li className="text-text-secondary text-sm">
                              {children}
                            </li>
                          ),
                          p: ({ children }) => (
                            <p className="text-text-secondary text-sm leading-relaxed my-2">
                              {children}
                            </p>
                          ),
                          a: ({ href, children }) => (
                            <a href={href} className="text-primary hover:text-primary-light underline" target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {analysis || "## Analysis Complete\n\nNo content generated."}
                      </Markdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer with code stats */}
            {!isAnalyzing && userCode && (
              <div className="px-6 py-2 border-t border-white/10 bg-surface-darker/30 flex justify-between items-center text-[8px] text-text-secondary">
                <div className="flex gap-3">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">code</span>
                    {getCodeStats()?.codeLines} lines
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">function</span>
                    {getCodeStats()?.functions} functions
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">loop</span>
                    {getCodeStats()?.loops} loops
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                  <span>Powered by Gemini 1.5 Pro</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
