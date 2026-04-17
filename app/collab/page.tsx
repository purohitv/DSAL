// app/collab/page.tsx
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'idle' | 'away';
  cursorPosition?: { x: number; y: number };
  selection?: { start: number; end: number };
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  snapshot?: {
    title: string;
    description: string;
    data: any;
  };
}

interface CodeLine {
  number: number;
  content: string;
  isActive: boolean;
  hasComment: boolean;
  highlightColor?: string;
}

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  isActive: boolean;
  isVisited: boolean;
  isCurrent: boolean;
  comments?: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

export default function DsalCollaborativeReviewInterface() {
  // State
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: '1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', status: 'online' },
    { id: '2', name: 'Mike Rodriguez', avatar: '/avatars/mike.jpg', status: 'idle' },
    { id: '3', name: 'Alex Kumar', avatar: '/avatars/alex.jpg', status: 'online' },
    { id: '4', name: 'Emma Wilson', avatar: '/avatars/emma.jpg', status: 'away' },
  ]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Mike Rodriguez',
      userAvatar: '/avatars/mike.jpg',
      content: 'Why is the priority queue behaving like a FIFO here? Check line 42.',
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: '2',
      userId: '1',
      userName: 'Sarah Chen',
      userAvatar: '/avatars/sarah.jpg',
      content: 'I think the comparator is inverted. Look at this state snapshot, the weights are negative.',
      timestamp: new Date(Date.now() - 240000),
      snapshot: {
        title: 'Queue State',
        description: 'Captured at T=14.2s',
        data: { queue: [1, 2, 3], weights: [-5, -2, -1] }
      }
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isSyncView, setIsSyncView] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNode, setActiveNode] = useState<string>('C');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchName, setBranchName] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Sample graph nodes
  const nodes: GraphNode[] = [
    { id: 'A', label: 'A', x: 40, y: 30, isActive: false, isVisited: true, isCurrent: false },
    { id: 'B', label: 'B', x: 30, y: 50, isActive: false, isVisited: true, isCurrent: false },
    { id: 'C', label: 'C', x: 60, y: 40, isActive: true, isVisited: false, isCurrent: true },
    { id: 'D', label: 'D', x: 50, y: 70, isActive: false, isVisited: false, isCurrent: false },
  ];
  
  // Sample code lines
  const codeLines: CodeLine[] = [
    { number: 38, content: 'class PriorityQueue {', isActive: false, hasComment: false },
    { number: 39, content: '  constructor() {', isActive: false, hasComment: false },
    { number: 40, content: '    this.values = [];', isActive: false, hasComment: false },
    { number: 41, content: '  }', isActive: false, hasComment: false },
    { number: 42, content: '  enqueue(val, priority) {', isActive: true, hasComment: true, highlightColor: 'primary' },
    { number: 43, content: '    this.values.push({val, priority});', isActive: false, hasComment: false },
    { number: 44, content: '    this.sort();', isActive: false, hasComment: false },
    { number: 45, content: '  }', isActive: false, hasComment: false },
    { number: 46, content: '  dequeue() {', isActive: false, hasComment: false },
    { number: 47, content: '    return this.values.shift();', isActive: false, hasComment: false },
  ];
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Auto-advance simulation
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isPlaying, totalSteps]);
  
  // Handle send message
  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      userId: 'current',
      userName: 'You',
      userAvatar: '/avatars/you.jpg',
      content: newMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  }, [newMessage]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Enter to send message (with Shift for new line)
      if (e.key === 'Enter' && !e.shiftKey && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        sendMessage();
      }
      
      // Space to play/pause
      if (e.key === ' ' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      
      // Arrow keys for step navigation
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentStep(prev => Math.max(0, prev - 1));
        if (isPlaying) setIsPlaying(false);
      }
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1));
        if (isPlaying) setIsPlaying(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sendMessage, isPlaying, totalSteps]);
  
  // Handle create branch
  const createBranch = useCallback(() => {
    if (branchName.trim()) {
      setSelectedBranch(branchName);
      setShowBranchModal(false);
      setBranchName('');
    }
  }, [branchName]);
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border-dark bg-surface-dark/95 backdrop-blur-sm px-6 py-3 h-16 z-20 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-text-secondary hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </Link>
          <div className="size-9 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">hub</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold leading-tight tracking-tight">
              DSAL Review: Dijkstra's Algorithm
            </h1>
            <p className="text-slate-400 text-xs">Version 4.2 • Last edited 2m ago • {collaborators.length} online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Collaborators avatars */}
          <div className="flex items-center -space-x-2">
            {collaborators.slice(0, 3).map((collab) => (
              <div key={collab.id} className="relative group cursor-pointer">
                <div className="size-9 rounded-full border-2 border-surface-dark bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {collab.name.charAt(0)}
                  </span>
                </div>
                <div className={`absolute bottom-0 right-0 size-2.5 border-2 border-surface-dark rounded-full ${
                  collab.status === 'online' ? 'bg-green-500' : 
                  collab.status === 'idle' ? 'bg-amber-500' : 'bg-gray-500'
                }`} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-dark rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {collab.name}
                </div>
              </div>
            ))}
            {collaborators.length > 3 && (
              <div className="relative group cursor-pointer flex items-center justify-center bg-slate-700 size-9 rounded-full border-2 border-surface-dark text-xs font-bold text-white">
                +{collaborators.length - 3}
              </div>
            )}
          </div>
          
          <div className="h-6 w-px bg-border-dark" />
          
          {/* Sync view toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-300">Sync View</span>
            <button
              onClick={() => setIsSyncView(!isSyncView)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isSyncView ? 'bg-primary' : 'bg-slate-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSyncView ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          {/* Share button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">share</span>
            <span>Share</span>
          </motion.button>
        </div>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Code Editor */}
        <aside className="w-80 flex flex-col border-r border-border-dark bg-surface-darker z-10 hidden lg:flex">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-dark bg-surface-dark">
            <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">code</span>
              Source: Graph.js
            </span>
            <button className="text-slate-500 hover:text-white">
              <span className="material-symbols-outlined text-lg">open_in_full</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto font-mono text-xs leading-6 p-4 bg-surface-darker custom-scrollbar">
            {codeLines.map((line) => (
              <motion.div
                key={line.number}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-4 group hover:bg-white/5 transition-colors ${
                  line.isActive ? 'bg-primary/20 -mx-4 px-4 border-l-2 border-primary text-white' : ''
                }`}
              >
                <span className={`w-6 text-right select-none ${
                  line.isActive ? 'text-primary' : 'text-slate-600'
                }`}>
                  {line.number}
                </span>
                <span className={`flex-1 ${line.highlightColor ? `text-${line.highlightColor}` : ''}`}>
                  {line.content}
                </span>
                {line.hasComment && (
                  <span className="material-symbols-outlined text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    comment
                  </span>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Memory Watch */}
          <div className="h-1/3 border-t border-border-dark flex flex-col">
            <div className="px-4 py-2 bg-surface-dark border-b border-border-dark text-xs font-bold text-slate-300">
              Memory Watch
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
              <div className="flex justify-between">
                <span className="text-purple-400">queue_size</span>
                <span className="text-white font-mono">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">current_node</span>
                <span className="text-yellow-400 font-mono">'C'</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">visited</span>
                <span className="text-slate-400">['A', 'B']</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">distances</span>
                <span className="text-accent-mint text-[10px]">{JSON.stringify({ A: 0, B: 5, C: 12, D: Infinity })}</span>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Center - Graph Visualization */}
        <section className="flex-1 flex flex-col relative bg-background-dark overflow-hidden">
          {/* Playback controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface-dark/90 backdrop-blur-sm border border-border-dark rounded-full px-4 py-2 shadow-xl z-20">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
              title="Previous (←)"
            >
              <span className="material-symbols-outlined text-xl">skip_previous</span>
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              <span className="material-symbols-outlined text-xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <button
              onClick={() => setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1))}
              className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
              title="Next (→)"
            >
              <span className="material-symbols-outlined text-xl">skip_next</span>
            </button>
            <div className="w-px h-4 bg-border-dark mx-1" />
            <div className="text-xs font-mono text-primary font-bold">
              Step {currentStep + 1}/{totalSteps}
            </div>
          </div>
          
          {/* Graph canvas */}
          <div className="flex-1 relative cursor-crosshair bg-gradient-to-br from-background-dark to-surface-dark">
            {/* Graph edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '500px' }}>
              <defs>
                <marker id="arrowhead" markerHeight="7" markerWidth="10" orient="auto" refX="28" refY="3.5">
                  <polygon fill="#475569" points="0 0, 10 3.5, 0 7" />
                </marker>
                <marker id="arrowhead-active" markerHeight="7" markerWidth="10" orient="auto" refX="28" refY="3.5">
                  <polygon fill="#3b82f6" points="0 0, 10 3.5, 0 7" />
                </marker>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Edges */}
              <line markerEnd="url(#arrowhead)" stroke="#475569" strokeWidth="2" x1="40%" x2="30%" y1="30%" y2="50%" />
              <line markerEnd="url(#arrowhead-active)" stroke="#3b82f6" strokeWidth="3" x1="40%" x2="60%" y1="30%" y2="40%" filter="url(#glow)" />
              <line markerEnd="url(#arrowhead)" stroke="#475569" strokeWidth="2" x1="30%" x2="50%" y1="50%" y2="70%" />
              <line markerEnd="url(#arrowhead)" stroke="#475569" strokeWidth="2" x1="60%" x2="50%" y1="40%" y2="70%" />
            </svg>
            
            {/* Nodes */}
            {nodes.map((node) => (
              <motion.div
                key={node.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div className={`size-14 rounded-full flex items-center justify-center shadow-lg relative z-10 transition-all group-hover:scale-105 ${
                  node.isCurrent
                    ? 'bg-surface-dark border-4 border-primary shadow-[0_0_20px_rgba(127,19,236,0.4)]'
                    : node.isVisited
                    ? 'bg-slate-800 border-4 border-slate-600'
                    : 'bg-slate-800 border-4 border-slate-600 opacity-60'
                }`}>
                  <span className={`font-bold text-lg ${
                    node.isCurrent ? 'text-primary' : 'text-white'
                  }`}>
                    {node.label}
                  </span>
                </div>
                
                {node.isCurrent && (
                  <div className="absolute -top-3 -right-3 z-20">
                    <div className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-surface-dark">
                      <span className="material-symbols-outlined text-[10px]">play_arrow</span>
                      Current
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Active cursors from collaborators */}
            <div className="absolute top-[42%] left-[63%] pointer-events-none z-30 transition-all duration-300">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1"
              >
                <svg className="text-purple-500 drop-shadow-md" fill="none" height="20" viewBox="0 0 24 24" width="20">
                  <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L17.9164 12.3673H5.65376Z" fill="currentColor" stroke="white" />
                </svg>
                <div className="bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                  Sarah is selecting...
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Timeline / Version Control */}
          <div className="h-40 border-t border-border-dark bg-surface-darker flex flex-col z-20">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-dark">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">alt_route</span>
                Version Control
              </div>
              <button
                onClick={() => setShowBranchModal(true)}
                className="text-xs bg-surface-dark hover:bg-white/5 border border-border-dark text-slate-300 px-3 py-1 rounded transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                New Branch
              </button>
            </div>
            
            <div className="flex-1 relative overflow-x-auto p-4 flex items-center">
              {/* Timeline track */}
              <div className="absolute h-1 bg-slate-700 w-[calc(100%-2rem)] top-1/2 -translate-y-1/2 rounded-full left-4" />
              
              <div className="relative flex w-full justify-between px-4 items-center">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative group cursor-pointer"
                    onClick={() => setCurrentStep(i)}
                  >
                    <div className={`size-3 rounded-full transition-all ${
                      i === currentStep
                        ? 'bg-primary ring-4 ring-primary/20 scale-125'
                        : i < currentStep
                        ? 'bg-primary/50 hover:bg-primary'
                        : 'bg-slate-500 hover:bg-white'
                    }`} />
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      Step {i + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Branch indicator */}
              {selectedBranch && (
                <div className="absolute top-[calc(50%+30px)] left-[420px]">
                  <div className="relative group cursor-pointer">
                    <div className="size-3 bg-rose-500 rounded-full ring-4 ring-rose-500/20" />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] text-rose-500 font-bold whitespace-nowrap">
                      Branch: {selectedBranch}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Right Sidebar - Chat */}
        <aside className="w-96 flex flex-col border-l border-border-dark bg-surface-dark z-20">
          <div className="px-4 py-3 border-b border-border-dark flex items-center justify-between">
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">chat</span>
              Review Chat
            </h2>
            <button className="text-slate-400 hover:text-white">
              <span className="material-symbols-outlined text-xl">more_horiz</span>
            </button>
          </div>
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`flex gap-3 ${message.userId === 'current' ? 'flex-row-reverse' : ''}`}
                >
                  <div className="size-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {message.userName.charAt(0)}
                  </div>
                  <div className={`flex flex-col gap-1 max-w-[70%] ${message.userId === 'current' ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{message.userName}</span>
                      <span className="text-[10px] text-slate-500">{formatTime(message.timestamp)}</span>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      message.userId === 'current'
                        ? 'bg-primary/10 border-primary/20 rounded-tr-none'
                        : 'bg-surface-darker border-border-dark rounded-tl-none'
                    }`}>
                      <p className="text-sm text-slate-300">{message.content}</p>
                      
                      {message.snapshot && (
                        <div className="mt-2 cursor-pointer group hover:border-primary/50 transition-colors bg-[#0f111a] border border-border-dark rounded-lg p-2 flex items-start gap-2">
                          <div className="size-8 bg-primary/10 rounded flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-base">data_object</span>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate">{message.snapshot.title}</h4>
                            <p className="text-[9px] text-slate-500">{message.snapshot.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <div className="p-4 border-t border-border-dark bg-surface-dark">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message... (Enter to send)"
                className="w-full bg-surface-darker border border-border-dark rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                rows={2}
              />
              <button
                onClick={sendMessage}
                className="absolute right-2 bottom-2 p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-2 px-1">
              <button className="text-slate-500 hover:text-white transition-colors" title="Attach Snapshot">
                <span className="material-symbols-outlined text-lg">add_a_photo</span>
              </button>
              <button className="text-slate-500 hover:text-white transition-colors" title="Code Snippet">
                <span className="material-symbols-outlined text-lg">code</span>
              </button>
              <button className="text-slate-500 hover:text-white transition-colors" title="Emoji">
                <span className="material-symbols-outlined text-lg">sentiment_satisfied</span>
              </button>
            </div>
          </div>
        </aside>
      </main>
      
      {/* Branch Creation Modal */}
      <AnimatePresence>
        {showBranchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
            onClick={() => setShowBranchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-darker border border-border-dark rounded-xl p-6 w-96 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-2">Create New Branch</h3>
              <p className="text-sm text-text-secondary mb-4">
                Branch from current state to experiment with changes.
              </p>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Branch name..."
                className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createBranch();
                  if (e.key === 'Escape') setShowBranchModal(false);
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBranchModal(false)}
                  className="flex-1 px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-secondary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createBranch}
                  className="flex-1 px-4 py-2 bg-primary rounded-lg text-white font-bold hover:bg-primary-dark transition-colors"
                >
                  Create Branch
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
