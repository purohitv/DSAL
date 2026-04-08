"use client";

import React, { useEffect } from "react";
import IDELayout from '@/components/ide/Layout';
import { Editor } from "@monaco-editor/react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Plus, Minus, Search, RefreshCw, Terminal, Layers } from 'lucide-react';

export default function DsalAlgorithmIdeBstVisualization4() {
  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();

  useEffect(() => {
    setUserCode(`struct Node {
  int val;
  Node *left, *right;
  Node(int x) : val(x), left(NULL), right(NULL) {}
};

Node* insert(Node* root, int val) {
  if (!root) return new Node(val);

  if (val < root->val) {
    root->left = insert(root->left, val);
  } else {
    root->right = insert(root->right, val);
  }
  return root;
}`);
    setPlaygroundLanguage("cpp");
  }, [setUserCode, setPlaygroundLanguage]);
  return (
    <IDELayout
      title="Binary Search Tree"
      category="Non-Linear"
      operations={[
        { name: 'Insert', onClick: () => {}, icon: <Plus size={14} /> },
        { name: 'Delete', onClick: () => {}, icon: <Minus size={14} /> },
        { name: 'Search', onClick: () => {}, icon: <Search size={14} /> },
        { name: 'Reset', onClick: () => {}, icon: <RefreshCw size={14} /> },
      ]}
      activeStep="Step 4/12"
      totalSteps={12}
      currentStep={4}
      isPlaying={false}
      leftPanel={{
        title: "Source View",
        subtitle: "bst_insert.cpp",
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={`struct Node {
  int val;
  Node *left, *right;
  Node(int x) : val(x), left(NULL), right(NULL) {}
};

Node* insert(Node* root, int val) {
  if (!root) return new Node(val);

  if (val < root->val) {
    root->left = insert(root->left, val);
  } else {
    root->right = insert(root->right, val);
  }
  return root;
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
          <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full flex items-center justify-center">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(90deg, #3b4354 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
            <div className="relative w-[600px] h-[400px]">
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-600" >
                <line strokeWidth="2" x1="300" x2="200" y1="50" y2="150" />
                <line strokeWidth="2" x1="300" x2="400" y1="50" y2="150" />
              </svg>
              <div className="absolute top-[20px] left-[270px] z-10">
                <div className="w-16 h-16 rounded-full bg-[#1e293b] border-2 border-[#60a5fa] shadow-[0_0_20px_rgba(96,165,250,0.8)] flex items-center justify-center text-white font-bold text-xl relative">
                  10
                </div>
              </div>
              <div className="absolute top-[130px] left-[170px] z-10">
                <div className="w-16 h-16 rounded-full bg-[#1e293b] border-2 border-[#0f172a] flex items-center justify-center text-white font-bold text-xl">
                  5
                </div>
              </div>
              <div className="absolute top-[130px] left-[370px] z-10">
                <div className="w-16 h-16 rounded-full bg-[#1e293b] border-2 border-[#0f172a] flex items-center justify-center text-white font-bold text-xl">
                  20
                </div>
              </div>
              <div className="absolute top-[40px] left-[420px] z-20 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-[#1e293b]/50 border-2 border-dashed border-[#60a5fa] flex items-center justify-center text-[#60a5fa] font-bold text-xl backdrop-blur-sm">
                  15
                </div>
              </div>
            </div>
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
              <div className="flex gap-1.5 text-white font-bold">
                <span className="text-blue-500 font-bold">➜</span>
                <span>[Step 4] Comparing 15 with root (10)... Result: GREATER.</span>
              </div>
              <div className="flex gap-1.5 text-gray-300 opacity-60">
                <span className="text-blue-500 font-bold">➜</span>
                <span>[Step 3] Comparing values...</span>
              </div>
              <div className="flex gap-1.5 text-gray-300 opacity-60">
                <span className="text-blue-500 font-bold">➜</span>
                <span>[Step 2] Root is not null (10).</span>
              </div>
              <div className="flex gap-1.5 text-gray-300 opacity-60">
                <span className="text-blue-500 font-bold">➜</span>
                <span>[Step 1] Initializing insert(15)...</span>
              </div>
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
            <div className="group flex items-center justify-between p-1.5 rounded transition-colors bg-[#282e39] border-l-2 border-primary rounded-r shadow-sm cursor-pointer hover:bg-[#323945]">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-white font-medium">insert(root, 15)</span>
              </div>
              <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 text-[10px]">arrow_back</span>
            </div>
          </div>
        )
      }}
      rightPanelBottom={{
        title: "Variables",
        subtitle: "Live Watch",
        icon: "visibility",
        content: (
          <div className="flex-1 overflow-auto bg-[#1c212c] h-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#161b26] text-[9px] uppercase text-slate-500 font-medium tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-1.5 border-b border-[#3b4354] w-1/3">Name</th>
                  <th className="px-2 py-1.5 border-b border-[#3b4354] w-1/3">Value</th>
                  <th className="px-2 py-1.5 border-b border-[#3b4354] w-1/3 text-right">Type</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px] divide-y divide-[#3b4354]">
                <tr className="hover:bg-[#282e39] transition-colors">
                  <td className="px-2 py-1.5 text-purple-400">this</td>
                  <td className="px-2 py-1.5 text-slate-300">0x55a2b0</td>
                  <td className="px-2 py-1.5 text-right text-slate-500">BST*</td>
                </tr>
                <tr className="hover:bg-[#282e39] transition-colors">
                  <td className="px-2 py-1.5 text-purple-400">root</td>
                  <td className="px-2 py-1.5 text-slate-300">0x7ffee4</td>
                  <td className="px-2 py-1.5 text-right text-slate-500">Node*</td>
                </tr>
                <tr className="hover:bg-[#282e39] transition-colors">
                  <td className="px-2 py-1.5 text-purple-400">val</td>
                  <td className="px-2 py-1.5 text-slate-300">15</td>
                  <td className="px-2 py-1.5 text-right text-slate-500">int</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      }}
    />
  );
}
