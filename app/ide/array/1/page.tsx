// app/ide/array/1/page.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Search, Play, RefreshCw,
  ArrowRight, Terminal, Layers, Eye, Info,
  AlertCircle, CheckCircle, ChevronRight, Zap,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import IDELayout from '@/components/ide/Layout';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useSimulationStore } from '@/store/useSimulationStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_SIZE = 10;
const CELL_W = 64;
const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// ─── Enhanced C++ code snippet with better comments ─────────────────────────
const CODE_SNIPPET = `/**
 * Array Implementation in C++
 * Dynamic array operations with bounds checking
 * 
 * Time Complexities:
 * - Insert: O(n) - requires shifting elements
 * - Delete: O(n) - requires shifting elements  
 * - Search: O(n) - linear scan
 * - Access: O(1) - direct indexing
 */

#include <iostream>
using namespace std;

#define MAX 10
int arr[MAX];
int size = 0;

/**
 * Insert element at specified index
 * @param idx Insertion position (0-based)
 * @param val Value to insert
 */
void insert(int idx, int val) {
    if (size >= MAX) {
        cout << "Array Overflow\\n";
        return;
    }
    
    if (idx < 0 || idx > size) {
        cout << "Invalid index\\n";
        return;
    }
    
    // Shift elements to the right
    for (int i = size; i > idx; i--) {
        arr[i] = arr[i - 1];
    }
    
    arr[idx] = val;
    size++;
    cout << "Inserted " << val << " at index " << idx << "\\n";
}

/**
 * Delete element at specified index
 * @param idx Position to delete
 */
void deleteAt(int idx) {
    if (size == 0) {
        cout << "Array is empty\\n";
        return;
    }
    
    if (idx < 0 || idx >= size) {
        cout << "Index out of range\\n";
        return;
    }
    
    int val = arr[idx];
    
    // Shift elements to the left
    for (int i = idx; i < size - 1; i++) {
        arr[i] = arr[i + 1];
    }
    
    size--;
    cout << "Deleted " << val << " from index " << idx << "\\n";
}

/**
 * Linear search for value
 * @param val Value to find
 * @return Index of value or -1 if not found
 */
int search(int val) {
    for (int i = 0; i < size; i++) {
        if (arr[i] == val) {
            return i;
        }
    }
    return -1;
}

/**
 * Traverse and display array elements
 */
void traverse() {
    for (int i = 0; i < size; i++) {
        cout << arr[i] << " ";
    }
    cout << "\\n";
}

/**
 * Get element at index (O(1) access)
 */
int get(int idx) {
    if (idx < 0 || idx >= size) {
        cout << "Index out of range\\n";
        return -1;
    }
    return arr[idx];
}
`;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

type LogEntry = { 
  id: string;
  text: string; 
  type: 'info' | 'success' | 'error' | 'warning' | 'dim';
  timestamp: Date;
};

type VarEntry = { 
  name: string; 
  value: string | number; 
  type: string;
  isNew?: boolean;
};

type CallStackFrame = {
  name: string;
  line: number;
  params?: Record<string, any>;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ArrayVisualization() {
  const [arr, setArr] = useState<(number | null)[]>(Array(MAX_SIZE).fill(null));
  const [size, setSize] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [shiftRange, setShiftRange] = useState<number[]>([]);
  const [foundIdx, setFoundIdx] = useState<number | null>(null);
  const [highlightedIdx, setHighlightedIdx] = useState<number | null>(null);

  const [valInput, setValInput] = useState('');
  const [idxInput, setIdxInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [terminal, setTerminal] = useState<LogEntry[]>([]);
  const [callStack, setCallStack] = useState<CallStackFrame[]>([]);
  const [variables, setVariables] = useState<VarEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);
  const termEndRef = useRef<HTMLDivElement>(null);
  const operationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();

  // Initialize store
  useEffect(() => {
    setUserCode(CODE_SNIPPET);
    setPlaygroundLanguage('cpp');
  }, [setUserCode, setPlaygroundLanguage]);

  // Auto-scroll terminal
  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminal]);

  // Monaco line highlighting
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    
    if (activeLine !== null) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], [{
        range: new monaco.Range(activeLine, 1, activeLine, 1),
        options: { 
          isWholeLine: true, 
          className: 'active-line-highlight',
          glyphMarginClassName: 'line-highlight-glyph'
        },
      }]);
      editor.revealLineInCenter(activeLine);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], []);
    }
  }, [activeLine]);

  // Progress animation for operations
  useEffect(() => {
    if (isAnimating && currentOperation) {
      operationIntervalRef.current = setInterval(() => {
        setOperationProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 5;
        });
      }, 50);
    } else {
      if (operationIntervalRef.current) {
        clearInterval(operationIntervalRef.current);
      }
      setOperationProgress(0);
    }
    
    return () => {
      if (operationIntervalRef.current) {
        clearInterval(operationIntervalRef.current);
      }
    };
  }, [isAnimating, currentOperation]);

  // Logging helper
  const log = useCallback((text: string, type: LogEntry['type'] = 'info') => {
    setTerminal(prev => [...prev, { 
      id: Date.now().toString() + Math.random(), 
      text, 
      type, 
      timestamp: new Date() 
    }]);
  }, []);

  // Reset animation state
  const resetAnim = useCallback(() => {
    setActiveIdx(null);
    setShiftRange([]);
    setFoundIdx(null);
    setHighlightedIdx(null);
    setActiveLine(null);
    setCallStack([]);
    setVariables([]);
    setCurrentOperation(null);
  }, []);

  // Clear terminal
  const clearTerminal = useCallback(() => {
    setTerminal([]);
    log('Terminal cleared', 'info');
  }, [log]);

  // Get complexity color
  const getComplexityColor = useCallback((complexity: string) => {
    switch (complexity) {
      case 'O(1)': return 'text-green-400';
      case 'O(n)': return 'text-yellow-400';
      case 'O(n²)': return 'text-red-400';
      default: return 'text-blue-400';
    }
  }, []);

  // ─── INSERT OPERATION ──────────────────────────────────────────────────────
  const handleInsert = useCallback(async () => {
    if (isAnimating) return;
    
    const val = parseInt(valInput);
    const idx = idxInput === '' ? size : parseInt(idxInput);
    
    if (isNaN(val)) { 
      log('Please enter a valid numeric value.', 'error'); 
      return; 
    }
    if (isNaN(idx) || idx < 0 || idx > size) { 
      log(`Index must be between 0 and ${size}.`, 'error'); 
      return; 
    }

    setIsAnimating(true);
    setCurrentOperation('insert');
    setValInput('');
    setIdxInput('');

    // Step 1: Function call
    setCallStack([{ name: `insert(${idx}, ${val})`, line: 29, params: { idx, val } }]);
    setActiveLine(29);
    setVariables([
      { name: 'idx', value: idx, type: 'int', isNew: true },
      { name: 'val', value: val, type: 'int', isNew: true },
      { name: 'size', value: size, type: 'int' }
    ]);
    log(`Calling insert(${idx}, ${val})...`, 'info');
    await sleep(ANIMATION_DURATION.NORMAL);

    // Step 2: Overflow check
    if (size >= MAX_SIZE) {
      setActiveLine(31);
      log('❌ Array Overflow! Cannot insert more elements.', 'error');
      await sleep(ANIMATION_DURATION.SLOW);
      resetAnim();
      setIsAnimating(false);
      return;
    }

    // Step 3: Shift elements
    if (idx < size) {
      setActiveLine(38);
      log(`Shifting elements from index ${size - 1} down to ${idx}...`, 'info');
      
      for (let i = size; i > idx; i--) {
        setShiftRange([i - 1]);
        setActiveIdx(i);
        setArr(prev => {
          const next = [...prev];
          next[i] = next[i - 1];
          return next;
        });
        setVariables([
          { name: 'i', value: i, type: 'int', isNew: true },
          { name: `arr[${i}]`, value: arr[i - 1] ?? 'null', type: 'int' }
        ]);
        await sleep(ANIMATION_DURATION.FAST);
      }
      setShiftRange([]);
    }

    // Step 4: Insert value
    setActiveLine(42);
    setArr(prev => { 
      const next = [...prev]; 
      next[idx] = val; 
      return next; 
    });
    setActiveIdx(idx);
    setHighlightedIdx(idx);
    log(`✓ Inserted ${val} at index ${idx}`, 'success');
    setVariables([{ name: `arr[${idx}]`, value: val, type: 'int', isNew: true }]);
    await sleep(ANIMATION_DURATION.NORMAL);

    // Step 5: Update size
    setActiveLine(43);
    setSize(s => s + 1);
    setVariables(prev => [...prev, { name: 'size', value: size + 1, type: 'int', isNew: true }]);
    await sleep(ANIMATION_DURATION.FAST);

    // Step 6: Return
    setActiveLine(44);
    log(`Insert operation completed. New size: ${size + 1}`, 'success');
    await sleep(ANIMATION_DURATION.NORMAL);

    resetAnim();
    setIsAnimating(false);
  }, [isAnimating, valInput, idxInput, size, arr, log, resetAnim]);

  // ─── DELETE OPERATION ──────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (isAnimating) return;
    
    const idx = parseInt(idxInput);
    
    if (isNaN(idx)) {
      log('Please enter a valid index to delete.', 'error');
      return;
    }
    if (size === 0) {
      log('Array is empty. Nothing to delete.', 'error');
      return;
    }
    if (idx < 0 || idx >= size) {
      log(`Index must be between 0 and ${size - 1}.`, 'error');
      return;
    }

    setIsAnimating(true);
    setCurrentOperation('delete');
    setIdxInput('');

    // Step 1: Function call
    setCallStack([{ name: `deleteAt(${idx})`, line: 59, params: { idx } }]);
    setActiveLine(59);
    setVariables([
      { name: 'idx', value: idx, type: 'int', isNew: true },
      { name: 'size', value: size, type: 'int' }
    ]);
    log(`Calling deleteAt(${idx})...`, 'info');
    await sleep(ANIMATION_DURATION.NORMAL);

    // Step 2: Empty check
    if (size === 0) {
      setActiveLine(61);
      log('Array is empty!', 'error');
      await sleep(ANIMATION_DURATION.SLOW);
      resetAnim();
      setIsAnimating(false);
      return;
    }

    // Step 3: Out of range check
    if (idx < 0 || idx >= size) {
      setActiveLine(66);
      log('Index out of range!', 'error');
      await sleep(ANIMATION_DURATION.SLOW);
      resetAnim();
      setIsAnimating(false);
      return;
    }

    const removed = arr[idx];
    setActiveLine(71);
    setActiveIdx(idx);
    setHighlightedIdx(idx);
    setVariables([{ name: 'val', value: removed ?? '?', type: 'int', isNew: true }]);
    log(`Removing value ${removed} at index ${idx}...`, 'info');
    await sleep(ANIMATION_DURATION.NORMAL);

    // Step 4: Shift elements left
    setActiveLine(74);
    const newArr = [...arr];
    for (let i = idx; i < size - 1; i++) {
      setShiftRange([i + 1]);
      newArr[i] = newArr[i + 1];
      newArr[i + 1] = null;
      setArr([...newArr]);
      setVariables([
        { name: 'i', value: i, type: 'int' },
        { name: `arr[${i}]`, value: newArr[i] ?? 'null', type: 'int' }
      ]);
      await sleep(ANIMATION_DURATION.FAST);
    }

    setShiftRange([]);
    newArr[size - 1] = null;
    setArr([...newArr]);
    
    // Step 5: Update size
    setActiveLine(78);
    setSize(s => s - 1);
    log(`✓ Deleted ${removed} from index ${idx}`, 'success');
    setVariables(prev => [...prev, { name: 'size', value: size - 1, type: 'int', isNew: true }]);
    await sleep(ANIMATION_DURATION.NORMAL);

    resetAnim();
    setIsAnimating(false);
  }, [isAnimating, idxInput, size, arr, log, resetAnim]);

  // ─── SEARCH OPERATION ──────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (isAnimating) return;
    
    const val = parseInt(valInput);
    
    if (isNaN(val)) {
      log('Please enter a value to search for.', 'error');
      return;
    }

    setIsAnimating(true);
    setCurrentOperation('search');
    setValInput('');
    setSearchTerm(val.toString());

    // Step 1: Function call
    setCallStack([{ name: `search(${val})`, line: 89, params: { val } }]);
    setActiveLine(89);
    setVariables([{ name: 'val', value: val, type: 'int', isNew: true }]);
    log(`Searching for value ${val}...`, 'info');
    await sleep(ANIMATION_DURATION.NORMAL);

    let found = -1;
    
    // Step 2: Linear search
    setActiveLine(90);
    for (let i = 0; i < size; i++) {
      setActiveIdx(i);
      setActiveLine(91);
      setVariables([
        { name: 'i', value: i, type: 'int' },
        { name: `arr[${i}]`, value: arr[i] ?? 'null', type: 'int' }
      ]);
      await sleep(ANIMATION_DURATION.FAST);

      if (arr[i] === val) {
        found = i;
        setFoundIdx(i);
        setHighlightedIdx(i);
        setActiveLine(92);
        log(`✓ Found ${val} at index ${i}!`, 'success');
        await sleep(ANIMATION_DURATION.SLOW);
        break;
      }
    }

    // Step 3: Not found case
    if (found === -1) {
      setActiveLine(96);
      log(`✗ Value ${val} not found in array.`, 'error');
      await sleep(ANIMATION_DURATION.SLOW);
    }

    resetAnim();
    setIsAnimating(false);
  }, [isAnimating, valInput, size, arr, log, resetAnim]);

  // ─── TRAVERSE OPERATION ────────────────────────────────────────────────────
  const handleTraverse = useCallback(async () => {
    if (isAnimating) return;
    if (size === 0) {
      log('Array is empty. Nothing to traverse.', 'error');
      return;
    }

    setIsAnimating(true);
    setCurrentOperation('traverse');

    setCallStack([{ name: 'traverse()', line: 104 }]);
    setActiveLine(104);
    log('Traversing array elements...', 'info');
    await sleep(ANIMATION_DURATION.NORMAL);

    const values: string[] = [];
    
    setActiveLine(105);
    for (let i = 0; i < size; i++) {
      setActiveIdx(i);
      setVariables([
        { name: 'i', value: i, type: 'int' },
        { name: `arr[${i}]`, value: arr[i] ?? 'null', type: 'int' }
      ]);
      values.push(String(arr[i]));
      await sleep(ANIMATION_DURATION.FAST);
    }

    setActiveLine(108);
    log(`[ ${values.join(', ')} ]`, 'success');
    await sleep(ANIMATION_DURATION.NORMAL);

    resetAnim();
    setIsAnimating(false);
  }, [isAnimating, size, arr, log, resetAnim]);

  // ─── RESET OPERATION ───────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (isAnimating) return;
    setArr(Array(MAX_SIZE).fill(null));
    setSize(0);
    setValInput('');
    setIdxInput('');
    setSearchTerm('');
    resetAnim();
    log('Array reset to initial state', 'info');
  }, [isAnimating, resetAnim, log]);

  // ─── GET OPERATION (O(1) access) ──────────────────────────────────────────
  const handleGet = useCallback(async () => {
    if (isAnimating) return;
    
    const idx = parseInt(idxInput);
    
    if (isNaN(idx)) {
      log('Please enter a valid index to access.', 'error');
      return;
    }
    if (idx < 0 || idx >= size) {
      log(`Index ${idx} is out of range. Valid range: 0-${size - 1}`, 'error');
      return;
    }

    setIsAnimating(true);
    setCurrentOperation('get');
    
    setCallStack([{ name: `get(${idx})`, line: 117 }]);
    setActiveLine(117);
    setActiveIdx(idx);
    setHighlightedIdx(idx);
    
    const value = arr[idx];
    log(`✓ arr[${idx}] = ${value} (O(1) direct access)`, 'success');
    setVariables([{ name: `arr[${idx}]`, value: value ?? 'null', type: 'int', isNew: true }]);
    
    await sleep(ANIMATION_DURATION.NORMAL);
    resetAnim();
    setIsAnimating(false);
  }, [isAnimating, idxInput, size, arr, log, resetAnim]);

  // ─── Extra Controls ────────────────────────────────────────────────────────
  const controls = useMemo(() => (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Insert/Delete/Search Group */}
      <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-md overflow-hidden">
        <input
          type="number"
          value={valInput}
          onChange={e => setValInput(e.target.value)}
          placeholder="Value"
          disabled={isAnimating}
          className="w-20 bg-transparent text-xs text-white px-2 py-1.5 outline-none placeholder:text-gray-600"
          onKeyDown={e => e.key === 'Enter' && handleInsert()}
        />
        <div className="w-px h-4 bg-neutral-700" />
        <input
          type="number"
          value={idxInput}
          onChange={e => setIdxInput(e.target.value)}
          placeholder="Index"
          disabled={isAnimating}
          className="w-20 bg-transparent text-xs text-white px-2 py-1.5 outline-none placeholder:text-gray-600"
          onKeyDown={e => e.key === 'Enter' && handleInsert()}
        />
        <button
          onClick={handleInsert}
          disabled={isAnimating || valInput === ''}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-colors border-l border-neutral-800"
          title="Insert element (O(n))"
        >
          <Plus size={12} /> Insert
        </button>
      </div>
      
      <button 
        onClick={handleDelete} 
        disabled={isAnimating || idxInput === ''} 
        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white text-xs font-bold rounded-md border border-neutral-700 transition-colors"
        title="Delete element at index (O(n))"
      >
        <Trash2 size={12} /> Delete
      </button>
      
      <button 
        onClick={handleSearch} 
        disabled={isAnimating || valInput === ''} 
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold rounded-md border border-emerald-800 transition-colors"
        title="Linear search for value (O(n))"
      >
        <Search size={12} /> Search
      </button>
      
      <button 
        onClick={handleGet} 
        disabled={isAnimating || idxInput === '' || size === 0} 
        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white text-xs font-bold rounded-md border border-purple-800 transition-colors"
        title="Direct access by index (O(1))"
      >
        <Zap size={12} /> Get
      </button>
      
      <button 
        onClick={handleTraverse} 
        disabled={isAnimating || size === 0} 
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-bold rounded-md border border-amber-800 transition-colors"
        title="Traverse all elements (O(n))"
      >
        <ArrowRight size={12} /> Traverse
      </button>
      
      <div className="w-px h-5 bg-neutral-800" />
      
      {/* Reset Button */}
      <button 
        onClick={handleReset} 
        disabled={isAnimating} 
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 disabled:opacity-40 text-xs font-bold rounded-md border border-red-900/50 transition-colors"
        title="Reset array to empty state"
      >
        <RefreshCw size={12} /> Reset
      </button>
      
      {/* Help Button */}
      <button 
        onClick={() => setShowHelp(!showHelp)} 
        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white text-xs font-bold rounded-md border border-neutral-700 transition-colors"
        title="Show help"
      >
        <Info size={12} /> Help
      </button>
    </div>
  ), [valInput, idxInput, isAnimating, size, handleInsert, handleDelete, handleSearch, handleGet, handleTraverse, handleReset, showHelp]);

  // ─── Code Panel ───────────────────────────────────────────────────────────
  const codePanel = useMemo(() => (
    <div className="flex-1 overflow-hidden bg-[#0d1117] h-full relative">
      <style>{`
        .active-line-highlight { 
          background-color: rgba(59,130,246,0.25) !important;
          border-left: 3px solid #3b82f6 !important;
        }
        .line-highlight-glyph {
          background-color: #3b82f6;
          width: 2px !important;
        }
      `}</style>
      <Editor
        height="100%"
        defaultLanguage="cpp"
        theme="vs-dark"
        value={CODE_SNIPPET}
        options={{
          minimap: { enabled: false },
          fontSize: 11,
          readOnly: true,
          scrollBeyondLastLine: false,
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          padding: { top: 8, bottom: 8 },
          renderLineHighlight: 'none',
          fontFamily: 'JetBrains Mono, monospace',
        }}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
        }}
      />
    </div>
  ), []);

  // ─── Visualization Panel ──────────────────────────────────────────────────
  const vizPanel = useMemo(() => (
    <div className="flex flex-col h-full">
      {/* Complexity Badge */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] font-mono">
          <span className="text-gray-400">Insert: </span>
          <span className={getComplexityColor('O(n)')}>O(n)</span>
          <span className="text-gray-400 mx-1">|</span>
          <span className="text-gray-400">Search: </span>
          <span className={getComplexityColor('O(n)')}>O(n)</span>
          <span className="text-gray-400 mx-1">|</span>
          <span className="text-gray-400">Access: </span>
          <span className={getComplexityColor('O(1)')}>O(1)</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(90deg, #3b4354 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        {/* Info badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-gray-400 font-mono z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <span className="material-symbols-outlined text-base">memory</span>
          <span>MAX={MAX_SIZE} · size={size}</span>
          {isAnimating && (
            <div className="flex items-center gap-1 ml-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-[10px]">{currentOperation}</span>
            </div>
          )}
        </div>

        <TransformWrapper 
          initialScale={1} 
          minScale={0.3} 
          maxScale={4} 
          centerOnInit 
          wheel={{ step: 0.08 }}
          onZoom={(ref) => setZoomLevel(ref.state.scale)}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div className="flex flex-col items-center gap-6 relative z-10">

              {/* Index row */}
              <div className="flex gap-1">
                {Array.from({ length: MAX_SIZE }).map((_, i) => (
                  <div key={i} className="w-16 text-center text-[9px] font-mono text-gray-500">
                    {i}
                    {i === highlightedIdx && <span className="ml-1 text-primary">←</span>}
                  </div>
                ))}
              </div>

              {/* Cell row */}
              <div className="flex gap-1">
                {Array.from({ length: MAX_SIZE }).map((_, i) => {
                  const filled = arr[i] !== null;
                  const isActive = activeIdx === i;
                  const isFound = foundIdx === i;
                  const isShift = shiftRange.includes(i);
                  const isHighlighted = highlightedIdx === i;

                  let border = 'border-dashed border-gray-700/40';
                  let bg = 'bg-transparent';
                  let textCol = 'text-gray-700';
                  let shadow = '';

                  if (filled) { 
                    bg = 'bg-[#1c212c]'; 
                    border = 'border-[#3b4354]'; 
                    textCol = 'text-white'; 
                  }
                  if (isShift) { 
                    bg = 'bg-amber-500/20'; 
                    border = 'border-amber-500/60'; 
                    shadow = 'shadow-[0_0_10px_rgba(245,158,11,0.4)]'; 
                  }
                  if (isActive) { 
                    bg = 'bg-primary/20'; 
                    border = 'border-primary/70'; 
                    textCol = 'text-primary'; 
                    shadow = 'shadow-[0_0_14px_rgba(127,19,236,0.5)]'; 
                  }
                  if (isFound) { 
                    bg = 'bg-emerald-500/20'; 
                    border = 'border-emerald-400/70'; 
                    textCol = 'text-emerald-300'; 
                    shadow = 'shadow-[0_0_14px_rgba(52,211,153,0.5)]'; 
                  }
                  if (isHighlighted && !isActive && !isFound) {
                    bg = 'bg-blue-500/10';
                    border = 'border-blue-500/40';
                  }

                  return (
                    <motion.div
                      key={i}
                      layout
                      className={`w-16 h-12 border-2 rounded flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 relative ${bg} ${border} ${textCol} ${shadow}`}
                      initial={isHighlighted ? { scale: 0.95 } : {}}
                      animate={isHighlighted ? { scale: [0.95, 1.05, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <AnimatePresence mode="wait">
                        {arr[i] !== null ? (
                          <motion.span
                            key={arr[i]}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.2 }}
                            className="font-bold"
                          >
                            {arr[i]}
                          </motion.span>
                        ) : (
                          <span className="text-[10px] text-gray-600">∅</span>
                        )}
                      </AnimatePresence>

                      {/* Shift arrow overlay */}
                      {isShift && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-5 left-1/2 -translate-x-1/2"
                        >
                          <span className="material-symbols-outlined text-amber-400 text-base">arrow_downward</span>
                        </motion.div>
                      )}
                      
                      {/* Found indicator */}
                      {isFound && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-5 left-1/2 -translate-x-1/2"
                        >
                          <CheckCircle size={12} className="text-emerald-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Pointer arrow for active index */}
              {activeIdx !== null && (
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center"
                  style={{ marginLeft: `${activeIdx * (CELL_W + 4)}px`, position: 'relative', left: `${-(MAX_SIZE / 2 - 0.5) * (CELL_W + 4)}px` }}
                >
                  <span className="material-symbols-outlined text-primary text-lg">arrow_upward</span>
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 rounded border border-primary/30">
                    {currentOperation === 'search' ? 'current' : `i=${activeIdx}`}
                  </span>
                </motion.div>
              )}
            </div>
          </TransformComponent>
        </TransformWrapper>
        
        {/* Zoom indicator */}
        {zoomLevel !== 1 && (
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-[9px] text-gray-400">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        )}
      </div>
    </div>
  ), [arr, size, activeIdx, foundIdx, shiftRange, highlightedIdx, isAnimating, currentOperation, zoomLevel, getComplexityColor]);

  // ─── Terminal Panel ────────────────────────────────────────────────────────
  const terminalPanel = useMemo(() => ({
    title: 'Standard Output',
    subtitle: 'Live Stream',
    icon: 'terminal',
    extra: (
      <button
        onClick={clearTerminal}
        className="w-7 h-7 rounded bg-surface-darker border border-border-dark flex items-center justify-center text-text-secondary hover:text-white transition-colors"
        title="Clear terminal"
      >
        <span className="material-symbols-outlined text-sm">delete_sweep</span>
      </button>
    ),
    content: (
      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px] bg-[#0d1117] h-full flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar">
          {terminal.length === 0 ? (
            <div className="text-gray-600 italic text-center py-8">
              <Terminal size={24} className="mx-auto mb-2 opacity-30" />
              No output yet. Run an operation to see results.
            </div>
          ) : terminal.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-1.5 items-start ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'success' ? 'text-emerald-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                log.type === 'dim' ? 'text-gray-500' : 'text-gray-300'
              }`}
            >
              <span className="shrink-0 mt-0.5">
                {log.type === 'error' ? '✖' : 
                 log.type === 'success' ? '✔' : 
                 log.type === 'warning' ? '⚠' : '➜'}
              </span>
              <span className="flex-1">{log.text}</span>
              <span className="text-[8px] text-gray-600 shrink-0">
                {log.timestamp.toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
          <div ref={termEndRef} />
        </div>
        
        {/* Command input */}
        <div className="flex items-center gap-1.5 border-t border-[#3b4354] pt-2 mt-1">
          <span className="text-blue-500 font-bold">$</span>
          <div className="flex-1 relative">
            <input
              type="text"
              disabled={isAnimating}
              className="w-full bg-[#1c212c] border border-[#3b4354] rounded px-2 py-1 outline-none text-white font-mono text-[10px] placeholder:text-gray-600 focus:bg-[#282e39] focus:border-primary/50 transition-colors"
              placeholder="insert &lt;val&gt; [idx] | delete &lt;idx&gt; | search &lt;val&gt; | get &lt;idx&gt; | traverse | reset"
              onKeyDown={e => {
                if (e.key !== 'Enter') return;
                const input = e.currentTarget;
                const parts = input.value.trim().split(/\s+/);
                const cmd = parts[0]?.toLowerCase();
                
                if (cmd === 'insert' && parts[1]) {
                  setValInput(parts[1]);
                  if (parts[2]) setIdxInput(parts[2]);
                  setTimeout(handleInsert, 10);
                } else if (cmd === 'delete' && parts[1]) {
                  setIdxInput(parts[1]);
                  setTimeout(handleDelete, 10);
                } else if (cmd === 'search' && parts[1]) {
                  setValInput(parts[1]);
                  setTimeout(handleSearch, 10);
                } else if (cmd === 'get' && parts[1]) {
                  setIdxInput(parts[1]);
                  setTimeout(handleGet, 10);
                } else if (cmd === 'traverse') {
                  handleTraverse();
                } else if (cmd === 'reset') {
                  handleReset();
                } else if (cmd === 'clear') {
                  clearTerminal();
                } else if (cmd === 'help') {
                  log('Available commands: insert, delete, search, get, traverse, reset, clear', 'info');
                } else {
                  log(`Unknown command: ${cmd}. Type 'help' for available commands.`, 'error');
                }
                input.value = '';
              }}
            />
          </div>
          <button
            onClick={() => {
              const input = document.querySelector('.command-input') as HTMLInputElement;
              if (input) {
                const cmd = input.value.trim().split(/\s+/)[0]?.toLowerCase();
                if (cmd === 'help') {
                  log('Available commands: insert &lt;val&gt; [idx], delete &lt;idx&gt;, search &lt;val&gt;, get &lt;idx&gt;, traverse, reset, clear', 'info');
                }
                input.value = '';
              }
            }}
            className="px-2 py-1 bg-primary/20 hover:bg-primary/30 rounded text-primary text-[10px] font-bold transition-colors"
          >
            Help
          </button>
        </div>
      </div>
    ),
  }), [terminal, isAnimating, clearTerminal, handleInsert, handleDelete, handleSearch, handleGet, handleTraverse, handleReset, log]);

  // ─── Call Stack Panel ──────────────────────────────────────────────────────
  const callStackPanel = useMemo(() => ({
    title: 'Call Stack',
    subtitle: 'Execution Trace',
    icon: 'layers',
    content: (
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5 bg-[#1c212c] h-full custom-scrollbar">
        <AnimatePresence>
          {callStack.length === 0 ? (
            <div className="text-[9px] text-gray-500 italic text-center py-8">
              <Layers size={20} className="mx-auto mb-2 opacity-30" />
              Stack empty
            </div>
          ) : callStack.map((frame, i) => (
            <motion.div
              key={frame.name + frame.line}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center justify-between p-1.5 rounded ${i === 0 ? 'bg-[#282e39] border-l-2 border-primary' : 'opacity-60'}`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  {i === 0 && <ChevronRight size={10} className="text-primary" />}
                  <span className="font-mono text-[10px] text-white font-medium">{frame.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-400">Line {frame.line}</span>
                  {frame.params && Object.entries(frame.params).map(([k, v]) => (
                    <span key={k} className="text-[7px] bg-primary/20 px-1 rounded text-primary">
                      {k}={v}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    ),
  }), [callStack]);

  // ─── Variables Panel ───────────────────────────────────────────────────────
  const variablesPanel = useMemo(() => ({
    title: 'Variables',
    subtitle: 'Local Scope',
    icon: 'visibility',
    content: (
      <div className="flex-1 overflow-y-auto bg-[#1c212c] h-full custom-scrollbar">
        {variables.length === 0 ? (
          <div className="text-[9px] text-gray-500 italic text-center py-8">
            <Eye size={20} className="mx-auto mb-2 opacity-30" />
            No active variables
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#282e39] text-[9px] uppercase text-[#b0b8c9] font-semibold sticky top-0">
              <tr>
                <th className="px-2 py-1">Name</th>
                <th className="px-2 py-1">Value</th>
                <th className="px-2 py-1">Type</th>
              </tr>
            </thead>
            <tbody className="text-[10px] font-mono divide-y divide-[#3b4354]">
              <AnimatePresence>
                {variables.map(v => (
                  <motion.tr
                    key={v.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className={v.isNew ? 'bg-primary/5' : ''}
                  >
                    <td className="px-2 py-1 text-blue-300 font-medium">{v.name}</td>
                    <td className="px-2 py-1 text-white">
                      <motion.span
                        key={String(v.value)}
                        initial={v.isNew ? { scale: 1.2, color: '#60a5fa' } : {}}
                        animate={{ scale: 1, color: '#ffffff' }}
                        transition={{ duration: 0.3 }}
                        className="inline-block"
                      >
                        {v.value}
                      </motion.span>
                    </td>
                    <td className="px-2 py-1 text-[#9da6b9]">{v.type}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    ),
  }), [variables]);

  // ─── Help Modal ────────────────────────────────────────────────────────────
  const helpModal = useMemo(() => (
    <AnimatePresence>
      {showHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200]"
          onClick={() => setShowHelp(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-surface-darker border border-border-dark rounded-xl p-6 w-[500px] max-w-[90vw] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Info size={20} className="text-primary" />
              Array Operations Guide
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="border-b border-border-dark pb-3">
                <h4 className="font-bold text-primary mb-2">Operations & Complexity</h4>
                <div className="space-y-1 text-gray-300">
                  <div className="flex justify-between">
                    <span><span className="text-primary">Insert</span> at index</span>
                    <span className="font-mono text-yellow-400">O(n)</span>
                  </div>
                  <div className="flex justify-between">
                    <span><span className="text-primary">Delete</span> at index</span>
                    <span className="font-mono text-yellow-400">O(n)</span>
                  </div>
                  <div className="flex justify-between">
                    <span><span className="text-primary">Search</span> by value</span>
                    <span className="font-mono text-yellow-400">O(n)</span>
                  </div>
                  <div className="flex justify-between">
                    <span><span className="text-primary">Access</span> by index</span>
                    <span className="font-mono text-green-400">O(1)</span>
                  </div>
                  <div className="flex justify-between">
                    <span><span className="text-primary">Traverse</span> all elements</span>
                    <span className="font-mono text-yellow-400">O(n)</span>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-border-dark pb-3">
                <h4 className="font-bold text-primary mb-2">Commands</h4>
                <div className="space-y-1 text-gray-300 text-xs font-mono">
                  <div><span className="text-primary">insert</span> &lt;value&gt; [index] - Insert at end or specified index</div>
                  <div><span className="text-primary">delete</span> &lt;index&gt; - Delete element at index</div>
                  <div><span className="text-primary">search</span> &lt;value&gt; - Linear search for value</div>
                  <div><span className="text-primary">get</span> &lt;index&gt; - Direct O(1) access</div>
                  <div><span className="text-primary">traverse</span> - Display all elements</div>
                  <div><span className="text-primary">reset</span> - Clear the array</div>
                  <div><span className="text-primary">clear</span> - Clear terminal output</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-primary mb-2">Keyboard Shortcuts</h4>
                <div className="space-y-1 text-gray-300 text-xs">
                  <div>⌘/Ctrl + Enter - Execute current operation</div>
                  <div>↑/↓ - Navigate command history</div>
                  <div>Tab - Auto-complete commands</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full px-4 py-2 bg-primary rounded-lg text-white font-bold hover:bg-primary-dark transition-colors"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  ), [showHelp]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <IDELayout
        title="Array"
        category="Linear"
        showTimeline={false}
        extraControls={controls}
        operations={[
          { name: 'Insert', onClick: handleInsert, icon: <Plus size={14} /> },
          { name: 'Delete', onClick: handleDelete, icon: <Trash2 size={14} /> },
          { name: 'Search', onClick: handleSearch, icon: <Search size={14} /> },
          { name: 'Get', onClick: handleGet, icon: <Zap size={14} /> },
          { name: 'Traverse', onClick: handleTraverse, icon: <ArrowRight size={14} /> },
          { name: 'Reset', onClick: handleReset, icon: <RefreshCw size={14} /> },
        ]}
        leftPanel={{ title: 'Source View', subtitle: 'array.cpp', icon: 'code', content: codePanel }}
        centerPanel={{ title: 'Simulation Stage', subtitle: 'Array Memory Visualization', icon: 'science', content: vizPanel }}
        bottomPanel={terminalPanel}
        rightPanelTop={callStackPanel}
        rightPanelBottom={variablesPanel}
        isSaving={isAnimating}
      />
      {helpModal}
      
      <style jsx global>{`
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(127, 19, 236, 0.8);
        }
      `}</style>
    </>
  );
}
