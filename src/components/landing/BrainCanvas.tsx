import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, MeshDistortMaterial, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/* Camera-following rig: gentle pointer parallax */
function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const p = state.pointer;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, p.x * 0.32, 0.045);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -p.y * 0.2, 0.045);
  });
  return <group ref={ref}>{children}</group>;
}

/* Core: distorted energy brain */
function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.16;
  });
  return (
    <Float speed={2.4} rotationIntensity={0.3} floatIntensity={1.15}>
      {/* warm halo rim */}
      <mesh scale={1.72}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FFD9C4" transparent opacity={0.16} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh ref={ref} scale={1.42}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial color="#A78BFA" emissive="#6D4DFF" emissiveIntensity={0.42} roughness={0.3} metalness={0.08} distort={0.3} speed={2.2} />
      </mesh>
      {/* glowing sulci lines */}
      <mesh scale={1.43}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#FFFFFF" wireframe transparent opacity={0.1} depthWrite={false} />
      </mesh>
      {/* warm inner light */}
      <mesh scale={0.62}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FFE7D4" transparent opacity={0.9} />
      </mesh>
    </Float>
  );
}

/* Neural net shell: fibonacci nodes + nearest links, breathing */
function NeuralShell() {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const linkMat = useRef<THREE.LineBasicMaterial>(null);
  const { nodeGeo, linkGeo } = useMemo(() => {
    const N = 44;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * 2.399963;
      pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r));
    }
    const seen = new Set<string>();
    const lp: number[] = [];
    pts.forEach((p, i) => {
      pts
        .map((q, j) => ({ j, d: p.distanceToSquared(q) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          const k = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(k)) return;
          seen.add(k);
          lp.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z);
        });
    });
    const nodeGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lp), 3));
    return { nodeGeo, linkGeo };
  }, []);
  useFrame(({ clock }, dt) => {
    if (group.current) {
      group.current.rotation.y -= dt * 0.1;
      group.current.rotation.z = Math.sin(clock.elapsedTime * 0.24) * 0.12;
    }
    const pulse = 0.5 + Math.sin(clock.elapsedTime * 2.1) * 0.22;
    if (mat.current) mat.current.opacity = pulse;
    if (linkMat.current) linkMat.current.opacity = 0.28 + Math.sin(clock.elapsedTime * 2.1 + 1) * 0.12;
  });
  return (
    <group ref={group} scale={2.02}>
      <points geometry={nodeGeo}>
        <pointsMaterial ref={mat} color="#7C5CFF" size={0.055} transparent depthWrite={false} />
      </points>
      <lineSegments geometry={linkGeo}>
        <lineBasicMaterial ref={linkMat} color="#C9B8FF" transparent opacity={0.32} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

/* Orbiting quiz chips + tilted glow rings */
const CHIPS = [
  { r: 2.62, s: 0.5, c: '#FF6B4A', y: 0.45, off: 0, speed: 0.34 },
  { r: 2.72, s: 0.4, c: '#2E9BFF', y: -0.4, off: 2.1, speed: 0.42 },
  { r: 2.5, s: 0.34, c: '#FFC531', y: 0.95, off: 4.2, speed: 0.5 },
];
function Orbiters() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ref.current?.children.forEach((child, i) => {
      const it = CHIPS[i % CHIPS.length];
      const a = t * it.speed + it.off;
      child.position.set(Math.cos(a) * it.r, it.y + Math.sin(t * 0.85 + i * 1.7) * 0.28, Math.sin(a) * it.r);
      child.rotation.set(Math.sin(t * 0.6 + i) * 0.35, -a, 0);
    });
  });
  return (
    <group ref={ref}>
      {CHIPS.map((it, i) => (
        <RoundedBox key={i} args={[1, 1, 1]} radius={0.22} smoothness={4} scale={it.s} castShadow={false}>
          <meshStandardMaterial color={it.c} emissive={it.c} emissiveIntensity={0.55} roughness={0.35} />
        </RoundedBox>
      ))}
    </group>
  );
}

function Rings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (r1.current) r1.current.rotation.z = t * 0.12;
    if (r2.current) r2.current.rotation.z = -t * 0.09;
  });
  return (
    <>
      <mesh ref={r1} rotation={[Math.PI / 2.35, 0.15, 0]}>
        <torusGeometry args={[2.66, 0.014, 8, 140]} />
        <meshBasicMaterial color="#D5C6FF" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 1.85, -0.2, 0]}>
        <torusGeometry args={[2.3, 0.012, 8, 140]} />
        <meshBasicMaterial color="#FFC9B3" transparent opacity={0.55} depthWrite={false} />
      </mesh>
    </>
  );
}

export default function BrainCanvas({ simple = false }: { simple?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.04 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        dpr={simple ? 1 : [1, 1.75]}
        frameloop={visible ? 'always' : 'never'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.35, 7.6], fov: 42 }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[4, 5, 6]} intensity={1.15} color="#FFF4E8" />
        <pointLight position={[-5, -1, 3]} intensity={26} color="#B79CFF" />
        <pointLight position={[4, -3, 2]} intensity={18} color="#FFB59E" />
        <Suspense fallback={null}>
          <Rig>
            <Core />
            <NeuralShell />
            <Orbiters />
            <Rings />
          </Rig>
          <Sparkles count={simple ? 28 : 64} scale={[7.5, 5, 4]} size={3.2} speed={0.32} color="#C4AEFF" opacity={0.55} />
          {!simple && <ContactShadows position={[0, -2.7, 0]} opacity={0.16} scale={9} blur={2.6} far={4} color="#7C5CFF" />}
        </Suspense>
      </Canvas>
    </div>
  );
}
