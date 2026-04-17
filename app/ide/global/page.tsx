"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useSimulationStore } from "@/store/useSimulationStore";
import IDELayout from "@/components/ide/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Layers, MemoryStick, PenTool, Hash, Terminal } from "lucide-react";
import { useCompiler } from "@/hooks/useCompiler";

type ViewMode = 'visualizer' | 'memory' | 'canvas';
type VisType = 'array' | 'stack' | 'queue' | 'tree' | 'graph';

const CODE_TEMPLATE = `#include <iostream>
using namespace std;

int main() {
    cout << "Welcome to the Global Sandbox IDE!\\n";
    
    // Declare memory variables
    int a = 10;
    int b = 25;
    int sum = a + b;
    
    cout << "Allocating memory...\\n";
    cout << "a = " << a << ", b = " << b << "\\n";
    cout << "Sum = " << sum << "\\n";
    
    return 0;
}`;

export default function GlobalIDEPage() {
    const { setUserCode, setPlaygroundLanguage } = useSimulationStore();
    const { output, isRunning, runCode, stopCode, setOutput } = useCompiler();
    
    const [viewMode, setViewMode] = useState<ViewMode>('visualizer');
    const [visType, setVisType] = useState<VisType>('array');
    const [codeVal, setCodeVal] = useState(CODE_TEMPLATE);

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setUserCode(CODE_TEMPLATE);
        setPlaygroundLanguage("cpp");
    }, [setUserCode, setPlaygroundLanguage]);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [output]);

    const handleRun = () => {
        if (!isRunning) {
            setOutput("");
            runCode("cpp", codeVal);
        }
    };

    // --- RENDER MODES ---

    const renderVisualizationStage = () => {
        // Fallback or generic graphic representations
        return (
            <div className="flex-1 w-full h-full flex flex-col items-center justify-center">
                {visType === 'array' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex gap-2 p-4 bg-[#282e39] rounded shadow-2xl border border-[#3b4354]">
                        {[1, 5, 10, 15, 20, 25].map((val, i) => (
                           <div key={i} className="flex flex-col items-center gap-2">
                               <div className="text-[10px] text-gray-400 font-mono">{i}</div>
                               <div className="w-12 h-12 bg-[#1c212c] border border-[#475569] flex items-center justify-center font-bold text-blue-300 rounded shadow-inner">{val}</div>
                           </div>
                        ))}
                    </motion.div>
                )}

                {visType === 'stack' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex gap-12 p-8">
                        <div className="flex flex-col-reverse gap-2 bg-[#282e39] p-4 rounded-b-xl border-x-4 border-b-4 border-[#3b4354] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                            {[10, 20, 30, 40].map((val, i) => (
                               <motion.div key={i} initial={{y: 50, opacity:0}} animate={{y:0, opacity:1}} transition={{delay: i * 0.1}} className="w-24 h-12 bg-primary/20 border border-primary/50 flex items-center justify-center font-bold text-white rounded">
                                   {val}
                               </motion.div>
                            ))}
                            <div className="absolute top-[80px] -right-12 text-primary flex items-center gap-1 font-bold text-xs"><span className="material-symbols-outlined rotate-180">arrow_right_alt</span> TOP</div>
                        </div>
                    </motion.div>
                )}

                {visType === 'tree' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="relative w-64 h-64 flex flex-col items-center">
                        <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none stroke-[#475569]">
                            <line x1="128" y1="40" x2="64" y2="120" strokeWidth="2" />
                            <line x1="128" y1="40" x2="192" y2="120" strokeWidth="2" />
                            <line x1="64" y1="120" x2="32" y2="200" strokeWidth="2" />
                            <line x1="64" y1="120" x2="96" y2="200" strokeWidth="2" />
                        </svg>
                        <div className="absolute top-[15px] w-12 h-12 rounded-full bg-[#1c212c] border-2 border-emerald-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">50</div>
                        <div className="absolute top-[95px] left-[40px] w-12 h-12 rounded-full bg-[#1c212c] border-2 border-slate-600 flex items-center justify-center font-bold text-gray-300">30</div>
                        <div className="absolute top-[95px] right-[40px] w-12 h-12 rounded-full bg-[#1c212c] border-2 border-slate-600 flex items-center justify-center font-bold text-gray-300">70</div>
                        <div className="absolute top-[175px] left-[8px] w-12 h-12 rounded-full bg-[#1c212c] border-2 border-slate-600 flex items-center justify-center font-bold text-gray-300">20</div>
                        <div className="absolute top-[175px] left-[72px] w-12 h-12 rounded-full bg-[#1c212c] border-2 border-slate-600 flex items-center justify-center font-bold text-gray-300">40</div>
                    </motion.div>
                )}
                <div className="mt-8 text-[10px] text-gray-500 italic uppercase tracking-widest font-mono">Mock Dynamic Visualizer Stage</div>
            </div>
        );
    };

    const renderMemoryMatrix = () => {
        return (
            <div className="w-full h-full p-8 flex flex-col gap-8">
                <div className="text-sm font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2 border-b border-[#3b4354] pb-2">
                    <MemoryStick size={16} /> Stack Frame Layout
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Simulated variables */}
                    {[{n: 'a', v: '10', t: 'int', add: '0x7ffd989c'}, {n: 'b', v: '25', t: 'int', add: '0x7ffd9898'}, {n: 'sum', v: '35', t: 'int', add: '0x7ffd9894'}, {n: 'ptr', v: '0x7ffd989c', t: 'int*', add: '0x7ffd9890'}].map((mem, i) => (
                        <motion.div key={i} initial={{opacity:0, scale: 0.9}} animate={{opacity:1, scale:1}} transition={{delay: i * 0.1}} className="flex flex-col bg-[#1c212c] border border-[#3b4354] rounded-lg overflow-hidden shadow-lg group">
                            <div className="bg-[#282e39] border-b border-[#3b4354] px-3 py-1.5 flex justify-between items-center group-hover:bg-[#323945] transition-colors">
                                <span className="text-[10px] font-mono text-gray-400">{mem.t}</span>
                                <span className="text-[9px] font-mono text-emerald-400/60">{mem.add}</span>
                            </div>
                            <div className="p-4 flex flex-col items-center justify-center gap-1">
                                <span className="font-mono text-purple-400 font-bold text-sm">{mem.n}</span>
                                <span className="font-mono text-xl text-white font-black">{mem.v}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-4 p-4 border border-blue-900/40 bg-blue-900/10 rounded-lg">
                    <div className="text-[10px] text-blue-400 font-bold mb-2 uppercase tracking-wider">Heap Memory (Dynamic Allocation)</div>
                    <div className="h-24 bg-[#111827] border border-[#1f2937] rounded flex items-center justify-center text-xs text-gray-500 italic">No heap memory allocated natively.</div>
                </div>
            </div>
        );
    };

    const renderBlankCanvas = () => {
        return (
            <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-[#0d1017] opacity-60" style={{ backgroundImage: 'radial-gradient(#282e39 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <PenTool size={32} className="text-gray-600 mb-4 opacity-50" />
                    <div className="text-gray-500 font-mono text-sm">Blank Rendering Canvas</div>
                    <div className="text-gray-600 font-mono text-[10px] mt-2">Outputs generated from WASM graphic layers will appear here.</div>
                </div>
            </div>
        );
    };

    // --- END RENDER MODES ---

    const extraControls = (
        <div className="flex items-center gap-3 w-full justify-between">
            {/* View Mode Segmented Control */}
            <div className="flex bg-[#1c212c] p-0.5 rounded-md border border-[#3b4354] shadow-inner">
                <button 
                    onClick={() => setViewMode('visualizer')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-all ${viewMode === 'visualizer' ? 'bg-[#282e39] text-primary shadow-sm' : 'text-gray-500 hover:text-white'}`}
                >
                    <Layers size={12} /> Visual Engine
                </button>
                <button 
                    onClick={() => setViewMode('memory')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-all ${viewMode === 'memory' ? 'bg-[#282e39] text-emerald-500 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                >
                    <MemoryStick size={12} /> Code Memory
                </button>
                <button 
                    onClick={() => setViewMode('canvas')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-all ${viewMode === 'canvas' ? 'bg-[#282e39] text-purple-400 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                >
                    <PenTool size={12} /> Clean Grid
                </button>
            </div>

            {/* Run Controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={isRunning ? stopCode : handleRun}
                    className={`flex items-center gap-2 px-6 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all shadow-lg border ${
                        isRunning 
                        ? 'bg-red-600/20 text-red-500 border-red-500/50 hover:bg-red-600/30' 
                        : 'bg-primary text-white border-white/10 hover:bg-primary/90 shadow-[0_3px_0_rgb(88,13,164)] active:translate-y-[2px] active:shadow-none'
                    }`}
                >
                    {isRunning ? <Square size={14} /> : <Play size={14} fill="currentColor" />}
                    {isRunning ? "Stop" : "Compile & Run"}
                </button>
            </div>
        </div>
    );

    return (
        <IDELayout
            title="Global Sandbox"
            category="Development"
            extraControls={extraControls}
            showTimeline={false}
            leftPanel={{
                title: "Source View",
                subtitle: "main.cpp",
                icon: "code",
                content: (
                    <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
                        <Editor
                            height="100%"
                            defaultLanguage="cpp"
                            theme="vs-dark"
                            value={codeVal}
                            onChange={(val) => setCodeVal(val || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                scrollBeyondLastLine: false,
                                lineNumbers: 'on',
                                glyphMargin: false,
                                folding: true,
                                lineDecorationsWidth: 0,
                                lineNumbersMinChars: 3,
                                padding: { top: 16, bottom: 16 }
                            }}
                            onMount={(editor, monaco) => {
                                editorRef.current = editor;
                                monacoRef.current = monaco;
                            }}
                        />
                    </div>
                )
            }}
            centerPanel={{
                title: viewMode === 'visualizer' ? "Simulation Stage" : viewMode === 'memory' ? "Memory Tracker" : "Raw Canvas",
                subtitle: viewMode === 'visualizer' ? "Interactive Graphic Mode" : viewMode === 'memory' ? "Heap & Stack Visualizer" : "Sandbox Rendering Window",
                icon: "science",
                extra: viewMode === 'visualizer' ? (
                    <div className="flex items-center bg-[#1c212c] rounded border border-[#3b4354] overflow-hidden ml-4">
                        <select 
                            value={visType}
                            onChange={(e) => setVisType(e.target.value as VisType)}
                            className="bg-transparent text-[10px] text-white font-bold uppercase tracking-wider px-2 py-0.5 outline-none cursor-pointer hover:bg-[#282e39]"
                        >
                            <option value="array">Array</option>
                            <option value="stack">Stack</option>
                            <option value="queue">Queue</option>
                            <option value="tree">Tree</option>
                            <option value="graph">Graph</option>
                        </select>
                    </div>
                ) : null,
                content: (
                    <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={viewMode}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full"
                            >
                                {viewMode === 'visualizer' && renderVisualizationStage()}
                                {viewMode === 'memory' && renderMemoryMatrix()}
                                {viewMode === 'canvas' && renderBlankCanvas()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )
            }}
            bottomPanel={{
                title: "Standard Output",
                subtitle: "Compiler Stream",
                icon: "terminal",
                content: (
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs bg-[#0d1117] h-full flex flex-col pt-4">
                        {output ? (
                            <pre className="text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">{output}</pre>
                        ) : (
                            <div className="text-gray-600 italic">No output. Press "Compile & Run" to execute your code natively.</div>
                        )}
                        <div ref={terminalEndRef} />
                    </div>
                )
            }}
        />
    );
}
