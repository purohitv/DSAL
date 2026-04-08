'use client';

import IDELayout from '@/components/ide/Layout';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useMockTimeline } from '@/hooks/useMockTimeline';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from "@monaco-editor/react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Plus, Minus, Square, Play, ArrowRight, Terminal, Code, Layers, Database, Eye, Search } from 'lucide-react';

function LinearStructureContent() {
  useMockTimeline();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'array';
  
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

  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();

  useEffect(() => {
    let code = '';
    if (type === 'array') {
      code = `#include <iostream>
using namespace std;

int main() {
    int arr[6] = {10, 20, 30, 40, 50};
    int size = 5;
    
    // Insert 25 at index 2
    for(int i = size; i > 2; i--) arr[i] = arr[i-1];
    arr[2] = 25;
    size++;
    
    return 0;
}`;
    } else if (type === 'linked-list') {
      code = `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

void insertHead(Node** head, int val) {
    Node* newNode = new Node();
    newNode->data = val;
    newNode->next = *head;
    *head = newNode;
}

int main() {
    Node* head = NULL;
    insertHead(&head, 10);
    insertHead(&head, 20);
    return 0;
}`;
    } else if (type === 'queue') {
      code = `#include <iostream>
using namespace std;

#define MAX 6
int queue[MAX];
int front = -1, rear = -1;

void enqueue(int val) {
    if (rear == MAX - 1) return;
    if (front == -1) front = 0;
    queue[++rear] = val;
}

int main() {
    enqueue(10);
    enqueue(20);
    return 0;
}`;
    } else {
      code = `#include <iostream>
using namespace std;

#define MAX 6
int stack[MAX];
int top = -1;

void push(int val) {
    if (top >= MAX - 1) {
        cout << "Stack Overflow\\n";
        return;
    }
    stack[++top] = val;
    cout << "Pushed " << val << "\\n";
}

int pop() {
    if (top < 0) {
        cout << "Stack Underflow\\n";
        return -1;
    }
    int val = stack[top--];
    cout << "Popped " << val << "\\n";
    return val;
}

int peek() {
    if (top < 0) {
        cout << "Stack is Empty\\n";
        return -1;
    }
    return stack[top];
}`;
    }
    setUserCode(code);
    setPlaygroundLanguage("cpp");
  }, [setUserCode, setPlaygroundLanguage, type]);

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
            variables: [
              { name: 'top', value: top, type: 'int' },
              { name: 'val', value: num, type: 'int' }
            ],
            heap: [...heap],
            output: [...output],
            description: `Pushed ${num} onto stack`
          });
        }
        appendFrames(newFrames);
      }
    } else if (cmd === 'pop') {
      if (top < 0) {
        output.push(`Stack Underflow!`);
        newFrames.push({
          ...lastFrame,
          output: [...output],
          description: `Attempt pop() - Underflow`
        });
      } else {
        const val = heap[top];
        heap[top] = 0;
        top--;
        output.push(`Popped ${val} from stack`);
        
        newFrames.push({
          ...lastFrame,
          callStack: [
            { id: Date.now().toString(), functionName: `pop()`, line: 20, fileName: 'stack.cpp' },
            ...lastFrame.callStack.filter(f => f.functionName === 'main()')
          ],
          variables: [
            { name: 'top', value: top, type: 'int' }
          ],
          heap: [...heap],
          output: [...output],
          description: `Popped ${val} from stack`
        });
      }
      appendFrames(newFrames);
    }
  };

  const currentFrame = frames[currentFrameIndex];

  const getOperations = () => {
    const baseOps = [
      { name: 'Reset', onClick: () => appendFrames([frames[0]]), icon: <Square size={14} /> },
    ];

    if (type === 'array') {
      return [
        { name: 'Insert', onClick: () => handleCommand('insert 10'), icon: <Plus size={14} /> },
        { name: 'Delete', onClick: () => handleCommand('delete 0'), icon: <Minus size={14} /> },
        { name: 'Search', onClick: () => handleCommand('search 42'), icon: <Search size={14} /> },
        ...baseOps
      ];
    } else if (type === 'linked-list') {
      return [
        { name: 'Insert Head', onClick: () => handleCommand('insert_head 10'), icon: <Plus size={14} /> },
        { name: 'Insert Tail', onClick: () => handleCommand('insert_tail 20'), icon: <Plus size={14} /> },
        { name: 'Delete', onClick: () => handleCommand('delete 10'), icon: <Minus size={14} /> },
        ...baseOps
      ];
    } else if (type === 'queue') {
      return [
        { name: 'Enqueue', onClick: () => handleCommand('enqueue 10'), icon: <Plus size={14} /> },
        { name: 'Dequeue', onClick: () => handleCommand('dequeue'), icon: <Minus size={14} /> },
        ...baseOps
      ];
    }
    
    return [
      { name: 'Push', onClick: () => handleCommand('push 10'), icon: <Plus size={14} /> },
      { name: 'Pop', onClick: () => handleCommand('pop'), icon: <Minus size={14} /> },
      { name: 'Peek', onClick: () => handleCommand('peek'), icon: <Eye size={14} /> },
      ...baseOps
    ];
  };

  return (
    <IDELayout
      title={type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
      category="Basic"
      operations={getOperations()}
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
        subtitle: `${type.replace('-', '_')}.cpp`,
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={useSimulationStore.getState().userCode}
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
        subtitle: "Visualizer",
        icon: "science",
        content: (
          <div className="flex-1 relative overflow-hidden bg-[#0a0d14] h-full">
            <TransformWrapper initialScale={1} minScale={0.5} maxScale={2}>
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                <div className="flex items-center justify-center min-w-[800px] min-h-[500px] p-20">
                  <div className="relative flex gap-1 items-end h-40 border-b-2 border-slate-700 px-10">
                    {currentFrame?.heap.map((val: any, i: number) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ 
                          opacity: val ? 1 : 0.3, 
                          scale: 1,
                          height: val ? 100 : 40,
                          backgroundColor: i === (currentFrame.variables.find(v => v.name === 'top')?.value as number) ? '#7f13ec' : '#1e293b'
                        }}
                        className="w-16 rounded-t-lg flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/10"
                      >
                        <AnimatePresence mode="wait">
                          {val ? (
                            <motion.span
                              key={val}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              {val}
                            </motion.span>
                          ) : (
                            <span className="text-slate-600 text-xs">null</span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                    
                    {/* Pointer */}
                    <AnimatePresence>
                      {type === 'stack' && (
                        <motion.div
                          layoutId="pointer"
                          className="absolute -bottom-12 flex flex-col items-center"
                          animate={{ x: (currentFrame?.variables.find(v => v.name === 'top')?.value as number || 0) * 68 + 40 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          <ArrowRight className="-rotate-90 text-primary mb-1" size={20} />
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Top</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs bg-[#0d1117] h-full">
            {currentFrame?.output.map((line, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="flex gap-3 text-slate-400 border-l border-slate-800 pl-3"
              >
                <span className="text-slate-600 select-none w-4">{i + 1}</span>
                <span className={line.includes('Overflow') || line.includes('Underflow') ? 'text-red-400' : 'text-slate-300'}>
                  {line}
                </span>
              </motion.div>
            ))}
          </div>
        )
      }}
    />
  );
}

export default function DsalLinearStructureVisualization() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LinearStructureContent />
    </Suspense>
  );
}
