'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { AuthButton } from '@/components/AuthButton';
import { useRouter } from 'next/navigation';

interface SnippetClientProps {
  snippet: any;
  currentUser: any;
}

export default function SnippetClient({ snippet, currentUser }: SnippetClientProps) {
  const editorRef = useRef<any>(null);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [linkCopyStatus, setLinkCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopyStatus('copied');
    setTimeout(() => setLinkCopyStatus('idle'), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/snippets/${snippet.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        router.push('/library');
        router.refresh();
      } else {
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting snippet:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isOwner = currentUser?.email && currentUser.email === snippet.user?.email || currentUser?.id === snippet.user?.id;

  return (
    <div className="flex h-screen w-full bg-background-dark text-white overflow-hidden selection:bg-primary/30">
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-darker border border-border-dark p-8 rounded-[2rem] max-w-md w-full shadow-3xl"
            >
              <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">Delete Snippet?</h3>
              <p className="text-text-secondary mb-8 leading-relaxed">This action cannot be undone. This snippet will be permanently removed from the registry.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
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
            <span className="material-symbols-outlined text-white font-bold text-2xl">code</span>
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-white text-3xl font-black leading-none tracking-tight uppercase italic">DSAL</h1>
            <p className="text-text-secondary text-sm font-bold mt-1 uppercase tracking-widest opacity-50">Snippet</p>
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
            <Link href="/library" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-bold uppercase tracking-widest text-sm">Back to Registry</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <AuthButton />
          </div>
        </header>

        <div className="flex-1 flex flex-col p-8 max-w-7xl mx-auto w-full gap-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-4">{snippet.title}</h2>
              <div className="flex items-center gap-4">
                {snippet.user?.image ? (
                  <img src={snippet.user.image} alt={snippet.user.name || 'User'} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {snippet.user?.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-bold text-white">{snippet.user?.name || 'Anonymous'}</p>
                  <p className="text-sm text-text-secondary">{new Date(snippet.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-surface-dark text-text-secondary font-mono rounded-xl border border-border-dark">
                {snippet.language}
              </span>
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-6 py-3 bg-surface-dark text-white font-bold rounded-xl hover:bg-surface-dark/80 transition-colors border border-border-dark"
              >
                <span className="material-symbols-outlined text-sm">{linkCopyStatus === 'copied' ? 'check' : 'share'}</span>
                {linkCopyStatus === 'copied' ? 'Link Copied' : 'Share Link'}
              </button>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">{copyStatus === 'copied' ? 'check' : 'content_copy'}</span>
                {copyStatus === 'copied' ? 'Copied' : 'Copy Code'}
              </button>
              {isOwner && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 bg-[#0d1117] rounded-3xl border border-border-dark overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-12 bg-[#161b22] border-b border-border-dark flex items-center px-6 gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              <span className="ml-4 text-xs font-mono text-text-secondary">{snippet.title}.{snippet.language === 'javascript' ? 'js' : snippet.language === 'python' ? 'py' : snippet.language === 'cpp' ? 'cpp' : 'txt'}</span>
            </div>
            <div className="pt-12 h-full">
              <Editor
                height="100%"
                defaultLanguage={snippet.language}
                theme="vs-dark"
                value={snippet.code}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  readOnly: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
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
