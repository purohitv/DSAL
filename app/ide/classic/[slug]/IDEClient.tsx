'use client';

import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import IDELayout from '@/components/ide/Layout';
import VisualizerFactory from '@/components/visualizers/VisualizerFactory';
import VisualizerControls from '@/components/ide/VisualizerControls';
import Timeline from '@/components/ide/Timeline';
import MemoryMonitor from '@/components/ide/MemoryMonitor';
import LectureCanvas from '@/components/ide/LectureCanvas';
import ComplexityDashboard from '@/components/ide/ComplexityDashboard';
import { useSimulationStore } from '@/store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import ComplexityChart from '@/components/ide/ComplexityChart';
import { useSession } from 'next-auth/react';
import { Plus, Minus, Search, Play, RefreshCw, Save, Terminal, Layers, ArrowRight, Eye } from 'lucide-react';

interface IDEClientProps {
  lesson: any;
}

export default function IDEClient({ lesson }: IDEClientProps) {
  const {
    currentStep,
    isPlaying,
    playbackSpeed,
    terminalOutput,
    callStack,
    variables,
    activeLine,
    setCurrentStep,
    setIsPlaying,
    setPlaybackSpeed,
    addTerminalOutput,
    clearTerminal,
    setCallStack,
    setVariables,
    setActiveLine,
    setComplexityData,
    setSteps,
    setUserCode: setStoreUserCode,
    setPlaygroundLanguage: setStorePlaygroundLanguage,
    reset,
  } = useSimulationStore();

  const [userCode, setUserCode] = React.useState(lesson.initialCode);
  const [isSavingProgress, setIsSavingProgress] = React.useState(false);
  const [mode, setMode] = React.useState<'demo' | 'user'>('demo');
  const [userInput, setUserInput] = React.useState<string>("");
  const [playgroundLanguage, setPlaygroundLanguage] = React.useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');

  // Sync with store
  useEffect(() => {
    setStoreUserCode(userCode);
  }, [userCode, setStoreUserCode]);

  useEffect(() => {
    setStorePlaygroundLanguage(playgroundLanguage);
  }, [playgroundLanguage, setStorePlaygroundLanguage]);
  const [playgroundVisualizerType, setPlaygroundVisualizerType] = React.useState<string>(lesson.visualizationType);
  const [playgroundSteps, setPlaygroundSteps] = React.useState<any[]>([]);
  const [isCompiling, setIsCompiling] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSnippets, setSavedSnippets] = React.useState<any[]>([]);
  const [showLoadMenu, setShowLoadMenu] = React.useState(false);
  
  // New IDE features
  const [breakpoints, setBreakpoints] = React.useState<Set<number>>(new Set());
  const [showGrid, setShowGrid] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isLectureMode, setIsLectureMode] = React.useState(false);

  const { data: session } = useSession();

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);
  const breakpointDecorationsRef = useRef<any[]>([]);
  const pythonWorkerRef = useRef<Worker | null>(null);

  // Initialize Python Worker
  useEffect(() => {
    pythonWorkerRef.current = new Worker('/python-worker.js');
    return () => {
      pythonWorkerRef.current?.terminate();
    };
  }, []);

  const steps = mode === 'user' && playgroundSteps.length > 0 ? playgroundSteps : lesson.steps;
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep - 1];

  // Sync steps with store
  useEffect(() => {
    setSteps(steps);
  }, [steps, setSteps]);

  // Load progress on mount
  useEffect(() => {
    if (session?.user?.email && lesson.id) {
      fetch(`/api/lesson-progress?lessonId=${lesson.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.code) {
            setUserCode(data.code);
            if (data.lastStep) setCurrentStep(data.lastStep);
          }
        })
        .catch(err => console.error('Error loading progress:', err));
    }
  }, [session, lesson.id, setCurrentStep]);

  // Save progress function
  const saveProgress = async (code: string, step: number, completed: boolean = false) => {
    if (!session?.user?.email || !lesson.id) return;
    setIsSavingProgress(true);
    try {
      await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          code,
          lastStep: step,
          completed
        }),
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    } finally {
      setIsSavingProgress(false);
    }
  };

  // Auto-save on code change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProgress(userCode, currentStep);
    }, 3000);
    return () => clearTimeout(timer);
  }, [userCode, currentStep]);

  // Toggle Breakpoint
  const toggleBreakpoint = (line: number) => {
    const newBreakpoints = new Set(breakpoints);
    if (newBreakpoints.has(line)) {
      newBreakpoints.delete(line);
    } else {
      newBreakpoints.add(line);
    }
    setBreakpoints(newBreakpoints);
  };

  // Update Breakpoint Decorations
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const newDecorations = Array.from(breakpoints).map(line => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: 'bg-red-500 rounded-full w-2 h-2 ml-1 mt-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      }));
      breakpointDecorationsRef.current = editor.deltaDecorations(breakpointDecorationsRef.current || [], newDecorations);
    }
  }, [breakpoints]);

  const runCode = () => {
    const traceSteps: any[] = [];
    const dsal = {
      trace: (data: any) => {
        traceSteps.push({
          visualState: JSON.stringify(data.visualState || { nodes: [], edges: [] }),
          terminalMessage: data.message || "",
          callStack: JSON.stringify(data.callStack || []),
          variables: JSON.stringify(data.variables || {}),
          highlightLines: JSON.stringify(data.line ? [data.line] : []),
          operations: data.operations || 0,
          memory: data.memory || 0,
        });
      }
    };

    clearTerminal();
    
    if (playgroundLanguage === 'python') {
      addTerminalOutput("Initializing Python WASM Engine (Pyodide)...");
      setIsCompiling(true);
      
      if (!pythonWorkerRef.current) {
        addTerminalOutput("Error: Python worker not initialized.");
        setIsCompiling(false);
        return;
      }

      const runId = Date.now().toString();
      
      const handleMessage = (e: MessageEvent) => {
        const { type, id, data, error } = e.data;
        if (id !== runId) return;

        if (type === 'trace') {
          dsal.trace(data);
        } else if (type === 'done') {
          if (traceSteps.length > 0) {
            setPlaygroundSteps(traceSteps);
            setComplexityData(traceSteps.map((step, index) => ({
              step: index + 1,
              operations: step.operations,
              memory: step.memory
            })));
            setCurrentStep(1);
            setIsPlaying(true);
            addTerminalOutput(`Success: Generated ${traceSteps.length} simulation steps via WASM.`);
          } else {
            addTerminalOutput("Warning: No dsal.trace() calls detected in Python code.");
          }
          setIsCompiling(false);
          pythonWorkerRef.current?.removeEventListener('message', handleMessage);
        } else if (type === 'error') {
          addTerminalOutput(`Python Error: ${error}`);
          setIsCompiling(false);
          pythonWorkerRef.current?.removeEventListener('message', handleMessage);
        }
      };

      pythonWorkerRef.current.addEventListener('message', handleMessage);
      pythonWorkerRef.current.postMessage({ id: runId, code: userCode, input: userInput });
      return;
    }

    if (playgroundLanguage === 'cpp' || playgroundLanguage === 'java') {
      addTerminalOutput(`Initializing ${playgroundLanguage.toUpperCase()} Cloud Engine (Piston)...`);
      setIsCompiling(true);

      const runPiston = async () => {
        try {
          const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language: playgroundLanguage,
              version: '*',
              files: [{ content: userCode }],
              stdin: userInput
            })
          });

          const result = await response.json();
          
          if (result.message) {
              addTerminalOutput(`API Error: ${result.message}`);
              setIsCompiling(false);
              return;
          }

          const output = (result.run.stdout || "") + (result.run.stderr ? "\n" + result.run.stderr : "");
          
          // Parse traces
          const traceRegex = /@@DSAL_TRACE@@([\s\S]*?)@@DSAL_TRACE_END@@/g;
          let match;
          let traceCount = 0;
          
          while ((match = traceRegex.exec(output)) !== null) {
            try {
              const data = JSON.parse(match[1]);
              traceSteps.push({
                visualState: JSON.stringify(data.visualState || { nodes: [], edges: [] }),
                terminalMessage: data.message || "",
                callStack: JSON.stringify(data.callStack || []),
                variables: JSON.stringify(data.variables || {}),
                highlightLines: JSON.stringify(data.line ? [data.line] : []),
                operations: data.operations || 0,
                memory: data.memory || 0,
              });
              traceCount++;
            } catch (e: any) {
              addTerminalOutput(`Failed to parse trace JSON: ${e.message}`);
            }
          }

          // Remove the traces from the terminal output so it looks clean
          const cleanOutput = output.replace(/@@DSAL_TRACE@@[\s\S]*?@@DSAL_TRACE_END@@\n?/g, '');
          if (cleanOutput.trim()) {
              addTerminalOutput(cleanOutput.trim());
          }

          if (traceSteps.length > 0) {
            setPlaygroundSteps(traceSteps);
            setComplexityData(traceSteps.map((step, index) => ({
              step: index + 1,
              operations: step.operations,
              memory: step.memory
            })));
            setCurrentStep(1);
            setIsPlaying(true);
            addTerminalOutput(`Success: Generated ${traceSteps.length} simulation steps via Cloud Engine.`);
          } else {
            addTerminalOutput(`Execution finished. No valid dsal_trace calls detected.`);
          }
        } catch (err: any) {
          addTerminalOutput(`Network Error: ${err.message}`);
        } finally {
          setIsCompiling(false);
        }
      };
      
      runPiston();
      return;
    }

    // JavaScript Execution
    try {
      addTerminalOutput("Initializing JS Playground Engine...");
      
      // Basic execution wrapper
      const execute = new Function('dsal', 'input', `
        try {
          ${userCode}
          if (typeof main === 'function') {
            main(dsal, input);
          }
        } catch (e) {
          throw e;
        }
      `);
      
      execute(dsal, userInput);
      
      if (traceSteps.length > 0) {
        setPlaygroundSteps(traceSteps);
        setComplexityData(traceSteps.map((step, index) => ({
          step: index + 1,
          operations: step.operations,
          memory: step.memory
        })));
        setCurrentStep(1);
        setIsPlaying(true);
        addTerminalOutput(`Success: Generated ${traceSteps.length} simulation steps.`);
      } else {
        addTerminalOutput("Warning: No dsal.trace() calls detected in code.");
      }
    } catch (err: any) {
      addTerminalOutput(`Runtime Error: ${err.message}`);
    }
  };

  // Sync state with current step data
  useEffect(() => {
    if (currentStepData) {
      if (currentStepData.terminalMessage) {
        addTerminalOutput(currentStepData.terminalMessage);
      }
      if (currentStepData.callStack) {
        setCallStack(JSON.parse(currentStepData.callStack));
      }
      if (currentStepData.variables) {
        setVariables(JSON.parse(currentStepData.variables));
      }
      if (currentStepData.highlightLines) {
        const lines = JSON.parse(currentStepData.highlightLines);
        setActiveLine(lines.length > 0 ? lines[0] : null);
      }
    }
  }, [currentStep, currentStepData, addTerminalOutput, setCallStack, setVariables, setActiveLine]);

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

  // Playback logic
  useEffect(() => {
    let timer: any;
    if (isPlaying && currentStep < totalSteps) {
      // Check for breakpoints in the next step
      const nextStepData = steps[currentStep];
      if (nextStepData && nextStepData.highlightLines) {
        const nextLines = JSON.parse(nextStepData.highlightLines);
        if (nextLines.some((l: number) => breakpoints.has(l))) {
          setIsPlaying(false);
          addTerminalOutput(`Breakpoint hit at line ${nextLines[0]}`);
          return;
        }
      }

      timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1000 / playbackSpeed);
    } else if (currentStep === totalSteps) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, setCurrentStep, setIsPlaying, breakpoints, steps, addTerminalOutput]);

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleTogglePlayback = () => {
    if (currentStep === totalSteps) {
      setCurrentStep(1);
      clearTerminal();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSaveSnippet = async () => {
    if (!session) {
      addTerminalOutput("Error: Please sign in to save snippets.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Playground - ${new Date().toLocaleString()}`,
          code: userCode,
          language: playgroundLanguage
        })
      });
      if (res.ok) {
        addTerminalOutput("Successfully saved snippet to cloud.");
        handleLoadSnippets();
      } else {
        addTerminalOutput("Failed to save snippet.");
      }
    } catch (error) {
      console.error(error);
      addTerminalOutput("Error saving snippet.");
    }
    setIsSaving(false);
  };

  const handleLoadSnippets = async () => {
    if (!session) {
      addTerminalOutput("Error: Please sign in to load snippets.");
      return;
    }
    try {
      const res = await fetch('/api/snippets');
      if (res.ok) {
        const data = await res.json();
        setSavedSnippets(data);
        setShowLoadMenu(!showLoadMenu);
      }
    } catch (error) {
      console.error(error);
      addTerminalOutput("Error loading snippets.");
    }
  };

  const [activeBottomTab, setActiveBottomTab] = React.useState<'terminal' | 'input'>('terminal');

  const getOperations = () => {
    const baseOps = [
      { name: 'Run Simulation', onClick: runCode, icon: <Play size={14} /> },
      { name: 'Reset', onClick: reset, icon: <RefreshCw size={14} /> },
      { name: 'Save Progress', onClick: () => saveProgress(userCode, currentStep), icon: <Save size={14} /> },
      { name: 'User Input', onClick: () => {}, icon: <Terminal size={14} /> },
      { name: 'All', onClick: () => {}, icon: <Layers size={14} /> },
    ];

    const type = lesson.visualizationType;

    switch (type) {
      case 'stack':
        return [
          { name: 'Push', onClick: () => {}, icon: <Plus size={14} /> },
          { name: 'Pop', onClick: () => {}, icon: <Minus size={14} /> },
          { name: 'Peek', onClick: () => {}, icon: <Eye size={14} /> },
          ...baseOps
        ];
      case 'linear': // Array
        return [
          { name: 'Insert', onClick: () => {}, icon: <Plus size={14} /> },
          { name: 'Delete', onClick: () => {}, icon: <Minus size={14} /> },
          { name: 'Search', onClick: () => {}, icon: <Search size={14} /> },
          ...baseOps
        ];
      case 'linked-list':
        return [
          { name: 'Insert Head', onClick: () => {}, icon: <Plus size={14} /> },
          { name: 'Insert Tail', onClick: () => {}, icon: <Plus size={14} /> },
          { name: 'Delete', onClick: () => {}, icon: <Minus size={14} /> },
          ...baseOps
        ];
      case 'tree':
        return [
          { name: 'Insert', onClick: () => {}, icon: <Plus size={14} /> },
          { name: 'Delete', onClick: () => {}, icon: <Minus size={14} /> },
          { name: 'Search', onClick: () => {}, icon: <Search size={14} /> },
          ...baseOps
        ];
      case 'graph':
        return [
          { name: 'Add Node', onClick: () => {}, icon: <Plus size={14} /> },
          { name: 'Add Edge', onClick: () => {}, icon: <ArrowRight size={14} /> },
          ...baseOps
        ];
      default:
        return baseOps;
    }
  };

  return (
    <IDELayout
      title={lesson.title}
      category={lesson.category === 'Trees' ? 'Non-Linear' : lesson.category === 'Linear' ? 'Linear' : 'Advanced'}
      operations={getOperations()}
      currentStep={currentStep}
      totalSteps={totalSteps}
      isPlaying={isPlaying}
      playbackSpeed={playbackSpeed}
      onNext={handleNext}
      onPrev={handlePrev}
      onTogglePlayback={handleTogglePlayback}
      onSetPlaybackSpeed={setPlaybackSpeed}
      isSaving={isSavingProgress}
      leftPanel={{
        title: mode === 'user' ? "Playground Editor" : "Source View",
        subtitle: `${lesson.slug}.${mode === 'user' ? (playgroundLanguage === 'python' ? 'py' : playgroundLanguage === 'javascript' ? 'js' : playgroundLanguage) : (lesson.language === 'cpp' ? 'cpp' : 'js')}`,
        icon: mode === 'user' ? "edit_note" : "code",
        extra: mode === 'user' && (
          <div className="group relative">
            <button className="w-5 h-5 rounded bg-accent-mint/20 flex items-center justify-center border border-accent-mint/30 text-accent-mint hover:bg-accent-mint/30 transition-all">
              <span className="material-symbols-outlined text-[12px]">help</span>
            </button>
            <div className="absolute top-full left-0 mt-2 w-80 bg-background-dark border border-border-dark rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-[10px] font-mono max-h-[80vh] overflow-y-auto">
              <h4 className="text-accent-mint font-black uppercase mb-2">Playground API</h4>
              <p className="text-text-secondary mb-3">Use <code className="text-white bg-white/5 px-1 rounded">dsal.trace(data)</code> to update the visualization.</p>
              
              <div className="space-y-3">
                <div className="bg-surface-darker p-2 rounded border border-white/5 space-y-1">
                  <p className="text-primary text-[9px] font-bold">JS Example:</p>
                  <pre className="text-[8px] text-gray-400 overflow-x-auto">
{`function main(dsal) {
  dsal.trace({
    visualState: { nodes: [{id: 1, label: 'A'}], edges: [] },
    message: "Init",
    operations: 1,
    memory: 10
  });
}`}
                  </pre>
                </div>

                <div className="bg-surface-darker p-2 rounded border border-white/5 space-y-1">
                  <p className="text-blue-400 text-[9px] font-bold">Python Example:</p>
                  <pre className="text-[8px] text-gray-400 overflow-x-auto">
{`def main(dsal):
    dsal.trace({
        "visualState": { "nodes": [{"id": 1, "label": "A"}], "edges": [] },
        "message": "Init",
        "operations": 1,
        "memory": 10
    })`}
                  </pre>
                </div>

                <div className="bg-surface-darker p-2 rounded border border-white/5 space-y-1">
                  <p className="text-pink-400 text-[9px] font-bold">C++ Example (Print JSON):</p>
                  <pre className="text-[8px] text-gray-400 overflow-x-auto">
{`#include <iostream>
using namespace std;

void dsal_trace(string json) {
  cout << "@@DSAL_TRACE@@" << json << "@@DSAL_TRACE_END@@\\n";
}

int main() {
  dsal_trace("{\\"message\\": \\"Init\\", \\"operations\\": 1, \\"memory\\": 10, \\"visualState\\": {\\"nodes\\": [{\\"id\\": 1, \\"label\\": \\"A\\"}], \\"edges\\": []}}");
  return 0;
}`}
                  </pre>
                </div>

                <div className="bg-surface-darker p-2 rounded border border-white/5 space-y-1">
                  <p className="text-orange-400 text-[9px] font-bold">Java Example (Print JSON):</p>
                  <pre className="text-[8px] text-gray-400 overflow-x-auto">
{`public class Main {
  public static void dsal_trace(String json) {
    System.out.println("@@DSAL_TRACE@@" + json + "@@DSAL_TRACE_END@@");
  }
  public static void main(String[] args) {
    dsal_trace("{\\"message\\": \\"Init\\", \\"operations\\": 1, \\"memory\\": 10, \\"visualState\\": {\\"nodes\\": [{\\"id\\": 1, \\"label\\": \\"A\\"}], \\"edges\\": []}}");
  }
}`}
                  </pre>
                </div>

                <div className="bg-surface-darker p-2 rounded border border-white/5 space-y-1">
                  <p className="text-accent-mint text-[9px] font-bold">Quantum Example (JS):</p>
                  <pre className="text-[8px] text-gray-400 overflow-x-auto">
{`function main(dsal) {
  dsal.trace({
    visualState: { 
      qubits: [{ id: 'q0', theta: Math.PI/2, phi: 0, label: '|+>' }] 
    },
    message: "Hadamard Gate Applied"
  });
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ),
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <style>{`
              .bg-blue-500\\/30 {
                background-color: rgba(59, 130, 246, 0.3) !important;
              }
            `}</style>
            <Editor
              height="100%"
              language={mode === 'user' ? playgroundLanguage : lesson.language}
              theme="vs-dark"
              value={mode === 'user' ? userCode : lesson.initialCode}
              onChange={(val) => mode === 'user' && setUserCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 10,
                readOnly: mode === 'demo',
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                glyphMargin: true,
                folding: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                padding: { top: 8, bottom: 8 }
              }}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;
                
                // Add breakpoint click listener
                editor.onMouseDown((e: any) => {
                  if (e.target.type === 2) { // Glyph margin
                    const line = e.target.position.lineNumber;
                    toggleBreakpoint(line);
                  }
                });
              }}
            />
          </div>
        )
      }}
      centerPanel={{
        title: "Simulation Stage",
        subtitle: lesson.title,
        icon: "science",
        extra: (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsLectureMode(!isLectureMode)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all border ${
                isLectureMode 
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(127,19,236,0.3)]' 
                : 'bg-surface-darker border-border-dark text-text-secondary hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-xs">edit_note</span>
              Lecture Mode
            </button>
            {mode === 'user' && (
              <select 
                value={playgroundVisualizerType}
                onChange={(e) => setPlaygroundVisualizerType(e.target.value)}
                className="bg-surface-darker border border-border-dark text-white text-[10px] rounded px-2 py-1 outline-none focus:border-primary"
              >
                <option value="tree">Tree</option>
                <option value="stack">Stack</option>
                <option value="linear">Linear</option>
                <option value="linked-list">Linked List</option>
                <option value="graph">Graph</option>
                <option value="quantum">Quantum (Bloch Sphere)</option>
              </select>
            )}
          </div>
        ),
        content: (
          <div className={`relative h-full w-full ${isFullscreen ? 'fixed inset-0 z-[200] bg-background-dark' : ''}`}>
            <LectureCanvas enabled={isLectureMode} />
            <VisualizerControls 
              showGrid={showGrid}
              showLabels={showLabels}
              isFullscreen={isFullscreen}
              onToggleGrid={() => setShowGrid(!showGrid)}
              onToggleLabels={() => setShowLabels(!showLabels)}
              onFullscreen={() => setIsFullscreen(!isFullscreen)}
              onReset={() => {
                setCurrentStep(1);
                setIsPlaying(false);
              }}
            />
            <VisualizerFactory 
              type={mode === 'user' ? playgroundVisualizerType : lesson.visualizationType} 
              data={currentStepData ? {
                ...JSON.parse(currentStepData.visualState),
                showGrid,
                showLabels
              } : { nodes: [], edges: [], showGrid, showLabels }} 
            />
            <div className="absolute bottom-0 left-0 right-0 z-50">
              <Timeline 
                totalSteps={totalSteps} 
                currentStep={currentStep} 
                onStepChange={setCurrentStep} 
              />
            </div>
          </div>
        )
      }}
      bottomPanel={{
        title: activeBottomTab === 'terminal' ? "Standard Output" : "User Input Data",
        subtitle: activeBottomTab === 'terminal' ? "Live Stream" : "Standard Input",
        icon: activeBottomTab === 'terminal' ? "terminal" : "input",
        extra: (
          <div className="flex items-center gap-2">
            <div className="flex bg-surface-darker rounded border border-border-dark overflow-hidden">
              <button
                onClick={() => setActiveBottomTab('terminal')}
                className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-colors ${
                  activeBottomTab === 'terminal' ? 'bg-primary/20 text-primary' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Terminal
              </button>
              <button
                onClick={() => setActiveBottomTab('input')}
                className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-colors border-l border-border-dark ${
                  activeBottomTab === 'input' ? 'bg-accent-mint/20 text-accent-mint' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Input
              </button>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearTerminal}
              className="w-8 h-8 rounded bg-surface-darker border border-border-dark flex items-center justify-center text-text-secondary hover:text-white hover:border-primary/50 transition-all"
            >
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
            </motion.button>
          </div>
        ),
        content: (
          <div className="flex-1 overflow-hidden h-full flex flex-col bg-[#0d1117]">
            {activeBottomTab === 'terminal' ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-[9px] flex flex-col-reverse">
                <AnimatePresence mode="popLayout">
                  {terminalOutput.map((msg, i) => (
                    <motion.div 
                      key={`${msg}-${i}`}
                      initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      className={`flex gap-1.5 ${i === terminalOutput.length - 1 ? "text-white font-bold" : "text-gray-300 opacity-60"}`}
                    >
                      <span className="text-blue-500 font-bold">➜</span>
                      <span>{msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {terminalOutput.length === 0 && (
                  <div className="text-slate-600 italic p-2">No output yet. Run code to see results.</div>
                )}
              </div>
            ) : (
              <div className="flex-1 p-3">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter input data here (e.g., space-separated numbers)..."
                  className="w-full h-full bg-transparent border-none outline-none text-slate-300 font-mono text-[10px] resize-none placeholder:text-slate-700"
                />
              </div>
            )}
          </div>
        )
      }}
      rightPanelTop={{
        title: "Complexity Analysis",
        subtitle: "Big-O Metrics",
        icon: "monitoring",
        content: <ComplexityDashboard />
      }}
      rightPanelBottom={{
        title: "Memory Monitor",
        subtitle: "Stack & Variables",
        icon: "memory",
        content: <MemoryMonitor />
      }}
    />
  );
}
