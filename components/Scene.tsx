import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Glitch, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { GlitchMode, BlendFunction } from 'postprocessing';
import CameraModel from './CameraModel';
import Particles from './Particles';
import * as THREE from 'three';

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: false }}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={3} color="#ff073a" />
      <directionalLight position={[-5, 5, -5]} intensity={3} color="#6eff3b" />
      <pointLight position={[0, 0, 5]} intensity={2} color="#ffffff" />
      
      <CameraModel />
      <Particles />

      <EffectComposer>
        <Noise opacity={0.3} blendFunction={BlendFunction.OVERLAY} />
        <ChromaticAberration offset={new THREE.Vector2(0.003, 0.003)} blendFunction={BlendFunction.NORMAL} />
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} blendFunction={BlendFunction.ADD} />
        <Glitch 
          delay={new THREE.Vector2(2.0, 5.0)}
          duration={new THREE.Vector2(0.1, 0.3)}
          strength={new THREE.Vector2(0.02, 0.08)}
          mode={GlitchMode.SPORADIC}
          active
          ratio={0.1}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.2} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </Canvas>
  );
}
