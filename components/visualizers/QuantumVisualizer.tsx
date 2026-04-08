'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import VisualizerContainer from './VisualizerContainer';

interface Qubit {
  id: string | number;
  theta: number; // 0 to Math.PI
  phi: number;   // 0 to 2 * Math.PI
  label?: string;
}

interface QuantumVisualizerProps {
  data: {
    qubits?: Qubit[];
    message?: string;
    showLabels?: boolean;
    title?: string;
    subtitle?: string;
  };
}

function BlochSphere({ qubit, position, showLabels = true }: { qubit: Qubit; position: [number, number, number]; showLabels?: boolean }) {
  const arrowRef = useRef<THREE.Group>(null);
  
  // Calculate Bloch vector
  // x = sin(theta) * cos(phi)
  // y = cos(theta) // Z-axis in standard Bloch sphere is usually Up (Y in ThreeJS)
  // z = sin(theta) * sin(phi)
  
  // In Three.js, Y is up. So we map:
  // Bloch Z -> Three Y
  // Bloch X -> Three X
  // Bloch Y -> Three Z
  const targetVector = useMemo(() => {
    const x = Math.sin(qubit.theta) * Math.cos(qubit.phi);
    const y = Math.cos(qubit.theta);
    const z = Math.sin(qubit.theta) * Math.sin(qubit.phi);
    return new THREE.Vector3(x, y, z);
  }, [qubit.theta, qubit.phi]);

  useFrame(() => {
    if (arrowRef.current) {
      // Smoothly interpolate the arrow rotation towards the target vector
      const currentDir = new THREE.Vector3(0, 1, 0).applyQuaternion(arrowRef.current.quaternion);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetVector);
      arrowRef.current.quaternion.slerp(quaternion, 0.1);
    }
  });

  return (
    <group position={position}>
      {/* Sphere Wireframe */}
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial color="#3b4354" wireframe transparent opacity={0.15} />
      </Sphere>
      
      {/* Equator */}
      <Line points={useMemo(() => {
        const pts = [];
        for (let i = 0; i <= 64; i++) {
          const angle = (i / 64) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(angle) * 2, 0, Math.sin(angle) * 2));
        }
        return pts;
      }, [])} color="#7f13ec" opacity={0.3} transparent lineWidth={1} />

      {/* Axes */}
      <Line points={[[-2.5, 0, 0], [2.5, 0, 0]]} color="#ffffff" opacity={0.2} transparent />
      <Line points={[[0, -2.5, 0], [0, 2.5, 0]]} color="#ffffff" opacity={0.2} transparent />
      <Line points={[[0, 0, -2.5], [0, 0, 2.5]]} color="#ffffff" opacity={0.2} transparent />

      {/* Axis Labels */}
      {showLabels && (
        <>
          <Text position={[2.8, 0, 0]} fontSize={0.2} color="#8892b0">{"|x>"}</Text>
          <Text position={[0, 2.8, 0]} fontSize={0.2} color="#ffffff">{"|0>"}</Text>
          <Text position={[0, -2.8, 0]} fontSize={0.2} color="#ffffff">{"|1>"}</Text>
          <Text position={[0, 0, 2.8]} fontSize={0.2} color="#8892b0">{"|y>"}</Text>
        </>
      )}

      {/* State Vector Arrow */}
      <group ref={arrowRef}>
        <Line points={[[0, 0, 0], [0, 2, 0]]} color="#00f0ff" lineWidth={3} />
        <mesh position={[0, 2, 0]}>
          <coneGeometry args={[0.1, 0.3, 16]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
      </group>

      {/* Qubit Label */}
      {showLabels && (
        <Html position={[0, -3.5, 0]} center>
          <div className="text-accent-mint font-mono text-xs bg-background-dark/80 px-2 py-1 rounded border border-accent-mint/30 whitespace-nowrap">
            {qubit.label || `Qubit ${qubit.id}`}
            <br/>
            <span className="text-[9px] text-slate-400">
              θ: {(qubit.theta / Math.PI).toFixed(2)}π, φ: {(qubit.phi / Math.PI).toFixed(2)}π
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function QuantumVisualizer({ data }: QuantumVisualizerProps) {
  const qubits = data?.qubits || [{ id: 'q0', theta: 0, phi: 0, label: '|0>' }];
  const showLabels = data?.showLabels ?? true;
  const title = data?.title || "Bloch Sphere";
  const subtitle = data?.subtitle || "Quantum Simulation";

  return (
    <VisualizerContainer title={title} subtitle={subtitle} showGrid={false} step={0} disableZoom={true}>
      <div className="w-full h-full relative bg-[#0d1117]">
        <div className="absolute top-16 left-4 z-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-darker/80 backdrop-blur-md border border-border-dark rounded-lg p-3 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-accent-mint text-sm">public</span>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">State Visualization</h3>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Visualizing {qubits.length} Qubit{qubits.length !== 1 ? 's' : ''}
            </p>
          </motion.div>
        </div>

        <Canvas camera={{ position: [4, 3, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          {qubits.map((qubit, index) => {
            // Space out multiple qubits if there are more than 1
            const offset = (index - (qubits.length - 1) / 2) * 5;
            return (
              <BlochSphere 
                key={qubit.id} 
                qubit={qubit} 
                position={[offset, 0, 0]} 
                showLabels={showLabels}
              />
            );
          })}

          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            autoRotate={false}
          />
        </Canvas>
      </div>
    </VisualizerContainer>
  );
}
