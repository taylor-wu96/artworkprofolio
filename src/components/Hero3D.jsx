import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import { useRef } from 'react';

// 一束會緩慢掃過的光，呼應「光」與「門檻」——明暗交界處。
function SweepingLight() {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.x = Math.sin(t * 0.3) * 4;
      ref.current.position.y = Math.cos(t * 0.2) * 2 + 1;
    }
  });
  return <directionalLight ref={ref} intensity={2.2} color="#f3e6c0" castShadow />;
}

// 一顆會微微起伏、表面像被侵蝕的形體——「衰敗與生機並存」。
function DecayingForm() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.12;
      ref.current.rotation.z = state.clock.elapsedTime * 0.04;
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref} scale={1.4}>
        <icosahedronGeometry args={[1, 24]} />
        <MeshDistortMaterial
          color="#2b2b32"
          roughness={0.45}
          metalness={0.55}
          distort={0.35}
          speed={1.4}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#0a0a0c']} />
      <fog attach="fog" args={['#0a0a0c', 5, 11]} />
      <ambientLight intensity={0.25} />
      <SweepingLight />
      <DecayingForm />
      <Environment preset="night" />
    </Canvas>
  );
}
