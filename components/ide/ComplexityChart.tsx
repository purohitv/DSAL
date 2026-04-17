// components/ide/ComplexityChart.tsx
'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart, ReferenceLine } from 'recharts';
import { useSimulationStore } from '@/store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';

interface DataPoint {
  step: number;
  operations: number;
  memory: number;
  deltaOps?: number;
  deltaMem?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export default function ComplexityChart() {
  const { complexityData, currentStep } = useSimulationStore();
  const [chartType, setChartType] = useState<'lines' | 'areas' | 'comparison'>('lines');
  const [showDelta, setShowDelta] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Process and enhance data
  const processedData = useMemo(() => {
    if (complexityData.length === 0) return [];
    
    const data = complexityData
      .filter(d => d.step <= currentStep)
      .map((d, index, arr) => {
        const prev = arr[index - 1];
        return {
          ...d,
          deltaOps: prev ? d.operations - prev.operations : 0,
          deltaMem: prev ? d.memory - prev.memory : 0
        };
      });
    
    return data;
  }, [complexityData, currentStep]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (processedData.length === 0) return null;
    
    const ops = processedData.map(d => d.operations);
    const mem = processedData.map(d => d.memory);
    
    return {
      maxOps: Math.max(...ops),
      minOps: Math.min(...ops),
      avgOps: ops.reduce((a, b) => a + b, 0) / ops.length,
      maxMem: Math.max(...mem),
      minMem: Math.min(...mem),
      avgMem: mem.reduce((a, b) => a + b, 0) / mem.length,
      finalOps: ops[ops.length - 1],
      finalMem: mem[mem.length - 1],
      growthRate: ops.length > 1 ? (ops[ops.length - 1] - ops[0]) / ops[0] : 0
    };
  }, [processedData]);

  // Custom tooltip component
  const CustomTooltip = useCallback(({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;
    
    const data = payload[0].payload;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-darker/95 backdrop-blur-md border border-primary/30 rounded-lg p-2 shadow-2xl min-w-[160px]"
      >
        <div className="flex items-center gap-2 mb-2 pb-1 border-b border-white/10">
          <span className="text-[8px] font-black uppercase tracking-widest text-primary">Step</span>
          <span className="text-white font-mono font-bold text-xs">{label}</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[8px] text-text-secondary">Operations:</span>
            </div>
            <span className="text-white font-mono text-[10px] font-bold">
              {data.operations.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent-mint" />
              <span className="text-[8px] text-text-secondary">Memory:</span>
            </div>
            <span className="text-accent-mint font-mono text-[10px] font-bold">
              {data.memory.toLocaleString()} units
            </span>
          </div>
          
          {showDelta && (data.deltaOps !== 0 || data.deltaMem !== 0) && (
            <>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex justify-between items-center gap-3">
                <span className="text-[7px] text-text-secondary">Δ Operations:</span>
                <span className={`text-[8px] font-mono ${data.deltaOps > 0 ? 'text-orange-400' : data.deltaOps < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                  {data.deltaOps > 0 ? '+' : ''}{data.deltaOps}
                </span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-[7px] text-text-secondary">Δ Memory:</span>
                <span className={`text-[8px] font-mono ${data.deltaMem > 0 ? 'text-orange-400' : data.deltaMem < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                  {data.deltaMem > 0 ? '+' : ''}{data.deltaMem}
                </span>
              </div>
            </>
          )}
        </div>
        
        {/* Trend indicator */}
        {data.deltaOps > data.deltaMem * 2 && (
          <div className="mt-2 pt-1 border-t border-white/10">
            <span className="text-[6px] text-yellow-500 uppercase tracking-wider">⚠️ Performance spike</span>
          </div>
        )}
      </motion.div>
    );
  }, [showDelta]);

  // Custom legend content
  const renderLegend = useCallback((props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-4 mt-1">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[8px] text-text-secondary font-mono uppercase tracking-wider">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }, []);

  // Format Y-axis values
  const formatYAxis = useCallback((value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  }, []);

  // Determine chart type based on data size
  const getChartHeight = useCallback(() => {
    if (processedData.length > 100) return '80%';
    if (processedData.length > 50) return '90%';
    return '100%';
  }, [processedData.length]);

  if (complexityData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs p-4 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
        >
          <span className="material-symbols-outlined text-3xl mb-2 opacity-50">monitoring</span>
          <p className="text-[10px]">No complexity data available</p>
          <p className="text-[8px] mt-1 opacity-70">
            Use <code className="text-primary px-1 bg-primary/10 rounded">dsal.trace()</code> to track metrics
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117]">
      {/* Header Controls */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-white/10 bg-surface-darker/30">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">
              Complexity Analysis
            </span>
          </div>
          
          {/* Chart type selector */}
          <div className="flex gap-1 ml-3">
            {(['lines', 'areas', 'comparison'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase transition-all ${
                  chartType === type 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {type === 'lines' ? 'Lines' : type === 'areas' ? 'Areas' : 'Compare'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Delta toggle */}
          <button
            onClick={() => setShowDelta(!showDelta)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black transition-all ${
              showDelta 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[10px]">trending_up</span>
            Delta
          </button>
          
          {/* Stats summary */}
          {stats && (
            <div className="flex gap-2 text-[8px] font-mono">
              <div className="flex items-center gap-1">
                <span className="text-text-secondary">Max Ops:</span>
                <span className="text-primary font-bold">{stats.maxOps.toLocaleString()}</span>
              </div>
              <div className="w-px h-3 bg-white/20" />
              <div className="flex items-center gap-1">
                <span className="text-text-secondary">Max Mem:</span>
                <span className="text-accent-mint font-bold">{stats.maxMem.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="flex-1 min-h-0 w-full relative p-2" style={{ height: getChartHeight() }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={processedData} 
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            onMouseMove={(e) => {
              if (e.activeTooltipIndex !== undefined) {
                setHoveredPoint(processedData[e.activeTooltipIndex]?.step || null);
              }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="opsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7f13ec" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7f13ec" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#ffffff08" 
              vertical={false}
              horizontal={true}
            />
            
            <XAxis 
              dataKey="step" 
              stroke="#ffffff30" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => {
                if (processedData.length > 100 && val % Math.ceil(processedData.length / 20) !== 0) return '';
                return val;
              }}
              interval={0}
            />
            
            <YAxis 
              yAxisId="left"
              stroke="#7f13ec60" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={formatYAxis}
              domain={['auto', 'auto']}
            />
            
            <YAxis 
              yAxisId="right"
              orientation="right" 
              stroke="#00f0ff60" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={formatYAxis}
              domain={['auto', 'auto']}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} />
            <Legend content={renderLegend} verticalAlign="bottom" height={25} />
            
            {/* Reference line for average */}
            {stats && chartType === 'comparison' && (
              <>
                <ReferenceLine 
                  yAxisId="left"
                  y={stats.avgOps} 
                  stroke="#7f13ec40" 
                  strokeDasharray="3 3"
                  label={{ value: 'Avg Ops', position: 'right', fill: '#7f13ec80', fontSize: 8 }}
                />
                <ReferenceLine 
                  yAxisId="right"
                  y={stats.avgMem} 
                  stroke="#00f0ff40" 
                  strokeDasharray="3 3"
                  label={{ value: 'Avg Mem', position: 'right', fill: '#00f0ff80', fontSize: 8 }}
                />
              </>
            )}
            
            {/* Lines/Areas based on chart type */}
            {chartType === 'areas' ? (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="operations"
                  name="Operations"
                  stroke="#7f13ec"
                  strokeWidth={2}
                  fill="url(#opsGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#7f13ec', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="memory"
                  name="Memory"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  fill="url(#memGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#00f0ff', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </>
            ) : (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="operations"
                  name="Operations"
                  stroke="#7f13ec"
                  strokeWidth={2}
                  dot={processedData.length <= 50}
                  activeDot={{ r: 4, fill: '#7f13ec', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="memory"
                  name="Memory"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  dot={processedData.length <= 50}
                  activeDot={{ r: 4, fill: '#00f0ff', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </>
            )}
            
            {/* Delta lines for comparison mode */}
            {chartType === 'comparison' && showDelta && (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="deltaOps"
                  name="Δ Operations"
                  stroke="#ffaa00"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="deltaMem"
                  name="Δ Memory"
                  stroke="#ff66cc"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Current values indicator */}
      {processedData.length > 0 && (
        <div className="flex justify-between items-center px-3 py-1.5 border-t border-white/10 bg-surface-darker/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px] text-primary">play_arrow</span>
              <span className="text-[7px] text-text-secondary uppercase">Current</span>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[8px] font-mono text-white">
                  {stats?.finalOps.toLocaleString()} ops
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
                <span className="text-[8px] font-mono text-white">
                  {stats?.finalMem.toLocaleString()} mem
                </span>
              </div>
            </div>
          </div>
          
          {/* Growth indicator */}
          {stats && (
            <div className={`flex items-center gap-1 text-[7px] ${
              stats.growthRate > 1 ? 'text-orange-400' : stats.growthRate > 0.5 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              <span className="material-symbols-outlined text-[10px]">
                {stats.growthRate > 1 ? 'trending_up' : stats.growthRate > 0.5 ? 'trending_flat' : 'trending_down'}
              </span>
              <span className="font-mono">
                {stats.growthRate > 0 ? '+' : ''}{Math.round(stats.growthRate * 100)}% growth
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Animated indicator for current step */}
      <AnimatePresence>
        {hoveredPoint !== null && hoveredPoint !== currentStep && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-12 right-3 bg-primary/20 px-2 py-0.5 rounded text-[7px] font-mono text-primary border border-primary/30"
          >
            Viewing step {hoveredPoint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
