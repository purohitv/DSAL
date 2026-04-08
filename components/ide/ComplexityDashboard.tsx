'use client';

import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import ComplexityChart from './ComplexityChart';
import { motion } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";

export default function ComplexityDashboard() {
  const { complexityData, userCode, playgroundLanguage } = useSimulationStore();
  const [aiEstimate, setAiEstimate] = useState<{ time: string; space: string; reasoning: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const heuristicEstimate = () => {
    if (complexityData.length < 2) return "O(1)";
    const n = complexityData.length;
    const first = complexityData[0].operations;
    const last = complexityData[n - 1].operations;
    
    if (last <= first + 5) return "O(1)";
    if (last > first * n * 0.5) return "O(n²)";
    if (last > first * Math.log2(n)) return "O(n)";
    return "O(log n)";
  };

  useEffect(() => {
    const analyzeComplexity = async () => {
      if (!userCode || userCode.length < 10) return;
      
      setIsAnalyzing(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Analyze the following ${playgroundLanguage} code and estimate its Big-O Time and Space complexity. 
          Respond ONLY with a JSON object in this format: {"time": "O(...)", "space": "O(...)", "reasoning": "short explanation"}.
          
          Code:
          ${userCode}`,
          config: {
            responseMimeType: "application/json"
          }
        });

        const result = JSON.parse(response.text || "{}");
        if (result.time && result.space) {
          setAiEstimate(result);
        }
      } catch (err) {
        console.error("AI Analysis failed:", err);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const timer = setTimeout(analyzeComplexity, 2000); // Debounce
    return () => clearTimeout(timer);
  }, [userCode, playgroundLanguage]);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] divide-y divide-white/5">
      <div className="flex-1 min-h-[60%]">
        <ComplexityChart />
      </div>
      
      <div className="p-3 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Analysis Engine</span>
          <div className="flex items-center gap-2">
            {isAnalyzing && (
              <motion.span 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="material-symbols-outlined text-[10px] text-primary"
              >
                sync
              </motion.span>
            )}
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-black rounded border border-primary/30">AI ESTIMATE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Time Complexity</p>
            <p className="text-xl font-black text-white tracking-tighter italic">
              {aiEstimate?.time || heuristicEstimate()}
            </p>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <p className="text-[8px] text-gray-500 uppercase font-bold mb-1">Space Complexity</p>
            <p className="text-xl font-black text-accent-mint tracking-tighter italic">
              {aiEstimate?.space || "O(n)"}
            </p>
          </div>
        </div>

        {aiEstimate?.reasoning && (
          <p className="text-[9px] text-slate-400 font-mono bg-white/5 p-2 rounded border border-white/5">
            <span className="text-primary font-bold mr-1">Reasoning:</span>
            {aiEstimate.reasoning}
          </p>
        )}

        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-mono">
            <span className="text-gray-500">Peak Operations</span>
            <span className="text-white">{Math.max(...complexityData.map(d => d.operations), 0)}</span>
          </div>
          <div className="flex justify-between text-[9px] font-mono">
            <span className="text-gray-500">Peak Memory</span>
            <span className="text-white">{Math.max(...complexityData.map(d => d.memory), 0)} units</span>
          </div>
        </div>

        <p className="text-[9px] text-gray-400 leading-relaxed italic opacity-60">
          * Complexity estimated based on trace patterns and AI code analysis.
        </p>
      </div>
    </div>
  );
}
