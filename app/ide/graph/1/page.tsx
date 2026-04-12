"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useSimulationStore } from "@/store/useSimulationStore";
import {
  ReactFlow,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import IDELayout from "@/components/ide/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Network } from 'lucide-react';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Graph logic definition
const INITIAL_NODES: Node[] = [
  { id: '0', position: { x: 250, y: 50 }, data: { label: '0' } },
  { id: '1', position: { x: 100, y: 150 }, data: { label: '1' } },
  { id: '2', position: { x: 400, y: 150 }, data: { label: '2' } },
  { id: '3', position: { x: 50, y: 250 }, data: { label: '3' } },
  { id: '4', position: { x: 250, y: 250 }, data: { label: '4' } },
  { id: '5', position: { x: 150, y: 350 }, data: { label: '5' } },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e0-1', source: '0', target: '1', type: 'straight' },
  { id: 'e0-2', source: '0', target: '2', type: 'straight' },
  { id: 'e1-3', source: '1', target: '3', type: 'straight' },
  { id: 'e1-4', source: '1', target: '4', type: 'straight' },
  { id: 'e2-4', source: '2', target: '4', type: 'straight' },
  { id: 'e3-5', source: '3', target: '5', type: 'straight' },
  { id: 'e4-5', source: '4', target: '5', type: 'straight' },
];

// Adjacency List for our internal execution
const ADJ_LIST: Record<string, string[]> = {
  '0': ['1', '2'],
  '1': ['0', '3', '4'],
  '2': ['0', '4'],
  '3': ['1', '5'],
  '4': ['1', '2', '5'],
  '5': ['3', '4']
};

const CODE_SNIPPET = \`#include <iostream>
#include <vector>
#include <queue>
using namespace std;

void BFS(int start, vector<vector<int>>& adj) {
    int V = adj.size();
    vector<bool> visited(V, false);
    queue<int> q;

    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << u << " ";

        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}
\`;

export default function DsalAlgorithmIdeGraphVisualization() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(["> Graph Initialized. Ready for BFS."]);
  const [callStack, setCallStack] = useState<any[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  
  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const styleGraph = useCallback((
    activeNodeId: string | null = null, 
    visitedNodeIds: string[] = [],
    queuedNodeIds: string[] = [],
    currentEdge: Edge | null = null
  ) => {
    setNodes(INITIAL_NODES.map(n => {
      const isVisited = visitedNodeIds.includes(n.id);
      const isQueued = queuedNodeIds.includes(n.id);
      const isActive = activeNodeId === n.id;
      
      let bg = "#1e293b";
      let border = "#475569";
      let shadow = "none";
      
      if (isActive) {
        bg = "#3b82f6"; border = "#93c5fd"; shadow = "0 0 20px rgba(59, 130, 246, 0.8)";
      } else if (isVisited) {
        bg = "#10b981"; border = "#34d399"; shadow = "0 0 10px rgba(16, 185, 129, 0.5)";
      } else if (isQueued) {
        bg = "#f59e0b"; border = "#fcd34d"; shadow = "0 0 10px rgba(245, 158, 11, 0.5)";
      }

      return {
        ...n,
        style: {
          background: bg, color: "#fff", border: \`2px solid \${border}\`, borderRadius: "50%",
          width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "bold", boxShadow: shadow, zIndex: isActive ? 10 : 1, transition: "all 0.3s ease"
        }
      };
    }));

    setEdges(INITIAL_EDGES.map(e => {
        const isActiveEdge = currentEdge && ((currentEdge.source === e.source && currentEdge.target === e.target) || (currentEdge.source === e.target && currentEdge.target === e.source));
        const isVisitedEdge = visitedNodeIds.includes(e.source) && visitedNodeIds.includes(e.target);
        
        let stroke = "#475569";
        if (isActiveEdge) stroke = "#3b82f6";
        else if (isVisitedEdge) stroke = "#10b981";

        return {
            ...e,
            animated: isActiveEdge,
            style: { stroke, strokeWidth: isActiveEdge ? 4 : 2, transition: "stroke 0.3s ease" }
        };
    }));
  }, []);

  useEffect(() => {
    setUserCode(CODE_SNIPPET);
    setPlaygroundLanguage("cpp");
    styleGraph();
  }, [setUserCode, setPlaygroundLanguage, styleGraph]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      if (activeLine !== null) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current || [], [
          { range: new monacoRef.current.Range(activeLine, 1, activeLine, 1), options: { isWholeLine: true, className: 'bg-blue-500/30' } }
        ]);
        editorRef.current.revealLineInCenter(activeLine);
      } else {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current || [], []);
      }
    }
  }, [activeLine]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const handleReset = () => {
    if(isPlaying) return;
    styleGraph(null, [], []);
    setTerminalOutput(["> Graph reset. Ready."]);
    setCallStack([]);
    setVariables([]);
    setActiveLine(null);
  };

  const runBFS = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setTerminalOutput(["> Starting BFS from Node 0..."]);
    
    let visited: string[] = [];
    let q: string[] = [];
    let bfsOutput: string[] = [];
    
    setCallStack([{ id: 'bfs', name: 'BFS(0)', line: 6 }]);
    
    // Line 7: Init visited
    setActiveLine(8); 
    await sleep(600);
    
    // Line 8: Init queue
    setActiveLine(9);
    await sleep(600);
    
    // Line 11: visited[start] = true
    setActiveLine(11);
    visited.push('0');
    styleGraph(null, visited, q);
    setVariables([{ name: 'q', value: \`[\${q.join(',')}]\`, type: 'queue<int>' }]);
    await sleep(600);

    // Line 12: q.push(start)
    setActiveLine(12);
    q.push('0');
    styleGraph(null, visited, q);
    setVariables([{ name: 'q', value: \`[\${q.join(',')}]\`, type: 'queue<int>' }]);
    await sleep(600);

    // Line 14: while(!q.empty)
    setActiveLine(14);
    await sleep(600);

    while (q.length > 0) {
        // Line 15: int u = q.front();
        setActiveLine(15);
        let u = q[0];
        setVariables([{ name: 'u', value: u, type: 'int' }, { name: 'q', value: \`[\${q.join(',')}]\`, type: 'queue<int>' }]);
        await sleep(600);

        // Line 16: q.pop();
        setActiveLine(16);
        q.shift();
        setVariables([{ name: 'u', value: u, type: 'int' }, { name: 'q', value: \`[\${q.join(',')}]\`, type: 'queue<int>' }]);
        await sleep(600);
        
        // Line 17: cout << u
        setActiveLine(17);
        bfsOutput.push(u);
        setTerminalOutput(prev => [...prev, \`> Output: \${bfsOutput.join(', ')}\`]);
        styleGraph(u, visited, q); // Mark current active
        await sleep(800);

        // Line 19: for v in adj[u]
        const neighbors = ADJ_LIST[u];
        for (const v of neighbors) {
            setActiveLine(19);
            styleGraph(u, visited, q, { id: 'test', source: u, target: v } as Edge);
            setVariables([{ name: 'u', value: u, type: 'int' }, { name: 'v', value: v, type: 'int' }, { name: 'q', value: \`[\${q.join(',')}]\`, type: 'queue<int>' }]);
            await sleep(600);

            // Line 20: if (!visited[v])
            setActiveLine(20);
            await sleep(400);

            if (!visited.includes(v)) {
                // Line 21: visited[v] = true
                setActiveLine(21);
                visited.push(v);
                styleGraph(u, visited, q, { id: 'test', source: u, target: v } as Edge);
                await sleep(600);

                // Line 22: q.push(v)
                setActiveLine(22);
                q.push(v);
                setTerminalOutput(prev => [...prev, \`> Enqueued neighbor: \${v}\`]);
                setVariables([{ name: 'u', value: u, type: 'int' }, { name: 'v', value: v, type: 'int' }, { name: 'q', value: \`[\${q.join(',')}]\`, type: 'queue<int>' }]);
                styleGraph(u, visited, q);
                await sleep(600);
            }
        }
        
        setActiveLine(14);
        await sleep(600);
    }
    
    setActiveLine(null);
    setCallStack([]);
    setVariables([]);
    styleGraph(null, visited, []);
    setTerminalOutput(prev => [...prev, "> BFS Complete!"]);
    setIsPlaying(false);
  };

  const graphControls = (
    <div className="flex items-center gap-3">
        <button
            onClick={() => runBFS()}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-md transition-colors shadow-lg"
        >
            <Play size={14} /> Run BFS
        </button>
        <button
            onClick={handleReset}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-bold rounded-md border border-neutral-700 transition-colors"
        >
            <Square size={14} /> Stop / Reset
        </button>
    </div>
  );

  return (
    <IDELayout
      title="Graph Traversals"
      category="Non-Linear"
      operations={[
        { name: 'Run BFS', onClick: () => runBFS() },
        { name: 'Reset Network', onClick: handleReset },
      ]}
      extraControls={graphControls}
      showTimeline={false}
      leftPanel={{
        title: "Source View",
        subtitle: "bfs.cpp",
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <style>{\` .bg-blue-500\\\\/30 { background-color: rgba(59, 130, 246, 0.3) !important; } \`}</style>
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={CODE_SNIPPET}
              options={{ minimap: { enabled: false }, fontSize: 10, readOnly: true, lineNumbers: 'on', glyphMargin: false, folding: false, lineDecorationsWidth: 0, lineNumbersMinChars: 3, padding: { top: 8, bottom: 8 } }}
              onMount={(editor, monaco) => { editorRef.current = editor; monacoRef.current = monaco; }}
            />
          </div>
        )
      }}
      centerPanel={{
        title: "Simulation Stage",
        subtitle: "Undirected Graph",
        icon: "science",
        content: (
          <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(90deg, #3b4354 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-right"
              panOnDrag={false}
              zoomOnScroll={false}
            >
              <Controls className="bg-[#1c212c] border border-[#3b4354] fill-white rounded overflow-hidden shadow-lg" />
            </ReactFlow>
          </div>
        )
      }}
      bottomPanel={{
        title: "Standard Output",
        icon: "terminal",
        content: (
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1 font-mono text-[9px] bg-[#0d1117] h-full flex flex-col pt-4">
             {terminalOutput.map((log, i) => (
                <div key={i} className="flex gap-1.5 text-gray-300">
                    <span className="text-blue-500 font-bold">➜</span>
                    <span>{log}</span>
                </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        )
      }}
      rightPanelTop={{
        title: "Call Stack",
        icon: "layers",
        content: (
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5 bg-[#1c212c] h-full">
            <AnimatePresence mode="popLayout">
              {callStack.length === 0 ? (
                <div className="text-[9px] font-mono text-gray-500 text-center mt-4">Stack Empty</div>
              ) : (
                callStack.map((call, i) => (
                  <motion.div 
                    key={\`\${call.id}-\${i}\`}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col p-1.5 rounded transition-colors bg-[#282e39] border-l-2 border-primary rounded-r shadow-sm"
                  >
                    <span className="font-mono text-[10px] text-white">{call.name}</span>
                    <span className="font-mono text-[8px] text-gray-400">Line: {call.line}</span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )
      }}
      rightPanelBottom={{
        title: "Variables",
        icon: "visibility",
        content: (
          <div className="flex-1 overflow-y-auto bg-[#1c212c] h-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#282e39] text-[9px] uppercase text-[#b0b8c9] font-semibold sticky top-0">
                <tr><th className="px-2 py-1">Name</th><th className="px-2 py-1">Value</th><th className="px-2 py-1">Type</th></tr>
              </thead>
              <tbody className="text-[10px] font-mono divide-y divide-[#3b4354]">
                <AnimatePresence>
                  {variables.map((v) => (
                     <motion.tr key={v.name} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/10">
                      <td className="px-2 py-1 text-blue-300 font-medium">{v.name}</td>
                      <td className="px-2 py-1 text-white">{v.value}</td>
                      <td className="px-2 py-1 text-[#9da6b9]">{v.type}</td>
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
