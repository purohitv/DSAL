// components/ide/LectureCanvas.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LectureCanvasProps {
  enabled: boolean;
  onSave?: (imageData: string) => void;
  onClear?: () => void;
  defaultColor?: string;
  defaultBrushSize?: number;
  penEnabled?: boolean;
  highlighterEnabled?: boolean;
}

interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

export default function LectureCanvas({ 
  enabled, 
  onSave, 
  onClear,
  defaultColor = '#7f13ec',
  defaultBrushSize = 3,
  penEnabled = true,
  highlighterEnabled = true
}: LectureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [color, setColor] = useState(defaultColor);
  const [brushSize, setBrushSize] = useState(defaultBrushSize);
  const [opacity, setOpacity] = useState(1);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const lastPointRef = useRef<DrawingPoint | null>(null);

  // Tool configurations
  const tools = useMemo(() => ({
    pen: {
      icon: 'brush',
      label: 'Pen',
      color: color,
      width: brushSize,
      opacity: 1,
      blendMode: 'source-over' as GlobalCompositeOperation
    },
    highlighter: {
      icon: 'highlight',
      label: 'Highlighter',
      color: color,
      width: brushSize * 2,
      opacity: 0.4,
      blendMode: 'multiply' as GlobalCompositeOperation
    },
    eraser: {
      icon: 'eraser',
      label: 'Eraser',
      color: '#000000',
      width: brushSize * 1.5,
      opacity: 1,
      blendMode: 'destination-out' as GlobalCompositeOperation
    }
  }), [color, brushSize]);

  // Save canvas state to history
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo last action
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadImageToCanvas(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Redo last action
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadImageToCanvas(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Load image to canvas
  const loadImageToCanvas = useCallback((imageData: string) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageData;
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    contextRef.current = ctx;

    // Set canvas size to match parent with device pixel ratio for sharpness
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Restore saved drawing if exists
        if (history[historyIndex]) {
          loadImageToCanvas(history[historyIndex]);
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    resize();
    window.addEventListener('resize', resize);
    
    // Save initial empty state
    saveToHistory();

    return () => {
      window.removeEventListener('resize', resize);
      resizeObserver.disconnect();
    };
  }, [enabled, history, historyIndex, loadImageToCanvas, saveToHistory]);

  // Update drawing context when tool changes
  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx) return;
    
    const tool = tools[activeTool];
    ctx.globalCompositeOperation = tool.blendMode;
    ctx.strokeStyle = tool.color;
    ctx.lineWidth = tool.width;
    ctx.globalAlpha = tool.opacity;
  }, [activeTool, tools]);

  // Get canvas coordinates from event
  const getCanvasCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): DrawingPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return {
      x,
      y,
      timestamp: Date.now()
    };
  }, []);

  // Smooth drawing between points
  const drawSmoothLine = useCallback((from: DrawingPoint, to: DrawingPoint) => {
    const ctx = contextRef.current;
    if (!ctx) return;
    
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(Math.ceil(distance / 2), 1);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!enabled) return;
    e.preventDefault();
    
    const point = getCanvasCoordinates(e);
    if (!point) return;
    
    setIsDrawing(true);
    lastPointRef.current = point;
    
    const ctx = contextRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      
      // Draw a dot for single clicks
      ctx.lineTo(point.x + 0.5, point.y + 0.5);
      ctx.stroke();
    }
  }, [enabled, getCanvasCoordinates]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !enabled) return;
    e.preventDefault();
    
    const point = getCanvasCoordinates(e);
    if (!point || !lastPointRef.current) return;
    
    const ctx = contextRef.current;
    if (!ctx) return;
    
    // Draw line between last point and current point
    drawSmoothLine(lastPointRef.current, point);
    lastPointRef.current = point;
  }, [isDrawing, enabled, getCanvasCoordinates, drawSmoothLine]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPointRef.current = null;
      saveToHistory();
    }
  }, [isDrawing, saveToHistory]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
      onClear?.();
    }
  }, [saveToHistory, onClear]);

  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas && onSave) {
      const imageData = canvas.toDataURL('image/png');
      onSave(imageData);
    }
  }, [onSave]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `lecture-notes-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  }, []);

  // Handle panning (middle mouse button or shift + drag)
  const startPan = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.shiftKey && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const pan = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    
    const newOffset = {
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    };
    setPanOffset(newOffset);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transform = `translate(${newOffset.x}px, ${newOffset.y}px)`;
    }
  }, [isPanning, panStart]);

  const stopPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 z-[100] overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out'
        }}
      />
      
      {/* Controls */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto z-10"
        >
          <div className="glass-panel p-2 flex flex-col gap-3 rounded-xl border border-white/10 shadow-2xl bg-surface-darker/90 backdrop-blur-md">
            {/* Tool selection */}
            <div className="flex gap-1">
              {penEnabled && (
                <ToolButton
                  active={activeTool === 'pen'}
                  icon={tools.pen.icon}
                  label="Pen"
                  onClick={() => setActiveTool('pen')}
                />
              )}
              {highlighterEnabled && (
                <ToolButton
                  active={activeTool === 'highlighter'}
                  icon={tools.highlighter.icon}
                  label="Highlighter"
                  onClick={() => setActiveTool('highlighter')}
                />
              )}
              <ToolButton
                active={activeTool === 'eraser'}
                icon={tools.eraser.icon}
                label="Eraser"
                onClick={() => setActiveTool('eraser')}
              />
            </div>

            <div className="h-px bg-white/10" />

            {/* Color palette */}
            <div className="flex gap-2">
              {['#7f13ec', '#00f0ff', '#ff0055', '#ffffff', '#00ff88', '#ffaa00'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    color === c ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  title={`Color ${c}`}
                />
              ))}
            </div>

            {/* Brush size control */}
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white/50 text-sm">brush</span>
              <input 
                type="range" 
                min="1" 
                max={activeTool === 'highlighter' ? 30 : 20} 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, ${color} ${(brushSize / (activeTool === 'highlighter' ? 30 : 20)) * 100}%, rgba(255,255,255,0.1) ${(brushSize / (activeTool === 'highlighter' ? 30 : 20)) * 100}%)`
                }}
              />
              <span className="text-[10px] text-white/50 font-mono">{brushSize}px</span>
            </div>

            {/* Opacity control for highlighter */}
            {activeTool === 'highlighter' && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/50 text-sm">opacity</span>
                <input 
                  type="range" 
                  min="0.1" 
                  max="0.8" 
                  step="0.05"
                  value={opacity} 
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-white/50 font-mono">{Math.round(opacity * 100)}%</span>
              </div>
            )}

            <div className="h-px bg-white/10" />

            {/* Action buttons */}
            <div className="flex gap-2">
              <ActionButton
                icon="undo"
                label="Undo"
                onClick={undo}
                disabled={historyIndex <= 0}
              />
              <ActionButton
                icon="redo"
                label="Redo"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              />
              <ActionButton
                icon="delete"
                label="Clear"
                onClick={clearCanvas}
                variant="danger"
              />
            </div>

            <div className="flex gap-2">
              <ActionButton
                icon="download"
                label="Download"
                onClick={downloadCanvas}
                variant="success"
              />
              {onSave && (
                <ActionButton
                  icon="save"
                  label="Save"
                  onClick={saveCanvas}
                  variant="primary"
                />
              )}
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="glass-panel px-2 py-1 rounded-lg border border-white/10 bg-surface-darker/80 backdrop-blur-md text-[8px] text-text-secondary">
            <div className="flex gap-3">
              <span>🎨 {activeTool}</span>
              <span>⌘+Z Undo</span>
              <span>⌘+Y Redo</span>
              <span>Shift+Drag Pan</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Keyboard shortcuts */}
      <div className="hidden">
        <button onClick={undo} data-shortcut="undo" />
        <button onClick={redo} data-shortcut="redo" />
      </div>
    </div>
  );
}

// Sub-components
function ToolButton({ 
  active, 
  icon, 
  label, 
  onClick 
}: { 
  active: boolean; 
  icon: string; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-all ${
        active 
          ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(127,19,236,0.3)]' 
          : 'text-text-secondary hover:text-white hover:bg-white/10'
      }`}
      title={label}
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
    </motion.button>
  );
}

function ActionButton({ 
  icon, 
  label, 
  onClick, 
  disabled = false,
  variant = 'default'
}: { 
  icon: string; 
  label: string; 
  onClick: () => void; 
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success' | 'primary';
}) {
  const variants = {
    default: 'text-text-secondary hover:text-white hover:bg-white/10',
    danger: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
    success: 'text-green-400 hover:text-green-300 hover:bg-green-500/10',
    primary: 'text-primary hover:text-primary-light hover:bg-primary/10'
  };
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
        variants[variant]
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      title={label}
    >
      <span className="material-symbols-outlined text-xs">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">
        {label}
      </span>
    </motion.button>
  );
}
