'use client';

import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import IDELayout from '@/components/ide/Layout';
import VisualizerFactory from '@/components/visualizers/VisualizerFactory';
import { useSimulationStore } from '@/store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';

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
    reset,
  } = useSimulationStore();

  const [userCode, setUserCode] = React.useState(lesson.initialCode);
  const [isPlayground, setIsPlayground] = React.useState(false);
  const [playgroundSteps, setPlaygroundSteps] = React.useState<any[]>([]);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);

  const steps = isPlayground && playgroundSteps.length > 0 ? playgroundSteps : lesson.steps;
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep - 1];

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
        });
      }
    };

    try {
      clearTerminal();
      addTerminalOutput("Initializing Playground Engine...");
      
      // Basic execution wrapper
      const execute = new Function('dsal', `
        try {
          ${userCode}
          if (typeof main === 'function') {
            main(dsal);
          } else {
            dsal.trace({ message: "Execution complete. No main() found." });
          }
        } catch (e) {
          throw e;
        }
      `);
      
      execute(dsal);
      
      if (traceSteps.length > 0) {
        setPlaygroundSteps(traceSteps);
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
      timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1000 / playbackSpeed);
    } else if (currentStep === totalSteps) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, setCurrentStep, setIsPlaying]);

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

  return (
    <IDELayout
      title={lesson.title}
      category={lesson.category}
      currentStep={currentStep}
      totalSteps={totalSteps}
      isPlaying={isPlaying}
      playbackSpeed={playbackSpeed}
      onNext={handleNext}
      onPrev={handlePrev}
      onTogglePlayback={handleTogglePlayback}
      onSetPlaybackSpeed={setPlaybackSpeed}
      extraControls={
        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlayground(!isPlayground)}
            className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${
              isPlayground 
              ? 'bg-accent-mint/20 text-accent-mint border-accent-mint/40 shadow-neon-sm' 
              : 'bg-surface-darker text-text-secondary border-border-dark hover:text-white'
            }`}
          >
            {isPlayground ? 'Playground: ON' : 'Playground: OFF'}
          </motion.button>
          {isPlayground && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(127,19,236,0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={runCode}
              className="px-2 py-1 rounded bg-primary/10 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-widest shadow-neon-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[10px]">play_circle</span>
              Run Code
            </motion.button>
          )}
        </div>
      }
      leftPanel={{
        title: isPlayground ? "Playground Editor" : "Source View",
        subtitle: `${lesson.slug}.${lesson.language === 'cpp' ? 'cpp' : 'js'}`,
        icon: isPlayground ? "edit_note" : "code",
        extra: isPlayground && (
          <div className="group relative">
            <button className="w-5 h-5 rounded bg-accent-mint/20 flex items-center justify-center border border-accent-mint/30 text-accent-mint hover:bg-accent-mint/30 transition-all">
              <span className="material-symbols-outlined text-[12px]">help</span>
            </button>
            <div className="absolute top-full left-0 mt-2 w-64 bg-background-dark border border-border-dark rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-[10px] font-mono">
              <h4 className="text-accent-mint font-black uppercase mb-2">Playground API</h4>
              <p className="text-text-secondary mb-3">Use <code className="text-white bg-white/5 px-1 rounded">dsal.trace(data)</code> to update the visualization.</p>
              <div className="bg-surface-darker p-2 rounded border border-white/5 space-y-2">
                <p className="text-primary">Example:</p>
                <pre className="text-[8px] text-gray-400 overflow-x-auto">
{`function main(dsal) {
  const nodes = [
    { id: 1, label: 'A' },
    { id: 2, label: 'B' }
  ];
  dsal.trace({
    visualState: { nodes, edges: [] },
    message: "Initial state",
    line: 1,
    variables: { count: 2 }
  });
}`}
                </pre>
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
              defaultLanguage={lesson.language}
              theme="vs-dark"
              value={isPlayground ? userCode : lesson.initialCode}
              onChange={(val) => isPlayground && setUserCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 10,
                readOnly: !isPlayground,
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                glyphMargin: false,
                folding: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                padding: { top: 8, bottom: 8 }
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
        title: "Simulation Stage",
        subtitle: lesson.title,
        icon: "science",
        content: (
          <VisualizerFactory 
            type={lesson.visualizationType} 
            data={currentStepData ? JSON.parse(currentStepData.visualState) : { nodes: [], edges: [] }} 
          />
        )
      }}
      bottomPanel={{
        title: "Standard Output",
        subtitle: "Live Stream",
        icon: "terminal",
        extra: (
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={clearTerminal}
            className="w-10 h-10 rounded-lg bg-surface-darker border border-border-dark flex items-center justify-center text-text-secondary hover:text-white hover:border-primary/50 transition-all"
          >
            <span className="material-symbols-outlined text-xl">delete_sweep</span>
          </motion.button>
        ),
        content: (
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1 font-mono text-[9px] bg-[#0d1117] h-full flex flex-col">
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto flex-col-reverse">
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
            <AnimatePresence mode="popLayout">
              {callStack.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[9px] font-mono text-gray-500 text-center mt-4"
                >
                  Stack Empty
                </motion.div>
              ) : (
                callStack.map((call, i) => (
                  <motion.div 
                    key={`${call}-${i}`}
                    initial={{ opacity: 0, x: 15, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`group flex items-center justify-between p-1.5 rounded transition-colors ${
                      i === 0 
                      ? 'bg-[#282e39] border-l-2 border-primary rounded-r shadow-sm cursor-pointer hover:bg-[#323945]' 
                      : 'border border-transparent hover:bg-[#282e39]/50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-mono text-[10px] ${i === 0 ? 'text-white font-medium' : 'text-gray-300'}`}>{call}</span>
                    </div>
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
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#282e39] text-[9px] uppercase text-[#b0b8c9] font-semibold sticky top-0">
                <tr>
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Value</th>
                  <th className="px-2 py-1">Type</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-mono divide-y divide-[#3b4354]">
                <AnimatePresence mode="popLayout">
                  {Object.entries(variables).map(([name, value]) => (
                    <motion.tr 
                      key={name}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-primary/10"
                    >
                      <td className="px-2 py-1 text-blue-300 font-medium">{name}</td>
                      <td className="px-2 py-1 text-white">{value}</td>
                      <td className="px-2 py-1 text-[#9da6b9]">int</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )
      }}
    />
  );
}
