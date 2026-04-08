'use client';

import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion, AnimatePresence } from 'framer-motion';

interface VisualizerContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showGrid?: boolean;
  step?: number;
  disableZoom?: boolean;
}

export default function VisualizerContainer({ 
  children, 
  title, 
  subtitle, 
  showGrid = true,
  step = 0,
  disableZoom = false
}: VisualizerContainerProps) {
  const content = (
    <div className="w-full h-full flex items-center justify-center p-12">
      {children}
    </div>
  );

  return (
    <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full flex flex-col">
      {/* Step Flash Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-primary/5 pointer-events-none z-10"
        />
      </AnimatePresence>

      {/* Background Grid */}
      {showGrid && (
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(90deg, #3b4354 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      )}

      {/* Header Overlay */}
      {(title || subtitle) && (
        <div className="absolute top-4 left-4 z-20 flex flex-col pointer-events-none">
          {title && <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] drop-shadow-lg">{title}</h3>}
          {subtitle && <span className="text-primary text-[9px] font-bold uppercase tracking-widest opacity-80">{subtitle}</span>}
        </div>
      )}

      {/* Zoom/Pan Wrapper */}
      {disableZoom ? (
        <div className="w-full h-full flex items-center justify-center">
          {children}
        </div>
      ) : (
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={10}
          centerOnInit
          wheel={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
        >
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {content}
          </TransformComponent>
        </TransformWrapper>
      )}

      {/* Controls Overlay (Bottom Right) */}
      {!disableZoom && (
        <div className="absolute bottom-4 right-4 z-20 flex gap-2 pointer-events-auto">
          <div className="px-2 py-1 rounded-lg bg-surface-darker/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-text-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">mouse</span>
            <span>Scroll to Zoom • Drag to Pan</span>
          </div>
        </div>
      )}
    </div>
  );
}
