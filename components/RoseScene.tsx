import { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment, Float, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import SceneErrorBoundary from './SceneErrorBoundary';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  scale: number;
}

// ── Mouse parallax camera ─────────────────────────────────────────────────────
function ParallaxCamera() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  // read mouse from window so we don't need canvas pointer capture
  useMemo(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (mouse.current.y * 0.3 + 0.5 - camera.position.y) * 0.03;
  });

  return null;
}

// ── Silver material ───────────────────────────────────────────────────────────
function useSilverMat(roughness = 0.12) {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c8c8c8',
        metalness: 1.0,
        roughness,
        envMapIntensity: 1.2,
      }),
    [roughness],
  );
}

// ── Burst particles (silver sparks on rose click) ─────────────────────────────
function BurstParticles({ active, origin }: { active: boolean; origin: THREE.Vector3 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const silverMat = useSilverMat(0.08);
  const COUNT = 40;

  const particles = useRef<Particle[]>([]);

  // spawn on activate
  useMemo(() => {
    if (!active) return;
    particles.current = Array.from({ length: COUNT }, () => {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const speed = 0.04 + Math.random() * 0.08;
      return {
        position: origin.clone(),
        velocity: new THREE.Vector3(
          Math.sin(theta) * Math.cos(phi) * speed,
          Math.cos(theta) * speed + 0.02,
          Math.sin(theta) * Math.sin(phi) * speed,
        ),
        life: 1,
        maxLife: 0.7 + Math.random() * 0.6,
        scale: 0.03 + Math.random() * 0.05,
      };
    });
  }, [active, origin]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current || !active) return;
    particles.current.forEach((p, i) => {
      p.life -= 0.018;
      if (p.life <= 0) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        return;
      }
      p.velocity.y -= 0.0008; // gravity
      p.position.addScaledVector(p.velocity, 1);
      dummy.position.copy(p.position);
      const s = p.scale * (p.life / p.maxLife);
      dummy.scale.setScalar(Math.max(0, s));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <instancedMesh ref={meshRef} args={[undefined, silverMat, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
    </instancedMesh>
  );
}

// ── Wilted silver rose ────────────────────────────────────────────────────────
function SilverRose({ onBurst }: { onBurst: (origin: THREE.Vector3) => void }) {
  const silver = useSilverMat();
  const petalDark = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#a8a8a8',
        metalness: 1.0,
        roughness: 0.18,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const leafMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#909090',
        metalness: 0.9,
        roughness: 0.25,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const scaleTarget = useRef(1);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.25;
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.06;
    // scale pulse on hover
    scaleTarget.current = hovered ? 1.12 : 1;
    groupRef.current.scale.lerp(
      new THREE.Vector3(scaleTarget.current, scaleTarget.current, scaleTarget.current),
      0.1,
    );
  });

  const petalGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.15, 0.1, 0.2, 0.4, 0, 0.6);
    shape.bezierCurveTo(-0.2, 0.4, -0.15, 0.1, 0, 0);
    return new THREE.ShapeGeometry(shape, 12);
  }, []);

  const leafGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.1, 0.05, 0.12, 0.25, 0, 0.35);
    shape.bezierCurveTo(-0.12, 0.25, -0.1, 0.05, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  const outerPetals = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      angle: (i / 6) * Math.PI * 2,
      droop: 0.55 + Math.sin(i * 1.3) * 0.15,
      scale: 1 + Math.sin(i * 0.7) * 0.2,
    })), []);

  const innerPetals = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      angle: (i / 5) * Math.PI * 2 + 0.3,
      droop: 0.2 + Math.sin(i * 1.1) * 0.1,
      scale: 0.7,
    })), []);

  const handleClick = useCallback(() => {
    const origin = new THREE.Vector3(0, 0.3, 0);
    if (groupRef.current) groupRef.current.localToWorld(origin);
    onBurst(origin);
  }, [onBurst]);

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* invisible hit sphere for easier clicking */}
      <mesh visible={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      <mesh material={silver} position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 1.6, 12]} />
      </mesh>
      <mesh material={silver} position={[0.1, -0.35, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.022, 0.028, 0.5, 10]} />
      </mesh>
      <mesh geometry={leafGeom} material={leafMat} position={[0.12, -0.7, 0]} rotation={[0.3, 0.4, 0.5]} />
      <mesh geometry={leafGeom} material={leafMat} position={[-0.1, -0.9, 0.05]} rotation={[-0.2, -0.5, -0.6]} scale={0.8} />
      <mesh material={silver} position={[0.04, -0.55, 0]} rotation={[0, 0, -0.9]}>
        <coneGeometry args={[0.015, 0.08, 6]} />
      </mesh>
      <mesh material={silver} position={[-0.04, -0.8, 0.02]} rotation={[0.2, 0.3, 0.9]}>
        <coneGeometry args={[0.012, 0.06, 6]} />
      </mesh>
      <mesh material={silver} position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.12, 12, 8]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} material={petalDark} position={[Math.cos(a) * 0.14, -0.04, Math.sin(a) * 0.14]} rotation={[Math.PI / 2 + 0.5, 0, a]}>
            <coneGeometry args={[0.03, 0.22, 5]} />
          </mesh>
        );
      })}
      {outerPetals.map((p, i) => (
        <mesh
          key={i}
          geometry={petalGeom}
          material={i % 2 === 0 ? silver : petalDark}
          position={[Math.cos(p.angle) * 0.28, 0.18 - p.droop * 0.6, Math.sin(p.angle) * 0.28]}
          rotation={[Math.PI / 2 + p.droop, 0, p.angle + Math.PI / 2]}
          scale={p.scale}
        />
      ))}
      {innerPetals.map((p, i) => (
        <mesh
          key={i}
          geometry={petalGeom}
          material={silver}
          position={[Math.cos(p.angle) * 0.14, 0.35 - p.droop * 0.3, Math.sin(p.angle) * 0.14]}
          rotation={[Math.PI / 2 + p.droop, 0, p.angle + Math.PI / 2]}
          scale={p.scale}
        />
      ))}
      <mesh material={silver} position={[0, 0.48, 0]}>
        <sphereGeometry args={[0.08, 10, 8]} />
      </mesh>
    </group>
  );
}

// ── Single interactive photo ──────────────────────────────────────────────────
function PhotoPlane({
  url,
  position,
  rotation,
  floatSpeed,
  floatIntensity,
  onSelect,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  floatSpeed: number;
  floatIntensity: number;
  onSelect: (url: string) => void;
}) {
  const texture = useTexture(url);
  const meshRef = useRef<THREE.Mesh>(null);
  const frameMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const scaleRef = useRef(1);
  const glowMat = useMemo(() =>
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      metalness: 0.8,
      roughness: 0.05,
      emissive: '#aaaaff',
      emissiveIntensity: 0,
      side: THREE.DoubleSide,
    }), []);

  useFrame(() => {
    const target = hovered ? 1.12 : 1;
    scaleRef.current += (target - scaleRef.current) * 0.1;
    if (meshRef.current) meshRef.current.scale.setScalar(scaleRef.current);
    if (frameMeshRef.current) frameMeshRef.current.scale.setScalar(scaleRef.current);
    glowMat.emissiveIntensity += ((hovered ? 0.6 : 0) - glowMat.emissiveIntensity) * 0.1;
  });

  // detect drag vs click
  const pointerDownPos = useRef({ x: 0, y: 0 });

  return (
    <Float speed={floatSpeed} floatIntensity={floatIntensity} rotationIntensity={0.08}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onPointerDown={(e) => { pointerDownPos.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => {
          const dx = e.clientX - pointerDownPos.current.x;
          const dy = e.clientY - pointerDownPos.current.y;
          if (Math.sqrt(dx * dx + dy * dy) < 6) onSelect(url);
        }}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* frame */}
      <mesh ref={frameMeshRef} position={position} rotation={rotation} material={glowMat}>
        <planeGeometry args={[1.62, 1.62]} />
      </mesh>
    </Float>
  );
}

// ── Photo ring ────────────────────────────────────────────────────────────────
const PHOTOS = [
  '/photos/photo1.jpg', '/photos/photo2.jpg', '/photos/photo3.jpg',
  '/photos/photo4.jpg', '/photos/photo5.jpg', '/photos/photo6.jpg',
  '/photos/photo7.jpg', '/photos/photo8.jpg',
];

// stable tilt values (avoid Math.random in render)
const PHOTO_TILTS = [-0.06, 0.09, -0.04, 0.11, -0.08, 0.05, -0.1, 0.07];

function PhotoRing({ onSelect }: { onSelect: (url: string) => void }) {
  const radius = 3.8;
  return (
    <>
      {PHOTOS.map((url, i) => {
        const angle = (i / PHOTOS.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i * 0.9) * 0.8;
        const rotY = -angle + Math.PI;
        return (
          <PhotoPlane
            key={url}
            url={url}
            position={[x, y, z]}
            rotation={[PHOTO_TILTS[i], rotY, 0]}
            floatSpeed={0.8 + i * 0.15}
            floatIntensity={0.3 + (i % 3) * 0.1}
            onSelect={onSelect}
          />
        );
      })}
    </>
  );
}

// ── Scene content ─────────────────────────────────────────────────────────────
function SceneContent({
  onPhotoSelect,
}: {
  onPhotoSelect: (url: string) => void;
}) {
  const [burstActive, setBurstActive] = useState(false);
  const [burstOrigin, setBurstOrigin] = useState(() => new THREE.Vector3(0, 0.3, 0));

  const handleBurst = useCallback((origin: THREE.Vector3) => {
    setBurstOrigin(origin.clone());
    setBurstActive(false);
    // re-trigger on next tick so useMemo fires again
    setTimeout(() => setBurstActive(true), 10);
    setTimeout(() => setBurstActive(false), 2500);
  }, []);

  return (
    <>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 6, 4]} intensity={3} color="#ffffff" />
      <directionalLight position={[-4, 2, -4]} intensity={2} color="#c8c8ff" />
      <pointLight position={[0, 3, 0]} intensity={4} color="#e0e0ff" distance={8} />
      <pointLight position={[0, -1, 0]} intensity={1.5} color="#8080ff" distance={5} />

      <Environment preset="studio" />
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        maxPolarAngle={Math.PI * 0.75}
        makeDefault
      />
      <ParallaxCamera />

      <SilverRose onBurst={handleBurst} />
      <BurstParticles active={burstActive} origin={burstOrigin} />
      <PhotoRing onSelect={onPhotoSelect} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.9} intensity={1.2} blendFunction={BlendFunction.ADD} />
        <ChromaticAberration offset={new THREE.Vector2(0.0015, 0.0015)} blendFunction={BlendFunction.NORMAL} />
        <Vignette eskil={false} offset={0.15} darkness={1.0} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function RoseScene({ onPhotoSelect }: { onPhotoSelect: (url: string) => void }) {
  return (
    <SceneErrorBoundary fallback={<div className="w-full h-full bg-black" />}>
      <Canvas camera={{ position: [0, 0.5, 7], fov: 45 }} dpr={[1, 2]}>
        <SceneContent onPhotoSelect={onPhotoSelect} />
      </Canvas>
    </SceneErrorBoundary>
  );
}
