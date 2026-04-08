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

interface GraphVisualizerProps {
  data: {
    nodes?: any[];
    edges?: any[];
    activeNodeId?: string | number | null;
    pathNodeIds?: (string | number)[];
    showGrid?: boolean;
    showLabels?: boolean;
    directed?: boolean;
    weighted?: boolean;
    title?: string;
    subtitle?: string;
    step?: number;
  };
}

export default function GraphVisualizer({ data }: GraphVisualizerProps) {
  const { 
    nodes: rawNodes = [], 
    edges: rawEdges = [], 
    activeNodeId = null, 
    pathNodeIds = [], 
    showGrid = true, 
    showLabels = true,
    directed = true,
    weighted = false,
    title,
    subtitle,
    step
  } = data;

  // Transform raw nodes to React Flow nodes with our styling
  const nodes: Node[] = rawNodes.map((node: any) => {
    const isActive = activeNodeId === node.id;
    const isInPath = pathNodeIds.includes(node.id);
    
    return {
      id: node.id.toString(),
      position: node.position || { x: 0, y: 0 },
      data: { label: showLabels ? (node.value?.toString() || node.label || node.id) : "" },
      style: {
        background: isActive ? "rgba(127, 19, 236, 0.2)" : isInPath ? "rgba(16, 185, 129, 0.2)" : "rgba(28, 33, 44, 0.8)",
        color: "#fff",
        border: isActive ? "2px solid #7f13ec" : isInPath ? "2px solid #10b981" : "2px solid #3b4354",
        borderRadius: "12px",
        width: 60,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        boxShadow: isActive ? "0 0 20px rgba(127, 19, 236, 0.5)" : isInPath ? "0 0 15px rgba(16, 185, 129, 0.3)" : "none",
        transition: "all 0.5s ease-in-out",
        fontSize: "12px",
        backdropFilter: "blur(4px)",
      },
    };
  });

  const edges: Edge[] = rawEdges.map((edge: any) => {
    const isSourceInPath = pathNodeIds.includes(edge.source);
    const isTargetInPath = pathNodeIds.includes(edge.target);
    const isActivePath = isSourceInPath && isTargetInPath;
    
    return {
      id: edge.id || `${edge.source}-${edge.target}`,
      source: edge.source.toString(),
      target: edge.target.toString(),
      animated: isActivePath,
      label: weighted ? edge.weight?.toString() : "",
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 700 },
      labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
      style: { 
        stroke: isActivePath ? "#10b981" : "#3b4354", 
        strokeWidth: isActivePath ? 3 : 2,
        transition: "stroke 0.5s ease-in-out",
      },
      markerEnd: directed ? {
        type: MarkerType.ArrowClosed,
        color: isActivePath ? "#10b981" : "#3b4354",
      } : undefined,
    };
  });

  return (
    <VisualizerContainer title={title} subtitle={subtitle} showGrid={showGrid} step={step} disableZoom={true}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-right"
        className="transition-all duration-500"
      >
        <Controls className="bg-[#1c212c] border border-[#3b4354] fill-white rounded overflow-hidden shadow-lg" />
        <Background color="#3b4354" gap={40} size={1} />
      </ReactFlow>
    </VisualizerContainer>
  );
}
