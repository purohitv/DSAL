'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Node {
  id: string;
  value: number;
  color: 'red' | 'black';
  x: number;
  y: number;
  isActive?: boolean;
  isHighlighted?: boolean;
}

interface Edge {
  from: string;
  to: string;
}

interface Step {
  id: number;
  title: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  presenterNotes: string;
}

// --- Mock Data ---
const mockSteps: Step[] = [
  {
    id: 1,
    title: 'Initial State',
    description: 'The Red-Black Tree is currently balanced.',
    presenterNotes: 'Start by explaining the properties of a Red-Black Tree. Focus on the root being black and the red-red violation rule.',
    nodes: [
      { id: '1', value: 20, color: 'black', x: 400, y: 100, isActive: true },
      { id: '2', value: 10, color: 'black', x: 300, y: 200 },
      { id: '3', value: 30, color: 'black', x: 500, y: 200 },
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '1', to: '3' },
    ],
  },
  {
    id: 2,
    title: 'Insert 25',
    description: 'Inserting a new node with value 25. By default, new nodes are red.',
    presenterNotes: 'Notice how we insert 25 as a child of 30. It starts as red. Ask the students if this violates any RBT properties.',
    nodes: [
      { id: '1', value: 20, color: 'black', x: 400, y: 100 },
      { id: '2', value: 10, color: 'black', x: 300, y: 200 },
      { id: '3', value: 30, color: 'black', x: 500, y: 200, isActive: true },
      { id: '4', value: 25, color: 'red', x: 450, y: 300, isHighlighted: true },
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '1', to: '3' },
      { from: '3', to: '4' },
    ],
  },
  {
    id: 3,
    title: 'Recolor',
    description: 'A red-red violation occurred. We need to recolor the parent and uncle.',
    presenterNotes: 'Explain the recoloring logic. Since the uncle is black (null), we might need a rotation instead. Wait, let\'s re-examine the case.',
    nodes: [
      { id: '1', value: 20, color: 'black', x: 400, y: 100, isActive: true },
      { id: '2', value: 10, color: 'black', x: 300, y: 200 },
      { id: '3', value: 30, color: 'red', x: 500, y: 200, isHighlighted: true },
      { id: '4', value: 25, color: 'red', x: 450, y: 300, isHighlighted: true },
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '1', to: '3' },
      { from: '3', to: '4' },
    ],
  },
];

export default function LectureModePage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pointer' | 'pen' | 'highlighter'>('pointer');
  const [canvasVisible, setCanvasVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const currentStep = mockSteps[currentStepIndex];

  // --- Canvas Logic ---
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        contextRef.current = context;
      }
    }
  }, []);

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    if (tool === 'pointer') return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    
    if (tool === 'pen') {
      contextRef.current.strokeStyle = '#00FF00';
      contextRef.current.lineWidth = 2;
      contextRef.current.globalAlpha = 1;
    } else if (tool === 'highlighter') {
      contextRef.current.strokeStyle = '#FFFF00';
      contextRef.current.lineWidth = 20;
      contextRef.current.globalAlpha = 0.3;
    }

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context && canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-display overflow-hidden selection:bg-lecture-primary/30">
      {/* --- Top Navigation --- */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-16 py-10 bg-background-dark/40 backdrop-blur-2xl border-b border-white/5 shrink-0 z-50"
      >
        <div className="flex items-center gap-12">
          <Link href="/" className="group">
            <motion.div 
              whileHover={{ x: -5 }}
              className="flex items-center gap-5 text-text-secondary hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-4xl">arrow_back</span>
              <span className="text-sm font-black uppercase tracking-[0.3em]">Exit Lecture</span>
            </motion.div>
          </Link>
          <div className="h-12 w-px bg-white/10"></div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-6">
              <span className="text-lecture-primary">Lecture:</span> Red-Black Trees
            </h1>
            <p className="text-sm text-text-secondary font-mono uppercase tracking-[0.4em] mt-3">Advanced Data Structures • Module 04</p>
          </div>
        </div>

        {/* Tool Selector */}
        <div className="flex items-center gap-5 bg-surface-darker/80 p-4 rounded-2xl border border-white/10 shadow-2xl">
          {[
            { id: 'pointer', icon: 'near_me', label: 'Pointer' },
            { id: 'pen', icon: 'edit', label: 'Pen' },
            { id: 'highlighter', icon: 'border_color', label: 'Highlighter' },
          ].map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTool(t.id as any)}
              className={`flex items-center gap-6 px-10 py-5 rounded-xl transition-all ${
                tool === t.id 
                  ? 'bg-lecture-primary text-surface-darker font-black shadow-lg shadow-lecture-primary/20' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[32px]">{t.icon}</span>
              <span className="text-base font-black uppercase tracking-widest hidden lg:inline">{t.label}</span>
            </motion.button>
          ))}
          <div className="w-px h-12 bg-white/10 mx-5"></div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearCanvas}
            className="p-5 text-text-secondary hover:text-red-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[32px]">delete</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-lecture-primary uppercase tracking-widest">Live Session</span>
            <span className="text-xs text-text-secondary font-mono">ID: LECT-RB-001</span>
          </div>
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lecture-primary to-secondary p-0.5 shadow-lg shadow-lecture-primary/20">
            <div className="w-full h-full rounded-full bg-surface-darker flex items-center justify-center overflow-hidden">
              <img src="https://picsum.photos/seed/presenter/100/100" alt="Presenter" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </motion.header>

      {/* --- Main Content --- */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Drawing Canvas Overlay */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 z-40 cursor-crosshair transition-opacity duration-500 ${tool === 'pointer' ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        />

        {/* Left: Visualization Area */}
        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface-darker/20 to-transparent overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full flex items-center justify-center p-20"
            >
              <svg width="100%" height="100%" viewBox="0 0 800 600" className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                  </linearGradient>
                </defs>

                {/* Edges */}
                {currentStep.edges.map((edge, i) => {
                  const fromNode = currentStep.nodes.find(n => n.id === edge.from);
                  const toNode = currentStep.nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  return (
                    <motion.line
                      key={`edge-${i}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.3 }}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="url(#edgeGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Nodes */}
                {currentStep.nodes.map((node) => (
                  <motion.g
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.1 * parseInt(node.id) }}
                  >
                    {/* Node Shadow/Glow */}
                    {node.isHighlighted && (
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={35}
                        fill={node.color === 'red' ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.1)'}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    {/* Main Node Body */}
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={28}
                      fill={node.color === 'red' ? '#FF4444' : '#1A1A1A'}
                      stroke={node.isActive ? '#00FF00' : node.isHighlighted ? '#FFFF00' : 'rgba(255,255,255,0.1)'}
                      strokeWidth={node.isActive || node.isHighlighted ? 4 : 2}
                      className="transition-all duration-500"
                      style={{ filter: node.isHighlighted ? 'url(#glow)' : 'none' }}
                    />

                    {/* Node Value */}
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      className="text-lg font-black font-mono tracking-tighter"
                    >
                      {node.value}
                    </text>

                    {/* Status Indicator */}
                    {node.isActive && (
                      <motion.circle
                        cx={node.x + 20}
                        cy={node.y - 20}
                        r={6}
                        fill="#00FF00"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="shadow-lg shadow-green-500/50"
                      />
                    )}
                  </motion.g>
                ))}
              </svg>
            </motion.div>
          </AnimatePresence>          {/* Educational Overlay */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute left-16 bottom-16 max-w-xl z-30"
          >
            <div className="bg-surface-darker/80 backdrop-blur-xl border-b-8 border-r-8 border-black/40 border border-white/10 rounded-[3rem] p-16 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2.5 h-full bg-lecture-primary"></div>
              <div className="flex items-center gap-8 mb-10">
                <div className="w-16 h-16 rounded-xl bg-lecture-primary/10 flex items-center justify-center border border-lecture-primary/20">
                  <span className="material-symbols-outlined text-lecture-primary text-4xl">info</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">{currentStep.title}</h2>
              </div>
              <p className="text-2xl text-text-secondary leading-relaxed font-medium">
                {currentStep.description}
              </p>
              <div className="mt-12 flex items-center gap-6">
                <span className="text-base font-black text-lecture-primary uppercase tracking-[0.2em]">Current Context:</span>
                <span className="px-5 py-2.5 rounded-lg bg-white/5 text-sm font-mono text-white/50 border border-white/10 uppercase">RB-Insertion</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Presenter Panel */}
        <motion.aside 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-[500px] border-l border-white/5 bg-surface-darker/40 backdrop-blur-xl flex flex-col z-30"
        >
          {/* Presenter Notes */}
          <div className="flex-1 flex flex-col p-16 overflow-hidden">
            <div className="flex items-center justify-between mb-16">
              <h3 className="text-lg font-black uppercase tracking-[0.3em] flex items-center gap-6">
                <span className="w-5 h-5 rounded-full bg-lecture-primary"></span>
                Presenter Notes
              </h3>
              <span className="text-base font-mono text-text-secondary">Step {currentStepIndex + 1} / {mockSteps.length}</span>
            </div>
            
            <div className="flex-1 bg-background-dark/50 rounded-[3rem] p-16 border border-white/5 overflow-y-auto scrollbar-hide relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-lecture-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <p className="text-3xl text-gray-300 leading-relaxed font-medium italic">
                "{currentStep.presenterNotes}"
              </p>
              
              <div className="mt-16 space-y-12">
                <div className="p-10 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-sm font-black text-lecture-primary uppercase tracking-widest mb-5 block">Key Concept</span>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    Red-Black trees maintain balance through specific coloring rules. No two red nodes can be adjacent.
                  </p>
                </div>
                <div className="p-10 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-sm font-black text-secondary uppercase tracking-widest mb-5 block">Student Q&A</span>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    "Why do we start with red?" - Explain that it minimizes black-height violations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones / Timeline */}
          <div className="p-16 border-t border-white/5 bg-background-dark/40">
            <h3 className="text-base font-black uppercase tracking-[0.3em] mb-12 text-text-secondary">Lecture Milestones</h3>
            <div className="space-y-6">
              {mockSteps.map((step, i) => (
                <motion.button
                  key={step.id}
                  whileHover={{ x: 5 }}
                  onClick={() => setCurrentStepIndex(i)}
                  className={`w-full flex items-center gap-8 p-8 rounded-2xl border transition-all ${
                    currentStepIndex === i 
                      ? 'bg-lecture-primary/10 border-lecture-primary/30 text-white' 
                      : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono text-lg font-black ${
                    currentStepIndex === i ? 'bg-lecture-primary text-surface-darker' : 'bg-surface-darker text-text-secondary'
                  }`}>
                    0{step.id}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-lg font-black uppercase tracking-widest block">{step.title}</span>
                    <span className="text-sm opacity-50 font-medium">04:2{i} • Completed</span>
                  </div>
                  {currentStepIndex > i && (
                    <span className="material-symbols-outlined text-lecture-primary text-2xl">check_circle</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.aside>
      </main>

      {/* --- Bottom Toolbar --- */}
      <motion.footer 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-16 py-10 bg-background-dark/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-between shrink-0 z-50"
      >
        <div className="flex items-center gap-16">
          <div className="flex items-center gap-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
              className="w-16 h-16 rounded-2xl bg-surface-darker border border-white/10 flex items-center justify-center text-text-secondary hover:text-white disabled:opacity-30 transition-all shadow-xl"
            >
              <span className="material-symbols-outlined text-3xl">skip_previous</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-24 h-24 rounded-[2.5rem] bg-lecture-primary text-surface-darker flex items-center justify-center shadow-2xl shadow-lecture-primary/30 group"
            >
              <span className="material-symbols-outlined text-5xl group-hover:scale-110 transition-transform">play_arrow</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentStepIndex(Math.min(mockSteps.length - 1, currentStepIndex + 1))}
              disabled={currentStepIndex === mockSteps.length - 1}
              className="w-16 h-16 rounded-2xl bg-surface-darker border border-white/10 flex items-center justify-center text-text-secondary hover:text-white disabled:opacity-30 transition-all shadow-xl"
            >
              <span className="material-symbols-outlined text-3xl">skip_next</span>
            </motion.button>
          </div>

          <div className="h-16 w-px bg-white/10"></div>

          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <span className="text-xs font-black text-text-secondary uppercase tracking-[0.3em] mb-3">Playback Speed</span>
              <div className="flex items-center gap-4">
                {['0.5x', '1.0x', '1.5x', '2.0x'].map((speed) => (
                  <button key={speed} className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${speed === '1.0x' ? 'bg-lecture-primary text-surface-darker' : 'text-text-secondary hover:bg-white/5'}`}>
                    {speed}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-3xl mx-32">
          <div className="flex items-center justify-between mb-6">
            <span className="text-base font-black uppercase tracking-widest text-lecture-primary">Lecture Progress</span>
            <span className="text-base font-mono text-text-secondary">{Math.round(((currentStepIndex + 1) / mockSteps.length) * 100)}%</span>
          </div>
          <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / mockSteps.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-lecture-primary to-secondary shadow-[0_0_20px_rgba(0,255,170,0.5)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-6 px-12 py-6 rounded-2xl bg-surface-darker border border-white/10 text-text-secondary hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-[32px]">photo_camera</span>
            <span className="text-base font-black uppercase tracking-widest">Snapshot</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-6 px-12 py-6 rounded-2xl bg-lecture-primary/10 border border-lecture-primary/20 text-lecture-primary hover:bg-lecture-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-[32px]">ios_share</span>
            <span className="text-base font-black uppercase tracking-widest">Export</span>
          </motion.button>
        </div>
      </motion.footer>

      {/* Floating Action Menu (Mobile/Quick Access) */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-32 right-10 z-50"
      >
        <motion.button
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-full bg-lecture-primary text-surface-darker flex items-center justify-center shadow-2xl shadow-lecture-primary/40"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
