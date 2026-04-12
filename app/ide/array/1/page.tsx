'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Search, Play, RefreshCw,
  ArrowRight, Terminal, Layers, Eye,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import IDELayout from '@/components/ide/Layout';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useSimulationStore } from '@/store/useSimulationStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_SIZE = 10;
const CELL_W   = 64; // px width of each cell for layout hints

// ─── C++ code snapshots shown in the left panel ───────────────────────────────
const CODE_SNIPPET = `#include <iostream>
using namespace std;

#define MAX 10
int arr[MAX];
int size = 0;

// Insert at index
void insert(int idx, int val) {
    if (size >= MAX) {
        cout << "Array Overflow\\n"; return;
    }
    for (int i = size; i > idx; i--)
        arr[i] = arr[i - 1];
    arr[idx] = val;
    size++;
    cout << "Inserted " << val
         << " at index " << idx << "\\n";
}

// Delete at index
void deleteAt(int idx) {
    if (idx < 0 || idx >= size) {
        cout << "Index out of range\\n"; return;
    }
    int val = arr[idx];
    for (int i = idx; i < size - 1; i++)
        arr[i] = arr[i + 1];
    size--;
    cout << "Deleted " << val
         << " from index " << idx << "\\n";
}

// Linear search
int search(int val) {
    for (int i = 0; i < size; i++)
        if (arr[i] == val) return i;
    return -1;
}

// Traverse
void traverse() {
    for (int i = 0; i < size; i++)
        cout << arr[i] << " ";
    cout << "\\n";
}
`;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

type LogEntry = { text: string; type: 'info' | 'success' | 'error' | 'dim' };
type VarEntry  = { name: string; value: string | number; type: string };

// ─── Component ────────────────────────────────────────────────────────────────
export default function ArrayVisualization() {
  const [arr, setArr]               = useState<(number | null)[]>(Array(MAX_SIZE).fill(null));
  const [size, setSize]             = useState(0);
  const [activeIdx, setActiveIdx]   = useState<number | null>(null);
  const [shiftRange, setShiftRange] = useState<number[]>([]);   // indices being shifted
  const [foundIdx, setFoundIdx]     = useState<number | null>(null);

  const [valInput, setValInput]   = useState('');
  const [idxInput, setIdxInput]   = useState('');

  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [terminal, setTerminal]     = useState<LogEntry[]>([]);
  const [callStack, setCallStack]   = useState<{ name: string; line: number }[]>([]);
  const [variables, setVariables]   = useState<VarEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const editorRef      = useRef<any>(null);
  const monacoRef      = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);
  const termEndRef     = useRef<HTMLDivElement>(null);

  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();

  useEffect(() => {
    setUserCode(CODE_SNIPPET);
    setPlaygroundLanguage('cpp');
  }, [setUserCode, setPlaygroundLanguage]);

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
        options: { isWholeLine: true, className: 'active-line-highlight' },
      }]);
      editor.revealLineInCenter(activeLine);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], []);
    }
  }, [activeLine]);

  const log = (text: string, type: LogEntry['type'] = 'info') =>
    setTerminal(p => [...p, { text, type }]);

  const resetAnim = () => {
    setActiveIdx(null);
    setShiftRange([]);
    setFoundIdx(null);
    setActiveLine(null);
    setCallStack([]);
    setVariables([]);
  };

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async () => {
    if (isAnimating) return;
    const val = parseInt(valInput);
    const idx = idxInput === '' ? size : parseInt(idxInput);
    if (isNaN(val)) { log('Enter a valid value.', 'error'); return; }
    if (isNaN(idx) || idx < 0 || idx > size) { log(`Index must be 0–${size}.`, 'error'); return; }

    setIsAnimating(true);
    setValInput(''); setIdxInput('');

    setCallStack([{ name: `insert(${idx}, ${val})`, line: 9 }]);
    setActiveLine(9);
    setVariables([{ name: 'idx', value: idx, type: 'int' }, { name: 'val', value: val, type: 'int' }, { name: 'size', value: size, type: 'int' }]);
    await sleep(500);

    if (size >= MAX_SIZE) {
      setActiveLine(11);
      log('Array Overflow! Cannot insert.', 'error');
      await sleep(600);
      resetAnim(); setIsAnimating(false); return;
    }

    // Animate shift
    const shifts: number[] = [];
    for (let i = size; i > idx; i--) shifts.push(i - 1);

    setActiveLine(13);
    for (const i of shifts) {
      setShiftRange([i]);
      setArr(prev => {
        const next = [...prev];
        next[i + 1] = next[i];
        return next;
      });
      setVariables([
        { name: 'i', value: i, type: 'int' },
        { name: 'arr[i]→arr[i+1]', value: `${arr[i]}`, type: 'int' },
      ]);
      await sleep(300);
    }

    setShiftRange([]);
    setActiveLine(15);
    setArr(prev => { const n = [...prev]; n[idx] = val; return n; });
    setActiveIdx(idx);
    setSize(s => s + 1);
    setVariables([{ name: 'arr[' + idx + ']', value: val, type: 'int' }]);
    await sleep(600);

    setActiveLine(17);
    log(`Inserted ${val} at index ${idx}`, 'success');
    await sleep(500);

    resetAnim(); setIsAnimating(false);
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (isAnimating) return;
    const idx = parseInt(idxInput);
    if (isNaN(idx) || idx < 0 || idx >= size) {
      log(`Invalid index. Must be 0–${size - 1}.`, 'error'); return;
    }

    setIsAnimating(true);
    setIdxInput('');

    setCallStack([{ name: `deleteAt(${idx})`, line: 22 }]);
    setActiveLine(22);
    setVariables([{ name: 'idx', value: idx, type: 'int' }, { name: 'size', value: size, type: 'int' }]);
    await sleep(500);

    const removed = arr[idx];
    setActiveIdx(idx);
    setActiveLine(26);
    setVariables([{ name: 'val', value: removed ?? '?', type: 'int' }]);
    await sleep(700);

    // Animate shift left
    setActiveLine(27);
    const newArr = [...arr];
    for (let i = idx; i < size - 1; i++) {
      setShiftRange([i + 1]);
      newArr[i] = newArr[i + 1];
      newArr[i + 1] = null;
      setArr([...newArr]);
      setVariables([{ name: 'i', value: i, type: 'int' }, { name: 'arr[i]', value: newArr[i] ?? 0, type: 'int' }]);
      await sleep(300);
    }

    setShiftRange([]);
    newArr[size - 1] = null;
    setArr([...newArr]);
    setSize(s => s - 1);
    setActiveLine(30);
    log(`Deleted ${removed} from index ${idx}`, 'success');
    await sleep(500);

    resetAnim(); setIsAnimating(false);
  };

  // ── SEARCH ────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (isAnimating) return;
    const val = parseInt(valInput);
    if (isNaN(val)) { log('Enter a value to search.', 'error'); return; }

    setIsAnimating(true);
    setValInput('');

    setCallStack([{ name: `search(${val})`, line: 35 }]);
    setActiveLine(35);
    setVariables([{ name: 'val', value: val, type: 'int' }]);
    log(`Searching for ${val}...`, 'info');
    await sleep(500);

    let found = -1;
    for (let i = 0; i < size; i++) {
      setActiveIdx(i);
      setActiveLine(36);
      setVariables([{ name: 'i', value: i, type: 'int' }, { name: 'arr[i]', value: arr[i] ?? '?', type: 'int' }]);
      await sleep(500);

      if (arr[i] === val) {
        found = i;
        setFoundIdx(i);
        setActiveLine(37);
        log(`Found ${val} at index ${i}!`, 'success');
        await sleep(800);
        break;
      }
    }

    if (found === -1) {
      log(`${val} not found in array.`, 'error');
    }

    await sleep(600);
    resetAnim(); setIsAnimating(false);
  };

  // ── TRAVERSE ──────────────────────────────────────────────────────────────
  const handleTraverse = async () => {
    if (isAnimating) return;
    setIsAnimating(true);

    setCallStack([{ name: 'traverse()', line: 42 }]);
    setActiveLine(42);
    log('Traversing array...', 'dim');
    await sleep(400);

    const vals: string[] = [];
    for (let i = 0; i < size; i++) {
      setActiveIdx(i);
      setActiveLine(43);
      setVariables([{ name: 'i', value: i, type: 'int' }, { name: 'arr[i]', value: arr[i] ?? 0, type: 'int' }]);
      vals.push(String(arr[i]));
      await sleep(400);
    }

    setActiveLine(45);
    log(`[ ${vals.join(', ')} ]`, 'success');
    await sleep(500);

    resetAnim(); setIsAnimating(false);
  };

  // ── RESET ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (isAnimating) return;
    setArr(Array(MAX_SIZE).fill(null));
    setSize(0);
    setTerminal([]);
    setValInput(''); setIdxInput('');
    resetAnim();
  };

  // ─── Extra controls (top bar) ──────────────────────────────────────────────
  const controls = (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-md overflow-hidden">
        <input
          type="number"
          value={valInput}
          onChange={e => setValInput(e.target.value)}
          placeholder="Value"
          disabled={isAnimating}
          className="w-20 bg-transparent text-xs text-white px-2 py-1.5 outline-none"
          onKeyDown={e => e.key === 'Enter' && handleInsert()}
        />
        <div className="w-px h-4 bg-neutral-700" />
        <input
          type="number"
          value={idxInput}
          onChange={e => setIdxInput(e.target.value)}
          placeholder="Index"
          disabled={isAnimating}
          className="w-20 bg-transparent text-xs text-white px-2 py-1.5 outline-none"
          onKeyDown={e => e.key === 'Enter' && handleInsert()}
        />
        <button
          onClick={handleInsert}
          disabled={isAnimating || valInput === ''}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-colors border-l border-neutral-800"
        >
          <Plus size={12} /> Insert
        </button>
      </div>
      <button onClick={handleDelete} disabled={isAnimating || idxInput === ''} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white text-xs font-bold rounded-md border border-neutral-700 transition-colors">
        <Trash2 size={12} /> Delete
      </button>
      <button onClick={handleSearch} disabled={isAnimating || valInput === ''} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold rounded-md border border-emerald-800 transition-colors">
        <Search size={12} /> Search
      </button>
      <button onClick={handleTraverse} disabled={isAnimating || size === 0} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-bold rounded-md border border-amber-800 transition-colors">
        <ArrowRight size={12} /> Traverse
      </button>
      <div className="w-px h-5 bg-neutral-800" />
      <button onClick={handleReset} disabled={isAnimating} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 disabled:opacity-40 text-xs font-bold rounded-md border border-red-900/50 transition-colors">
        <RefreshCw size={12} /> Reset
      </button>
    </div>
  );

  // ─── Code Panel ───────────────────────────────────────────────────────────
  const codePanel = (
    <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
      <style>{`.active-line-highlight { background-color: rgba(59,130,246,0.25) !important; }`}</style>
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
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          padding: { top: 8, bottom: 8 },
          renderLineHighlight: 'none',
        }}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
        }}
      />
    </div>
  );

  // ─── Visualization Panel ──────────────────────────────────────────────────
  const vizPanel = (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(90deg, #3b4354 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        {/* Info badge */}
        <div className="absolute top-4 left-5 flex items-center gap-2 text-xs text-gray-400 font-mono z-10">
          <span className="material-symbols-outlined text-base">memory</span>
          <span>arr[MAX={MAX_SIZE}] · size = {size}</span>
        </div>

        <TransformWrapper initialScale={1} minScale={0.3} maxScale={4} centerOnInit wheel={{ step: 0.08 }}>
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div className="flex flex-col items-center gap-6 relative z-10">

              {/* Index row */}
              <div className="flex gap-1">
                {Array.from({ length: MAX_SIZE }).map((_, i) => (
                  <div key={i} className="w-16 text-center text-[9px] font-mono text-gray-500">{i}</div>
                ))}
              </div>

              {/* Cell row */}
              <div className="flex gap-1">
                {Array.from({ length: MAX_SIZE }).map((_, i) => {
                  const filled   = arr[i] !== null;
                  const isActive = activeIdx === i;
                  const isFound  = foundIdx === i;
                  const isShift  = shiftRange.includes(i);

                  let border  = 'border-dashed border-gray-700/40';
                  let bg      = 'bg-transparent';
                  let textCol = 'text-gray-700';
                  let shadow  = '';

                  if (filled) { bg = 'bg-[#1c212c]'; border = 'border-[#3b4354]'; textCol = 'text-white'; }
                  if (isShift) { bg = 'bg-amber-500/20'; border = 'border-amber-500/60'; shadow = 'shadow-[0_0_10px_rgba(245,158,11,0.4)]'; }
                  if (isActive) { bg = 'bg-primary/20'; border = 'border-primary/70'; textCol = 'text-primary'; shadow = 'shadow-[0_0_14px_rgba(127,19,236,0.5)]'; }
                  if (isFound)  { bg = 'bg-emerald-500/20'; border = 'border-emerald-400/70'; textCol = 'text-emerald-300'; shadow = 'shadow-[0_0_14px_rgba(52,211,153,0.5)]'; }

                  return (
                    <motion.div
                      key={i}
                      layout
                      className={`w-16 h-12 border-2 rounded flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 relative ${bg} ${border} ${textCol} ${shadow}`}
                    >
                      <AnimatePresence mode="wait">
                        {arr[i] !== null ? (
                          <motion.span
                            key={arr[i]}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.2 }}
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
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -top-5 left-1/2 -translate-x-1/2"
                        >
                          <span className="material-symbols-outlined text-amber-400 text-base">arrow_downward</span>
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
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 rounded border border-primary/30">i={activeIdx}</span>
                </motion.div>
              )}

            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <IDELayout
      title="Array"
      category="Linear"
      showTimeline={false}
      extraControls={controls}
      operations={[
        { name: 'Insert', onClick: handleInsert, icon: <Plus size={14} /> },
        { name: 'Delete', onClick: handleDelete, icon: <Trash2 size={14} /> },
        { name: 'Search', onClick: handleSearch, icon: <Search size={14} /> },
        { name: 'Traverse', onClick: handleTraverse, icon: <ArrowRight size={14} /> },
        { name: 'Reset', onClick: handleReset, icon: <RefreshCw size={14} /> },
      ]}
      leftPanel={{ title: 'Source View', subtitle: 'array.cpp', icon: 'code', content: codePanel }}
      centerPanel={{ title: 'Simulation Stage', subtitle: 'Array Memory', icon: 'science', content: vizPanel }}
      bottomPanel={{
        title: 'Standard Output', subtitle: 'Live Stream', icon: 'terminal',
        extra: (
          <button
            onClick={() => setTerminal([])}
            className="w-7 h-7 rounded bg-surface-darker border border-border-dark flex items-center justify-center text-text-secondary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
          </button>
        ),
        content: (
          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px] bg-[#0d1117] h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-0.5">
              {terminal.length === 0 ? (
                <span className="text-gray-600 italic">No output yet…</span>
              ) : terminal.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-1.5 ${
                    log.type === 'error'   ? 'text-red-400' :
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'dim'     ? 'text-gray-500' : 'text-gray-300'
                  }`}
                >
                  <span className={
                    log.type === 'error'   ? 'text-red-500'     :
                    log.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
                  }>
                    {log.type === 'error' ? '✖' : log.type === 'success' ? '✔' : '➜'}
                  </span>
                  <span>{log.text}</span>
                </motion.div>
              ))}
              <div ref={termEndRef} />
            </div>
            {/* Command input */}
            <div className="flex items-center gap-1.5 border-t border-[#3b4354] pt-1 mt-1">
              <span className="text-blue-500 font-bold">➜</span>
              <input
                type="text"
                disabled={isAnimating}
                className="flex-1 bg-[#1c212c] border border-[#3b4354] rounded px-2 py-0.5 outline-none text-white font-mono text-[10px] placeholder:text-gray-600 focus:bg-[#282e39] focus:border-primary/50 transition-colors"
                placeholder="insert <val> [idx] | delete <idx> | search <val> | traverse"
                onKeyDown={e => {
                  if (e.key !== 'Enter') return;
                  const input = e.currentTarget;
                  const parts = input.value.trim().split(/\s+/);
                  const cmd = parts[0]?.toLowerCase();
                  if (cmd === 'insert' && parts[1]) {
                    setValInput(parts[1]);
                    if (parts[2]) setIdxInput(parts[2]);
                    setTimeout(handleInsert, 0);
                  } else if (cmd === 'delete' && parts[1]) {
                    setIdxInput(parts[1]);
                    setTimeout(handleDelete, 0);
                  } else if (cmd === 'search' && parts[1]) {
                    setValInput(parts[1]);
                    setTimeout(handleSearch, 0);
                  } else if (cmd === 'traverse') {
                    handleTraverse();
                  } else if (cmd === 'reset') {
                    handleReset();
                  } else {
                    log(`Unknown command: ${cmd}`, 'error');
                  }
                  input.value = '';
                }}
              />
            </div>
          </div>
        ),
      }}
      rightPanelTop={{
        title: 'Call Stack', subtitle: 'Memory Monitor', icon: 'layers',
        content: (
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5 bg-[#1c212c] h-full">
            <AnimatePresence>
              {callStack.length === 0 ? (
                <div className="text-[9px] text-gray-500 italic text-center mt-3">Stack empty</div>
              ) : callStack.map((frame, i) => (
                <motion.div
                  key={frame.name}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`flex items-center justify-between p-1.5 rounded ${i === 0 ? 'bg-[#282e39] border-l-2 border-primary' : 'opacity-50'}`}
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-white font-medium">{frame.name}</span>
                    <span className="text-[8px] text-gray-400">Line {frame.line}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ),
      }}
      rightPanelBottom={{
        title: 'Variables', subtitle: 'Local Scope', icon: 'visibility',
        content: (
          <div className="flex-1 overflow-y-auto bg-[#1c212c] h-full">
            {variables.length === 0 ? (
              <div className="text-[9px] text-gray-500 italic text-center mt-3">No active variables</div>
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
                        className="bg-primary/5"
                      >
                        <td className="px-2 py-1 text-blue-300 font-medium">{v.name}</td>
                        <td className="px-2 py-1 text-white">
                          <motion.span
                            key={String(v.value)}
                            initial={{ scale: 1.3, color: '#60a5fa' }}
                            animate={{ scale: 1, color: '#ffffff' }}
                            transition={{ duration: 0.4 }}
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
      }}
    />
  );
}
