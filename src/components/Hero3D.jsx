import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// 一束柔光點的「資料雲」——緩慢呼吸、漂移、色溫微移。
// 沉思內核（Anadol 點雲 / Turrell・Eliasson 光場）不變；
// 階段 B 演化：① 滾動驅動 ② 指標互動（門檻/被觸碰）③ 一粒綠光（衰敗中的生機）。

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

// 黃金角螺旋分布在略壓扁的球殼上 → 帶厚度的柔光體積。
function shellPositions(count, radius = 1.55, spread = 0.7) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = Math.PI * (1 + Math.sqrt(5)) * i;
    const shell = radius + (Math.random() - 0.5) * spread * Math.pow(Math.random(), 1.5);
    arr[i * 3] = shell * Math.sin(inclination) * Math.cos(azimuth);
    arr[i * 3 + 1] = shell * Math.cos(inclination) * 0.62; // 略壓扁成水平光帶
    arr[i * 3 + 2] = shell * Math.sin(inclination) * Math.sin(azimuth);
  }
  return arr;
}

function LightField({ scroll, prefersReduced }) {
  const group = useRef();
  const points = useRef();
  const material = useRef();
  const greenMat = useRef();
  const hazeMat = useRef(); // Janssens 式綠霧：一層極淡的彩色感知霧
  const sprite = useMemo(() => softSprite(), []);

  const count = useMemo(
    () => (typeof window !== 'undefined' && window.innerWidth < 768 ? 4000 : 8000),
    []
  );
  // 綠光：灰白光海中的生機（v2.2 增量——綠不再那麼稀少，但仍是少數）。
  const greenCount = useMemo(
    () => (typeof window !== 'undefined' && window.innerWidth < 768 ? 24 : 44),
    []
  );

  const positions = useMemo(() => shellPositions(count), [count]);
  const greenPositions = useMemo(() => shellPositions(greenCount, 1.5, 0.9), [greenCount]);

  // 兩個光的色溫之間極慢來回（暖白 ↔ 冷白）——藝術品本身的光。
  const warm = useMemo(() => new THREE.Color('#f3e8cf'), []);
  const cool = useMemo(() => new THREE.Color('#cfe0ec'), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  // 指標目標與當前值（重阻尼，位移極小）。
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05); // 鎖定阻尼步長，避免掉幀爆衝

    // 指標互動：光隨游標極輕微聚散，重阻尼。
    target.current.x = prefersReduced ? 0 : state.pointer.y * 0.12;
    target.current.y = prefersReduced ? 0 : state.pointer.x * 0.16;
    cur.current.x += (target.current.x - cur.current.x) * d * 1.6;
    cur.current.y += (target.current.y - cur.current.y) * d * 1.6;

    // 樂章二（捲出 hero）：光場不表演式消失，而是沉降、後退、稀釋——
    // 消融進圖錄共用的同一片黑。白光場較快退場；綠光（唯一還活著的）淡得最慢，
    // 最後一個離開視野，把「衰敗中的生機」帶進暗房。
    const s = scroll.current; // 0..1（hero 視窗內的進度）

    if (group.current) {
      group.current.position.y = -s * 1.1; // 下沉（加深，像落入暗房地面）
      group.current.position.z = -s * 1.4; // 後退（加深）
    }

    if (points.current) {
      const autoY = prefersReduced ? 0 : t * 0.025; // 極慢自轉
      const autoX = prefersReduced ? 0 : Math.sin(t * 0.07) * 0.12;
      points.current.rotation.y = autoY + cur.current.y;
      points.current.rotation.x = autoX + cur.current.x;
      const breath = prefersReduced ? 1 : 1 + Math.sin(t * 0.18) * 0.045; // ~35s 呼吸
      points.current.scale.setScalar(breath * (1 - s * 0.14));
    }

    if (material.current) {
      const k = prefersReduced ? 0.5 : (Math.sin(t * 0.06) + 1) / 2; // ~50s 色溫循環
      tmp.copy(warm).lerp(cool, k);
      material.current.color.copy(tmp);
      const base = prefersReduced ? 0.72 : 0.72 + Math.sin(t * 0.18) * 0.06;
      material.current.opacity = base * Math.max(0, 1 - s * 1.15); // 白光較快稀釋
    }

    if (greenMat.current) {
      // 綠光獨立、更慢的脈動——像還在呼吸的生命；淡得最慢，最後消融。
      const pulse = prefersReduced ? 0.85 : 0.6 + (Math.sin(t * 0.12) + 1) * 0.22;
      greenMat.current.opacity = pulse * Math.max(0, 1 - s * 0.55); // 綠光續存最久
    }

    if (hazeMat.current) {
      // 綠霧：極淡、極慢呼吸的感知霧（Janssens 彩色霧）；隨滾動淡出。
      const h = prefersReduced ? 0.05 : 0.04 + (Math.sin(t * 0.05) + 1) * 0.022;
      hazeMat.current.opacity = h * Math.max(0, 1 - s * 0.9);
    }
  });

  return (
    <group ref={group}>
      {/* 綠霧：一層極淡的彩色感知霧，墊在光場之後（Janssens）。 */}
      <mesh position={[0, -0.1, -0.6]} scale={[8, 5.5, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={hazeMat}
          map={sprite}
          color="#6f8a5a"
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

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

      {/* 一粒綠光：地衣／氧化銅綠，稍大、稀少。 */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[greenPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={greenMat}
          color="#9fb487"
          size={0.1}
          sizeAttenuation
          map={sprite}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// 滾動進度寫入 ref（在 useFrame 讀取，避免 re-render）。
function useScrollProgress() {
  const scroll = useRef(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      scroll.current = Math.min(Math.max(window.scrollY / vh, 0), 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return scroll;
}

export default function Hero3D() {
  const scroll = useScrollProgress();
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Canvas
      className="hero__canvas"
      camera={{ position: [0, 0, 5], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#0c0c0b']} />
      <fog attach="fog" args={['#0c0c0b', 4.5, 9]} />
      <LightField scroll={scroll} prefersReduced={prefersReduced} />
    </Canvas>
  );
}
