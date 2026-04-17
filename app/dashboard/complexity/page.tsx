// app/dashboard/complexity/page.tsx
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSimulationStore } from '@/store/useSimulationStore';

interface ComplexityData {
  inputSize: number;
  standardTime: number;
  urgentTime: number;
  standardMemory: number;
  urgentMemory: number;
  status: 'optimal' | 'warning' | 'critical';
}

interface ExecutionRow {
  nodes: string;
  depth: number;
  insertSearch: string;
  processTime: string;
  stackOverhead: string;
  load: string;
  color: 'neon-orange' | 'neon-red' | 'neon-green';
  percentage: number;
}

export default function DsalComplexityAnalysisDashboard() {
  const { complexityData, userCode } = useSimulationStore();
  const [selectedView, setSelectedView] = useState<'unified' | 'split'>('unified');
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('time');
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState<'standard' | 'aggressive' | 'extreme'>('standard');

  // Generate complexity data points
  const complexityPoints = useMemo(() => {
    const points: ComplexityData[] = [];
    for (let i = 1; i <= 40; i += 2) {
      points.push({
        inputSize: i,
        standardTime: Math.pow(i, 1.5) * 0.1,
        urgentTime: Math.pow(2, i / 10) * 0.5,
        standardMemory: i * 8,
        urgentMemory: Math.pow(2, i / 8) * 4,
        status: i > 30 ? 'critical' : i > 20 ? 'warning' : 'optimal'
      });
    }
    return points;
  }, []);

  // Execution table data
  const executionData: ExecutionRow[] = [
    { nodes: '10', depth: 10, insertSearch: '0.02ms / 0.01ms', processTime: '0.5ms', stackOverhead: '2KB', load: 'OK', color: 'neon-green', percentage: 10 },
    { nodes: '1,000', depth: 20, insertSearch: '12ms / 4ms', processTime: '45ms', stackOverhead: '128KB', load: '45%', color: 'neon-orange', percentage: 45 },
    { nodes: '100,000', depth: 30, insertSearch: '4.2s / 1.1s', processTime: '12.5s', stackOverhead: '14MB', load: 'HIGH', color: 'neon-red', percentage: 90 },
    { nodes: '1,000,000+', depth: 40, insertSearch: 'TIMEOUT', processTime: '~Hours', stackOverhead: 'Overflow', load: 'FAIL', color: 'neon-red', percentage: 100 },
  ];

  // Simulate rebalancing
  const simulateRebalance = useCallback(async () => {
    setIsSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSimulating(false);
  }, []);

  // Run stress test
  const runStressTest = useCallback(() => {
    setShowOptimizationModal(true);
  }, []);

  // Apply optimization
  const applyOptimization = useCallback(() => {
    console.log(`Applying ${optimizationLevel} optimization...`);
    setShowOptimizationModal(false);
  }, [optimizationLevel]);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'critical': return 'text-neon-red border-neon-red/30 bg-neon-red/10';
      case 'warning': return 'text-neon-orange border-neon-orange/30 bg-neon-orange/10';
      default: return 'text-neon-green border-neon-green/30 bg-neon-green/10';
    }
  }, []);

  // Get complexity class
  const getComplexityClass = useCallback((complexity: string) => {
    if (complexity.includes('2^n')) return 'neon-text-red';
    if (complexity.includes('N²')) return 'text-neon-orange';
    if (complexity.includes('N log N')) return 'text-neon-cyan';
    if (complexity.includes('N')) return 'text-neon-green';
    if (complexity.includes('log n')) return 'text-cyber-purple';
    return 'text-white';
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-surface-darker-matte text-slate-300 font-display overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-solid border-slate-800 bg-surface-darker-matte/95 backdrop-blur-sm px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="size-8 flex items-center justify-center text-neon-cyan hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">hub</span>
          </Link>
          <h2 className="text-white text-xl font-bold leading-tight tracking-tight">
            DSAL <span className="text-xs font-normal text-slate-500 ml-2">Complexity Analysis Suite</span>
          </h2>
        </div>
        
        <div className="flex flex-1 justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/dashboard/editor" className="text-slate-400 hover:text-neon-cyan transition-colors text-sm font-medium">
              Editor
            </Link>
            <Link href="/dashboard/visualizer" className="text-slate-400 hover:text-neon-cyan transition-colors text-sm font-medium">
              Visualizer
            </Link>
            <Link href="/dashboard/complexity" className="text-neon-cyan text-sm font-medium relative after:content-[''] after:absolute after:-bottom-5 after:left-0 after:w-full after:h-0.5 after:bg-neon-cyan after:shadow-[0_0_10px_#00f2ff]">
              Analysis
            </Link>
            <Link href="/dashboard/settings" className="text-slate-400 hover:text-neon-cyan transition-colors text-sm font-medium">
              Settings
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <button className="size-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-neon-cyan transition-colors relative">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-neon-red rounded-full animate-pulse" />
            </button>
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-slate-700 cursor-pointer hover:scale-105 transition-transform" 
              style={{ backgroundImage: 'url("https://picsum.photos/seed/user/100/100")' }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 custom-scrollbar">
          {/* Breadcrumb & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <span className="material-symbols-outlined text-slate-600 text-sm">chevron_right</span>
              <Link href="/dashboard/analysis" className="text-slate-500 hover:text-white transition-colors text-sm font-medium">
                Analysis
              </Link>
              <span className="material-symbols-outlined text-slate-600 text-sm">chevron_right</span>
              <span className="text-neon-cyan text-sm font-bold bg-neon-cyan/10 px-2 py-0.5 rounded border border-neon-cyan/20">
                Complexity Analysis
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={simulateRebalance}
                disabled={isSimulating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-surface-dark-matte hover:bg-slate-700 transition-colors text-xs font-medium text-slate-300 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">
                  {isSimulating ? 'sync' : 'memory'}
                </span>
                {isSimulating ? 'Simulating...' : 'Simulate Rebalance'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-surface-dark-matte hover:bg-slate-700 transition-colors text-xs font-medium text-slate-300"
              >
                <span className="material-symbols-outlined text-sm">psychology</span>
                Apply Memoization
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runStressTest}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-cyan text-black hover:bg-cyan-300 transition-colors text-xs font-bold shadow-[0_0_15px_rgba(0,242,255,0.4)]"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                Run Stress Test
              </motion.button>
            </div>
          </div>

          {/* Complexity Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Complexity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-slate-800 bg-surface-dark-matte p-5 shadow-lg relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-neon-red">speed</span>
              </div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-slate-100 text-lg font-bold flex items-center gap-2">
                    Comparative Time Complexity
                    <span className={`flex size-2 rounded-full ${
                      complexityPoints[complexityPoints.length - 1]?.status === 'critical' 
                        ? 'bg-neon-red animate-pulse' 
                        : 'bg-neon-green'
                    }`} />
                  </h3>
                  <p className="text-slate-400 text-xs">Standard vs. Urgency Curves</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-xs text-cyber-purple font-bold">
                    <span className="w-3 h-0.5 bg-cyber-purple shadow-[0_0_8px_#b026ff]" />
                    O(N) Standard
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neon-red font-bold">
                    <span className="w-3 h-0.5 bg-neon-red shadow-[0_0_8px_#ff2a4d]" />
                    O(2^n) Urgent
                  </div>
                </div>
              </div>
              
              <div className="h-[200px] w-full relative z-10">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 200">
                  {/* Grid lines */}
                  <line x1="0" y1="199" x2="400" y2="199" stroke="#1e293b" strokeWidth="1" />
                  <line x1="0" y1="0" x2="0" y2="200" stroke="#1e293b" strokeWidth="1" />
                  <line x1="0" y1="150" x2="400" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" opacity="0.2" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" opacity="0.2" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" opacity="0.2" />
                  
                  <defs>
                    <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff2a4d" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#ff2a4d" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b026ff" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#b026ff" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Standard curve (O(N)) */}
                  <path d="M0,200 C100,180 200,140 400,20" fill="none" stroke="#b026ff" strokeWidth="2" filter="url(#glow)" />
                  <path d="M0,200 C100,180 200,140 400,20" fill="none" stroke="#b026ff" strokeWidth="2" className="drop-shadow-[0_0_6px_rgba(176,38,255,0.8)]" />
                  
                  {/* Urgent curve area (O(2^n)) */}
                  <path d="M0,200 Q150,200 280,100 T400,0 V200 H0 Z" fill="url(#redGradient)" />
                  
                  {/* Urgent curve */}
                  <path d="M0,200 Q150,200 280,100 T400,0" fill="none" stroke="#ff2a4d" strokeWidth="3" filter="url(#glow)" />
                  
                  {/* Current position markers */}
                  <circle cx="280" cy="100" r="4" fill="#ff2a4d" className="animate-pulse" />
                  <circle cx="200" cy="140" r="3" fill="#b026ff" />
                </svg>
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
                <span>1</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>N=40</span>
              </div>
            </motion.div>

            {/* Space Complexity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-slate-800 bg-surface-dark-matte p-5 shadow-lg relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-neon-cyan">storage</span>
              </div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-slate-100 text-lg font-bold">Space Complexity Analysis</h3>
                  <p className="text-slate-400 text-xs">Heap vs Memory Urgency Profile</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-neon-cyan font-bold">
                    <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_5px_#00f2ff]" />
                    Urgent Memory
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-cyber-purple font-bold">
                    <span className="w-2 h-2 rounded-full bg-cyber-purple shadow-[0_0_5px_#b026ff]" />
                    Standard Heap
                  </div>
                </div>
              </div>
              
              <div className="h-[200px] w-full relative z-10">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 200">
                  <line x1="0" y1="199" x2="400" y2="199" stroke="#1e293b" strokeWidth="1" />
                  <line x1="0" y1="0" x2="0" y2="200" stroke="#1e293b" strokeWidth="1" />
                  
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b026ff" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#b026ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Standard memory area */}
                  <path d="M0,200 L400,120 V200 H0 Z" fill="url(#purpleGradient)" />
                  <line x1="0" y1="200" x2="400" y2="120" stroke="#b026ff" strokeWidth="2" className="drop-shadow-[0_0_6px_rgba(176,38,255,0.6)]" />
                  
                  {/* Urgent memory area */}
                  <path d="M0,200 L400,50 V200 H0 Z" fill="url(#primaryGradient)" />
                  <line x1="0" y1="200" x2="400" y2="50" stroke="#00f2ff" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]" />
                  
                  {/* Animated indicator */}
                  <circle cx="200" cy="125" r="3" fill="#00f2ff" opacity="0.5" className="animate-ping" />
                  <circle cx="200" cy="125" r="3" fill="#00f2ff" />
                </svg>
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
                <span>10</span>
                <span>100</span>
                <span>1k</span>
                <span>10k</span>
                <span>100k</span>
              </div>
            </motion.div>
          </div>

          {/* Complexity Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: 'Worst Case', value: 'O(2^n)', type: 'time', status: 'critical', description: 'Exponential growth detected' },
              { label: 'Average Case', value: 'O(N)', type: 'time', status: 'warning', description: 'Linear scaling' },
              { label: 'Best Case', value: 'O(log n)', type: 'time', status: 'optimal', description: 'Logarithmic efficiency' },
              { label: 'Space', value: 'O(N)', type: 'space', status: 'warning', description: 'Linear memory usage' },
              { label: 'Auxiliary', value: 'O(1)', type: 'space', status: 'optimal', description: 'Constant extra space' },
              { label: 'Amortized', value: 'O(1)*', type: 'time', status: 'optimal', description: 'Amortized constant' },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                className={`rounded-xl bg-surface-dark-matte border p-4 flex flex-col items-center justify-center gap-1 relative overflow-hidden group cursor-pointer ${
                  metric.status === 'critical' 
                    ? 'neon-border-red' 
                    : metric.status === 'warning'
                    ? 'neon-border-orange'
                    : 'neon-border-green'
                }`}
                onClick={() => setSelectedMetric(metric.type)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  metric.status === 'critical' 
                    ? 'from-neon-red/10' 
                    : metric.status === 'warning'
                    ? 'from-neon-orange/10'
                    : 'from-neon-green/10'
                } to-transparent opacity-50`} />
                
                <p className={`text-xs font-bold uppercase tracking-wider z-10 ${
                  metric.status === 'critical' 
                    ? 'text-neon-red' 
                    : metric.status === 'warning'
                    ? 'text-neon-orange'
                    : 'text-neon-green'
                }`}>
                  {metric.label}
                </p>
                <p className={`text-2xl font-bold z-10 ${getComplexityClass(metric.value)}`}>
                  {metric.value}
                </p>
                <span className={`text-[9px] uppercase px-2 py-0.5 rounded border z-10 ${getStatusColor(metric.status)}`}>
                  {metric.status === 'critical' ? 'Critical' : metric.status === 'warning' ? 'Warning' : 'Optimal'}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Execution Log Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-slate-800 bg-surface-dark-matte overflow-hidden flex-1 min-h-[300px]"
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-surface-darker-matte">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-neon-orange">table_chart</span>
                Unified Execution Log
              </h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded text-xs text-slate-400 border border-slate-700">
                  <span className="size-2 rounded-full bg-cyber-purple" />
                  Standard Path
                  <span className="size-2 rounded-full bg-neon-orange ml-2" />
                  Urgent Path
                </div>
                <select 
                  value={selectedView}
                  onChange={(e) => setSelectedView(e.target.value as 'unified' | 'split')}
                  className="bg-slate-800 text-slate-300 text-xs border border-slate-700 rounded px-2 py-1 outline-none focus:border-neon-orange cursor-pointer"
                >
                  <option value="unified">Unified View</option>
                  <option value="split">Split View</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase border-b border-slate-800 bg-surface-darker-matte">
                    <th className="p-4 font-medium w-32">Input (Nodes)</th>
                    <th className="p-4 font-medium w-24">Depth</th>
                    <th className="p-4 font-medium w-32">Insert / Search</th>
                    <th className="p-4 font-medium w-32">Process Time</th>
                    <th className="p-4 font-medium w-32">Stack Overhead</th>
                    <th className="p-4 font-medium">Performance Load</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-800">
                  {executionData.map((row, i) => (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="p-4 text-white font-medium">{row.nodes}</td>
                      <td className="p-4 text-slate-400 font-mono">{row.depth}</td>
                      <td className="p-4 text-slate-400 font-mono">{row.insertSearch}</td>
                      <td className={`p-4 font-mono font-bold ${
                        row.color === 'neon-red' ? 'text-neon-red' : 
                        row.color === 'neon-orange' ? 'text-neon-orange' : 'text-neon-green'
                      }`}>
                        {row.processTime}
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{row.stackOverhead}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${row.percentage}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`h-full rounded-full shadow-[0_0_8px] ${
                                row.color === 'neon-red' ? 'bg-neon-red' : 
                                row.color === 'neon-orange' ? 'bg-neon-orange' : 'bg-neon-green'
                              }`}
                            />
                          </div>
                          <span className={`text-[10px] w-12 text-right font-bold ${
                            row.color === 'neon-red' ? 'text-neon-red' : 
                            row.color === 'neon-orange' ? 'text-neon-orange' : 'text-neon-green'
                          }`}>
                            {row.load}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>

        {/* Right Sidebar - AI Observer */}
        <aside className="w-80 border-l border-slate-800 bg-surface-darker-matte hidden xl:flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-neon-cyan">psychology</span>
              AI Observer
            </h3>
            <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f2ff] animate-pulse" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Live Insights
            </div>
            
            {/* Skew Detection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-dark-matte rounded-lg p-4 border border-cyber-purple/30 shadow-[0_0_10px_rgba(176,38,255,0.1)]"
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="material-symbols-outlined text-cyber-purple text-sm mt-0.5">balance</span>
                <h4 className="text-cyber-purple text-sm font-bold uppercase tracking-wide">Skew Detection</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Data distribution is heavily left-skewed. Tree height is suboptimal at <span className="text-cyber-purple font-mono">H = 40</span>. Rebalancing suggested.
              </p>
            </motion.div>
            
            {/* Exponential Growth Alert */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/80 rounded-lg p-4 border-l-4 border-neon-red shadow-[0_0_15px_rgba(255,42,77,0.1)]"
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="material-symbols-outlined text-neon-red text-sm mt-0.5">report</span>
                <h4 className="text-neon-red text-sm font-bold uppercase tracking-wide">Exponential Growth</h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Algorithm has degraded to <span className="text-neon-red font-mono">O(2^n)</span>. Processing N=35 will cause a timeout.
              </p>
            </motion.div>
            
            {/* Stack Usage Warning */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/80 rounded-lg p-4 border-l-4 border-neon-orange"
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="material-symbols-outlined text-neon-orange text-sm mt-0.5">warning</span>
                <h4 className="text-neon-orange text-sm font-bold uppercase tracking-wide">Stack Usage</h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Recursion depth increasing linearly <span className="text-neon-orange font-mono">O(N)</span>. Risk of stack overflow for N &gt; 5000.
              </p>
              <button className="mt-3 text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded transition-colors w-full">
                Optimize Stack
              </button>
            </motion.div>
            
            {/* Live Trace */}
            <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-800 mt-2">
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-3">Live Trace</h4>
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between text-slate-300">
                  <span>&gt; recurse(30)</span>
                  <span className="text-neon-red animate-pulse">Processing...</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>&gt; insert(node_29)</span>
                  <span className="text-cyber-purple">Allocated</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>&gt; recurse(29)</span>
                  <span>Done</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Optimization CTA */}
          <div className="p-4 border-t border-slate-800">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-neon-cyan/5" />
              <p className="text-neon-cyan text-xs font-medium mb-2 relative z-10">Optimization Available</p>
              <button 
                onClick={runStressTest}
                className="w-full bg-neon-cyan text-black font-bold text-xs py-2 rounded hover:bg-cyan-300 transition-colors shadow-[0_0_10px_rgba(0,242,255,0.5)] relative z-10"
              >
                Auto-Optimize Code
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Optimization Modal */}
      <AnimatePresence>
        {showOptimizationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
            onClick={() => setShowOptimizationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-darker border border-slate-800 rounded-xl p-6 w-96 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-2">Optimization Level</h3>
              <p className="text-sm text-slate-400 mb-4">
                Select optimization intensity for your algorithm.
              </p>
              
              <div className="space-y-3 mb-6">
                {[
                  { level: 'standard', label: 'Standard', description: 'Basic optimizations, safe for production', color: 'neon-green' },
                  { level: 'aggressive', label: 'Aggressive', description: 'Major refactoring, may change behavior', color: 'neon-orange' },
                  { level: 'extreme', label: 'Extreme', description: 'Complete rewrite, maximum performance', color: 'neon-red' },
                ].map((opt) => (
                  <label
                    key={opt.level}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      optimizationLevel === opt.level
                        ? `border-${opt.color} bg-${opt.color}/10`
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="optimization"
                      value={opt.level}
                      checked={optimizationLevel === opt.level}
                      onChange={() => setOptimizationLevel(opt.level as any)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className={`font-bold text-sm ${
                        optimizationLevel === opt.level ? `text-${opt.color}` : 'text-white'
                      }`}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-slate-400">{opt.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOptimizationModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyOptimization}
                  className="flex-1 px-4 py-2 bg-neon-cyan rounded-lg text-black font-bold hover:bg-cyan-300 transition-colors"
                >
                  Apply Optimization
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 242, 255, 0.5);
          border-radius: 4px;
        }
        .neon-border-red {
          border-color: rgba(255, 42, 77, 0.3);
          box-shadow: 0 0 20px rgba(255, 42, 77, 0.1);
        }
        .neon-border-orange {
          border-color: rgba(255, 159, 10, 0.3);
          box-shadow: 0 0 20px rgba(255, 159, 10, 0.1);
        }
        .neon-border-green {
          border-color: rgba(74, 222, 128, 0.3);
          box-shadow: 0 0 20px rgba(74, 222, 128, 0.1);
        }
        .neon-text-red {
          text-shadow: 0 0 10px rgba(255, 42, 77, 0.5);
        }
        .neon-text-orange {
          text-shadow: 0 0 10px rgba(255, 159, 10, 0.5);
        }
        .neon-text-purple {
          text-shadow: 0 0 10px rgba(176, 38, 255, 0.5);
        }
        .neon-text-primary {
          text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
