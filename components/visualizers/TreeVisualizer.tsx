'use client';

import React from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import VisualizerContainer from './VisualizerContainer';

interface TreeVisualizerProps {
  data: {
    nodes: any[];
    edges: any[];
    activeNodeId?: string | null;
    pathNodeIds?: string[];
    showGrid?: boolean;
    showLabels?: boolean;
    title?: string;
    subtitle?: string;
    step?: number;
  };
}

export default function TreeVisualizer({ data }: TreeVisualizerProps) {
  const { nodes: rawNodes, edges: rawEdges, activeNodeId, pathNodeIds = [], showGrid = true, showLabels = true, title, subtitle, step } = data;

  // Transform raw nodes to React Flow nodes with our styling
  const nodes: Node[] = rawNodes.map((node: any) => {
    // Determine base colors based on state or custom color
    let bg = "#1e293b";
    let border = "2px solid #475569";
    
    if (activeNodeId === node.id) {
      bg = "#3b82f6";
      border = "2px solid #60a5fa";
    } else if (pathNodeIds.includes(node.id)) {
      bg = "#10b981";
      border = "2px solid #34d399";
    } else if (node.color) {
      // Support custom colors (e.g., for Red-Black Trees)
      bg = node.color === 'red' || node.color === 'RED' ? '#ef4444' : 
           node.color === 'black' || node.color === 'BLACK' ? '#111827' : node.color;
      border = `2px solid ${node.color === 'red' || node.color === 'RED' ? '#f87171' : '#374151'}`;
    }

    return {
      id: node.id,
      position: node.position || { x: 0, y: 0 },
      data: { label: showLabels ? (node.value?.toString() || node.label) : "" },
      style: {
        background: bg,
        color: "#fff",
        border: border,
        borderRadius: "50%",
        width: 50,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        boxShadow: activeNodeId === node.id ? "0 0 15px rgba(59, 130, 246, 0.5)" : "none",
        ...node.style // Allow overriding with custom styles
      },
    };
  });

  const edges: Edge[] = rawEdges.map((edge: any) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: pathNodeIds.includes(edge.source) && pathNodeIds.includes(edge.target),
    style: { 
      stroke: (pathNodeIds.includes(edge.source) && pathNodeIds.includes(edge.target)) ? "#10b981" : "#475569", 
      strokeWidth: 2 
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: (pathNodeIds.includes(edge.source) && pathNodeIds.includes(edge.target)) ? "#10b981" : "#475569",
    },
  }));

  return (
    <VisualizerContainer title={title} subtitle={subtitle} showGrid={showGrid} step={step} disableZoom={true}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls className="bg-[#1c212c] border border-[#3b4354] fill-white rounded overflow-hidden shadow-lg" />
      </ReactFlow>
    </VisualizerContainer>
  );
}
