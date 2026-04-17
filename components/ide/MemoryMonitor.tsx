// components/ide/MemoryMonitor.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/store/useSimulationStore';

interface VariableHistory {
  step: number;
  value: any;
  timestamp: number;
}

interface VariableMetadata {
  type: string;
  size?: number;
  references?: number;
  lastChanged: number;
  firstSeen: number;
}

export default function MemoryMonitor() {
  const { callStack, variables, currentStep, steps } = useSimulationStore();
  const [expandedVar, setExpandedVar] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [autoScroll, setAutoScroll] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size'>('name');
  const variablesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new variable added
  useEffect(() => {
    if (autoScroll && variablesRef.current) {
      variablesRef.current.scrollTop = variablesRef.current.scrollHeight;
    }
  }, [variables, autoScroll]);

  // Get variable type with enhanced detection
  const getVariableType = useCallback((value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return `array[${value.length}]`;
    if (value instanceof Date) return 'date';
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return 'empty object';
      return `object (${keys.length} keys)`;
    }
    return typeof value;
  }, []);

  // Get color based on variable type
  const getVariableColor = useCallback((type: string): string => {
    const colors: Record<string, string> = {
      number: 'text-green-400',
      string: 'text-yellow-400',
      boolean: 'text-purple-400',
      array: 'text-cyan-400',
      object: 'text-orange-400',
      date: 'text-pink-400',
      null: 'text-gray-500',
      undefined: 'text-gray-500',
      'empty object': 'text-gray-500',
    };
    return colors[type.split('[')[0]] || 'text-blue-400';
  }, []);

  // Get variable icon
  const getVariableIcon = useCallback((type: string): string => {
    const icons: Record<string, string> = {
      number: '123',
      string: 'abc',
      boolean: 'toggle_on',
      array: 'view_list',
      object: 'data_object',
      date: 'calendar_today',
      null: 'block',
      undefined: 'help',
    };
    return icons[type.split('[')[0]] || 'data_usage';
  }, []);

  // Enhanced history tracking with timestamps
  const getVarHistory = useCallback((varName: string): VariableHistory[] => {
    const history: VariableHistory[] = [];
    steps.forEach((step, idx) => {
      if (idx >= currentStep) return;
      try {
        const stepVars = JSON.parse(step.variables || '{}');
        if (stepVars[varName] !== undefined) {
          history.push({ 
            step: idx + 1, 
            value: stepVars[varName],
            timestamp: Date.now()
          });
        }
      } catch (e) {}
    });
    return history;
  }, [steps, currentStep]);

  // Get variable metadata
  const getVariableMetadata = useCallback((name: string, value: any): VariableMetadata => {
    const type = getVariableType(value);
    let size: number | undefined;
    let references: number | undefined;
    
    if (type.startsWith('array')) {
      size = value.length;
    } else if (type.startsWith('object') && !type.includes('empty')) {
      size = Object.keys(value).length;
    }
    
    // Count references in call stack
    references = callStack.filter(frame => frame.includes(name)).length;
    
    const history = getVarHistory(name);
    const firstSeen = history[0]?.step || currentStep;
    const lastChanged = history[history.length - 1]?.step || currentStep;
    
    return { type, size, references, firstSeen, lastChanged };
  }, [callStack, getVariableType, getVarHistory, currentStep]);

  // Enhanced sparkline with better visualization
  const renderSparkline = useCallback((varName: string) => {
    const history = getVarHistory(varName);
    if (history.length < 2) return null;

    // Filter to numeric values for sparkline
    const numericHistory = history.filter(h => typeof h.value === 'number');
    if (numericHistory.length < 2) return null;

    const min = Math.min(...numericHistory.map(h => h.value));
    const max = Math.max(...numericHistory.map(h => h.value));
    const range = max - min || 1;

    return (
      <div className="h-20 w-full bg-black/20 rounded-lg border border-white/10 flex items-end p-1 gap-0.5 relative overflow-hidden group">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent-mint/5 to-transparent pointer-events-none" />
        
        {/* Value labels on hover */}
        <div className="absolute inset-x-0 bottom-full mb-1 flex justify-between text-[7px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-1">
          <span>min: {Math.round(min)}</span>
          <span>max: {Math.round(max)}</span>
        </div>
        
        {numericHistory.slice(-40).map((h, i) => {
          const height = ((h.value - min) / range) * 100;
          const isLatest = i === numericHistory.length - 1;
          
          return (
            <motion.div 
              key={i} 
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.002, type: 'spring', stiffness: 300 }}
              className={`flex-1 rounded-t-sm transition-all relative cursor-pointer ${
                isLatest 
                  ? 'bg-gradient-to-t from-accent-mint to-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' 
                  : 'bg-accent-mint/40 hover:bg-accent-mint/60'
              }`}
              title={`Step ${h.step}: ${h.value}`}
            >
              {isLatest && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_4px_white]" />
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }, [getVarHistory]);

  // Format value for display
  const formatValue = useCallback((value: any, maxLength: number = 50): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') {
      if (value.length > maxLength) return `"${value.substring(0, maxLength - 3)}..."`;
      return `"${value}"`;
    }
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return value.toString();
      return value.toFixed(4);
    }
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) {
      if (value.length > 10) return `[${value.slice(0, 10).map(v => formatValue(v, 20)).join(', ')}, ...] (${value.length})`;
      return `[${value.map(v => formatValue(v, 20)).join(', ')}]`;
    }
    if (typeof value === 'object') {
      if (value instanceof Date) return value.toLocaleString();
      const keys = Object.keys(value);
      if (keys.length > 5) return `{${keys.slice(0, 5).join(', ')}, ...} (${keys.length})`;
      if (keys.length === 0) return '{}';
      return JSON.stringify(value, null, 0);
    }
    return String(value);
  }, []);

  // Filter and sort variables
  const filteredVariables = useMemo(() => {
    let entries = Object.entries(variables);
    
    // Apply search filter
    if (searchTerm) {
      entries = entries.filter(([name, value]) => 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatValue(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      entries = entries.filter(([, value]) => {
        const type = getVariableType(value);
        return type === filterType || type.startsWith(filterType);
      });
    }
    
    // Apply sorting
    entries.sort(([aName, aValue], [bName, bValue]) => {
      if (sortBy === 'name') return aName.localeCompare(bName);
      if (sortBy === 'type') return getVariableType(aValue).localeCompare(getVariableType(bValue));
      if (sortBy === 'size') {
        const aSize = Array.isArray(aValue) ? aValue.length : Object.keys(aValue).length;
        const bSize = Array.isArray(bValue) ? bValue.length : Object.keys(bValue).length;
        return bSize - aSize;
      }
      return 0;
    });
    
    return entries;
  }, [variables, searchTerm, filterType, sortBy, getVariableType, formatValue]);

  // Get unique variable types for filter
  const variableTypes = useMemo(() => {
    const types = new Set<string>();
    Object.values(variables).forEach(value => {
      const type = getVariableType(value);
      types.add(type.split('[')[0]); // Remove array/object size info
    });
    return ['all', ...Array.from(types)];
  }, [variables, getVariableType]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You can add a toast notification here
      console.log(`Copied ${label} to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Get stats summary
  const stats = useMemo(() => {
    const totalVars = Object.keys(variables).length;
    const totalMemory = Object.values(variables).reduce((acc, val) => {
      if (typeof val === 'string') return acc + val.length;
      if (Array.isArray(val)) return acc + val.length;
      if (typeof val === 'object') return acc + Object.keys(val).length;
      return acc + 1;
    }, 0);
    return { totalVars, totalMemory };
  }, [variables]);

  return (
    <div className="flex-1 overflow-hidden bg-[#0d1117] h-full flex flex-col">
      {/* Header with controls */}
      <div className="px-3 py-2 bg-surface-darker/90 border-b border-white/10 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">memory</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Memory Monitor</span>
            <div className="flex items-center gap-1 ml-2 text-[8px] text-text-secondary">
              <span className="material-symbols-outlined text-[10px]">storage</span>
              <span>{stats.totalMemory} entries</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/20 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white focus:border-primary/50 focus:outline-none cursor-pointer"
            >
              <option value="name">Sort: Name</option>
              <option value="type">Sort: Type</option>
              <option value="size">Sort: Size</option>
            </select>
            
            {/* View mode toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="p-1 rounded hover:bg-white/5 transition-colors"
              title={viewMode === 'table' ? 'Card View' : 'Table View'}
            >
              <span className="material-symbols-outlined text-xs text-text-secondary">
                {viewMode === 'table' ? 'grid_view' : 'table_rows'}
              </span>
            </button>
            
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-1 rounded transition-colors ${autoScroll ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
              title={autoScroll ? 'Auto-scroll On' : 'Auto-scroll Off'}
            >
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
            </button>
          </div>
        </div>
        
        {/* Search and filter bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined text-[14px] absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search variables by name or value..."
              className="w-full bg-black/20 border border-white/10 rounded px-7 py-1 text-[11px] text-white placeholder-text-secondary/50 focus:border-primary/50 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <span className="material-symbols-outlined text-[12px] text-text-secondary hover:text-white">
                  close
                </span>
              </button>
            )}
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black/20 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-primary/50 focus:outline-none cursor-pointer"
          >
            {variableTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Call Stack Section */}
      <div className="flex-1 max-h-[35%] flex flex-col border-b border-white/10">
        <div className="px-3 py-1.5 bg-surface-darker/50 text-[9px] uppercase text-primary font-black tracking-widest flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">layers</span>
            <span>Call Stack</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40 font-mono text-[8px]">{callStack.length} Frames</span>
            {callStack.length > 0 && (
              <button
                onClick={() => setExpandedVar(null)}
                className="text-[8px] text-text-secondary hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {callStack.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-mono text-gray-600 text-center py-8 italic"
              >
                <span className="material-symbols-outlined text-2xl mb-2 opacity-30">layers_clear</span>
                <div>Stack Empty</div>
              </motion.div>
            ) : (
              callStack.map((call, i) => (
                <motion.div 
                  key={`${call}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group flex items-center justify-between p-2 rounded-lg transition-all ${
                    i === 0 
                    ? 'bg-primary/10 border-l-2 border-primary shadow-[0_0_15px_rgba(127,19,236,0.1)]' 
                    : 'bg-white/5 border-l-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {i === 0 && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="absolute -left-1 -top-1 w-2 h-2 bg-primary rounded-full"
                        />
                      )}
                      <span className={`font-mono text-[11px] ${i === 0 ? 'text-white font-bold' : 'text-gray-400'}`}>
                        {call}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-white/20">#{callStack.length - i}</span>
                    <button
                      onClick={() => copyToClipboard(call, 'function name')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[10px] text-text-secondary hover:text-white">
                        content_copy
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Variables Section */}
      <div className="flex-1 min-h-[0] flex flex-col">
        <div className="px-3 py-1.5 bg-surface-darker/50 text-[9px] uppercase text-accent-mint font-black tracking-widest flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">data_object</span>
            <span>Variables</span>
          </div>
          <span className="text-white/40 font-mono text-[8px]">
            {filteredVariables.length} / {Object.keys(variables).length} Vars
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar" ref={variablesRef}>
          {viewMode === 'table' ? (
            <table className="w-full text-left border-separate border-spacing-y-1">
              <thead className="text-[8px] uppercase text-gray-500 font-bold sticky top-0 bg-[#0d1117] z-10">
                <tr>
                  <th className="px-2 py-1">Identifier</th>
                  <th className="px-2 py-1">Type</th>
                  <th className="px-2 py-1">Value</th>
                  <th className="px-2 py-1 w-8"></th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-mono">
                <AnimatePresence mode="popLayout">
                  {filteredVariables.map(([name, value]) => {
                    const type = getVariableType(value);
                    const metadata = getVariableMetadata(name, value);
                    const isExpanded = expandedVar === name;
                    const icon = getVariableIcon(type);
                    const color = getVariableColor(type);
                    
                    return (
                      <React.Fragment key={name}>
                        <motion.tr 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          onClick={() => setExpandedVar(isExpanded ? null : name)}
                          className={`cursor-pointer transition-colors group ${
                            isExpanded ? 'bg-accent-mint/10' : 'hover:bg-white/5'
                          }`}
                        >
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] opacity-60">
                                {icon}
                              </span>
                              <span className={`font-bold ${color}`}>
                                {name}
                              </span>
                              {metadata.references && metadata.references > 0 && (
                                <span className="text-[8px] bg-primary/20 px-1 rounded text-primary">
                                  refs: {metadata.references}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <span className="text-[9px] text-text-secondary font-mono">
                              {type}
                              {metadata.size !== undefined && (
                                <span className="ml-1 opacity-50">({metadata.size})</span>
                              )}
                            </span>
                          </td>
                          <td className="px-2 py-2">
                            <code className="text-white bg-black/30 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono max-w-[200px] overflow-hidden text-ellipsis block">
                              {formatValue(value, 30)}
                            </code>
                          </td>
                          <td className="px-2 py-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(formatValue(value), 'variable value');
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="material-symbols-outlined text-[12px] text-text-secondary hover:text-white">
                                content_copy
                              </span>
                            </button>
                          </td>
                        </motion.tr>
                        
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td colSpan={4} className="px-4 py-3 bg-black/30 rounded-lg">
                              <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center text-[8px] text-gray-500 uppercase font-bold">
                                  <span>Value History Timeline</span>
                                  <span className="text-accent-mint">
                                    {getVarHistory(name).length} points tracked
                                  </span>
                                </div>
                                {renderSparkline(name) || (
                                  <div className="h-20 w-full bg-black/20 rounded-lg border border-white/10 flex items-center justify-center text-[9px] text-gray-600 italic">
                                    No numeric history available
                                  </div>
                                )}
                                
                                {/* Quick stats */}
                                <div className="flex gap-3 text-[8px] flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <span className="text-text-secondary">First seen:</span>
                                    <span className="text-white font-mono">
                                      Step {metadata.firstSeen}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-text-secondary">Last updated:</span>
                                    <span className="text-white font-mono">
                                      Step {metadata.lastChanged}
                                    </span>
                                  </div>
                                  {metadata.size !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-text-secondary">Size:</span>
                                      <span className="text-white font-mono">
                                        {metadata.size} {type.includes('array') ? 'elements' : 'properties'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                             </td>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            // Card view
            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence mode="popLayout">
                {filteredVariables.map(([name, value]) => {
                  const type = getVariableType(value);
                  const metadata = getVariableMetadata(name, value);
                  const icon = getVariableIcon(type);
                  const color = getVariableColor(type);
                  
                  return (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setExpandedVar(expandedVar === name ? null : name)}
                      className={`bg-black/20 border rounded-lg p-2 cursor-pointer transition-all hover:bg-black/30 ${
                        expandedVar === name ? 'border-accent-mint/50' : 'border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] opacity-60">
                            {icon}
                          </span>
                          <span className={`font-bold text-xs ${color}`}>
                            {name}
                          </span>
                        </div>
                        <span className="text-[8px] text-text-secondary">{type.split('[')[0]}</span>
                      </div>
                      <code className="text-white text-[9px] font-mono break-all block mb-1">
                        {formatValue(value, 40)}
                      </code>
                      {metadata.size !== undefined && (
                        <div className="text-[7px] text-text-secondary mt-1">
                          size: {metadata.size}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
          
          {filteredVariables.length === 0 && (
            <div className="text-[10px] font-mono text-gray-600 text-center py-12 italic">
              <span className="material-symbols-outlined text-3xl mb-2 opacity-30">data_usage</span>
              <div>{searchTerm ? 'No matching variables' : 'No active variables'}</div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-primary text-[8px] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(127, 19, 236, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(127, 19, 236, 0.8);
        }
      `}</style>
    </div>
  );
}
