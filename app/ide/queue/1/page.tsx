'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Terminal, Layers, Database, Plus, Minus, Eye } from 'lucide-react';
import Editor from '@monaco-editor/react';
import IDELayout from '@/components/ide/Layout';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useSimulationStore } from "@/store/useSimulationStore";

const MAX_QUEUE_SIZE = 6;

const CODE_SNIPPET = `#include <iostream>
using namespace std;

#define MAX 6
int queue[MAX];
int front = -1;
int rear = -1;

void enqueue(int val) {
    if (rear == MAX - 1) {
        cout << "Queue Overflow\\n";
        return;
    }
    if (front == -1) front = 0;
    queue[++rear] = val;
    cout << "Enqueued " << val << "\\n";
}

int dequeue() {
    if (front == -1 || front > rear) {
        cout << "Queue Underflow\\n";
        return -1;
    }
    int val = queue[front++];
    cout << "Dequeued " << val << "\\n";
    return val;
}

int peek() {
    if (front == -1 || front > rear) {
        cout << "Queue is Empty\\n";
        return -1;
    }
    return queue[front];
}
`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function QueueVisualization() {
    const [queue, setQueue] = useState<(number | null)[]>(Array(MAX_QUEUE_SIZE).fill(null));
    const [front, setFront] = useState(-1);
    const [rear, setRear] = useState(-1);
    const [inputValue, setInputValue] = useState("");
    const [activeLine, setActiveLine] = useState<number | null>(null);
    const [terminal, setTerminal] = useState<{ text: string, type: 'info' | 'error' | 'success' }[]>([]);
    const [callStack, setCallStack] = useState<any[]>([]);
    const [variables, setVariables] = useState<any[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const { setUserCode, setPlaygroundLanguage } = useSimulationStore();

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<any[]>([]);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setUserCode(CODE_SNIPPET);
        setPlaygroundLanguage("cpp");
    }, [setUserCode, setPlaygroundLanguage]);

    // Auto-scroll terminal
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminal]);

    // Highlight active line in Monaco
    useEffect(() => {
        if (editorRef.current && monacoRef.current) {
            const editor = editorRef.current;
            const monaco = monacoRef.current;
            if (activeLine !== null) {
                decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], [
                    {
                        range: new monaco.Range(activeLine, 1, activeLine, 1),
                        options: {
                            isWholeLine: true,
                            className: 'bg-blue-500/30',
                        }
                    }
                ]);
                editor.revealLineInCenter(activeLine);
            } else {
                decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], []);
            }
        }
    }, [activeLine]);

    const handleEnqueue = async () => {
        if (!inputValue || isAnimating) return;
        const val = parseInt(inputValue);
        setIsAnimating(true);
        setInputValue("");

        setActiveLine(9);
        setCallStack([{ id: 'enqueue', name: \`enqueue(\${val})\`, line: 9 }]);
        setVariables([{ name: 'val', value: val, type: 'int' }, { name: 'front', value: front, type: 'int' }, { name: 'rear', value: rear, type: 'int' }]);
        await sleep(600);

        setActiveLine(10);
        await sleep(600);

        if (rear >= MAX_QUEUE_SIZE - 1) {
            setActiveLine(11);
            setTerminal(prev => [...prev, { text: "Queue Overflow", type: "error" }]);
            await sleep(600);
            setActiveLine(12);
            await sleep(600);
        } else {
            setActiveLine(14);
            let nextFront = front;
            if (front === -1) {
                nextFront = 0;
                setFront(0);
                setVariables([{ name: 'val', value: val, type: 'int' }, { name: 'front', value: 0, type: 'int' }, { name: 'rear', value: rear, type: 'int' }]);
                await sleep(600);
            }

            setActiveLine(15);
            const newRear = rear + 1;
            setRear(newRear);
            setVariables([{ name: 'val', value: val, type: 'int' }, { name: 'front', value: nextFront, type: 'int' }, { name: 'rear', value: newRear, type: 'int' }]);
            
            setQueue(prev => {
                const next = [...prev];
                next[newRear] = val;
                return next;
            });
            await sleep(600);

            setActiveLine(16);
            setTerminal(prev => [...prev, { text: \`Enqueued \${val}\`, type: "success" }]);
            await sleep(600);
        }

        setActiveLine(null);
        setCallStack([]);
        setVariables([]);
        setIsAnimating(false);
    };

    const handleDequeue = async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        setActiveLine(19);
        setCallStack([{ id: 'dequeue', name: \`dequeue()\`, line: 19 }]);
        setVariables([{ name: 'front', value: front, type: 'int' }, { name: 'rear', value: rear, type: 'int' }]);
        await sleep(600);

        setActiveLine(20);
        await sleep(600);

        if (front === -1 || front > rear) {
            setActiveLine(21);
            setTerminal(prev => [...prev, { text: "Queue Underflow", type: "error" }]);
            await sleep(600);
            setActiveLine(22);
            await sleep(600);
        } else {
            setActiveLine(24);
            const val = queue[front];
            setVariables([{ name: 'val', value: val, type: 'int' }, { name: 'front', value: front, type: 'int' }, { name: 'rear', value: rear, type: 'int' }]);
            
            const newFront = front + 1;
            setFront(newFront);
            setVariables([{ name: 'val', value: val, type: 'int' }, { name: 'front', value: newFront, type: 'int' }, { name: 'rear', value: rear, type: 'int' }]);
            setQueue(prev => {
                const next = [...prev];
                next[front] = null;
                return next;
            });
            await sleep(600);

            setActiveLine(25);
            setTerminal(prev => [...prev, { text: \`Dequeued \${val}\`, type: "success" }]);
            await sleep(600);

            setActiveLine(26);
            await sleep(600);
        }

        setActiveLine(null);
        setCallStack([]);
        setVariables([]);
        setIsAnimating(false);
    };

    const handlePeek = async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        setActiveLine(29);
        setCallStack([{ id: 'peek', name: \`peek()\`, line: 29 }]);
        setVariables([{ name: 'front', value: front, type: 'int' }, { name: 'rear', value: rear, type: 'int' }]);
        await sleep(600);

        setActiveLine(30);
        await sleep(600);

        if (front === -1 || front > rear) {
            setActiveLine(31);
            setTerminal(prev => [...prev, { text: "Queue is Empty", type: "error" }]);
            await sleep(600);
            setActiveLine(32);
            await sleep(600);
        } else {
            setActiveLine(34);
            setTerminal(prev => [...prev, { text: \`Front is \${queue[front]}\`, type: "info" }]);
            await sleep(600);
        }

        setActiveLine(null);
        setCallStack([]);
        setVariables([]);
        setIsAnimating(false);
    };

    const handleReset = () => {
        if (isAnimating) return;
        setQueue(Array(MAX_QUEUE_SIZE).fill(null));
        setFront(-1);
        setRear(-1);
        setTerminal([]);
        setActiveLine(null);
        setCallStack([]);
        setVariables([]);
        setInputValue("");
    };

    const queueControls = (
        <div className="flex items-center gap-3">
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-md overflow-hidden">
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Value"
                    className="w-24 bg-transparent text-xs text-white px-3 py-1.5 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleEnqueue()}
                    disabled={isAnimating}
                />
                <button
                    onClick={handleEnqueue}
                    disabled={isAnimating || !inputValue}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-xs font-bold transition-colors border-l border-neutral-800"
                >
                    <Plus size={14} /> Enqueue
                </button>
            </div>
            <button
                onClick={handleDequeue}
                disabled={isAnimating}
                className="flex items-center gap-2 px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-bold rounded-md border border-neutral-700 transition-colors"
            >
                <Minus size={14} /> Dequeue
            </button>
            <button
                onClick={handlePeek}
                disabled={isAnimating}
                className="flex items-center gap-2 px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-bold rounded-md border border-neutral-700 transition-colors"
            >
                <Eye size={14} /> Peek
            </button>
            <div className="w-px h-6 bg-neutral-800 mx-2"></div>
            <button
                onClick={handleReset}
                disabled={isAnimating}
                className="flex items-center gap-2 px-4 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 disabled:opacity-50 text-xs font-bold rounded-md border border-red-900/50 transition-colors"
            >
                <Square size={14} /> Reset
            </button>
        </div>
    );

    const codePanel = (
        <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <style>{\`
                .bg-blue-500\\\\/30 {
                    background-color: rgba(59, 130, 246, 0.3) !important;
                }
            \`}</style>
            <Editor
                height="100%"
                defaultLanguage="cpp"
                theme="vs-dark"
                value={CODE_SNIPPET}
                options={{
                    minimap: { enabled: false },
                    fontSize: 10,
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

    const visualizationPanel = (
        <div className="flex flex-col h-full">
            {/* Main Visualization Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(90deg, #3b4354 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
                <div className="absolute top-6 left-6 flex items-center gap-3 text-sm text-gray-400 font-mono z-10">
                    <Database size={18} />
                    <span>Memory [MAX = {MAX_QUEUE_SIZE}]</span>
                </div>

                <TransformWrapper
                    initialScale={1}
                    minScale={0.2}
                    maxScale={4}
                    centerOnInit
                    wheel={{ step: 0.1 }}
                >
                    <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="flex flex-col gap-8 relative z-10">
                            <div className="flex pb-12 relative pt-12">
                                <div className="flex items-end justify-center bg-[#282e39] p-1.5 rounded-lg border border-[#3b4354] shadow-2xl relative">
                                    {Array.from({ length: MAX_QUEUE_SIZE }).map((_, i) => {
                                        const isActive = queue[i] !== null;
                                        return (
                                            <div key={i} className="flex flex-col items-center">
                                                <div className={\`h-4 flex items-end justify-center text-[9px] font-mono mb-1 \${i === front || i === rear ? 'text-white font-bold' : 'text-gray-500'}\`}>{i}</div>
                                                <motion.div 
                                                    layout
                                                    className={\`w-16 h-16 border rounded flex items-center justify-center font-mono text-xl shadow-sm transition-colors duration-300 mx-0.5 \${
                                                        isActive 
                                                            ? 'bg-primary text-white border-white/20 font-bold shadow-[0_0_10px_rgba(127,19,236,0.3)] z-10' 
                                                            : 'bg-[#1c212c] text-white border-[#3b4354] border-dashed text-[12px]'
                                                    }\`}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        {queue[i] !== null ? (
                                                            <motion.span
                                                                key={queue[i]}
                                                                initial={{ opacity: 0, scale: 0.5 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.5 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                {queue[i]}
                                                            </motion.span>
                                                        ) : (
                                                            <span className="text-gray-700/50">null</span>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Front Pointer */}
                                {front >= 0 && front <= rear && (
                                    <motion.div 
                                        layoutId="frontPointer"
                                        className="absolute -bottom-2 flex flex-col items-center transition-all duration-300 z-20"
                                        style={{ left: \`\${(front * 68) + 38}px\` }}
                                    >
                                        <span className="material-symbols-outlined text-green-500 -rotate-90">arrow_right_alt</span>
                                        <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider mt-1">Front</span>
                                    </motion.div>
                                )}

                                {/* Rear Pointer */}
                                {rear >= 0 && (
                                    <motion.div 
                                        layoutId="rearPointer"
                                        className="absolute -top-2 flex flex-col items-center transition-all duration-300 z-20"
                                        style={{ left: \`\${(rear * 68) + 38}px\` }}
                                    >
                                        <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider mb-1">Rear</span>
                                        <span className="material-symbols-outlined text-blue-500 rotate-90">arrow_right_alt</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </div>
    );

    return (
        <IDELayout
            title="Queue"
            category="Linear"
            operations={[
                { name: 'Enqueue', onClick: handleEnqueue, icon: <Plus size={14} /> },
                { name: 'Dequeue', onClick: handleDequeue, icon: <Minus size={14} /> },
                { name: 'Peek', onClick: handlePeek, icon: <Eye size={14} /> },
                { name: 'User Input', onClick: () => window.location.href = '/ide/classic/queue-experiment', icon: <Terminal size={14} /> },
                { name: 'All', onClick: () => {}, icon: <Layers size={14} /> },
                { name: 'Reset', onClick: handleReset, icon: <Square size={14} /> },
            ]}
            extraControls={queueControls}
            leftPanel={{
                title: "Source View",
                subtitle: "queue.cpp",
                icon: "code",
                content: codePanel
            }}
            centerPanel={{
                title: "Simulation Stage",
                subtitle: "Memory Array",
                icon: "science",
                content: visualizationPanel
            }}
            bottomPanel={{
                title: "Standard Output",
                subtitle: "Live Stream",
                icon: "terminal",
                content: (
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 font-mono text-[9px] bg-[#0d1117] h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            {terminal.length === 0 ? (
                                <div className="text-gray-500 italic">No output yet...</div>
                            ) : (
                                terminal.map((log, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={\`flex gap-1.5 \${
                                            log.type === 'error' ? 'text-red-400' : 
                                            log.type === 'success' ? 'text-green-400 opacity-60' : 'text-gray-300 opacity-60'
                                        }\`}
                                    >
                                        <span className={log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-green-500' : 'text-blue-500'}>
                                            {log.type === 'error' ? '✖' : log.type === 'success' ? '✔' : '➜'}
                                        </span>
                                        <span>{log.text}</span>
                                    </motion.div>
                                ))
                            )}
                            <div ref={terminalEndRef} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 border-t border-[#3b4354] pt-1">
                            <span className="text-blue-500 font-bold">➜</span>
                            <input 
                                type="text" 
                                maxLength={30}
                                className="flex-1 bg-[#1c212c] border border-[#3b4354] rounded px-1.5 py-0.5 outline-none text-white font-mono text-[9px] placeholder:text-gray-500 focus:bg-[#282e39] focus:border-primary/50 transition-colors"
                                placeholder="Enter command (e.g., 'enq 5', 'deq')..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const input = e.currentTarget;
                                        const val = input.value;
                                        if (val) {
                                            const parts = val.trim().split(/\\s+/);
                                            const cmd = parts[0].toLowerCase();
                                            if ((cmd === 'enqueue' || cmd === 'enq') && parts[1]) {
                                                setInputValue(parts[1]);
                                                setTimeout(handleEnqueue, 0);
                                            } else if (cmd === 'dequeue' || cmd === 'deq') {
                                                handleDequeue();
                                            } else if (cmd === 'peek') {
                                                handlePeek();
                                            } else {
                                                setTerminal(prev => [...prev, { text: \`Command not found: \${cmd}\`, type: 'error' }]);
                                            }
                                            input.value = '';
                                        }
                                    }
                                }}
                                disabled={isAnimating}
                            />
                        </div>
                    </div>
                )
            }}
            rightPanelTop={{
                title: "Call Stack",
                subtitle: "Memory Monitor",
                icon: "layers",
                content: (
                    <div className="flex-1 overflow-y-auto p-1 space-y-0.5 bg-[#1c212c] h-full">
                        <AnimatePresence>
                            {callStack.length === 0 ? (
                                <div className="text-[9px] text-gray-500 italic text-center mt-2">Stack is empty</div>
                            ) : (
                                callStack.map((frame, i) => (
                                    <motion.div
                                        key={frame.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={\`group flex items-center justify-between p-1.5 rounded transition-colors \${
                                            i === 0 
                                            ? 'bg-[#282e39] border-l-2 border-primary rounded-r shadow-sm cursor-pointer hover:bg-[#323945]' 
                                            : 'border border-transparent hover:bg-[#282e39]/50 opacity-60'
                                        }\`}
                                    >
                                        <div className="flex flex-col">
                                            <span className={\`font-mono text-[10px] \${i === 0 ? 'text-white font-medium' : 'text-gray-300'}\`}>{frame.name}</span>
                                            <span className={\`text-[9px] \${i === 0 ? 'text-[#9da6b9]' : 'text-gray-400'}\`}>Line {frame.line}</span>
                                        </div>
                                        {i === 0 && <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 text-[10px]">arrow_back</span>}
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                )
            }}
            rightPanelBottom={{
                title: "Variables",
                subtitle: "Local Scope",
                icon: "visibility",
                content: (
                    <div className="flex-1 overflow-y-auto bg-[#1c212c] h-full">
                        {variables.length === 0 ? (
                            <div className="text-[9px] text-gray-500 italic text-center mt-2">No active variables</div>
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
                                        {variables.map((v, i) => {
                                            const hasChanged = true; 
                                            return (
                                            <motion.tr 
                                                key={v.name}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={hasChanged ? 'bg-primary/10' : ''}
                                            >
                                                <td className="px-2 py-1 text-blue-300 font-medium">{v.name}</td>
                                                <td className="px-2 py-1 text-white">
                                                    <motion.span
                                                        key={String(v.value)}
                                                        initial={{ scale: 1.2, color: '#60a5fa' }}
                                                        animate={{ scale: 1, color: '#ffffff' }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        {v.value}
                                                    </motion.span>
                                                </td>
                                                <td className="px-2 py-1 text-[#9da6b9]">{v.type}</td>
                                            </motion.tr>
                                        )})}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        )}
                    </div>
                )
            }}
        />
    );
}
