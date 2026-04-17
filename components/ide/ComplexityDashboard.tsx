// components/ide/ComplexityDashboard.tsx - SIMPLIFIED WORKING VERSION
'use client';

import React, { useMemo } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import ComplexityChart from './ComplexityChart';
import { motion } from 'framer-motion';

export default function ComplexityDashboard() {
  const { complexityData } = useSimulationStore();

  const metrics = useMemo(() => {
    if (complexityData.length === 0) return null;
    
    const ops = complexityData.map(d => d.operations);
    const mem = complexityData.map(d => d.memory);
    const lastOps = ops[ops.length - 1];
    const lastMem = mem[mem.length - 1];
    const avgOps = ops.reduce((a, b) => a + b, 0) / ops.length;
    const peakOps = Math.max(...ops);
    
    return { lastOps, lastMem, avgOps, peakOps };
  }, [complexityData]);

  if (complexityData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <span className="material-symbols-outlined text-4xl text-gray-600 mb-3">analytics</span>
        <p className="text-xs text-gray-500">No complexity data yet</p>
        <p className="text-[10px] text-gray-600 mt-1">Run your algorithm to see metrics</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-y-auto">
      <div className="flex-1 min-h-[200px] border-b border-white/10">
        <ComplexityChart />
      </div>
      
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-primary/10 to-transparent p-3 rounded-lg border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-sm">schedule</span>
              <p className="text-[9px] text-gray-400 uppercase font-bold">Operations</p>
            </div>
            <p className="text-2xl font-bold text-primary">{metrics?.lastOps.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500 mt-1">Peak: {metrics?.peakOps.toLocaleString()}</p>
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-accent-mint/10 to-transparent p-3 rounded-lg border border-accent-mint/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-accent-mint text-sm">memory</span>
              <p className="text-[9px] text-gray-400 uppercase font-bold">Memory</p>
            </div>
            <p className="text-2xl font-bold text-accent-mint">{metrics?.lastMem.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500 mt-1">Units allocated</p>
          </motion.div>
        </div>
        
        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-yellow-500 text-sm">insights</span>
            <p className="text-[9px] text-gray-400 uppercase font-bold">Summary</p>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Tracked {complexityData.length} execution steps. 
            Average operations: {Math.round(metrics?.avgOps || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
