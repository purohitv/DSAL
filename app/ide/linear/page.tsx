'use client';

import IDELayout from '@/components/ide/Layout';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useMockTimeline } from '@/hooks/useMockTimeline';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from "@monaco-editor/react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function DsalLinearStructureVisualization() {
  useMockTimeline();
  
  const { 
    frames, 
    currentFrameIndex, 
    isPlaying, 
    playbackSpeed,
    nextFrame, 
    prevFrame, 
    goToFrame, 
    togglePlayback,
    setPlaybackSpeed,
    appendFrames
  } = useTimelineStore();

  const handleCommand = (val: string) => {
    const parts = val.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    
    if (frames.length === 0) return;
    const lastFrame = frames[frames.length - 1];
    let top = lastFrame.variables.find(v => v.name === 'top')?.value as number;
    let heap = [...lastFrame.heap];
    let output = [...lastFrame.output];
    
    const newFrames = [];

    if (cmd === 'push' && parts[1]) {
      const num = parseInt(parts[1]);
      if (!isNaN(num)) {
        if (top >= 6) {
          output.push(`Stack Overflow! Cannot push ${num}`);
          newFrames.push({
            ...lastFrame,
            output: [...output],
            description: `Attempt push(${num}) - Overflow`
          });
        } else {
          top++;
          heap[top] = num;
          output.push(`Pushed ${num} at index ${top}`);
          
          newFrames.push({
            ...lastFrame,
            callStack: [
              { id: Date.now().toString(), functionName: `push(${num})`, line: 11, fileName: 'stack.cpp' },
              ...lastFrame.callStack.filter(f => f.functionName === 'main()')
            ],
            variables: lastFrame.variables.map(v => v.name === 'top' ? { ...v, value: top } : v),
            heap: [...heap],
            output: [...output],
            activeLine: 15,
            description: `Push ${num} to stack`
          });
        }
      }
    } else if (cmd === 'pop') {
      if (top < 0) {
        output.push(`Stack Underflow! Cannot pop`);
        newFrames.push({
          ...lastFrame,
          output: [...output],
          description: `Attempt pop() - Underflow`
        });
      } else {
        const popped = heap[top];
        heap.pop();
        top--;
        output.push(`Popped ${popped} from index ${top + 1}`);
        
        newFrames.push({
          ...lastFrame,
          callStack: [
            { id: Date.now().toString(), functionName: `pop()`, line: 20, fileName: 'stack.cpp' },
            ...lastFrame.callStack.filter(f => f.functionName === 'main()')
          ],
          variables: lastFrame.variables.map(v => v.name === 'top' ? { ...v, value: top } : v),
          heap: [...heap],
          output: [...output],
          activeLine: 22,
          description: `Pop from stack`
        });
      }
    } else {
      output.push(`Command not found: ${cmd}`);
      newFrames.push({
        ...lastFrame,
        output: [...output],
        description: `Invalid command`
      });
    }

    if (newFrames.length > 0) {
      appendFrames(newFrames);
      if (!isPlaying) {
        togglePlayback();
      }
    }
  };

  const currentFrame = frames[currentFrameIndex] || null;
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);

  // Highlight active line in Monaco
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const activeLine = currentFrame?.activeLine;

      if (activeLine !== undefined && activeLine !== null) {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], [
          {
            range: new monaco.Range(activeLine, 1, activeLine, 1),
            options: {
              isWholeLine: true,
              className: 'bg-primary/20 border-l-4 border-primary',
            }
          }
        ]);
        editor.revealLineInCenterIfOutsideViewport(activeLine);
      } else {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], []);
      }
    }
  }, [currentFrame?.activeLine]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentFrameIndex < frames.length - 1) {
      interval = setInterval(() => {
        nextFrame();
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentFrameIndex, frames.length, playbackSpeed, nextFrame]);

  const code = `void push(int value) {
  // Check overflow
  if (top >= capacity - 1)
    return;
  data[++top] = value;
  cout << "Pushed " << value;
}

int main() {
  push(10);
  push(20);
  push(42);
  return 0;
}`;

  return (
    <IDELayout
      title="Stack Visualization"
      category="Linear Structures"
      activeStep={currentFrame?.description}
      totalSteps={frames.length}
      currentStep={currentFrameIndex + 1}
      onPrev={prevFrame}
      onNext={nextFrame}
      onTogglePlayback={togglePlayback}
      isPlaying={isPlaying}
      playbackSpeed={playbackSpeed}
      onSetPlaybackSpeed={setPlaybackSpeed}
      leftPanel={{
        title: "Source View",
        subtitle: "stack.cpp",
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <style>{`
              .bg-primary\\/20 {
                background-color: rgba(127, 19, 236, 0.2) !important;
              }
              .border-l-4 {
                border-left-width: 4px !important;
              }
            `}</style>
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              options={{
                minimap: { enabled: false },
                fontSize: 10,
                readOnly: true,
                scrollBeyondLastLine: false,
                lineNumbers: (num) => String(num + 10), // Offset to match original line numbers if needed
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
        )
      }}
      centerPanel={{
        title: "Simulation Stage",
        subtitle: "Array-based Stack",
        icon: "science",
        content: (
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(90deg, #3b4354 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
            <TransformWrapper
              initialScale={1}
              minScale={0.2}
              maxScale={4}
              centerOnInit
              wheel={{ step: 0.1 }}
            >
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="flex items-end gap-8 relative z-10">
                  <div className="flex relative pr-12">
                    {/* Indices */}
                    <div className="flex flex-col-reverse justify-start mr-2 gap-1 pb-1">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className={`h-8 flex items-center justify-end text-[9px] font-mono ${i === (currentFrame?.variables.find(v => v.name === 'top')?.value as number) ? 'text-white font-bold' : 'text-gray-500'}`}>
                          {i}
                        </div>
                      ))}
                    </div>

                    {/* Stack Container */}
                    <div className="flex flex-col-reverse gap-1 bg-[#282e39] p-1.5 rounded-lg border border-[#3b4354] shadow-2xl min-h-[200px] justify-end relative overflow-hidden">
                      <AnimatePresence mode="popLayout">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const value = currentFrame?.heap[i];
                          const isTop = i === (currentFrame?.variables.find(v => v.name === 'top')?.value as number);
                          
                          return (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, scale: 0.8, y: 30, rotateX: -45 }}
                              animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: 0,
                                rotateX: 0,
                                backgroundColor: isTop ? 'rgba(127, 19, 236, 1)' : 'rgba(28, 33, 44, 1)',
                                borderColor: isTop ? 'rgba(255, 255, 255, 0.2)' : 'rgba(59, 67, 84, 1)',
                                boxShadow: isTop ? '0 0 10px rgba(127, 19, 236, 0.5)' : 'none'
                              }}
                              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                              className={`w-16 h-8 border rounded flex items-center justify-center font-mono text-xs shadow-sm transition-all relative group overflow-hidden ${isTop ? 'text-white font-bold transform scale-105 z-10' : 'text-white'}`}
                            >
                              {value !== undefined ? (
                                <>
                                  <motion.span 
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                  >
                                    {value}
                                  </motion.span>
                                </>
                              ) : (
                                <span className="text-[9px] font-mono text-gray-700/50">null</span>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Top Pointer */}
                    <div className="absolute right-0 bottom-0 h-full w-8 pointer-events-none">
                      <AnimatePresence>
                        {(() => {
                          const topIndex = currentFrame?.variables.find(v => v.name === 'top')?.value as number;
                          if (topIndex >= 0 && topIndex < 7) {
                            const bottomPos = 6 + (topIndex * 36); 
                            return (
                              <motion.div 
                                key="top-pointer"
                                initial={{ opacity: 0, x: 30, scale: 0.5 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 30, scale: 0.5 }}
                                className="absolute -right-2 flex items-center transition-all duration-300 animate-pulse" 
                                style={{ bottom: `${bottomPos}px` }}
                              >
                                <span className="material-symbols-outlined text-primary rotate-180" style={{ fontSize: "16px" }}>arrow_right_alt</span>
                                <span className="ml-1 bg-primary text-white text-[8px] font-bold px-1 py-0.5 rounded shadow-lg uppercase tracking-wider">Top</span>
                              </motion.div>
                            );
                          }
                          return null;
                        })()}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
        )
      }}
      bottomPanel={{
        title: "Standard Output",
        subtitle: "Live Stream",
        icon: "terminal",
        content: (
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1 font-mono text-[9px] bg-[#0d1117] h-full flex flex-col">
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto flex-col-reverse">
              <AnimatePresence mode="popLayout">
                {currentFrame?.output.map((out, i) => (
                  <motion.div 
                    key={`${out}-${i}`}
                    initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    className={`flex gap-1.5 ${i === currentFrame.output.length - 1 ? "text-white font-bold" : "text-gray-300 opacity-60"}`}
                  >
                    <span className="text-blue-500 font-bold">➜</span>
                    <span>{out}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-1.5 mt-1 border-t border-[#3b4354] pt-1">
              <span className="text-blue-500 font-bold">➜</span>
              <input 
                type="text" 
                maxLength={30}
                className="flex-1 bg-[#1c212c] border border-[#3b4354] rounded px-1.5 py-0.5 outline-none text-white font-mono text-[9px] placeholder:text-gray-500 focus:bg-[#282e39] focus:border-primary/50 transition-colors"
                placeholder="Enter command (e.g., 'push 5', 'pop')..."
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
                disabled={isPlaying}
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
            <AnimatePresence mode="popLayout">
              {currentFrame?.callStack.map((frame, i) => (
                <motion.div 
                  key={frame.id}
                  initial={{ opacity: 0, x: 15, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  className={`group flex items-center justify-between p-1.5 rounded transition-colors ${
                    i === 0 
                    ? 'bg-[#282e39] border-l-2 border-primary rounded-r shadow-sm cursor-pointer hover:bg-[#323945]' 
                    : 'border border-transparent hover:bg-[#282e39]/50 opacity-60'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-mono text-[10px] ${i === 0 ? 'text-white font-medium' : 'text-gray-300'}`}>{frame.functionName}</span>
                    <span className={`text-[9px] ${i === 0 ? 'text-[#9da6b9]' : 'text-gray-400'}`}>Line {frame.line}</span>
                  </div>
                  {i === 0 && <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 text-[10px]">arrow_back</span>}
                </motion.div>
              ))}
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
                  {currentFrame?.variables.map((v, i) => {
                    const prevVar = currentFrameIndex > 0 ? frames[currentFrameIndex - 1].variables.find(pv => pv.name === v.name) : null;
                    const hasChanged = prevVar && prevVar.value !== v.value;
                    
                    return (
                    <motion.tr 
                      key={v.name}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={hasChanged ? 'bg-primary/10' : ''}
                    >
                      <td className="px-2 py-1 text-blue-300 font-medium">{v.name}</td>
                      <td className="px-2 py-1 text-white">
                        <motion.span
                          key={String(v.value)}
                          initial={{ scale: hasChanged ? 1.2 : 1, color: hasChanged ? '#60a5fa' : '#ffffff' }}
                          animate={{ scale: 1, color: '#ffffff' }}
                          transition={{ duration: 0.5 }}
                        >
                          {String(v.value)}
                        </motion.span>
                      </td>
                      <td className="px-2 py-1 text-[#9da6b9]">{v.type}</td>
                    </motion.tr>
                  )})}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )
      }}
    />
  );
}
