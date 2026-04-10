'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import IDELayout from '@/components/ide/Layout';
import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Plus, RefreshCw, Minus, Search, Terminal, Layers } from 'lucide-react';

// --- Red-Black Tree Logic ---
enum Color {
  RED,
  BLACK,
}

class RBTNode {
  value: number;
  color: Color;
  left: RBTNode | null = null;
  right: RBTNode | null = null;
  parent: RBTNode | null = null;
  id: string;

  constructor(value: number) {
    this.value = value;
    this.color = Color.RED; // New nodes are always red
    this.id = `node-${value}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

class RedBlackTree {
  root: RBTNode | null = null;
  steps: { node: RBTNode | null; message: string; activeIds: string[] }[] = [];

  private logStep(message: string, activeNodes: RBTNode[] = []) {
    this.steps.push({
      node: this.root,
      message,
      activeIds: activeNodes.map((n) => n.id),
    });
  }

  private leftRotate(x: RBTNode) {
    const y = x.right;
    if (!y) return;

    this.logStep(`Left Rotate on node ${x.value}`, [x, y]);

    x.right = y.left;
    if (y.left) y.left.parent = x;

    y.parent = x.parent;
    if (!x.parent) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }

    y.left = x;
    x.parent = y;
  }

  private rightRotate(x: RBTNode) {
    const y = x.left;
    if (!y) return;

    this.logStep(`Right Rotate on node ${x.value}`, [x, y]);

    x.left = y.right;
    if (y.right) y.right.parent = x;

    y.parent = x.parent;
    if (!x.parent) {
      this.root = y;
    } else if (x === x.parent.right) {
      x.parent.right = y;
    } else {
      x.parent.left = y;
    }

    y.right = x;
    x.parent = y;
  }

  private fixInsert(k: RBTNode) {
    while (k.parent && k.parent.color === Color.RED) {
      if (k.parent === k.parent.parent?.left) {
        const u = k.parent.parent.right; // uncle
        if (u && u.color === Color.RED) {
          this.logStep(`Uncle ${u.value} is RED. Recolor parent, uncle, and grandparent.`, [k, k.parent, u, k.parent.parent]);
          k.parent.color = Color.BLACK;
          u.color = Color.BLACK;
          k.parent.parent.color = Color.RED;
          k = k.parent.parent;
        } else {
          if (k === k.parent.right) {
            this.logStep(`Node ${k.value} is right child, parent is left child. Left rotate parent.`, [k, k.parent]);
            k = k.parent;
            this.leftRotate(k);
          }
          this.logStep(`Node ${k.value} is left child. Recolor parent and grandparent, then right rotate grandparent.`, [k, k.parent!, k.parent!.parent!]);
          k.parent!.color = Color.BLACK;
          k.parent!.parent!.color = Color.RED;
          this.rightRotate(k.parent!.parent!);
        }
      } else {
        const u = k.parent.parent?.left; // uncle
        if (u && u.color === Color.RED) {
          this.logStep(`Uncle ${u.value} is RED. Recolor parent, uncle, and grandparent.`, [k, k.parent, u, k.parent.parent!]);
          k.parent.color = Color.BLACK;
          u.color = Color.BLACK;
          k.parent.parent!.color = Color.RED;
          k = k.parent.parent!;
        } else {
          if (k === k.parent.left) {
            this.logStep(`Node ${k.value} is left child, parent is right child. Right rotate parent.`, [k, k.parent]);
            k = k.parent;
            this.rightRotate(k);
          }
          this.logStep(`Node ${k.value} is right child. Recolor parent and grandparent, then left rotate grandparent.`, [k, k.parent!, k.parent!.parent!]);
          k.parent!.color = Color.BLACK;
          k.parent!.parent!.color = Color.RED;
          this.leftRotate(k.parent!.parent!);
        }
      }
    }
    if (this.root && this.root.color !== Color.BLACK) {
      this.logStep(`Root must be BLACK. Recoloring root.`, [this.root]);
      this.root.color = Color.BLACK;
    }
  }

  insert(value: number) {
    this.steps = [];
    const node = new RBTNode(value);
    
    let y: RBTNode | null = null;
    let x = this.root;

    while (x !== null) {
      y = x;
      this.logStep(`Comparing ${value} with ${x.value}`, [x]);
      if (node.value < x.value) {
        x = x.left;
      } else if (node.value > x.value) {
        x = x.right;
      } else {
        this.logStep(`Value ${value} already exists in the tree.`);
        return this.steps;
      }
    }

    node.parent = y;
    if (y === null) {
      this.root = node;
    } else if (node.value < y.value) {
      y.left = node;
    } else {
      y.right = node;
    }

    this.logStep(`Inserted ${value} as RED node.`, [node]);

    if (node.parent === null) {
      node.color = Color.BLACK;
      this.logStep(`Root node ${value} colored BLACK.`, [node]);
      return this.steps;
    }

    if (node.parent.parent === null) {
      return this.steps;
    }

    this.fixInsert(node);
    this.logStep(`Insertion of ${value} complete.`);
    return this.steps;
  }

  getMinValueNode(node: RBTNode): RBTNode {
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current;
  }

  delete(value: number) {
    this.steps = [];
    this.logStep(`Deletion in RBT is complex. Performing standard BST delete for demo purposes.`);
    
    let current = this.root;
    while (current && current.value !== value) {
      this.logStep(`Searching for ${value}...`, [current]);
      if (value < current.value) current = current.left;
      else current = current.right;
    }

    if (!current) {
      this.logStep(`Value ${value} not found.`);
      return this.steps;
    }

    this.logStep(`Found ${value}. Deleting...`, [current]);

    if (!current.left && !current.right) {
      if (!current.parent) this.root = null;
      else if (current === current.parent.left) current.parent.left = null;
      else current.parent.right = null;
    } else if (!current.left || !current.right) {
      const child = current.left || current.right;
      if (!current.parent) {
        this.root = child;
        if (this.root) this.root.parent = null;
      } else if (current === current.parent.left) {
        current.parent.left = child;
        if (child) child.parent = current.parent;
      } else {
        current.parent.right = child;
        if (child) child.parent = current.parent;
      }
    } else {
      const successor = this.getMinValueNode(current.right);
      this.logStep(`Replacing with successor ${successor.value}`, [current, successor]);
      const tempVal = successor.value;
      
      if (!successor.left && !successor.right) {
        if (successor === successor.parent?.left) successor.parent.left = null;
        else if (successor.parent) successor.parent.right = null;
      } else if (successor.right) {
        if (successor === successor.parent?.left) {
          successor.parent.left = successor.right;
          successor.right.parent = successor.parent;
        } else if (successor.parent) {
          successor.parent.right = successor.right;
          successor.right.parent = successor.parent;
        }
      }
      
      current.value = tempVal;
    }

    this.logStep(`Deletion complete. (Rebalancing omitted for simplicity)`);
    return this.steps;
  }
}

// --- Helper to convert RBT to React Flow Nodes/Edges ---
const generateFlowElements = (
  root: RBTNode | null,
  activeIds: string[] = []
) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!root) return { nodes, edges };

  const traverse = (
    node: RBTNode,
    x: number,
    y: number,
    level: number,
    parentId: string | null = null
  ) => {
    const isActive = activeIds.includes(node.id);
    const isRed = node.color === Color.RED;

    nodes.push({
      id: node.id,
      position: { x, y },
      data: { label: node.value.toString() },
      style: {
        background: isRed ? '#ef4444' : '#1e293b',
        color: '#fff',
        border: isActive ? '3px solid #60a5fa' : '2px solid #0f172a',
        borderRadius: '50%',
        width: 50,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        boxShadow: isActive ? '0 0 20px rgba(96, 165, 250, 0.8)' : isRed ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none',
        transition: 'all 0.3s ease',
      },
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        animated: isActive,
        style: { stroke: isActive ? '#60a5fa' : '#475569', strokeWidth: isActive ? 3 : 2 },
      });
    }

    const dx = 150 / Math.pow(1.4, level);
    const dy = 80;

    if (node.left) traverse(node.left, x - dx, y + dy, level + 1, node.id);
    if (node.right) traverse(node.right, x + dx, y + dy, level + 1, node.id);
  };

  traverse(root, 0, 0, 0);
  return { nodes, edges };
};

export default function RedBlackTreeVisualization() {
  const [rbt] = useState(() => new RedBlackTree());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '> Red-Black Tree Initialized. Ready for operations.',
  ]);
  const [callStack, setCallStack] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();

  useEffect(() => {
    setUserCode(`enum Color { RED, BLACK };

struct Node {
  int data;
  Color color;
  Node *left, *right, *parent;
  Node(int data) : data(data), color(RED), left(NULL), right(NULL), parent(NULL) {}
};

class RedBlackTree {
private:
  Node *root;
  void leftRotate(Node *x);
  void rightRotate(Node *x);
  void fixInsert(Node *k);
public:
  RedBlackTree() { root = NULL; }
  void insert(int key);
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

  const updateFlow = (root: RBTNode | null, activeIds: string[]) => {
    const { nodes: newNodes, edges: newEdges } = generateFlowElements(root, activeIds);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const logTerminal = (msg: string) => {
    setTerminalOutput((prev) => [...prev, msg]);
  };

  const handleReset = () => {
    const newRbt = new RedBlackTree();
    setNodes([]);
    setEdges([]);
    setTerminalOutput(['> Red-Black Tree Reset. Ready for operations.']);
    setCallStack([]);
    setInputValue('');
  };

  const handleSearch = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');
    setIsPlaying(true);

    logTerminal(`> Searching for value: ${val}`);
    setCallStack([`search(${val})`]);

    let current = rbt.root;
    let found = false;

    while (current) {
      updateFlow(rbt.root, [current.id]);
      logTerminal(`> Visiting node ${current.value}...`);
      await new Promise((r) => setTimeout(r, 1000));

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

    updateFlow(rbt.root, []);
    setCallStack([]);
    setIsPlaying(false);
  };

  const handleDelete = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');
    setIsPlaying(true);

    logTerminal(`> Starting deletion for value: ${val}`);
    setCallStack([`delete(${val})`]);

    const steps = rbt.delete(val);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      updateFlow(step.node, step.activeIds);
      logTerminal(`> ${step.message}`);
      
      await new Promise((r) => setTimeout(r, 1200));
    }

    updateFlow(rbt.root, []);
    setCallStack([]);
    setIsPlaying(false);
  };

  const handleInsert = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');
    setIsPlaying(true);

    logTerminal(`> Starting insertion for value: ${val}`);
    setCallStack([`insert(${val})`]);

    const steps = rbt.insert(val);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      updateFlow(step.node, step.activeIds);
      logTerminal(`> ${step.message}`);
      
      if (step.message.includes('Rotate') || step.message.includes('Recolor')) {
        setCallStack((prev) => [`fixInsert(${val})`, ...prev]);
      }

      await new Promise((r) => setTimeout(r, 1200));
    }

    updateFlow(rbt.root, []);
    setCallStack([]);
    setIsPlaying(false);
  };

  useEffect(() => {
    // Initial tree setup
    const initialValues = [20, 15, 25, 10, 5];
    initialValues.forEach(v => rbt.insert(v));
    updateFlow(rbt.root, []);
  }, []);

  const rbtControls = (
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Value..."
        className="bg-panel-lighter border border-border-dark rounded px-4 py-2 text-base focus:outline-none focus:border-accent-mint w-32"
        disabled={isPlaying}
      />
      <button
        onClick={handleInsert}
        disabled={isPlaying || !inputValue}
        className="px-6 py-2 bg-accent-mint hover:bg-accent-mint/90 text-black disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-bold uppercase tracking-wider transition-colors shadow-neon-sm"
      >
        Insert
      </button>
    </div>
  );

  return (
    <IDELayout
      title="Red-Black Tree"
      category="Intermediate"
      operations={[
        { name: 'Insert', onClick: handleInsert, icon: <Plus size={14} /> },
        { name: 'Delete', onClick: handleDelete, icon: <Minus size={14} /> },
        { name: 'Search', onClick: handleSearch, icon: <Search size={14} /> },
        { name: 'User Input', onClick: () => {}, icon: <Terminal size={14} /> },
        { name: 'All', onClick: () => {}, icon: <Layers size={14} /> },
        { name: 'Reset', onClick: handleReset, icon: <RefreshCw size={14} /> },
      ]}
      showTimeline={false}
      extraControls={rbtControls}
      leftPanel={{
        title: "Source View",
        subtitle: "rbt.cpp",
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={`enum Color { RED, BLACK };

struct Node {
  int data;
  Color color;
  Node *left, *right, *parent;
  Node(int data) : data(data), color(RED), left(NULL), right(NULL), parent(NULL) {}
};

void fixInsert(Node*& root, Node*& pt) {
  Node* parent_pt = NULL;
  Node* grand_parent_pt = NULL;

  while ((pt != root) && (pt->color != BLACK) && (pt->parent->color == RED)) {
    parent_pt = pt->parent;
    grand_parent_pt = pt->parent->parent;

    if (parent_pt == grand_parent_pt->left) {
      Node* uncle_pt = grand_parent_pt->right;
      if (uncle_pt != NULL && uncle_pt->color == RED) {
        grand_parent_pt->color = RED;
        parent_pt->color = BLACK;
        uncle_pt->color = BLACK;
        pt = grand_parent_pt;
      } else {
        if (pt == parent_pt->right) {
          leftRotate(root, parent_pt);
          pt = parent_pt;
          parent_pt = pt->parent;
        }
        rightRotate(root, grand_parent_pt);
        swap(parent_pt->color, grand_parent_pt->color);
        pt = parent_pt;
      }
    } else {
      // Symmetric cases for right child
      Node* uncle_pt = grand_parent_pt->left;
      if ((uncle_pt != NULL) && (uncle_pt->color == RED)) {
        grand_parent_pt->color = RED;
        parent_pt->color = BLACK;
        uncle_pt->color = BLACK;
        pt = grand_parent_pt;
      } else {
        if (pt == parent_pt->left) {
          rightRotate(root, parent_pt);
          pt = parent_pt;
          parent_pt = pt->parent;
        }
        leftRotate(root, grand_parent_pt);
        swap(parent_pt->color, grand_parent_pt->color);
        pt = parent_pt;
      }
    }
  }
  root->color = BLACK;
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
        title: "RBT Properties",
        subtitle: "Invariants",
        icon: "info",
        content: (
          <div className="flex-1 p-2 overflow-y-auto text-[10px] text-slate-300 space-y-2 bg-[#1c212c] h-full">
            {[
              { text: "Every node is either RED or BLACK.", color: "text-red-400" },
              { text: "The root is always BLACK.", color: "text-slate-400" },
              { text: "Every leaf (NIL) is BLACK.", color: "text-slate-400" },
              { text: "If a node is RED, both its children are BLACK.", color: "text-red-400" },
              { text: "Paths from node to descendant leaves have same number of BLACK nodes.", color: "text-slate-400" }
            ].map((prop, i) => (
              <div key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-[#282e39] border border-[#3b4354]">
                <span className="material-symbols-outlined text-green-500 text-[12px] mt-0.5">check_circle</span>
                <p className="leading-tight">
                  {prop.text.split(prop.color === "text-red-400" ? "RED" : "BLACK").map((part, index, array) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < array.length - 1 && <span className={`${prop.color} font-bold`}>{prop.color === "text-red-400" ? "RED" : "BLACK"}</span>}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            ))}
          </div>
        )
      }}
    />
  );
}

