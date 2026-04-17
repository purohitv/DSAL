// app/quantum/grover/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'fotion';

const CODE_SNIPPET = `from qiskit import QuantumCircuit
from qiskit.algorithms import Grover

# Define the oracle for state |101>
oracle = QuantumCircuit(3)
oracle.cz(0, 2)
oracle.cz(1, 2)

# Apply Hadamard to initialize superposition
qc.h(range(3))
qc.barrier()
# Apply Oracle
qc.append(oracle, range(3))
qc.barrier()
# Apply Diffuser
qc.h(range(3))
qc.x(range(3))
qc.h(range(3))`;

export default function GroverAlgorithmPage() {
  const [activeStep, setActiveStep] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedQubit, setSelectedQubit] = useState(1);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '[System] Quantum Backend: AerSimulator (GPU)',
    '[System] Allocating 3 qubits... Done.',
    '[Info] Initial state |000> prepared.',
    '[Process] Applying Hadamard Gate to all qubits (H^⊗3)...',
  ]);
  const [stateProbabilities, setStateProbabilities] = useState([
    { state: '|000⟩', prob: 12.5, phase: '0π', isMarked: false },
    { state: '|001⟩', prob: 12.5, phase: '0π', isMarked: false },
    { state: '|010⟩', prob: 12.5, phase: '0π', isMarked: false },
    { state: '|011⟩', prob: 12.5, phase: '0π', isMarked: false },
    { state: '|100⟩', prob: 12.5, phase: '0π', isMarked: false },
    { state: '|101⟩', prob: 12.5, phase: 'π (Oracle)', isMarked: true },
    { state: '|110⟩', prob: 12.5, phase: '0π', isMarked: false },
    { state: '|111⟩', prob: 12.5, phase: '0π', isMarked: false },
  ]);

  const totalSteps = 12;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const stepNames = ['Initialization', 'Hadamard', 'Superposition', 'Oracle', 'Diffuser', 'Measurement'];
  const currentStepName = stepNames[Math.floor(activeStep / 2)] || 'Processing';

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden">
      {/* Header */}
      <header className="flex-none flex items-center justify-between border-b border-border-dark px-6 py-3 bg-[#130b1b]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-primary relative">
            <div className="absolute inset-0 bg-primary blur-xl opacity-20"></div>
            <span className="material-symbols-outlined text-3xl relative z-10">hub</span>
            <h1 className="text-white text-xl font-bold tracking-tight relative z-10">
              DSAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-normal text-sm tracking-widest opacity-90">QUANTUM IDE</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-text-dim hover:text-white text-sm font-medium transition-colors" href="#">File</a>
            <a className="text-text-dim hover:text-white text-sm font-medium transition-colors" href="#">Edit</a>
            <a className="text-text-dim hover:text-white text-sm font-medium transition-colors" href="#">View</a>
            <a className="text-primary hover:text-white text-sm font-medium transition-colors flex items-center gap-1" href="#">
              <span className="material-symbols-outlined text-[16px]">play_arrow</span> Run
            </a>
            <a className="text-text-dim hover:text-white text-sm font-medium transition-colors" href="#">Tools</a>
            <a className="text-text-dim hover:text-white text-sm font-medium transition-colors" href="#">Help</a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-64 hidden lg:block group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-dim group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input className="block w-full p-2 pl-10 text-sm text-white bg-panel-dark border border-border-dark rounded-lg placeholder-text-dim focus:ring-1 focus:ring-primary focus:border-primary shadow-inner" placeholder="Search algorithms, nodes..." type="text" />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center size-9 rounded-lg bg-panel-dark border border-border-dark text-text-dim hover:text-white hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
            <button className="flex items-center justify-center size-9 rounded-lg bg-panel-dark border border-border-dark text-text-dim hover:text-white hover:bg-white/5 transition-colors relative">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-primary rounded-full shadow-neon"></span>
            </button>
            <div className="w-px h-8 bg-border-dark mx-1"></div>
            <button className="flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20 ring-2 ring-transparent hover:ring-primary/50 transition-all">
              JD
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb & Timeline */}
      <div className="flex-none border-b border-border-dark bg-[#160d1f] px-6 py-3 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="flex items-center gap-2 text-sm z-10">
          <a className="text-text-dim hover:text-primary flex items-center gap-1" href="#">
            <span className="material-symbols-outlined text-[16px]">home</span>
          </a>
          <span className="text-border-dark">/</span>
          <a className="text-text-dim hover:text-primary" href="#">Algorithms</a>
          <span className="text-border-dark">/</span>
          <a className="text-text-dim hover:text-primary" href="#">Quantum</a>
          <span className="text-border-dark">/</span>
          <span className="text-white font-semibold flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary shadow-neon"></span>
            Grover's Search
          </span>
        </div>

        <div className="flex-1 max-w-2xl mx-auto flex items-center gap-4 z-10">
          <button className="text-text-dim hover:text-white transition-colors" onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}>
            <span className="material-symbols-outlined">skip_previous</span>
          </button>
          <button className="text-primary hover:text-white transition-colors bg-primary/10 rounded-full p-1 border border-primary/20 shadow-[0_0_15px_rgba(217,70,239,0.2)]" onClick={() => setIsPlaying(!isPlaying)}>
            <span className="material-symbols-outlined">{isPlaying ? 'pause' : 'play_arrow'}</span>
          </button>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-xs text-text-dim font-mono mb-1">
              <span>Initialization</span>
              <span className="text-primary font-bold">Step {activeStep + 1}/{totalSteps}: {currentStepName}</span>
              <span>Oracle</span>
              <span>Measurement</span>
            </div>
            <div className="relative h-2 bg-black/40 rounded-full overflow-hidden w-full border border-white/5">
              <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-secondary via-primary to-accent shadow-[0_0_15px_theme('colors.primary')]" style={{ width: `${((activeStep + 1) / totalSteps) * 100}%` }}></div>
            </div>
          </div>
          <button className="text-text-dim hover:text-white transition-colors" onClick={() => setActiveStep(prev => Math.min(totalSteps - 1, prev + 1))}>
            <span className="material-symbols-outlined">skip_next</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-accent bg-accent/10 px-3 py-1.5 rounded border border-accent/20 z-10 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
          <span className="material-symbols-outlined text-[14px] animate-pulse">wifi_tethering</span>
          System Coherent
        </div>
      </div>

      <main className="flex-1 p-4 grid grid-cols-12 gap-4 h-full min-h-0 relative z-0 overflow-auto">
        {/* Left Panel - Code Editor */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0 h-full">
          <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden shadow-cinematic">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-border-dark">
              <span className="text-sm font-medium text-text-dim flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary">code</span>
                grover_algo.py
              </span>
              <span className="text-xs text-text-dim font-mono bg-black/20 px-2 py-0.5 rounded">Python 3.9 (Qiskit)</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-[#0e0714]/80 relative">
              <pre className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">
                <code>
                  {CODE_SNIPPET.split('\n').map((line, idx) => (
                    <div key={idx} className={`code-line relative ${idx === 7 ? 'bg-primary/10 border-l-2 border-primary shadow-[0_0_20px_rgba(217,70,239,0.15)]' : ''}`}>
                      <span className="inline-block w-8 text-gray-500 text-right mr-4">{idx + 1}</span>
                      <span className={idx === 7 ? 'text-accent' : idx === 0 || idx === 1 ? 'text-primary' : ''}>
                        {line}
                      </span>
                      {idx === 7 && <span className="text-primary font-bold animate-pulse text-xs ml-4">&lt;-- Active Step</span>}
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Center Panel - 3D Visualization */}
        <section className="col-span-12 lg:col-span-6 flex flex-col gap-4 min-h-0 h-full">
          <div className="flex-[2] glass-panel rounded-xl flex flex-col relative overflow-hidden shadow-cinematic">
            <div className="absolute inset-0 cinematic-overlay pointer-events-none z-0"></div>
            <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-circuit-pattern" style={{ backgroundSize: '30px 30px', backgroundImage: 'radial-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px)' }}></div>
            
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-dark z-10 bg-white/5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">view_in_ar</span>
                3D Bloch Visualization
              </h2>
              <div className="flex gap-2">
                {[0, 1, 2].map((qubit) => (
                  <button
                    key={qubit}
                    onClick={() => setSelectedQubit(qubit)}
                    className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                      selectedQubit === qubit
                        ? 'text-white bg-primary/20 border border-primary/50 shadow-neon'
                        : 'text-text-dim bg-panel-dark border border-border-dark hover:border-primary'
                    }`}
                  >
                    Qubit {qubit}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 z-10 items-center justify-center">
              {/* 3D Sphere Visualization */}
              <div className="flex-1 flex items-center justify-center relative h-full w-full scene-3d">
                <div className="sphere-container">
                  <div className="ring ring-x"></div>
                  <div className="ring ring-y"></div>
                  <div className="ring ring-z"></div>
                  <div className="ring ring-d1"></div>
                  <div className="ring ring-d2"></div>
                  <div className="core-glow animate-pulse-slow"></div>
                  <div className="vector-arrow" style={{ transform: `translateX(-50%) translateY(-100%) rotateX(-30deg) rotateZ(${45 + activeStep * 15}deg)` }}></div>
                  <div className="vector-head" style={{ transform: `translate(-50%, -50%) rotateZ(${45 + activeStep * 15}deg)` }}></div>
                  <div className="absolute top-[-20px] left-[90px] text-xs font-mono text-primary font-bold tracking-widest">|0⟩</div>
                  <div className="absolute bottom-[-25px] left-[90px] text-xs font-mono text-secondary font-bold tracking-widest">|1⟩</div>
                  <div className="absolute w-full h-full rounded-full border border-dotted border-white/10 animate-[spin_10s_linear_infinite]"></div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
              </div>

              {/* Amplitude Bars */}
              <div className="w-full lg:w-48 flex flex-col justify-end pb-4 pl-4 border-l border-white/5 bg-gradient-to-l from-black/20 to-transparent">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-xs font-bold text-text-dim uppercase tracking-wider">Amplitude</h3>
                  <span className="text-xs text-accent font-mono border border-accent/30 rounded px-1">N=8</span>
                </div>
                <div className="h-40 flex items-end justify-between gap-1.5">
                  {stateProbabilities.map((state, idx) => (
                    <div key={idx} className="w-full bg-secondary/10 rounded-t-sm relative group" style={{ height: `${state.prob * 2}%` }}>
                      <div className={`absolute bottom-0 w-full h-full rounded-t-sm transition-all ${
                        state.isMarked ? 'bg-gradient-to-t from-primary/60 to-primary shadow-[0_0_15px_theme("colors.primary")]' : 'bg-gradient-to-t from-secondary/40 to-secondary/80 group-hover:from-primary/60 group-hover:to-primary'
                      }`}></div>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {state.prob}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[10px] text-text-dim font-mono text-center">Interference Pattern</div>
              </div>
            </div>
          </div>

          {/* Console Output */}
          <div className="h-48 flex-none glass-panel rounded-xl flex flex-col shadow-cinematic">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-border-dark">
              <span className="text-sm font-medium text-text-dim flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                Console Output
              </span>
              <button onClick={() => setTerminalOutput([])} className="text-xs text-text-dim hover:text-white flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded transition-colors">
                <span className="material-symbols-outlined text-[14px]">delete</span> Clear
              </button>
            </div>
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto text-gray-300 bg-black/40">
              {terminalOutput.map((line, idx) => (
                <div key={idx} className="mb-1">
                  <span className="text-green-400">➜</span> <span className="text-accent">~</span> {line}
                </div>
              ))}
              <div className="mt-2 flex items-center gap-1">
                <span className="text-green-400">➜</span>
                <div className="w-2 h-4 bg-primary animate-pulse"></div>
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>
        </section>

        {/* Right Panel - Circuit & State Monitor */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0 h-full">
          <div className="flex-1 glass-panel rounded-xl flex flex-col shadow-cinematic">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-border-dark">
              <span className="text-sm font-medium text-text-dim flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">schema</span>
                Circuit View
              </span>
              <span className="material-symbols-outlined text-text-dim text-[16px] hover:text-white cursor-pointer">zoom_out_map</span>
            </div>
            <div className="flex-1 p-4 overflow-x-auto relative flex flex-col justify-center gap-8 bg-gradient-to-b from-[#160d1f] to-transparent">
              {[0, 1, 2].map((qubit) => (
                <div key={qubit} className="flex items-center h-8 relative group">
                  <div className="w-8 text-xs font-mono text-text-dim group-hover:text-white transition-colors">q{qubit}</div>
                  <div className="flex-1 h-[2px] bg-border-dark flex items-center relative">
                    <div className="gate-3d absolute left-8 size-9 bg-gradient-to-br from-secondary to-[#4c1d95] border-t border-white/20 rounded flex items-center justify-center text-xs font-bold text-white shadow-gate z-20 cursor-pointer">H</div>
                    {qubit === 2 && (
                      <div className="gate-3d absolute left-32 size-9 bg-gradient-to-br from-accent to-[#0891b2] border-t border-white/20 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-gate z-20 cursor-pointer">X</div>
                    )}
                    {(qubit === 0 || qubit === 1) && (
                      <>
                        <div className="absolute left-32 size-3 bg-accent rounded-full z-10 shadow-neon"></div>
                        <div className="absolute left-32 h-20 w-[2px] bg-accent/50 top-4 shadow-[0_0_5px_rgba(34,211,238,0.5)]"></div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div className="absolute top-0 bottom-0 left-12 w-[1px] bg-primary/50 border-r border-dashed border-primary z-0 shadow-[0_0_10px_theme('colors.primary')]">
                <div className="absolute top-0 -left-1.5 size-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary"></div>
              </div>
            </div>
          </div>

          {/* State Monitor Table */}
          <div className="flex-1 glass-panel rounded-xl flex flex-col shadow-cinematic">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-border-dark">
              <span className="text-sm font-medium text-text-dim flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">data_object</span>
                State Monitor
              </span>
              <span className="material-symbols-outlined text-text-dim text-[16px] cursor-pointer hover:text-white">filter_list</span>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black/20 sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-2 text-text-dim font-normal">State</th>
                    <th className="px-4 py-2 text-text-dim font-normal">Prob %</th>
                    <th className="px-4 py-2 text-text-dim font-normal">Phase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stateProbabilities.map((state, idx) => (
                    <tr key={idx} className={`hover:bg-primary/5 transition-colors ${state.isMarked ? 'bg-secondary/20 border-l-2 border-secondary' : ''}`}>
                      <td className={`px-4 py-2 font-bold ${state.isMarked ? 'text-accent' : 'text-white'}`}>{state.state}</td>
                      <td className={`px-4 py-2 ${state.isMarked ? 'text-white font-bold' : 'text-text-dim'}`}>{state.prob}%</td>
                      <td className={`px-4 py-2 ${state.isMarked ? 'text-secondary font-bold' : 'text-text-dim'}`}>{state.phase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex-none bg-[#130b1b] border-t border-border-dark px-4 py-1.5 text-[11px] text-text-dim flex justify-between items-center font-mono relative z-20">
        <div className="flex gap-4">
          <span className="flex items-center gap-1 hover:text-white cursor-pointer"><span className="material-symbols-outlined text-[12px]">code_blocks</span> Master</span>
          <span className="flex items-center gap-1 hover:text-white cursor-pointer"><span className="material-symbols-outlined text-[12px]">warning</span> 0 Errors</span>
          <span className="flex items-center gap-1 text-primary hover:text-primary-dark cursor-pointer"><span className="material-symbols-outlined text-[12px]">info</span> 2 Hints</span>
        </div>
        <div className="flex gap-4">
          <span>Ln 28, Col 12</span>
          <span>UTF-8</span>
          <span className="flex items-center gap-1 text-accent animate-pulse"><span className="material-symbols-outlined text-[12px]">cloud_queue</span> Connected to IBM Quantum (Sim)</span>
        </div>
      </footer>

      <style jsx>{`
        .glass-panel {
          background: rgba(26, 16, 37, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(139, 92, 246, 0.15);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        .scene-3d {
          perspective: 800px;
          transform-style: preserve-3d;
        }
        .sphere-container {
          position: relative;
          width: 200px;
          height: 200px;
          transform-style: preserve-3d;
          animation: float 6s ease-in-out infinite;
        }
        .ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(217, 70, 239, 0.3);
          box-shadow: 0 0 15px rgba(217, 70, 239, 0.1);
        }
        .ring-x { transform: rotateX(90deg); border-color: rgba(34, 211, 238, 0.3); }
        .ring-y { transform: rotateY(90deg); }
        .ring-z { transform: rotateZ(0deg); border-color: rgba(139, 92, 246, 0.3); }
        .ring-d1 { transform: rotateX(45deg) rotateY(45deg); border: 1px dashed rgba(255, 255, 255, 0.1); }
        .ring-d2 { transform: rotateX(-45deg) rotateY(45deg); border: 1px dashed rgba(255, 255, 255, 0.1); }
        .core-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #fff, #d946ef);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 30px 10px rgba(217, 70, 239, 0.4);
        }
        .vector-arrow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 45%;
          background: linear-gradient(to top, transparent, #22d3ee);
          transform-origin: bottom center;
          transform: translateX(-50%) translateY(-100%) rotateX(-30deg);
          box-shadow: 0 0 8px #22d3ee;
        }
        .vector-head {
          position: absolute;
          top: 0;
          left: 50%;
          width: 8px;
          height: 8px;
          background: #22d3ee;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 15px #22d3ee, 0 0 30px #22d3ee;
        }
        .gate-3d {
          transition: all 0.2s ease;
          position: relative;
        }
        .gate-3d:hover {
          transform: translateY(2px);
          box-shadow: 0 2px 0 theme('colors.primary-dark'), 0 2px 5px rgba(0,0,0,0.5);
        }
        .cinematic-overlay {
          background: radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 0% 100%, rgba(217, 70, 239, 0.15) 0%, transparent 50%);
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(217, 70, 239, 0.5);
          border-radius: 4px;
        }
        .code-line {
          counter-increment: line;
          display: flex;
          align-items: center;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateX(10deg); }
          50% { transform: translateY(-10px) rotateX(15deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
