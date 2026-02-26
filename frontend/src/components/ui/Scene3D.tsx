import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

interface Scene3DProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  enableControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Scene3D({ 
  children, 
  cameraPosition = [0, 0, 5],
  enableControls = false,
  className,
  style 
}: Scene3DProps) {
  return (
    <div className={className} style={style}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
      >
        <PerspectiveCamera makeDefault position={cameraPosition} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          {children}
        </Suspense>
        {enableControls && <OrbitControls enableZoom={false} />}
      </Canvas>
    </div>
  );
}

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

// Floating geometric shapes for backgrounds
export function FloatingCube({ position, color = '#8b5cf6' }: { position: [number, number, number]; color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} opacity={0.6} transparent />
    </mesh>
  );
}

export function FloatingSphere({ position, color = '#3b82f6' }: { position: [number, number, number]; color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} opacity={0.6} transparent />
    </mesh>
  );
}

