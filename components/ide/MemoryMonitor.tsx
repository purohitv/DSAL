'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/store/useSimulationStore';

export default function MemoryMonitor() {
  const { callStack, variables, currentStep, steps } = useSimulationStore();
  const [expandedVar, setExpandedVar] = useState<string | null>(null);

  // Derive history for a specific variable
  const getVarHistory = (varName: string) => {
    const history: any[] = [];
    steps.forEach((step, idx) => {
      if (idx >= currentStep) return;
      try {
        const stepVars = JSON.parse(step.variables || '{}');
        if (stepVars[varName] !== undefined) {
          history.push({ step: idx + 1, value: stepVars[varName] });
        }
      } catch (e) {}
    });
    return history;
  };

  const renderSparkline = (varName: string) => {
    const history = getVarHistory(varName);
    if (history.length < 2) return null;

    // Filter to numeric values for sparkline
    const numericHistory = history.filter(h => typeof h.value === 'number');
    if (numericHistory.length < 2) return null;

    const min = Math.min(...numericHistory.map(h => h.value));
    const max = Math.max(...numericHistory.map(h => h.value));
    const range = max - min || 1;

    return (
      <div className="h-16 w-full bg-white/5 rounded border border-white/10 flex items-end p-1 gap-0.5">
        {numericHistory.slice(-30).map((h, i) => (
          <motion.div 
            key={i} 
            initial={{ height: 0 }}
            animate={{ height: `${((h.value - min) / range) * 100}%` }}
            className={`flex-1 rounded-t-sm transition-all ${i === numericHistory.length - 1 ? 'bg-accent-mint animate-pulse' : 'bg-accent-mint/40'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0d1117] h-full flex flex-col divide-y divide-white/5">
      {/* Call Stack Section */}
      <div className="flex-1 min-h-[40%] flex flex-col">
        <div className="px-3 py-1.5 bg-surface-darker/80 text-[10px] uppercase text-primary font-black tracking-widest sticky top-0 z-10 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">layers</span>
            <span>Call Stack</span>
          </div>
          <span className="text-white/40 font-mono">{callStack.length} Frames</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {callStack.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-mono text-gray-600 text-center mt-8 italic"
              >
                Stack Empty
              </motion.div>
            ) : (
              callStack.map((call, i) => (
                <motion.div 
                  key={`${call}-${i}`}
                  initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group flex items-center justify-between p-2 rounded-lg transition-all border ${
                    i === 0 
                    ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(127,19,236,0.1)]' 
                    : 'bg-white/5 border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-[11px] ${i === 0 ? 'text-white font-bold' : 'text-gray-400'}`}>
                      {i === 0 && <span className="text-primary mr-2">▶</span>}
                      {call}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-white/20">#{callStack.length - i}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Variables Section */}
      <div className="flex-1 min-h-[60%] flex flex-col">
        <div className="px-3 py-1.5 bg-surface-darker/80 text-[10px] uppercase text-accent-mint font-black tracking-widest sticky top-0 z-10 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">data_object</span>
            <span>Local Variables</span>
          </div>
          <span className="text-white/40 font-mono">{Object.keys(variables).length} Vars</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <table className="w-full text-left border-separate border-spacing-y-1">
            <thead className="text-[9px] uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-2 py-1">Identifier</th>
                <th className="px-2 py-1">Value</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-mono">
              <AnimatePresence mode="popLayout">
                {Object.entries(variables).map(([name, value]) => (
                  <React.Fragment key={name}>
                    <motion.tr 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setExpandedVar(expandedVar === name ? null : name)}
                      className={`cursor-pointer transition-colors ${expandedVar === name ? 'bg-accent-mint/10' : 'hover:bg-white/5'}`}
                    >
                      <td className="px-2 py-2 text-blue-400 font-bold border-l-2 border-transparent group-hover:border-accent-mint">
                        {name}
                      </td>
                      <td className="px-2 py-2">
                        <span className="text-white bg-white/5 px-1.5 py-0.5 rounded border border-white/10 shadow-inner">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </td>
                    </motion.tr>
                    {expandedVar === name && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <td colSpan={2} className="px-4 py-2 bg-black/20 rounded-b-lg">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[9px] text-gray-500 uppercase font-bold">
                              <span>Value History</span>
                              <span className="text-accent-mint">{getVarHistory(name).length} points tracked</span>
                            </div>
                            {renderSparkline(name) || (
                              <div className="h-16 w-full bg-white/5 rounded border border-white/10 flex items-center justify-center text-[9px] text-gray-600 italic">
                                No numeric history available
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {Object.keys(variables).length === 0 && (
            <div className="text-[10px] font-mono text-gray-600 text-center mt-8 italic">
              No active variables
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
