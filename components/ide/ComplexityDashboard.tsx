// components/ide/ComplexityDashboard.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import ComplexityChart from './ComplexityChart';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";

interface ComplexityEstimate {
  time: string;
  space: string;
  reasoning: string;
  confidence?: number;
  timeDetails?: string;
  spaceDetails?: string;
}

interface PerformanceMetrics {
  averageOperations: number;
  peakOperations: number;
  averageMemory: number;
  peakMemory: number;
  growthRate: number;
  operationsPerStep: number[];
}

export default function ComplexityDashboard() {
  const { complexityData, userCode, playgroundLanguage } = useSimulationStore();
  const [aiEstimate, setAiEstimate] = useState<ComplexityEstimate | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Calculate performance metrics from complexity data
  const metrics = useMemo((): PerformanceMetrics => {
    if (complexityData.length === 0) {
      return {
        averageOperations: 0,
        peakOperations: 0,
        averageMemory: 0,
        peakMemory: 0,
        growthRate: 0,
        operationsPerStep: []
      };
    }

    const operations = complexityData.map(d => d.operations);
    const memory = complexityData.map(d => d.memory);
    
    const averageOperations = operations.reduce((a, b) => a + b, 0) / operations.length;
    const peakOperations = Math.max(...operations);
    const averageMemory = memory.reduce((a, b) => a + b, 0) / memory.length;
    const peakMemory = Math.max(...memory);
    
    // Calculate growth rate using linear regression
    const n = operations.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += operations[i];
      sumXY += i * operations[i];
      sumX2 += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const growthRate = isNaN(slope) ? 0 : slope;
    
    const operationsPerStep = operations.map((op, i) => i > 0 ? op - operations[i - 1] : 0);
    
    return {
      averageOperations: Math.round(averageOperations),
      peakOperations,
      averageMemory: Math.round(averageMemory),
      peakMemory,
      growthRate: Math.round(growthRate * 100) / 100,
      operationsPerStep
    };
  }, [complexityData]);

  // Enhanced heuristic estimation with multiple patterns
  const heuristicEstimate = useCallback((): ComplexityEstimate => {
    if (complexityData.length < 2) {
      return {
        time: "O(1)",
        space: "O(1)",
        reasoning: "Insufficient data for complexity analysis. Run more steps to see patterns."
      };
    }

    const n = complexityData.length;
    const ops = complexityData.map(d => d.operations);
    const memory = complexityData.map(d => d.memory);
    const firstOps = ops[0];
    const lastOps = ops[n - 1];
    const maxOps = Math.max(...ops);
    const firstMem = memory[0];
    const lastMem = memory[n - 1];

    // Detect patterns
    const ratio = lastOps / (firstOps || 1);
    const logN = Math.log2(n);
    const nLogN = n * logN;
    
    let timeComplexity = "O(1)";
    let timeReasoning = "Constant time - operations don't grow significantly with input size.";
    
    if (lastOps > firstOps * n * 0.3) {
      timeComplexity = "O(n²)";
      timeReasoning = "Quadratic growth detected - operations increase quadratically with input size.";
    } else if (lastOps > firstOps * n * 0.1) {
      timeComplexity = "O(n log n)";
      timeReasoning = "Linearithmic growth - typical for efficient sorting algorithms.";
    } else if (lastOps > firstOps * logN) {
      timeComplexity = "O(n)";
      timeReasoning = "Linear growth - operations scale linearly with input size.";
    } else if (lastOps > firstOps * Math.log2(logN)) {
      timeComplexity = "O(log n)";
      timeReasoning = "Logarithmic growth - efficient for divide-and-conquer algorithms.";
    }
    
    // Space complexity analysis
    let spaceComplexity = "O(1)";
    let spaceReasoning = "Constant space - memory usage doesn't grow significantly.";
    
    const memGrowth = lastMem / (firstMem || 1);
    if (memGrowth > n * 0.5) {
      spaceComplexity = "O(n²)";
      spaceReasoning = "Quadratic space growth - algorithm uses significant extra memory.";
    } else if (memGrowth > logN) {
      spaceComplexity = "O(n)";
      spaceReasoning = "Linear space growth - memory scales with input size.";
    } else if (memGrowth > Math.log2(logN)) {
      spaceComplexity = "O(log n)";
      spaceReasoning = "Logarithmic space - efficient memory usage.";
    }

    return {
      time: timeComplexity,
      space: spaceComplexity,
      reasoning: `Based on ${n} data points: ${timeReasoning} ${spaceReasoning}`,
      confidence: Math.min(0.7 + (n / 100) * 0.3, 0.95)
    };
  }, [complexityData]);

  // AI-based complexity analysis with better error handling
  const analyzeComplexity = useCallback(async () => {
    if (!userCode || userCode.length < 10) {
      setAiEstimate(null);
      return;
    }
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not configured");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Analyze the following ${playgroundLanguage} code and estimate its time and space complexity.
      
      Requirements:
      1. Provide Big-O notation for both time and space complexity
      2. Include a brief reasoning (2-3 sentences)
      3. If possible, identify the best, average, and worst-case scenarios
      4. Highlight any potential performance bottlenecks
      
      Code to analyze:
      \`\`\`${playgroundLanguage}
      ${userCode.substring(0, 2000)} // Limit code length for API
      \`\`\`
      
      Additional context from execution trace:
      - Data points tracked: ${complexityData.length}
      - Peak operations: ${metrics.peakOperations}
      - Average operations: ${metrics.averageOperations}
      - Growth rate: ${metrics.growthRate}
      
      Respond with a JSON object in this exact format:
      {
        "time": "O(...)",
        "space": "O(...)", 
        "reasoning": "Brief explanation of the complexity analysis",
        "timeDetails": "Detailed explanation of time complexity (optional)",
        "spaceDetails": "Detailed explanation of space complexity (optional)",
        "confidence": 0.0-1.0
      }`;
      
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 4096
        }
      });

      const outputText = response.text || "{}";
      
      // Multi-step cleaning to handle various model output quirks
      let cleanJson = outputText.trim();
      
      // Remove any markdown wrappers
      const jsonMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanJson = jsonMatch[1].trim();
      }
      
      try {
        const analysisResult = JSON.parse(cleanJson);
        
        if (analysisResult.time && analysisResult.space) {
          setAiEstimate({
            time: analysisResult.time,
            space: analysisResult.space,
            reasoning: analysisResult.reasoning || "Analysis completed successfully.",
            confidence: analysisResult.confidence || 0.8,
            timeDetails: analysisResult.timeDetails,
            spaceDetails: analysisResult.spaceDetails
          });
          setAnalysisError(null);
          setRetryCount(0);
        } else {
          throw new Error("Invalid response format: Missing time or space fields");
        }
      } catch (parseErr) {
        console.error("JSON Parse Error:", parseErr, "Raw text:", outputText);
        throw new Error("Failed to parse AI response. The output might have been malformed.");
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
      
      // Retry logic for network errors
      if (retryCount < 2 && err instanceof Error && err.message.includes("network")) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          analyzeComplexity();
        }, 2000 * (retryCount + 1));
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [userCode, playgroundLanguage, complexityData.length, metrics, retryCount]);

  // Debounced analysis
  useEffect(() => {
    if (!userCode || userCode.length < 10) return;
    
    const timer = setTimeout(() => {
      analyzeComplexity();
    }, 1500); // Debounce for 1.5 seconds
    
    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [userCode, playgroundLanguage, analyzeComplexity]);

  // Get complexity color
  const getComplexityColor = useCallback((complexity: string): string => {
    const colors: Record<string, string> = {
      'O(1)': 'text-green-400',
      'O(log n)': 'text-cyan-400',
      'O(n)': 'text-blue-400',
      'O(n log n)': 'text-yellow-400',
      'O(n²)': 'text-orange-400',
      'O(2ⁿ)': 'text-red-400',
      'O(n!)': 'text-red-500'
    };
    
    for (const [key, color] of Object.entries(colors)) {
      if (complexity.includes(key)) return color;
    }
    return 'text-white';
  }, []);

  // Get efficiency rating
  const getEfficiencyRating = useCallback((complexity: string): { label: string; color: string } => {
    if (complexity.includes('O(1)')) return { label: 'Excellent', color: 'text-green-400' };
    if (complexity.includes('O(log n)')) return { label: 'Very Good', color: 'text-cyan-400' };
    if (complexity.includes('O(n)')) return { label: 'Good', color: 'text-blue-400' };
    if (complexity.includes('O(n log n)')) return { label: 'Fair', color: 'text-yellow-400' };
    if (complexity.includes('O(n²)')) return { label: 'Poor', color: 'text-orange-400' };
    return { label: 'Inefficient', color: 'text-red-400' };
  }, []);

  const currentEstimate = aiEstimate || heuristicEstimate();
  const timeRating = getEfficiencyRating(currentEstimate.time);
  const spaceRating = getEfficiencyRating(currentEstimate.space);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-y-auto custom-scrollbar">
      {/* Chart Section */}
      <div className="flex-1 min-h-[200px] border-b border-white/10">
        <ComplexityChart />
      </div>
      
      {/* Metrics Summary */}
      {complexityData.length > 0 && (
        <div className="p-3 border-b border-white/10 bg-surface-darker/30">
          <div className="grid grid-cols-4 gap-2">
            <MetricCard
              label="Avg Operations"
              value={metrics.averageOperations}
              icon="timeline"
              color="primary"
            />
            <MetricCard
              label="Peak Operations"
              value={metrics.peakOperations}
              icon="trending_up"
              color="accent"
            />
            <MetricCard
              label="Growth Rate"
              value={metrics.growthRate}
              suffix="x"
              icon="show_chart"
              color="info"
            />
            <MetricCard
              label="Data Points"
              value={complexityData.length}
              icon="analytics"
              color="success"
            />
          </div>
        </div>
      )}
      
      {/* Complexity Analysis Section */}
      <div className="p-3 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">speed</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Complexity Analysis
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAnalyzing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[10px] text-primary">sync</span>
                <span className="text-[8px] text-primary">Analyzing...</span>
              </motion.div>
            )}
            <button
              onClick={() => setShowDetailedView(!showDetailedView)}
              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[8px] font-black uppercase tracking-widest transition-colors"
            >
              {showDetailedView ? 'Simple' : 'Detailed'}
            </button>
            {analysisError && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px] text-red-400">error</span>
                <span className="text-[8px] text-red-400">Retrying...</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Complexity Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Time Complexity */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-primary/10 to-transparent p-3 rounded-lg border border-primary/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            <p className="text-[8px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
              Time Complexity
            </p>
            <p className={`text-xl font-black tracking-tighter italic ${getComplexityColor(currentEstimate.time)}`}>
              {currentEstimate.time}
            </p>
            <p className={`text-[8px] mt-1 ${timeRating.color}`}>
              {timeRating.label} Efficiency
            </p>
            {currentEstimate.confidence && (
              <div className="absolute bottom-2 right-2">
                <div className="w-6 h-6 rounded-full border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-[8px] font-black text-primary">
                    {Math.round(currentEstimate.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Space Complexity */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-accent-mint/10 to-transparent p-3 rounded-lg border border-accent-mint/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-accent-mint/5 rounded-full blur-2xl group-hover:bg-accent-mint/10 transition-colors" />
            <p className="text-[8px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">memory</span>
              Space Complexity
            </p>
            <p className={`text-xl font-black tracking-tighter italic ${getComplexityColor(currentEstimate.space)}`}>
              {currentEstimate.space}
            </p>
            <p className={`text-[8px] mt-1 ${spaceRating.color}`}>
              {spaceRating.label} Memory Usage
            </p>
          </motion.div>
        </div>

        {/* Reasoning Section */}
        <AnimatePresence mode="wait">
          {currentEstimate.reasoning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/5 p-2 rounded-lg border border-white/10"
            >
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[12px] text-primary mt-0.5">psychology</span>
                <div>
                  <p className="text-[7px] text-gray-500 uppercase font-bold mb-1">Analysis Reasoning</p>
                  <p className="text-[9px] text-slate-300 font-mono leading-relaxed">
                    {currentEstimate.reasoning}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detailed View */}
        <AnimatePresence>
          {showDetailedView && (currentEstimate.timeDetails || currentEstimate.spaceDetails) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {currentEstimate.timeDetails && (
                <div className="bg-primary/5 p-2 rounded border-l-2 border-primary">
                  <p className="text-[7px] text-primary uppercase font-bold mb-1">Time Analysis</p>
                  <p className="text-[8px] text-slate-400 font-mono">{currentEstimate.timeDetails}</p>
                </div>
              )}
              {currentEstimate.spaceDetails && (
                <div className="bg-accent-mint/5 p-2 rounded border-l-2 border-accent-mint">
                  <p className="text-[7px] text-accent-mint uppercase font-bold mb-1">Space Analysis</p>
                  <p className="text-[8px] text-slate-400 font-mono">{currentEstimate.spaceDetails}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Performance Tips */}
        {complexityData.length > 5 && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[12px] text-yellow-500">lightbulb</span>
              <div>
                <p className="text-[7px] text-yellow-500 uppercase font-bold mb-1">Performance Insight</p>
                <p className="text-[8px] text-slate-400">
                  {metrics.growthRate > 10 
                    ? "⚠️ Operations growing rapidly. Consider optimizing your algorithm for better performance."
                    : metrics.growthRate > 5
                    ? "📈 Moderate growth detected. Could be optimized for larger inputs."
                    : "✅ Good performance scaling. Your algorithm handles increased input size efficiently."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Source Note */}
        <p className="text-[8px] text-gray-500 text-center italic">
          {aiEstimate 
            ? "✨ AI-powered complexity analysis based on code structure and execution patterns"
            : "📊 Heuristic analysis based on execution trace data"}
        </p>
      </div>

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

// Metric Card Sub-component
function MetricCard({ 
  label, 
  value, 
  suffix = '', 
  icon, 
  color 
}: { 
  label: string; 
  value: number; 
  suffix?: string; 
  icon: string; 
  color: 'primary' | 'accent' | 'info' | 'success';
}) {
  const colors = {
    primary: 'text-primary',
    accent: 'text-accent-mint',
    info: 'text-cyan-400',
    success: 'text-green-400'
  };
  
  return (
    <div className="bg-black/20 rounded-lg p-2 border border-white/5">
      <div className="flex items-center gap-1 mb-1">
        <span className={`material-symbols-outlined text-[10px] ${colors[color]} opacity-60`}>
          {icon}
        </span>
        <p className="text-[7px] text-gray-500 uppercase font-bold">{label}</p>
      </div>
      <p className={`text-sm font-black ${colors[color]}`}>
        {value.toLocaleString()}{suffix}
      </p>
    </div>
  );
}
