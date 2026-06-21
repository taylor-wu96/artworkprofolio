import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// 一束柔光點的「資料雲」——緩慢呼吸、漂移、色溫微移。
// 呼應 Anadol 的點雲流動、Turrell/Eliasson 的光場：沉思而非表演。

function softSprite() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function LightField() {
  const points = useRef();
  const material = useRef();
  const sprite = useMemo(() => softSprite(), []);

  const count = useMemo(
    () => (typeof window !== 'undefined' && window.innerWidth < 768 ? 4000 : 8000),
    []
  );

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // 黃金角螺旋分布在球殼上，再加徑向噪聲 → 帶厚度的柔光體積
      const t = i / count;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = Math.PI * (1 + Math.sqrt(5)) * i;
      const shell = 1.55 + (Math.random() - 0.5) * 0.7 * Math.pow(Math.random(), 1.5);
      // 略為壓扁成水平的光帶，更像地平線上的光
      const x = shell * Math.sin(inclination) * Math.cos(azimuth);
      const y = shell * Math.cos(inclination) * 0.62;
      const z = shell * Math.sin(inclination) * Math.sin(azimuth);
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, [count]);

  // 兩個光的色溫之間極慢來回（暖白 ↔ 冷白）——這是藝術品本身的光。
  const warm = useMemo(() => new THREE.Color('#f3e8cf'), []);
  const cool = useMemo(() => new THREE.Color('#cfe0ec'), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (points.current) {
      points.current.rotation.y = t * 0.025; // 極慢自轉
      points.current.rotation.x = Math.sin(t * 0.07) * 0.12;
      const breath = 1 + Math.sin(t * 0.18) * 0.045; // ~35s 呼吸
      points.current.scale.setScalar(breath);
    }
    if (material.current) {
      const k = (Math.sin(t * 0.06) + 1) / 2; // ~50s 色溫循環
      tmp.copy(warm).lerp(cool, k);
      material.current.color.copy(tmp);
      material.current.opacity = 0.72 + Math.sin(t * 0.18) * 0.06;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        size={0.05}
        sizeAttenuation
        map={sprite}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      className="hero__canvas"
      camera={{ position: [0, 0, 5], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#0d0c09']} />
      <fog attach="fog" args={['#0d0c09', 4.5, 9]} />
      <LightField />
    </Canvas>
  );
}
