"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import IDELayout from "@/components/ide/Layout";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Play, Settings, Trash2, Terminal, Layers } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const QASM_CODE = (numQubits: number, targetState: number) => `// Grover's Algorithm in OpenQASM 2.0
OPENQASM 2.0;
include "qelib1.inc";

qreg q[${numQubits}];
creg c[${numQubits}];

// 1. Initialization
h q;

// 2. Oracle
oracle(q, ${targetState});

// 3. Diffusion
diffusion(q);

// 4. Measurement
measure q -> c;`;

interface QuantumState {
  amplitudes: number[];
  probabilities: number[];
  target: number;
  iteration: number;
  phase: "initial" | "oracle" | "diffusion" | "measured";
  desc: string;
}

export default function QuantumAlgorithmIde() {
  const [numQubits, setNumQubits] = useState(3);
  const [targetState, setTargetState] = useState(5);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<QuantumState[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [commandHistory, setCommandHistory] = useState<{cmd: string, response: string}[]>([]);
  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();

  useEffect(() => {
    setUserCode(QASM_CODE(numQubits, targetState));
    setPlaygroundLanguage("qasm");
  }, [numQubits, targetState, setUserCode, setPlaygroundLanguage]);

  const handleCommand = (val: string) => {
    const parts = val.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    let response = "";

    if (cmd === "help") {
      response = "Available commands: help, status, run, set_qubits <n>, set_target <n>, clear";
    } else if (cmd === "status") {
      response = `Qubits: ${numQubits}, Target: |${targetState}⟩, Iteration: ${currentData.iteration}, Phase: ${currentData.phase}`;
    } else if (cmd === "run") {
      generateGroverSteps();
      setIsPlaying(true);
      response = "Started Grover's Search simulation.";
    } else if (cmd === "set_qubits" && parts[1]) {
      const n = parseInt(parts[1]);
      if (n >= 2 && n <= 6) {
        setNumQubits(n);
        response = `Set qubits to ${n}.`;
      } else {
        response = "Invalid number of qubits. Must be between 2 and 6.";
      }
    } else if (cmd === "set_target" && parts[1]) {
      const n = parseInt(parts[1]);
      if (n >= 0 && n < Math.pow(2, numQubits)) {
        setTargetState(n);
        response = `Set target state to |${n}⟩.`;
      } else {
        response = `Invalid target state. Must be between 0 and ${Math.pow(2, numQubits) - 1}.`;
      }
    } else if (cmd === "clear") {
      setCommandHistory([]);
      return;
    } else {
      response = `Command not found: ${cmd}. Type 'help' for a list of commands.`;
    }

    setCommandHistory(prev => [...prev, { cmd: val, response }]);
  };

  const generateGroverSteps = () => {
    const N = Math.pow(2, numQubits);
    const newSteps: QuantumState[] = [];
    
    // Initial State: Uniform Superposition
    const initialAmplitudes = Array(N).fill(1 / Math.sqrt(N));
    newSteps.push({
      amplitudes: [...initialAmplitudes],
      probabilities: initialAmplitudes.map(a => a * a),
      target: targetState,
      iteration: 0,
      phase: "initial",
      desc: "Uniform Superposition: All states equally likely."
    });

    let currentAmplitudes = [...initialAmplitudes];
    const numIterations = Math.floor((Math.PI / 4) * Math.sqrt(N));

    for (let i = 1; i <= numIterations; i++) {
      // Oracle: Phase Inversion
      currentAmplitudes[targetState] *= -1;
      newSteps.push({
        amplitudes: [...currentAmplitudes],
        probabilities: currentAmplitudes.map(a => a * a),
        target: targetState,
        iteration: i,
        phase: "oracle",
        desc: `Iteration ${i}: Oracle marks target state |${targetState}⟩.`
      });

      // Diffusion: Reflection about the mean
      const mean = currentAmplitudes.reduce((a, b) => a + b, 0) / N;
      currentAmplitudes = currentAmplitudes.map(a => 2 * mean - a);
      newSteps.push({
        amplitudes: [...currentAmplitudes],
        probabilities: currentAmplitudes.map(a => a * a),
        target: targetState,
        iteration: i,
        phase: "diffusion",
        desc: `Iteration ${i}: Amplitude amplification via Diffusion.`
      });
    }

    setSteps(newSteps);
    setCurrentStep(0);
  };

  useEffect(() => {
    generateGroverSteps();
  }, [numQubits, targetState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playbackSpeed]);

  const currentData = steps[currentStep] || {
    amplitudes: [],
    probabilities: [],
    target: targetState,
    iteration: 0,
    phase: "initial",
    desc: "Ready"
  };

  const controls = (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Qubits</span>
        <select 
          value={numQubits} 
          onChange={(e) => setNumQubits(parseInt(e.target.value))}
          className="bg-transparent text-xs font-black text-primary border-none focus:ring-0"
        >
          <option value={2}>2 Qubits</option>
          <option value={3}>3 Qubits</option>
          <option value={4}>4 Qubits</option>
        </select>
      </div>
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Target</span>
        <input 
          type="number" 
          min="0" 
          max={Math.pow(2, numQubits) - 1} 
          value={targetState} 
          onChange={(e) => setTargetState(parseInt(e.target.value))}
          className="w-12 bg-transparent text-xs font-black text-secondary border-none focus:ring-0"
        />
      </div>
      <button 
        onClick={() => {
          generateGroverSteps();
          setIsPlaying(false);
        }}
        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-text-secondary hover:text-white"
        title="Restart"
      >
        <span className="material-symbols-outlined text-base">restart_alt</span>
      </button>
    </div>
  );

  return (
    <IDELayout
      title="Quantum Search"
      category="Advanced"
      operations={[
        { name: 'Run Grover', onClick: () => handleCommand('run'), icon: <Play size={14} /> },
        { name: 'Set 3 Qubits', onClick: () => handleCommand('set_qubits 3'), icon: <Settings size={14} /> },
        { name: 'Set 4 Qubits', onClick: () => handleCommand('set_qubits 4'), icon: <Settings size={14} /> },
        { name: 'Clear History', onClick: () => handleCommand('clear'), icon: <Trash2 size={14} /> },
      ]}
      showTimeline={true}
      currentStep={currentStep + 1}
      totalSteps={steps.length || 1}
      activeStep={currentData.phase.toUpperCase()}
      isPlaying={isPlaying}
      playbackSpeed={playbackSpeed}
      onTogglePlayback={() => setIsPlaying(!isPlaying)}
      onPrev={() => setCurrentStep(prev => Math.max(0, prev - 1))}
      onNext={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
      onSetPlaybackSpeed={setPlaybackSpeed}
      leftPanel={{
        title: "Source View",
        subtitle: "grover.qasm",
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <Editor
              height="100%"
              defaultLanguage="cpp" // QASM is similar to C-like syntax
              theme="vs-dark"
              value={QASM_CODE(numQubits, targetState)}
              options={{
                minimap: { enabled: false },
                fontSize: 10,
                readOnly: true, // Make it read-only since we expose parameters via UI
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                padding: { top: 8, bottom: 8 }
              }}
            />
          </div>
        )
      }}
      centerPanel={{
        title: "Amplitude Visualization",
        subtitle: "State Space Monitor",
        icon: "equalizer",
        extra: (
          <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">
            {currentData.phase}
          </span>
        ),
        content: (
          <div className="flex-1 flex flex-col p-1.5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(90deg, #3b4354 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
            <div className="flex-1 flex items-center justify-center gap-1 relative z-10">
              <AnimatePresence mode="wait">
                {currentData.amplitudes.map((amp, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.abs(amp) * 100}%` }}
                    className={cn(
                      "w-3 rounded-t-sm relative transition-all duration-500",
                      idx === targetState ? "bg-secondary shadow-[0_0_20px_rgba(217,19,236,0.6)]" : "bg-primary/40",
                      amp < 0 && "rounded-t-none rounded-b-sm"
                    )}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[6px] font-mono text-white/60">
                      |{idx}⟩
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[6px] font-mono text-white/80">
                      {amp.toFixed(2)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-1.5 p-1.5 rounded border border-[#3b4354] bg-[#1c212c] relative z-10">
              <p className="text-[8px] text-slate-400 font-medium leading-relaxed">
                <span className="text-primary font-black uppercase tracking-widest mr-1.5">LOG:</span>
                {currentData.desc}
              </p>
            </div>
          </div>
        )
      }}
      bottomPanel={{
        title: "Standard Output",
        subtitle: "Quantum Runtime",
        icon: "terminal",
        content: (
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1 font-mono text-[9px] bg-[#0d1117] h-full flex flex-col">
            <div className="flex-1 overflow-y-auto flex flex-col gap-1">
              <div className="mb-0.5 text-accent-mint font-black uppercase tracking-[0.2em]">[System] Quantum Engine v2.4.0-grover</div>
              <div className="text-gray-300 opacity-60">&gt; Allocated {numQubits} qubits on QPU-Alpha.</div>
              <div className="text-gray-300 opacity-60">&gt; Target state set to |{targetState}⟩.</div>
              <div className="text-gray-300 opacity-60">&gt; Running Grover iteration {currentData.iteration}...</div>
              <div className="text-gray-300 opacity-60">&gt; Phase: {currentData.phase}</div>
              
              {commandHistory.map((item, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="flex gap-1.5 text-white font-bold">
                    <span className="text-blue-500 font-bold">➜</span>
                    <span>{item.cmd}</span>
                  </div>
                  <div className="text-gray-400 pl-3">{item.response}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-1 border-t border-[#3b4354] pt-1">
              <span className="text-blue-500 font-bold">➜</span>
              <input 
                type="text" 
                maxLength={50}
                className="flex-1 bg-[#1c212c] border border-[#3b4354] rounded px-1.5 py-0.5 outline-none text-white font-mono text-[9px] placeholder:text-gray-500 focus:bg-[#282e39] focus:border-primary/50 transition-colors"
                placeholder="Enter command (e.g., 'help', 'status')..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    const val = input.value;
                    if (val) {
                      handleCommand(val);
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        )
      }}
      rightPanelTop={{
        title: "Circuit Topography",
        subtitle: "Gate Mapping",
        icon: "hub",
        content: (
          <div className="flex-1 p-1 bg-[#1c212c] h-full overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: numQubits }).map((_, i) => (
                <div key={i} className="relative h-1 bg-[#3b4354] flex items-center">
                  <div className="absolute -left-3 text-[6px] font-black text-gray-400">q[{i}]</div>
                  <div className="flex-1 flex justify-around px-1">
                    <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center text-[6px] font-black text-primary">H</div>
                    {currentData.phase !== "initial" && (
                      <div className="w-3 h-3 rounded-sm bg-secondary/20 border border-secondary/40 flex items-center justify-center text-[6px] font-black text-secondary">O</div>
                    )}
                    {currentData.phase === "diffusion" && (
                      <div className="w-3 h-3 rounded-sm bg-accent-mint/20 border border-accent-mint/40 flex items-center justify-center text-[6px] font-black text-accent-mint">D</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }}
      rightPanelBottom={{
        title: "State Vector Monitor",
        subtitle: "Probabilities",
        icon: "data_exploration",
        content: (
          <div className="flex-1 overflow-auto bg-[#1c212c] scrollbar-hide h-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#282e39] text-[9px] uppercase text-[#b0b8c9] font-semibold sticky top-0">
                <tr>
                  <th className="px-2 py-1">State</th>
                  <th className="px-2 py-1">Prob</th>
                  <th className="px-2 py-1">Phase</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-mono divide-y divide-[#3b4354]">
                {currentData.probabilities.map((prob, i) => (
                  <tr key={i} className={cn("hover:bg-[#282e39]/50 transition-colors", i === targetState && "bg-secondary/10")}>
                    <td className="px-2 py-1 text-blue-300 font-medium">|{i}⟩</td>
                    <td className="px-2 py-1">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-1 bg-[#3b4354] rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${prob * 100}%` }} />
                        </div>
                        <span className="text-white font-bold">{(prob * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-1 text-[#9da6b9]">
                      {currentData.amplitudes[i] < 0 ? "π" : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }}
    />
  );
}
