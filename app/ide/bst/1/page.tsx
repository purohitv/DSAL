"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useCompiler } from "@/hooks/useCompiler";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// --- BST Logic ---
class BSTNode {
  value: number;
  left: BSTNode | null = null;
  right: BSTNode | null = null;
  id: string;

  constructor(value: number) {
    this.value = value;
    this.id = `node-${value}-${Math.random().toString(36).substr(2, 9)}`;
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
        // Value already exists
        return { path, newNode: current };
      }
    }
  }

  search(value: number): { path: BSTNode[]; found: boolean } {
    let current = this.root;
    const path: BSTNode[] = [];

    while (current) {
      path.push(current);
      if (value === current.value) {
        return { path, found: true };
      } else if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return { path, found: false };
  }
}

// --- Helper to convert BST to React Flow Nodes/Edges ---
const generateFlowElements = (
  root: BSTNode | null,
  activeNodeId: string | null = null,
  pathNodeIds: string[] = []
) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!root) return { nodes, edges };

  const traverse = (
    node: BSTNode,
    x: number,
    y: number,
    level: number,
    parentId: string | null = null
  ) => {
    const isPath = pathNodeIds.includes(node.id);
    const isActive = activeNodeId === node.id;

    nodes.push({
      id: node.id,
      position: { x, y },
      data: { label: node.value.toString() },
      style: {
        background: isActive ? "#3b82f6" : isPath ? "#10b981" : "#1e293b",
        color: "#fff",
        border: isActive ? "2px solid #60a5fa" : isPath ? "2px solid #34d399" : "2px solid #475569",
        borderRadius: "50%",
        width: 50,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        boxShadow: isActive ? "0 0 15px rgba(59, 130, 246, 0.5)" : "none",
      },
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        animated: isPath,
        style: { stroke: isPath ? "#10b981" : "#475569", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isPath ? "#10b981" : "#475569",
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

import IDELayout from "@/components/ide/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/useSimulationStore";

import { Plus, Minus, Square, Search, RefreshCw, Terminal, Layers } from 'lucide-react';

export default function BSTVisualization() {
  const [bst, setBst] = useState(() => new BST());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "> BST Initialized. Ready for operations.",
  ]);
  const [callStack, setCallStack] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);

  useEffect(() => {
    setUserCode(`struct Node {
  int data;
  Node *left, *right;
  Node(int data) : data(data), left(NULL), right(NULL) {}
};

class BST {
  Node *root;
public:
  BST() { root = NULL; }
  void insert(int key);
  bool search(int key);
};`);
    setPlaygroundLanguage("cpp");
  }, [setUserCode, setPlaygroundLanguage]);

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

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const updateFlow = (activeId: string | null, pathIds: string[], currentBst: BST = bst) => {
    const { nodes: newNodes, edges: newEdges } = generateFlowElements(
      currentBst.root,
      activeId,
      pathIds
    );
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const logTerminal = (msg: string) => {
    setTerminalOutput((prev) => [...prev, msg]);
  };

  const handleReset = () => {
    const newBst = new BST();
    setBst(newBst);
    updateFlow(null, [], newBst);
    setTerminalOutput(["> BST Reset. Ready for operations."]);
    setCallStack([]);
    setActiveLine(null);
    setInputValue("");
  };

  const handleInsert = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue("");
    setIsPlaying(true);

    logTerminal(`> Starting insertion for value: ${val}`);
    const { path, newNode } = bst.insert(val);

    const currentPathIds: string[] = [];
    setCallStack(["insert(root, " + val + ")"]);

    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      currentPathIds.push(node.id);
      updateFlow(node.id, currentPathIds);
      
      if (i === path.length - 1 && node.id === newNode.id) {
        setActiveLine(2);
        logTerminal(`> Inserted ${val} successfully.`);
      } else {
        setActiveLine(3);
        logTerminal(`> Visiting node ${node.value}...`);
        await new Promise((r) => setTimeout(r, 400));
        if (val < node.value) setActiveLine(4);
        else setActiveLine(6);
      }
      
      await new Promise((r) => setTimeout(r, 800));
    }

    updateFlow(null, []);
    setCallStack([]);
    setActiveLine(null);
    setIsPlaying(false);
  };

  const handleSearch = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue("");
    setIsPlaying(true);

    logTerminal(`> Searching for value: ${val}`);
    const { path, found } = bst.search(val);

    const currentPathIds: string[] = [];
    setCallStack(["search(root, " + val + ")"]);

    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      currentPathIds.push(node.id);
      updateFlow(node.id, currentPathIds);
      
      setActiveLine(10);
      logTerminal(`> Comparing with node ${node.value}...`);
      await new Promise((r) => setTimeout(r, 400));
      
      if (val === node.value) setActiveLine(11);
      else if (val < node.value) setActiveLine(13);
      else setActiveLine(14);

      await new Promise((r) => setTimeout(r, 800));
    }

    if (found) {
      logTerminal(`> Value ${val} found in the BST!`);
    } else {
      logTerminal(`> Value ${val} not found.`);
    }

    await new Promise((r) => setTimeout(r, 1000));
    updateFlow(null, []);
    setCallStack([]);
    setActiveLine(null);
    setIsPlaying(false);
  };

  // Initial render
  useEffect(() => {
    updateFlow(null, []);
  }, []);

  const bstControls = (
    <div className="flex items-center gap-3">
      <div className="relative group">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Value..."
          className="bg-surface-darker border-2 border-border-dark rounded-lg px-4 py-2 text-base focus:outline-none focus:border-primary w-32 text-white font-black transition-all placeholder:text-text-secondary/30"
          disabled={isPlaying}
        />
        <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleInsert}
        disabled={isPlaying || !inputValue}
        className="px-4 py-1.5 bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-xs font-black uppercase tracking-widest transition-all shadow-[0_3px_0_rgb(88,13,164)] active:translate-y-[2px] active:shadow-none border border-white/10"
      >
        Insert
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSearch}
        disabled={isPlaying || !inputValue}
        className="px-4 py-1.5 bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-xs font-black uppercase tracking-widest transition-all shadow-[0_3px_0_rgb(5,150,105)] active:translate-y-[2px] active:shadow-none border border-white/10"
      >
        Search
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReset}
        disabled={isPlaying}
        className="px-4 py-1.5 bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-xs font-black uppercase tracking-widest transition-all shadow-[0_3px_0_rgb(185,28,28)] active:translate-y-[2px] active:shadow-none border border-white/10"
      >
        Reset
      </motion.button>
    </div>
  );

  return (
    <IDELayout
      title="Binary Search Tree"
      category="Basic"
      operations={[
        { name: 'Insert', onClick: handleInsert, icon: <Plus size={14} /> },
        { name: 'Search', onClick: handleSearch, icon: <Search size={14} /> },
        { name: 'Reset', onClick: handleReset, icon: <RefreshCw size={14} /> },
      ]}
      showTimeline={false}
      leftPanel={{
        title: "Source View",
        subtitle: "bst.cpp",
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <style>{`
              .bg-blue-500\\/30 {
                background-color: rgba(59, 130, 246, 0.3) !important;
              }
            `}</style>
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={`Node* insert(Node* root, int val) {
  if (!root) return new Node(val);
  if (val < root->val)
    root->left = insert(root->left, val);
  else if (val > root->val)
    root->right = insert(root->right, val);
  return root;
}

Node* search(Node* root, int val) {
  if (!root || root->val == val)
    return root;
  if (val < root->val)
    return search(root->left, val);
  return search(root->right, val);
}`}
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
        subtitle: "Binary Search Tree",
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
        subtitle: "Live Stream",
        icon: "terminal",
        extra: (
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTerminalOutput([])}
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
            <div className="flex items-center gap-1.5 mt-1 border-t border-[#3b4354] pt-1">
              <span className="text-blue-500 font-bold">➜</span>
              <input 
                type="text" 
                className="flex-1 bg-[#1c212c] border border-[#3b4354] rounded px-1.5 py-0.5 outline-none text-white font-mono text-[9px] placeholder:text-gray-500 focus:bg-[#282e39] focus:border-primary/50 transition-colors"
                placeholder="Enter command (e.g., 'insert 10', 'search 5')..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    const val = input.value;
                    if (val) {
                      const parts = val.trim().split(/\s+/);
                      const cmd = parts[0].toLowerCase();
                      if (cmd === 'insert' && parts[1]) {
                        setInputValue(parts[1]);
                        setTimeout(handleInsert, 0);
                      } else if (cmd === 'search' && parts[1]) {
                        setInputValue(parts[1]);
                        setTimeout(handleSearch, 0);
                      } else {
                        logTerminal(`> Command not found: ${cmd}`);
                      }
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
                    {i === 0 && <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 text-[10px]">arrow_back</span>}
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
                  {/* Since BST doesn't have a formal variables state yet, we'll just show the input value as a mock variable for now to satisfy the layout requirement, or leave it empty if no operation is running */}
                  {isPlaying && inputValue && (
                    <motion.tr 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-primary/10"
                    >
                      <td className="px-2 py-1 text-blue-300 font-medium">val</td>
                      <td className="px-2 py-1 text-white">
                        <motion.span
                          initial={{ scale: 1.2, color: '#60a5fa' }}
                          animate={{ scale: 1, color: '#ffffff' }}
                          transition={{ duration: 0.5 }}
                        >
                          {inputValue}
                        </motion.span>
                      </td>
                      <td className="px-2 py-1 text-[#9da6b9]">int</td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )
      }}
    />
  );
}
