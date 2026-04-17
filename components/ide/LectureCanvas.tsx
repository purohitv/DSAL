'use client';

import React, { useRef, useState, useEffect } from 'react';

interface LectureCanvasProps {
  enabled: boolean;
}

export default function LectureCanvas({ enabled }: LectureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#7f13ec');
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match parent
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
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

    return () => {
      window.removeEventListener('resize', resize);
      resizeObserver.disconnect();
    };
  }, [enabled]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!enabled) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !enabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 z-[100] pointer-events-none">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full pointer-events-auto cursor-crosshair"
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
        <div className="glass-panel p-2 flex flex-col gap-3 rounded-xl border border-white/10 shadow-2xl">
          <div className="flex gap-2">
            {['#7f13ec', '#00f0ff', '#ff0055', '#ffffff'].map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-white/50 text-sm">brush</span>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
          <button 
            onClick={clearCanvas}
            className="flex items-center justify-center gap-2 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-white/5"
          >
            <span className="material-symbols-outlined text-xs">delete</span>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
