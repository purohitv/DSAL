'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useRouter } from 'next/navigation';
import { AuthButton } from '@/components/AuthButton';

export default function NewSnippetClient() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Start coding here...');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<any>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, code, language }),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/snippets/${data.id}`);
        router.refresh();
      } else {
        alert('Failed to save snippet');
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error saving snippet:', error);
      alert('An error occurred');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background-dark text-white overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -64, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-64 bg-surface-darker border-r border-border-dark flex flex-col h-full shrink-0 z-20"
      >
        <div className="p-8 flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl shadow-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-white font-bold text-2xl">add_box</span>
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-white text-3xl font-black leading-none tracking-tight uppercase italic">DSAL</h1>
            <p className="text-text-secondary text-sm font-bold mt-1 uppercase tracking-widest opacity-50">New Snippet</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 scrollbar-hide">
          <div className="mb-8">
            <p className="px-4 text-sm font-black text-primary uppercase tracking-[0.3em] mb-5 opacity-50">Navigation</p>
            <Link className="flex items-center gap-5 px-6 py-6 rounded-xl text-text-secondary hover:bg-surface-dark hover:text-white hover:translate-x-1 transition-all group" href="/">
              <span className="material-symbols-outlined text-[32px] group-hover:text-primary transition-colors">dashboard</span>
              <span className="text-2xl font-bold tracking-tight">Command Center</span>
            </Link>
            <Link className="flex items-center gap-5 px-6 py-6 rounded-xl text-text-secondary hover:bg-surface-dark hover:text-white hover:translate-x-1 transition-all group" href="/library">
              <span className="material-symbols-outlined text-[32px] group-hover:text-primary transition-colors">database</span>
              <span className="text-2xl font-bold tracking-tight">Algorithm Registry</span>
            </Link>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-dark to-background-dark"
      >
        <header className="flex items-center justify-between px-12 py-10 bg-background-dark/80 backdrop-blur-xl border-b border-border-dark sticky top-0 z-30">
          <div className="flex items-center gap-8 flex-1">
            <Link href="/library?tab=snippets" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-bold uppercase tracking-widest text-sm">Cancel</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <AuthButton />
          </div>
        </header>

        <div className="flex-1 flex flex-col p-8 max-w-7xl mx-auto w-full gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Snippet Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Binary Search Implementation"
                className="bg-black/40 border border-border-dark rounded-2xl px-8 py-6 text-2xl text-white focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all w-full font-black uppercase tracking-tight"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isSaving}
                className="px-12 py-6 bg-primary text-white font-black text-lg uppercase tracking-widest rounded-2xl shadow-2xl border-b-4 border-r-4 border-black/20 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Publish Snippet'}
              </motion.button>
            </div>
          </div>

          <div className="flex-1 bg-[#0d1117] rounded-3xl border border-border-dark overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-12 bg-[#161b22] border-b border-border-dark flex items-center px-6 gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              <span className="ml-4 text-xs font-mono text-text-secondary">editor.js</span>
            </div>
            <div className="pt-12 h-full">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  automaticLayout: true,
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
