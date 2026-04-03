"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import IDELayout from "@/components/ide/Layout";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  desc: string;
  stats: {
    comparisons: number;
    swaps: number;
  };
}

const ALGORITHMS = {
  bubbleSort: {
    name: "Bubble Sort",
    id: "bubble_sort.cpp",
    code: `void bubbleSort(int arr[], int n) {
  for (int i = 0; i < n-1; i++) {
    for (int j = 0; j < n-i-1; j++) {
      if (arr[j] > arr[j+1]) {
        swap(arr[j], arr[j+1]);
      }
    }
  }
}`,
    complexity: "O(n²)",
    generateSteps: (arr: number[]) => {
      const newSteps: SortStep[] = [];
      const a = [...arr];
      let comparisons = 0;
      let swaps = 0;
      const n = a.length;

      newSteps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [],
        desc: "Initial state",
        stats: { comparisons, swaps }
      });

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          comparisons++;
          newSteps.push({
            array: [...a],
            comparing: [j, j + 1],
            swapping: [],
            sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
            desc: `Comparing ${a[j]} and ${a[j + 1]}`,
            stats: { comparisons, swaps }
          });

          if (a[j] > a[j + 1]) {
            swaps++;
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            newSteps.push({
              array: [...a],
              comparing: [],
              swapping: [j, j + 1],
              sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
              desc: `Swapping ${a[j]} and ${a[j + 1]}`,
              stats: { comparisons, swaps }
            });
          }
        }
      }

      newSteps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, k) => k),
        desc: "Sorting completed",
        stats: { comparisons, swaps }
      });

      return newSteps;
    }
  },
  selectionSort: {
    name: "Selection Sort",
    id: "selection_sort.cpp",
    code: `void selectionSort(int arr[], int n) {
  for (int i = 0; i < n-1; i++) {
    int min_idx = i;
    for (int j = i+1; j < n; j++)
      if (arr[j] < arr[min_idx])
        min_idx = j;
    swap(arr[min_idx], arr[i]);
  }
}`,
    complexity: "O(n²)",
    generateSteps: (arr: number[]) => {
      const newSteps: SortStep[] = [];
      const a = [...arr];
      let comparisons = 0;
      let swaps = 0;
      const n = a.length;

      newSteps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: [],
        desc: "Initial state",
        stats: { comparisons, swaps }
      });

      for (let i = 0; i < n - 1; i++) {
        let min_idx = i;
        for (let j = i + 1; j < n; j++) {
          comparisons++;
          newSteps.push({
            array: [...a],
            comparing: [min_idx, j],
            swapping: [],
            sorted: Array.from({ length: i }, (_, k) => k),
            desc: `Comparing ${a[j]} with current min ${a[min_idx]}`,
            stats: { comparisons, swaps }
          });
          if (a[j] < a[min_idx]) {
            min_idx = j;
          }
        }
        swaps++;
        [a[min_idx], a[i]] = [a[i], a[min_idx]];
        newSteps.push({
          array: [...a],
          comparing: [],
          swapping: [min_idx, i],
          sorted: Array.from({ length: i + 1 }, (_, k) => k),
          desc: `Swapping ${a[min_idx]} and ${a[i]}`,
          stats: { comparisons, swaps }
        });
      }

      newSteps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, k) => k),
        desc: "Sorting completed",
        stats: { comparisons, swaps }
      });

      return newSteps;
    }
  }
};

export default function ClassicAlgorithmLab() {
  const [selectedAlgo, setSelectedAlgo] = useState<keyof typeof ALGORITHMS>("bubbleSort");
  const [arraySize, setArraySize] = useState(20);
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [code, setCode] = useState(ALGORITHMS.bubbleSort.code);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "> Initializing Classic Lab Engine...",
    "[System] Algorithm: Bubble Sort selected.",
    "[System] Ready for execution."
  ]);

  const handleCommand = (val: string) => {
    const parts = val.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    
    if (cmd === "help") {
      setTerminalOutput(prev => [...prev, "> " + val, "Available commands: help, status, run, set_size <n>, clear"]);
    } else if (cmd === "status") {
      setTerminalOutput(prev => [...prev, "> " + val, `Algorithm: ${ALGORITHMS[selectedAlgo].name}, Size: ${arraySize}, Step: ${currentStep}/${steps.length}`]);
    } else if (cmd === "run") {
      setTerminalOutput(prev => [...prev, "> " + val, "Starting execution..."]);
      setIsPlaying(true);
    } else if (cmd === "set_size" && parts[1]) {
      const n = parseInt(parts[1]);
      if (n >= 10 && n <= 50) {
        setArraySize(n);
        setTerminalOutput(prev => [...prev, "> " + val, `Set array size to ${n}.`]);
      } else {
        setTerminalOutput(prev => [...prev, "> " + val, "Invalid size. Must be between 10 and 50."]);
      }
    } else if (cmd === "clear") {
      setTerminalOutput([]);
    } else {
      setTerminalOutput(prev => [...prev, "> " + val, `Command not found: ${cmd}. Type 'help' for a list of commands.`]);
    }
  };

  // Generate random array
  const generateArray = () => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
    setArray(newArray);
    setCurrentStep(0);
    setSteps([]);
    setIsPlaying(false);
    setTerminalOutput(prev => [...prev, `> Generated new array of size ${arraySize}.`]);
  };

  useEffect(() => {
    generateArray();
  }, [arraySize]);

  useEffect(() => {
    setCode(ALGORITHMS[selectedAlgo].code);
    setSteps([]);
    setCurrentStep(0);
    setTerminalOutput(prev => [...prev, `[System] Algorithm: ${ALGORITHMS[selectedAlgo].name} selected.`]);
  }, [selectedAlgo]);

  useEffect(() => {
    if (array.length > 0 && steps.length === 0) {
      setSteps(ALGORITHMS[selectedAlgo].generateSteps(array));
    }
  }, [array, steps, selectedAlgo]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 200 / playbackSpeed);
    } else if (currentStep === steps.length - 1) {
      setIsPlaying(false);
      setTerminalOutput(prev => [...prev, "> Execution finished."]);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, playbackSpeed]);

  const currentData = steps[currentStep] || {
    array: array,
    comparing: [],
    swapping: [],
    sorted: [],
    desc: "Ready",
    stats: { comparisons: 0, swaps: 0 }
  };

  const extraControls = (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Size</span>
        <input 
          type="range" 
          min="10" 
          max="50" 
          value={arraySize} 
          onChange={(e) => setArraySize(parseInt(e.target.value))}
          className="w-24 accent-primary"
        />
      </div>
      <div className="flex items-center bg-neutral-900 rounded-lg p-1 border border-neutral-800">
        {(Object.keys(ALGORITHMS) as Array<keyof typeof ALGORITHMS>).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedAlgo(key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
              selectedAlgo === key 
                ? "bg-primary text-white shadow-neon-sm" 
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            {ALGORITHMS[key].name}
          </button>
        ))}
      </div>
      <button 
        onClick={generateArray}
        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
      >
        <span className="material-symbols-outlined text-base">refresh</span>
      </button>
    </div>
  );

  return (
    <IDELayout
      title="Classic Lab"
      category="Research"
      showTimeline={false}
      extraControls={extraControls}
      isPlaying={isPlaying}
      onTogglePlayback={() => setIsPlaying(!isPlaying)}
      playbackSpeed={playbackSpeed}
      onSetPlaybackSpeed={setPlaybackSpeed}
      onPrev={() => setCurrentStep(Math.max(0, currentStep - 1))}
      onNext={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
      leftPanel={{
        title: "Source View",
        subtitle: ALGORITHMS[selectedAlgo].id,
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 10,
                readOnly: true,
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                padding: { top: 8, bottom: 8 },
                automaticLayout: true
              }}
            />
          </div>
        )
      }}
      centerPanel={{
        title: "Simulation Stage",
        subtitle: "Visual Execution Trace",
        icon: "analytics",
        extra: (
          <span className="text-[10px] font-mono text-primary bg-primary/10 px-3 py-1 rounded border border-primary/20 uppercase tracking-widest">
            {currentData.desc}
          </span>
        ),
        content: (
          <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full flex items-end justify-center gap-1 px-8 py-12">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(90deg, #3b4354 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
            {currentData.array.map((val, idx) => {
              const isComparing = currentData.comparing.includes(idx);
              const isSwapping = currentData.swapping.includes(idx);
              const isSorted = currentData.sorted.includes(idx);

              return (
                <motion.div
                  key={idx}
                  layout
                  className={cn(
                    "flex-1 rounded-t-sm transition-all duration-200 relative z-10",
                    isSwapping ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" :
                    isComparing ? "bg-secondary shadow-[0_0_15px_rgba(217,19,236,0.5)]" :
                    isSorted ? "bg-accent-mint shadow-[0_0_10px_rgba(0,255,170,0.3)]" :
                    "bg-[#60a5fa]/40"
                  )}
                  style={{ height: `${val}%` }}
                >
                  {arraySize < 25 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/40">
                      {val}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )
      }}
      bottomPanel={{
        title: "Standard Output",
        subtitle: "Execution Logs",
        icon: "terminal",
        content: (
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1 font-mono text-[9px] bg-[#0d1117] h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {terminalOutput.map((msg, i) => (
                <div key={i} className="mb-1 opacity-80 flex gap-1.5 text-gray-300">
                  <span className="text-blue-500 font-bold">➜</span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-blue-500 font-bold">➜</span>
              <input 
                type="text" 
                className="flex-1 bg-transparent border-none outline-none text-white/80 font-mono text-[9px] placeholder:text-white/20"
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
        title: "Performance Monitor",
        subtitle: "Metrics",
        icon: "monitoring",
        content: (
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5 bg-[#1c212c] h-full">
            <div className="bg-[#282e39] rounded p-1.5 border border-[#3b4354] mb-1">
              <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">Comparisons</div>
              <div className="text-sm font-mono text-white">
                {currentData.stats.comparisons}
              </div>
            </div>
            <div className="bg-[#282e39] rounded p-1.5 border border-[#3b4354] mb-1">
              <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">Swaps</div>
              <div className="text-sm font-mono text-white">
                {currentData.stats.swaps}
              </div>
            </div>
            <div className="bg-[#282e39] rounded p-1.5 border border-[#3b4354]">
              <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">Complexity</div>
              <div className="text-sm font-mono text-[#60a5fa]">
                O(n²)
              </div>
            </div>
          </div>
        )
      }}
      rightPanelBottom={{
        title: "Memory Map",
        subtitle: "Local Scope",
        icon: "memory",
        content: (
          <div className="flex-1 p-2 grid grid-cols-6 gap-1 overflow-y-auto bg-[#1c212c] h-full">
            {currentData.array.map((val, i) => (
              <div 
                key={i} 
                className={cn(
                  "aspect-square rounded flex items-center justify-center text-[9px] font-mono transition-all",
                  currentData.comparing.includes(i) ? "bg-secondary text-white" :
                  currentData.swapping.includes(i) ? "bg-red-500 text-white" :
                  currentData.sorted.includes(i) ? "bg-accent-mint/20 text-accent-mint border border-accent-mint/30" :
                  "bg-[#282e39] text-slate-300 border border-[#3b4354]"
                )}
              >
                {val}
              </div>
            ))}
          </div>
        )
      }}
    />
  );
}
