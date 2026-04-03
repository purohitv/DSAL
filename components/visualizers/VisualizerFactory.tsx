'use client';

import React from 'react';
import TreeVisualizer from './TreeVisualizer';

interface VisualizerFactoryProps {
  type: string;
  data: any;
}

export default function VisualizerFactory({ type, data }: VisualizerFactoryProps) {
  switch (type) {
    case 'tree':
      return <TreeVisualizer data={data} />;
    case 'stack':
      // return <StackVisualizer data={data} />;
      return <div className="flex items-center justify-center h-full text-text-secondary">Stack Visualizer Coming Soon</div>;
    case 'linear':
      // return <LinearVisualizer data={data} />;
      return <div className="flex items-center justify-center h-full text-text-secondary">Linear Visualizer Coming Soon</div>;
    case 'quantum':
      // return <QuantumVisualizer data={data} />;
      return <div className="flex items-center justify-center h-full text-text-secondary">Quantum Visualizer Coming Soon</div>;
    default:
      return <div className="flex items-center justify-center h-full text-text-secondary">Unknown Visualizer Type: {type}</div>;
  }
}
