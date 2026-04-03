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

interface TreeVisualizerProps {
  data: {
    nodes: any[];
    edges: any[];
    activeNodeId?: string | null;
    pathNodeIds?: string[];
  };
}

export default function TreeVisualizer({ data }: TreeVisualizerProps) {
  const { nodes: rawNodes, edges: rawEdges, activeNodeId, pathNodeIds = [] } = data;

  // Transform raw nodes to React Flow nodes with our styling
  const nodes: Node[] = rawNodes.map((node: any) => ({
    id: node.id,
    position: node.position || { x: 0, y: 0 },
    data: { label: node.value?.toString() || node.label },
    style: {
      background: activeNodeId === node.id ? "#3b82f6" : pathNodeIds.includes(node.id) ? "#10b981" : "#1e293b",
      color: "#fff",
      border: activeNodeId === node.id ? "2px solid #60a5fa" : pathNodeIds.includes(node.id) ? "2px solid #34d399" : "2px solid #475569",
      borderRadius: "50%",
      width: 50,
      height: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      boxShadow: activeNodeId === node.id ? "0 0 15px rgba(59, 130, 246, 0.5)" : "none",
    },
  }));

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
    <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#101622] to-[#0a0d14] h-full">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(90deg, #3b4354 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls className="bg-[#1c212c] border border-[#3b4354] fill-white rounded overflow-hidden shadow-lg" />
      </ReactFlow>
    </div>
  );
}
