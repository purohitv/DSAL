'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-6 text-center font-display">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-surface-darker/50 border border-red-500/30 rounded-[2.5rem] p-12 shadow-2xl backdrop-blur-xl"
          >
            <div className="size-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <span className="material-symbols-outlined text-4xl text-red-500">error</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4 italic">System Fault Detected</h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-8 font-medium">
              The simulation encountered an unrecoverable state. Our research team has been notified.
            </p>
            <div className="bg-black/40 rounded-xl p-4 mb-8 text-left border border-white/5">
              <p className="text-[10px] font-mono text-red-400/70 uppercase tracking-widest mb-2">Error Trace:</p>
              <p className="text-[11px] font-mono text-red-400 break-all leading-tight">
                {this.state.error?.message || 'Unknown simulation error'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              Reboot Terminal
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
