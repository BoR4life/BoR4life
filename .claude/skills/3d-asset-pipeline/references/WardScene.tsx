/**
 * The single live scene. Lazy-loaded by Hero3D — never imported directly.
 *
 * Every choice here is a frame-budget or memory decision. Read the comments
 * before changing anything; each one is protecting a specific failure mode.
 */

'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';

const MODEL = '/models/hero-ward.glb';

function Ward({ onReady }: { onReady: () => void }) {
  const { scene } = useGLTF(MODEL);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    onReady();
  }, [onReady]);

  // Dispose everything on unmount. Without this, geometries, materials and
  // textures leak and mobile Safari kills the tab on the second visit.
  useEffect(() => {
    return () => {
      scene.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        obj.geometry?.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          if (!m) continue;
          for (const key of Object.keys(m)) {
            const val = (m as any)[key];
            if (val instanceof THREE.Texture) val.dispose();
          }
          m.dispose();
        }
      });
      gl.dispose();
    };
  }, [scene, gl]);

  return <primitive object={scene} />;
}

export default function WardScene({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      // dpr capped at 2: retina phones will otherwise render 3x and drop frames.
      dpr={[1, 2]}
      // "demand" means we only render when something changes. For a
      // look-around scene with no animation this is a large power saving.
      frameloop="demand"
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      camera={{ fov: 40, position: [0, 1.6, 4] }} // 40mm-equivalent, eye height
    >
      <Suspense fallback={null}>
        <Ward onReady={onReady} />
        {/* HDRI does the lighting work. Clinical spaces are bright and even. */}
        <Environment files="/hdri/clinical-soft.hdr" />
        {/* Exactly one shadow-casting light — the budget allows no more. */}
        <directionalLight position={[3, 6, 2]} intensity={0.6} castShadow />
      </Suspense>

      <OrbitControls
        // The user moves the camera or it holds still. No involuntary motion —
        // vestibular safety is a hard rule, not a preference.
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.9}
        rotateSpeed={0.4}
      />
    </Canvas>
  );
}

// Preload only after the chunk itself has been fetched, never on first load.
useGLTF.preload(MODEL);
