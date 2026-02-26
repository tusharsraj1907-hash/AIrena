import * as THREE from 'three';

export function createGradientMaterial(color1: string, color2: string, opacity: number = 0.6) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color1),
    opacity,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

export function createAnimatedGeometry(type: 'box' | 'sphere' | 'torus', size: number = 1) {
  switch (type) {
    case 'box':
      return new THREE.BoxGeometry(size, size, size);
    case 'sphere':
      return new THREE.SphereGeometry(size, 32, 32);
    case 'torus':
      return new THREE.TorusGeometry(size, size * 0.3, 16, 100);
    default:
      return new THREE.BoxGeometry(size, size, size);
  }
}

export function randomPosition(range: number = 5): [number, number, number] {
  return [
    (Math.random() - 0.5) * range * 2,
    (Math.random() - 0.5) * range * 2,
    (Math.random() - 0.5) * range * 2,
  ];
}

export function randomColor(): string {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#10b981', // green
    '#f59e0b', // amber
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

