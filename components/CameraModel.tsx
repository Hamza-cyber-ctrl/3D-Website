import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';
import { scrollState } from '../store';

export default function CameraModel() {
  const group = useRef<THREE.Group>(null);
  
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.9, metalness: 0.3 }), []);
  const gripMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#020202', roughness: 1.0 }), []);
  const mountMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#444', metalness: 0.8, roughness: 0.2 }), []);
  const lensBodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.8 }), []);
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: '#00ffcc', transmission: 0.95, opacity: 1, transparent: true, roughness: 0.05, ior: 1.5, thickness: 0.5 
  }), []);
  const redRingMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff073a', emissive: '#ff073a', emissiveIntensity: 0.8 }), []);
  const dialMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.6, metalness: 0.7 }), []);
  
  useFrame((state) => {
    if (!group.current) return;
    const p = scrollState.progress;
    const t = state.clock.getElapsedTime();
    
    let targetX = 0;
    let targetY = Math.sin(t * 2) * 0.05;
    let targetZ = 0;
    
    let targetRotX = Math.cos(t * 0.5) * 0.05;
    let targetRotY = t * 0.2; 
    let targetRotZ = 0;

    if (p < 0.25) {
      // Hero
    } else if (p < 0.5) {
      // Specs
      const subP = (p - 0.25) / 0.25;
      targetX = THREE.MathUtils.lerp(0, 1.5, subP);
      targetRotY = THREE.MathUtils.lerp(t * 0.2, -Math.PI / 6, subP);
      targetRotX = THREE.MathUtils.lerp(Math.cos(t * 0.5) * 0.05, 0.3, subP);
      targetZ = THREE.MathUtils.lerp(0, -1, subP);
    } else if (p < 0.75) {
      // Lens
      const subP = (p - 0.5) / 0.25;
      targetX = THREE.MathUtils.lerp(1.5, 0, subP);
      targetRotY = THREE.MathUtils.lerp(-Math.PI / 6, 0, subP);
      targetRotX = THREE.MathUtils.lerp(0.3, 0, subP);
      targetZ = THREE.MathUtils.lerp(-1, 2.5, subP);
    } else {
      // Viewfinder
      const subP = (p - 0.75) / 0.25;
      targetX = 0;
      targetZ = THREE.MathUtils.lerp(2.5, 6, subP); 
      targetRotY = 0;
      targetRotX = 0;
    }

    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, 0.05);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.1);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, 0.05);
    
    if (p >= 0.25) {
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.05);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.05);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRotZ, 0.05);
    } else {
      group.current.rotation.x = targetRotX;
      group.current.rotation.y = targetRotY;
      group.current.rotation.z = targetRotZ;
    }
  });

  return (
    <group ref={group}>
       {/* Main Body */}
       <RoundedBox args={[1.4, 0.9, 0.4]} position={[0, 0, 0]} radius={0.05} smoothness={4} material={bodyMat} />
       
       {/* Grip */}
       <RoundedBox args={[0.45, 0.85, 0.5]} position={[0.5, 0, 0.15]} radius={0.1} smoothness={4} material={gripMat} />
       
       {/* Viewfinder Hump */}
       <RoundedBox args={[0.5, 0.35, 0.45]} position={[0, 0.5, 0.05]} radius={0.05} smoothness={4} material={bodyMat} />
       
       {/* EVF Eyepiece */}
       <Box args={[0.2, 0.15, 0.05]} position={[0, 0.55, -0.2]} material={bodyMat} />
       <Box args={[0.16, 0.11, 0.02]} position={[0, 0.55, -0.22]} material={glassMat} />

       {/* Hot Shoe */}
       <Box args={[0.2, 0.05, 0.2]} position={[0, 0.68, 0.05]}>
         <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
       </Box>

       {/* Lens Mount */}
       <Cylinder args={[0.35, 0.35, 0.1, 32]} position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]} material={mountMat} />

       {/* Lens Barrel */}
       <Cylinder args={[0.32, 0.34, 0.6, 32]} position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]} material={lensBodyMat} />
       
       {/* Focus Ring Ribs */}
       <Cylinder args={[0.33, 0.33, 0.2, 32, 1, false, 0, Math.PI * 2]} position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
         <meshStandardMaterial color="#020202" roughness={1.0} wireframe={true} />
       </Cylinder>

       {/* Lens Glass Elements */}
       <Cylinder args={[0.28, 0.28, 0.05, 32]} position={[0, 0, 0.88]} rotation={[Math.PI / 2, 0, 0]} material={glassMat} />
       <Cylinder args={[0.20, 0.20, 0.02, 32]} position={[0, 0, 0.89]} rotation={[Math.PI / 2, 0, 0]} material={new THREE.MeshPhysicalMaterial({ color: '#6eff3b', transmission: 0.8, opacity: 1, transparent: true })} />
       <Cylinder args={[0.15, 0.15, 0.02, 32]} position={[0, 0, 0.895]} rotation={[Math.PI / 2, 0, 0]} material={new THREE.MeshPhysicalMaterial({ color: '#ff073a', transmission: 0.9, opacity: 1, transparent: true })} />
       
       {/* Red Ring */}
       <Cylinder args={[0.345, 0.345, 0.02, 32]} position={[0, 0, 0.85]} rotation={[Math.PI / 2, 0, 0]} material={redRingMat} />

       {/* Dials */}
       <Cylinder args={[0.15, 0.15, 0.08, 16]} position={[-0.4, 0.45, 0]} rotation={[0, 0, 0]} material={dialMat} />
       <Cylinder args={[0.12, 0.12, 0.08, 16]} position={[0.4, 0.45, 0]} rotation={[0, 0, 0]} material={dialMat} />
       
       {/* Shutter Button */}
       <Cylinder args={[0.06, 0.06, 0.05, 16]} position={[0.55, 0.42, 0.25]} rotation={[Math.PI/8, 0, 0]}>
         <meshStandardMaterial color="#ff073a" metalness={0.5} roughness={0.2} emissive="#ff073a" emissiveIntensity={0.2} />
       </Cylinder>
       
       {/* Back screen */}
       <Box args={[1.1, 0.7, 0.05]} position={[-0.1, 0, -0.22]}>
          <meshStandardMaterial color="#000" roughness={0.1} metalness={0.8} />
       </Box>
       {/* Screen glow */}
       <Box args={[1.05, 0.65, 0.01]} position={[-0.1, 0, -0.25]}>
          <meshStandardMaterial color="#ff073a" emissive="#ff073a" emissiveIntensity={0.2} />
       </Box>
       {/* Screen reticle graphic */}
       <Box args={[0.1, 0.1, 0.02]} position={[-0.1, 0, -0.255]}>
          <meshBasicMaterial color="#ffffff" />
       </Box>
    </group>
  );
}
