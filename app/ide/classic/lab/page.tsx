"use client";

import React, { useRef, useEffect } from "react";
import IDELayout from "@/components/ide/Layout";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { useSimulationStore } from "@/store/useSimulationStore";

export default function ClassicIDE() {
  const { setUserCode, setPlaygroundLanguage } = useSimulationStore();
  const code = `void push(int value) {
  // Check overflow
  if (top >= capacity - 1)
    return;
  data[++top] = value;
  cout << "Pushed " << value;
}`;

  useEffect(() => {
    setUserCode(code);
    setPlaygroundLanguage("cpp");
  }, [setUserCode, setPlaygroundLanguage, code]);

  return (
    <IDELayout
      title="Stack"
      category="Linear"
      operations={[
        { name: 'Push', onClick: () => {} },
        { name: 'Pop', onClick: () => {} },
        { name: 'User Input', onClick: () => {} },
        { name: 'All', onClick: () => {} },
      ]}
      showTimeline={true}
      currentStep={5}
      totalSteps={12}
      activeStep="Push Operation"
      leftPanel={{
        title: "Source View",
        subtitle: "stack.cpp",
        icon: "code",
        content: (
          <div className="flex-1 overflow-hidden bg-[#0d1117] h-full">
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
                lineNumbers: (num: number) => String(num + 10),
                glyphMargin: false,
                folding: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                padding: { top: 8, bottom: 8 },
                renderLineHighlight: 'none',
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
            <div className="flex items-end gap-8 relative z-10">
              <div className="flex relative pr-12">
                <div className="flex flex-col-reverse justify-start mr-2 gap-1 pb-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={`h-8 flex items-center justify-end text-[9px] font-mono ${i === 4 ? 'text-white font-bold' : 'text-gray-500'}`}>{i}</div>
                  ))}
                </div>
                <div className="flex flex-col-reverse gap-1 bg-[#282e39] p-1.5 rounded-lg border border-[#3b4354] shadow-2xl">
                  {[10, 15, 7, 20, 42].map((val, i) => (
                    <div key={i} className={`w-16 h-8 border rounded flex items-center justify-center font-mono text-xs shadow-sm ${val === 42 ? 'bg-primary text-white border-white/20 font-bold shadow-[0_0_10px_rgba(127,19,236,0.5)] transform scale-105' : 'bg-[#1c212c] text-white border-[#3b4354]'}`}>{val}</div>
                  ))}
                  <div className="w-16 h-8 border-2 border-dashed border-gray-700 rounded flex items-center justify-center text-gray-700 font-mono text-[9px]">null</div>
                  <div className="w-16 h-8 border-2 border-dashed border-gray-700/50 rounded flex items-center justify-center text-gray-700/50 font-mono text-[9px]">null</div>
                </div>
                <div className="absolute right-0 bottom-0 h-full w-8 pointer-events-none">
                  <div className="absolute bottom-[148px] -right-2 flex items-center transition-all duration-300 animate-pulse">
                    <span className="material-symbols-outlined text-primary rotate-180" style={{ fontSize: "16px" }}>arrow_right_alt</span>
                    <span className="ml-1 bg-primary text-white text-[8px] font-bold px-1 py-0.5 rounded shadow-lg uppercase tracking-wider">Top</span>
                  </div>
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
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1 font-mono text-[9px] bg-[#0d1117] h-full">
            <div className="flex gap-1.5 opacity-60">
              <span className="text-blue-500">➜</span>
              <span className="text-gray-300">Initializing stack with capacity 10...</span>
            </div>
            <div className="flex gap-1.5 opacity-60">
              <span className="text-green-500">✔</span>
              <span className="text-gray-300">Stack created successfully.</span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-blue-500 font-bold">➜</span>
              <span className="text-white">Pushing <span className="text-primary font-bold">42</span> onto stack. Index updated to <span className="text-primary font-bold">4</span>.</span>
              <span className="animate-pulse inline-block w-1.5 h-3 bg-gray-500 ml-1 align-middle"></span>
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
            <div className="group flex items-center justify-between p-1.5 bg-[#282e39] border-l-2 border-primary rounded-r shadow-sm cursor-pointer hover:bg-[#323945] transition-colors">
              <div className="flex flex-col">
                <span className="text-white font-mono text-[10px] font-medium">push(42)</span>
                <span className="text-[9px] text-[#9da6b9]">Line 15: stack.cpp</span>
              </div>
              <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 text-[10px]">arrow_back</span>
            </div>
            <div className="flex items-center justify-between p-1.5 border border-transparent rounded hover:bg-[#282e39]/50 opacity-60 transition-colors">
              <div className="flex flex-col">
                <span className="text-gray-300 font-mono text-[10px]">main()</span>
                <span className="text-[9px] text-gray-400">Line 22: stack.cpp</span>
              </div>
            </div>
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
                <tr className="bg-primary/10">
                  <td className="px-2 py-1 text-blue-300 font-medium">top</td>
                  <td className="px-2 py-1 text-white">4</td>
                  <td className="px-2 py-1 text-[#9da6b9]">int</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 text-purple-300">value</td>
                  <td className="px-2 py-1 text-white">42</td>
                  <td className="px-2 py-1 text-[#9da6b9]">int</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      }}
    />
  );
}
