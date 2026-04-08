"use client";

import React, { useState, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
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

// --- AVL Tree Logic ---
class AVLNode {
  value: number;
  left: AVLNode | null = null;
  right: AVLNode | null = null;
  height: number = 1;
  id: string;

  constructor(value: number) {
    this.value = value;
    this.id = `node-${value}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

class AVLTree {
  root: AVLNode | null = null;

  getHeight(node: AVLNode | null): number {
    if (!node) return 0;
    return node.height;
  }

  getBalance(node: AVLNode | null): number {
    if (!node) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  rightRotate(y: AVLNode): AVLNode {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

    return x;
  }

  leftRotate(x: AVLNode): AVLNode {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

    return y;
  }

  insertNode(node: AVLNode | null, value: number, path: AVLNode[]): AVLNode {
    if (!node) {
      const newNode = new AVLNode(value);
      path.push(newNode);
      return newNode;
    }

    path.push(node);

    if (value < node.value) {
      node.left = this.insertNode(node.left, value, path);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value, path);
    } else {
      return node; // Duplicate values not allowed
    }

    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

    const balance = this.getBalance(node);

    // Left Left Case
    if (balance > 1 && value < node.left!.value) {
      return this.rightRotate(node);
    }

    // Right Right Case
    if (balance < -1 && value > node.right!.value) {
      return this.leftRotate(node);
    }

    // Left Right Case
    if (balance > 1 && value > node.left!.value) {
      node.left = this.leftRotate(node.left!);
      return this.rightRotate(node);
    }

    // Right Left Case
    if (balance < -1 && value < node.right!.value) {
      node.right = this.rightRotate(node.right!);
      return this.leftRotate(node);
    }

    return node;
  }

  insert(value: number): { path: AVLNode[]; root: AVLNode | null } {
    const path: AVLNode[] = [];
    this.root = this.insertNode(this.root, value, path);
    return { path, root: this.root };
  }

  getMinValueNode(node: AVLNode): AVLNode {
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current;
  }

  deleteNode(root: AVLNode | null, value: number, path: AVLNode[]): AVLNode | null {
    if (!root) return root;

    path.push(root);

    if (value < root.value) {
      root.left = this.deleteNode(root.left, value, path);
    } else if (value > root.value) {
      root.right = this.deleteNode(root.right, value, path);
    } else {
      if (!root.left || !root.right) {
        const temp = root.left ? root.left : root.right;
        if (!temp) {
          root = null;
        } else {
          root = temp;
        }
      } else {
        const temp = this.getMinValueNode(root.right);
        root.value = temp.value;
        root.right = this.deleteNode(root.right, temp.value, path);
      }
    }

    if (!root) return root;

    root.height = Math.max(this.getHeight(root.left), this.getHeight(root.right)) + 1;
    const balance = this.getBalance(root);

    if (balance > 1 && this.getBalance(root.left) >= 0) {
      return this.rightRotate(root);
    }
    if (balance > 1 && this.getBalance(root.left) < 0) {
      root.left = this.leftRotate(root.left!);
      return this.rightRotate(root);
    }
    if (balance < -1 && this.getBalance(root.right) <= 0) {
      return this.leftRotate(root);
    }
    if (balance < -1 && this.getBalance(root.right) > 0) {
      root.right = this.rightRotate(root.right!);
      return this.leftRotate(root);
    }

    return root;
  }

  delete(value: number): { path: AVLNode[]; root: AVLNode | null } {
    const path: AVLNode[] = [];
    this.root = this.deleteNode(this.root, value, path);
    return { path, root: this.root };
  }
}

// --- Helper to convert AVL to React Flow Nodes/Edges ---
const generateFlowElements = (
  root: AVLNode | null,
  activeNodeId: string | null = null,
  pathNodeIds: string[] = []
) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!root) return { nodes, edges };

  const traverse = (
    node: AVLNode,
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
        background: isActive ? "#818cf8" : isPath ? "#10b981" : "#1e293b",
        color: "#fff",
        border: isActive ? "2px solid #a5b4fc" : isPath ? "2px solid #34d399" : "2px solid #475569",
        borderRadius: "50%",
        width: 50,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        boxShadow: isActive ? "0 0 15px rgba(129, 140, 248, 0.5)" : "none",
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
import { Plus, RefreshCw, Minus, Search, Terminal, Layers } from 'lucide-react';

export default function AVLVisualization() {
  const [avl] = useState(() => new AVLTree());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "> AVL Tree Initialized. Ready for operations.",
  ]);
  const [callStack, setCallStack] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();

  useEffect(() => {
    setUserCode(`struct Node {
  int data;
  int height;
  Node *left, *right;
  Node(int data) : data(data), height(1), left(NULL), right(NULL) {}
};

class AVLTree {
  Node *root;
  int height(Node *N);
  int getBalance(Node *N);
  Node *rightRotate(Node *y);
  Node *leftRotate(Node *x);
  Node *insert(Node *node, int key);
public:
  AVLTree() { root = NULL; }
  void insert(int key) { root = insert(root, key); }
};`);
    setPlaygroundLanguage("cpp");
  }, [setUserCode, setPlaygroundLanguage]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const updateFlow = (activeId: string | null, pathIds: string[]) => {
    const { nodes: newNodes, edges: newEdges } = generateFlowElements(
      avl.root,
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
    setNodes([]);
    setEdges([]);
    setTerminalOutput(['> AVL Tree Reset. Ready for operations.']);
    setCallStack([]);
    setInputValue('');
  };

  const handleSearch = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue("");
    setIsPlaying(true);

    logTerminal(`> Searching for value: ${val}`);
    
    let current = avl.root;
    const currentPathIds: string[] = [];
    let found = false;

    while (current) {
      currentPathIds.push(current.id);
      updateFlow(current.id, currentPathIds);
      logTerminal(`> Visiting node ${current.value}...`);
      await new Promise((r) => setTimeout(r, 800));

      if (val === current.value) {
        found = true;
        logTerminal(`> Found value ${val}!`);
        break;
      } else if (val < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    if (!found) {
      logTerminal(`> Value ${val} not found in the tree.`);
    }

    updateFlow(null, []);
    setIsPlaying(false);
  };

  const handleDelete = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue("");
    setIsPlaying(true);

    logTerminal(`> Starting deletion for value: ${val}`);
    const { path } = avl.delete(val);

    const currentPathIds: string[] = [];
    setCallStack(["delete(root, " + val + ")"]);

    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      currentPathIds.push(node.id);
      updateFlow(node.id, currentPathIds);
      
      if (i === path.length - 1) {
        logTerminal(`> Deleted ${val} (if existed). Checking balance...`);
      } else {
        logTerminal(`> Visiting node ${node.value}...`);
      }
      
      await new Promise((r) => setTimeout(r, 800));
    }

    logTerminal(`> Tree rebalanced if necessary.`);
    updateFlow(null, []);
    setCallStack([]);
    setIsPlaying(false);
  };

  const handleInsert = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue("");
    setIsPlaying(true);

    logTerminal(`> Starting insertion for value: ${val}`);
    const { path } = avl.insert(val);

    const currentPathIds: string[] = [];
    setCallStack(["insert(root, " + val + ")"]);

    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      currentPathIds.push(node.id);
      updateFlow(node.id, currentPathIds);
      
      if (i === path.length - 1) {
        logTerminal(`> Inserted ${val}. Checking balance...`);
      } else {
        logTerminal(`> Visiting node ${node.value}...`);
      }
      
      await new Promise((r) => setTimeout(r, 800));
    }

    logTerminal(`> Tree rebalanced if necessary.`);
    updateFlow(null, []);
    setCallStack([]);
    setIsPlaying(false);
  };

  useEffect(() => {
    avl.insert(30);
    avl.insert(20);
    avl.insert(40);
    avl.insert(10);
    avl.insert(25);
    updateFlow(null, []);
  }, []);

  const avlControls = (
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Value..."
        className="bg-panel-lighter border-2 border-border-dark rounded-lg px-4 py-2 text-base focus:outline-none focus:border-indigo-400 w-32 text-white font-bold"
        disabled={isPlaying}
      />
      <button
        onClick={handleInsert}
        disabled={isPlaying || !inputValue}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-black uppercase tracking-widest transition-all shadow-[0_4px_0_rgb(79,70,229)] active:translate-y-[2px] active:shadow-none border border-white/10"
      >
        Insert
      </button>
    </div>
  );

  return (
    <IDELayout
      title="AVL Tree"
      category="Intermediate"
      operations={[
        { name: 'Insert', onClick: handleInsert, icon: <Plus size={14} /> },
        { name: 'Delete', onClick: handleDelete, icon: <Minus size={14} /> },
        { name: 'Search', onClick: handleSearch, icon: <Search size={14} /> },
        { name: 'Reset', onClick: handleReset, icon: <RefreshCw size={14} /> },
      ]}
      showTimeline={false}
      leftPanel={{
        title: "Source View",
        subtitle: "avl.cpp",
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={`Node* insert(Node* node, int key) {
  if (node == NULL)
    return(newNode(key));

  if (key < node->key)
    node->left = insert(node->left, key);
  else if (key > node->key)
    node->right = insert(node->right, key);
  else
    return node;

  node->height = 1 + max(height(node->left),
                         height(node->right));

  int balance = getBalance(node);

  // Left Left Case
  if (balance > 1 && key < node->left->key)
    return rightRotate(node);

  // Right Right Case
  if (balance < -1 && key > node->right->key)
    return leftRotate(node);

  // Left Right Case
  if (balance > 1 && key > node->left->key) {
    node->left = leftRotate(node->left);
    return rightRotate(node);
  }

  // Right Left Case
  if (balance < -1 && key < node->right->key) {
    node->right = rightRotate(node->right);
    return leftRotate(node);
  }

  return node;
}`}
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
                    {i === 0 && <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 text-[10px]">arrow_back</span>}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )
      }}
      rightPanelBottom={{
        title: "AVL Properties",
        subtitle: "Invariants",
        icon: "info",
        content: (
          <div className="flex-1 p-2 overflow-y-auto text-[10px] text-slate-300 space-y-2 bg-[#1c212c] h-full">
            {[
              "Self-balancing binary search tree.",
              "Height difference (balance factor) between left and right subtrees is at most 1.",
              "Search, insert, and delete take O(log n) time.",
              "Rebalancing is done via rotations (Left, Right, Left-Right, Right-Left)."
            ].map((prop, i) => (
              <div key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-[#282e39] border border-[#3b4354]">
                <span className="material-symbols-outlined text-green-500 text-[12px] mt-0.5">check_circle</span>
                <p className="leading-tight">{prop}</p>
              </div>
            ))}
          </div>
        )
      }}
    />
  );
}
