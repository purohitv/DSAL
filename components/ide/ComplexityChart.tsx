'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';
import { motion } from 'framer-motion';

export default function ComplexityChart() {
  const { complexityData, currentStep } = useSimulationStore();

  // Show data up to the current step
  const visibleData = complexityData.filter(d => d.step <= currentStep);

  if (complexityData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs p-4 text-center">
        <span className="material-symbols-outlined text-2xl mb-2 opacity-50">monitoring</span>
        <p>No complexity data available.</p>
        <p className="mt-1 opacity-70">Use <code className="text-primary">dsal.trace({'{ operations: N, memory: M }'})</code> to track metrics.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-2 bg-[#0d1117]">
      <div className="flex justify-between items-center mb-2 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Metrics</span>
        </div>
        <div className="flex gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">OPS:</span>
            <span className="text-white">{visibleData.length > 0 ? visibleData[visibleData.length - 1].operations : 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">MEM:</span>
            <span className="text-accent-mint">{visibleData.length > 0 ? visibleData[visibleData.length - 1].memory : 0}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="step" 
              stroke="#ffffff40" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `S${val}`}
            />
            <YAxis 
              yAxisId="left" 
              stroke="#ffffff40" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#ffffff40" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#8892b0', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} iconType="circle" iconSize={6} />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="operations" 
              name="Operations (Time)"
              stroke="#7f13ec" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#7f13ec', stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive={false}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="memory" 
              name="Memory (Space)"
              stroke="#00f0ff" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#00f0ff', stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
