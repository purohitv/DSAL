'use client';

import React from 'react';
import TreeVisualizer from './TreeVisualizer';
import QuantumVisualizer from './QuantumVisualizer';
import StackVisualizer from './StackVisualizer';
import LinearVisualizer from './LinearVisualizer';
import LinkedListVisualizer from './LinkedListVisualizer';
import GraphVisualizer from './GraphVisualizer';
import { useSimulationStore } from '@/store/useSimulationStore';

interface VisualizerFactoryProps {
  type: string;
  data: any;
}

export default function VisualizerFactory({ type, data }: VisualizerFactoryProps) {
  const { currentStep } = useSimulationStore();
  
  const visualizerData = {
    ...data,
    step: currentStep,
    title: data.title || type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
    subtitle: data.subtitle || "Simulation Stage"
  };

  switch (type) {
    case 'tree':
      return <TreeVisualizer data={visualizerData} />;
    case 'stack':
      return <StackVisualizer data={visualizerData} />;
    case 'linear':
      return <LinearVisualizer data={visualizerData} />;
    case 'linked-list':
      return <LinkedListVisualizer data={visualizerData} />;
    case 'graph':
      return <GraphVisualizer data={visualizerData} />;
    case 'quantum':
      return <QuantumVisualizer data={visualizerData} />;
    default:
      return <div className="flex items-center justify-center h-full text-text-secondary">Unknown Visualizer Type: {type}</div>;
  }
}
