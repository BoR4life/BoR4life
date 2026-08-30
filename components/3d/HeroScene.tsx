'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';

/**
 * The single live WebGL scene on the site.
 *
 * Every choice here is a frame-budget or memory decision — read the
 * comments before changing anything. Loaded only via next/dynamic from
 * HeroCanvas, so three.js never enters the initial bundle.
 */

function Bay({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    onReady();
  }, [onReady]);

  // Dispose the renderer's GPU resources on unmount. Without this, WebGL
  // contexts and their textures leak, and mobile Safari kills the tab on a
  // second visit.
  useEffect(() => {
    return () => {
      gl.dispose();
    };
  }, [gl]);

  // Intentionally renders nothing until hero-bay.glb is exported through
  // scripts/optimize-gltf.sh and passes the asset budget gate.
  //
  // Placeholder geometry was tried and removed: floating boxes over the
  // poster read as a rendering fault to any visitor, which is worse than
  // no canvas at all. The poster IS the intended final composition, so
  // showing it alone is honest and correct. Deliberately not useGLTF()
  // yet either — pointing at a missing model throws inside Suspense and
  // takes the whole hero down.
  return null;
}

export default function HeroScene({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      // dpr capped at 2: retina phones otherwise render at 3x and drop frames.
      dpr={[1, 2]}
      // "demand" renders only when something changes. For a look-around
      // scene with no animation this is a large power and thermal saving.
      frameloop="demand"
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: true,
      }}
      // 40mm-equivalent at standing eye height — a natural clinical
      // viewpoint. Wide-angle reads as amateur (docs/03-3d-production-spec.md).
      camera={{ fov: 40, position: [2.6, 1.6, 3.4] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <Suspense fallback={null}>
        <Bay onReady={onReady} />
        {/*
          Deliberately NOT drei's <Environment preset="...">: that fetches an
          HDRI from a third-party CDN (raw.githack.com) at runtime. On a
          healthcare site that is an undeclared external dependency, a
          privacy leak (every visitor's IP reaches that host), and a hard
          failure under our strict connect-src 'self' CSP. Local lights give
          the same soft high-key clinical read with no network at all.
        */}
        {/* Exactly one shadow-casting light — the budget allows no more. */}
        <directionalLight position={[3, 6, 2]} intensity={1.1} castShadow />
        <hemisphereLight args={['#cfd6dd', '#20242b', 0.75]} />
        <ambientLight intensity={0.35} />
      </Suspense>

      <OrbitControls
        // The user moves the camera or it holds still. No involuntary
        // motion — vestibular safety is a hard rule here, not a preference.
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.9}
        rotateSpeed={0.4}
      />
    </Canvas>
  );
}
