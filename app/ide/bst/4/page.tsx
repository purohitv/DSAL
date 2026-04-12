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
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import IDELayout from "@/components/ide/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, SkipForward, Square, RotateCcw, Layers, Play } from 'lucide-react';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- BST Logic ---
class BSTNode {
  value: number;
  left: BSTNode | null = null;
  right: BSTNode | null = null;
  id: string;

  constructor(value: number) {
    this.value = value;
    this.id = \`node-\${value}-\${Math.random().toString(36).substr(2, 9)}\`;
  }
}

class BST {
  root: BSTNode | null = null;

  insert(value: number): { path: BSTNode[]; newNode: BSTNode } {
    const newNode = new BSTNode(value);
    if (!this.root) {
      this.root = newNode;
      return { path: [newNode], newNode };
    }

    let current = this.root;
    const path: BSTNode[] = [current];

    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          path.push(newNode);
          return { path, newNode };
        }
        current = current.left;
        path.push(current);
      } else if (value > current.value) {
        if (!current.right) {
          current.right = newNode;
          path.push(newNode);
          return { path, newNode };
        }
        current = current.right;
        path.push(current);
      } else {
        return { path, newNode: current };
      }
    }
  }
}

// Helper to convert BST to React Flow
const generateFlowElements = (
  root: BSTNode | null,
  activeNodeId: string | null = null,
  visitedNodeIds: string[] = []
) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!root) return { nodes, edges };

  const traverse = (node: BSTNode, x: number, y: number, level: number, parentId: string | null = null) => {
    const isVisited = visitedNodeIds.includes(node.id);
    const isActive = activeNodeId === node.id;

    nodes.push({
      id: node.id,
      position: { x, y },
      data: { label: node.value.toString() },
      style: {
        background: isActive ? "#3b82f6" : isVisited ? "#10b981" : "#1e293b",
        color: "#fff",
        border: isActive ? "3px solid #93c5fd" : isVisited ? "2px solid #34d399" : "2px solid #475569",
        borderRadius: "50%",
        width: 50,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        boxShadow: isActive ? "0 0 20px rgba(59, 130, 246, 0.8)" : isVisited ? "0 0 10px rgba(16, 185, 129, 0.5)" : "none",
        zIndex: isActive ? 10 : 1,
        transition: "all 0.3s ease"
      },
    });

    if (parentId) {
      edges.push({
        id: \`e-\${parentId}-\${node.id}\`,
        source: parentId,
        target: node.id,
        animated: isActive || isVisited,
        style: { stroke: isVisited ? "#10b981" : "#475569", strokeWidth: 2, transition: "stroke 0.3s ease" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isVisited ? "#10b981" : "#475569",
        },
      });
    }

    const dx = 150 / Math.pow(1.5, level);
    const dy = 80;

    if (node.left) traverse(node.left, x - dx, y + dy, level + 1, node.id);
    if (node.right) traverse(node.right, x + dx, y + dy, level + 1, node.id);
  };

  traverse(root, 0, 0, 0);
  return { nodes, edges };
};

const CODE_SNIPPET = \`void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}

void preorder(Node* root) {
    if (!root) return;
    cout << root->val << " ";
    preorder(root->left);
    preorder(root->right);
}

void postorder(Node* root) {
    if (!root) return;
    postorder(root->left);
    postorder(root->right);
    cout << root->val << " ";
}\`;

export default function DsalAlgorithmIdeBstVisualization4() {
  const [bst, setBst] = useState(() => {
      const initBst = new BST();
      initBst.insert(50);
      initBst.insert(30);
      initBst.insert(70);
      initBst.insert(20);
      initBst.insert(40);
      initBst.insert(60);
      initBst.insert(80);
      return initBst;
  });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>(["> BST Initialized with sample tree."]);
  const [callStack, setCallStack] = useState<any[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  
  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserCode(CODE_SNIPPET);
    setPlaygroundLanguage("cpp");
    updateFlow(null, []);
  }, []);

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

  const updateFlow = (activeId: string | null = null, visitedIds: string[] = [], currentBst: BST = bst) => {
    const { nodes: newNodes, edges: newEdges } = generateFlowElements(currentBst.root, activeId, visitedIds);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleReset = () => {
    if(isPlaying) return;
    const newBst = new BST();
    setBst(newBst);
    updateFlow(null, [], newBst);
    setTerminalOutput(["> Tree cleared. Ready for insert."]);
    setCallStack([]);
    setVariables([]);
    setActiveLine(null);
  };

  const handleInsert = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || isPlaying) return;
    setInputValue("");
    bst.insert(val);
    updateFlow();
    setTerminalOutput(prev => [...prev, \`> Inserted \${val} into tree.\`]);
  };

  const runTraversal = async (type: 'inorder' | 'preorder' | 'postorder') => {
      if(isPlaying || !bst.root) return;
      setIsPlaying(true);
      setTerminalOutput(prev => [...prev, \`> Starting \${type.toUpperCase()} traversal...\`]);
      setCallStack([]);
      setVariables([]);
      
      const visited: string[] = [];
      const traversalOutput: number[] = [];

      const animateTraversal = async (node: BSTNode | null) => {
          if (!node) return;
          
          setCallStack(prev => [{ id: node.id, name: \`\${type}(\${node.value})\`, line: type === 'inorder' ? 1 : type === 'preorder' ? 7 : 14 }, ...prev]);
          setVariables([{ name: 'root->val', value: node.value, type: 'int' }]);

          // PREORDER LOGIC
          if (type === 'preorder') {
              setActiveLine(9);
              updateFlow(node.id, visited);
              await sleep(800);
              visited.push(node.id);
              traversalOutput.push(node.value);
              setTerminalOutput(prev => [...prev, \`> Output: \${traversalOutput.join(', ')}\`]);
              await sleep(400);

              setActiveLine(10); await sleep(400);
              await animateTraversal(node.left);
              
              setCallStack(prev => { const n = [...prev]; n.shift(); return [{ id: node.id, name: \`preorder(\${node.value})\`, line: 7 }, ...n.slice(1)]; });
              setActiveLine(11); await sleep(400);
              await animateTraversal(node.right);
          }

          // INORDER LOGIC
          else if (type === 'inorder') {
              setActiveLine(3);
              updateFlow(node.id, visited);
              await sleep(400);
              await animateTraversal(node.left);

              setCallStack(prev => { const n = [...prev]; n.shift(); return [{ id: node.id, name: \`inorder(\${node.value})\`, line: 1 }, ...n.slice(1)]; });
              setVariables([{ name: 'root->val', value: node.value, type: 'int' }]);
              setActiveLine(4);
              updateFlow(node.id, visited);
              await sleep(800);
              visited.push(node.id);
              traversalOutput.push(node.value);
              setTerminalOutput(prev => [...prev, \`> Output: \${traversalOutput.join(', ')}\`]);
              await sleep(400);

              setActiveLine(5); await sleep(400);
              await animateTraversal(node.right);
          }

          // POSTORDER LOGIC
          else if (type === 'postorder') {
              setActiveLine(16);
              updateFlow(node.id, visited);
              await sleep(400);
              await animateTraversal(node.left);

              setCallStack(prev => { const n = [...prev]; n.shift(); return [{ id: node.id, name: \`postorder(\${node.value})\`, line: 14 }, ...n.slice(1)]; });
              setVariables([{ name: 'root->val', value: node.value, type: 'int' }]);
              setActiveLine(17); await sleep(400);
              await animateTraversal(node.right);

              setCallStack(prev => { const n = [...prev]; n.shift(); return [{ id: node.id, name: \`postorder(\${node.value})\`, line: 14 }, ...n.slice(1)]; });
              setVariables([{ name: 'root->val', value: node.value, type: 'int' }]);
              setActiveLine(18);
              updateFlow(node.id, visited);
              await sleep(800);
              visited.push(node.id);
              traversalOutput.push(node.value);
              setTerminalOutput(prev => [...prev, \`> Output: \${traversalOutput.join(', ')}\`]);
              await sleep(400);
          }

          setCallStack(prev => { const next = [...prev]; next.shift(); return next; });
          if(setCallStack.length > 0) updateFlow(null, visited);
      };

      await animateTraversal(bst.root);
      
      updateFlow(null, visited);
      setTerminalOutput(prev => [...prev, \`> \${type.toUpperCase()} Traversal Complete!\`]);
      setActiveLine(null);
      setVariables([]);
      setIsPlaying(false);
  };

  const traverseControls = (
    <div className="flex items-center gap-3">
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-md overflow-hidden">
            <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Insert Node"
                className="w-24 bg-transparent text-xs text-white px-3 py-1.5 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                disabled={isPlaying}
            />
            <button
                onClick={handleInsert}
                disabled={isPlaying || !inputValue}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-xs font-bold transition-colors border-l border-neutral-800"
            >
                <Plus size={14} /> Insert
            </button>
        </div>
        <div className="w-px h-6 bg-neutral-800 mx-2"></div>
        <button
            onClick={() => runTraversal('inorder')}
            disabled={isPlaying || !bst.root}
            className="flex items-center gap-2 px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-bold rounded-md border border-neutral-700 transition-colors"
        >
            <Play size={14} /> Inorder
        </button>
        <button
            onClick={() => runTraversal('preorder')}
            disabled={isPlaying || !bst.root}
            className="flex items-center gap-2 px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-bold rounded-md border border-neutral-700 transition-colors"
        >
            <Play size={14} /> Preorder
        </button>
        <button
            onClick={() => runTraversal('postorder')}
            disabled={isPlaying || !bst.root}
            className="flex items-center gap-2 px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-bold rounded-md border border-neutral-700 transition-colors"
        >
            <Play size={14} /> Postorder
        </button>
        <button
            onClick={handleReset}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 disabled:opacity-50 text-xs font-bold rounded-md border border-red-900/50 transition-colors ml-4"
        >
            <RotateCcw size={14} /> Clear Tree
        </button>
    </div>
  );

  return (
    <IDELayout
      title="Tree Traversals"
      category="Non-Linear"
      operations={[
        { name: 'Inorder', onClick: () => runTraversal('inorder') },
        { name: 'Preorder', onClick: () => runTraversal('preorder') },
        { name: 'Postorder', onClick: () => runTraversal('postorder') },
        { name: 'Clear Tree', onClick: handleReset },
      ]}
      extraControls={traverseControls}
      showTimeline={false}
      leftPanel={{
        title: "Source View",
        subtitle: "traversals.cpp",
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <style>{\`
              .bg-blue-500\\\\/30 { background-color: rgba(59, 130, 246, 0.3) !important; }
            \`}</style>
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={CODE_SNIPPET}
              options={{
                minimap: { enabled: false },
                fontSize: 10,
                readOnly: true,
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
        subtitle: "Tree Traversals",
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
                    className={\`flex flex-col p-1.5 rounded transition-colors \${
                      i === 0 ? 'bg-[#282e39] border-l-2 border-primary rounded-r shadow-sm' : 'border border-transparent opacity-60'
                    }\`}
                  >
                    <span className={\`font-mono text-[10px] \${i === 0 ? 'text-white' : 'text-gray-300'}\`}>{call.name}</span>
                    <span className={\`font-mono text-[8px] \${i === 0 ? 'text-gray-400' : 'text-gray-500'}\`}>Line: {call.line}</span>
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
                <AnimatePresence mode="popLayout">
                  {variables.map((v, i) => (
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
