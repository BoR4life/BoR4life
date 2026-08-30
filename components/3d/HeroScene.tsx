'use client';

import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * The single live WebGL scene on the site.
 *
 * Every choice here is a frame-budget, memory or privacy decision — read the
 * comments before changing anything. Loaded only via next/dynamic from
 * HeroCanvas, so three.js never enters the initial bundle.
 */

const MODEL = '/models/hero-bay.glb';

/**
 * The camera, taken directly from the Blender view the poster was rendered
 * from (`VIEWS.hero` in scripts/build_clinical_bay.py) so the canvas and the
 * still are the same shot. Without that they cross-fade between two
 * different compositions, which reads as a glitch rather than as the image
 * coming alive.
 *
 * Blender is Z-up and three is Y-up, so (x, y, z) becomes (x, z, -y):
 *   loc    (1.05, 0.66, 1.64)  ->  (1.05, 1.64, -0.66)
 *   target (2.86, 3.66, 1.10)  ->  (2.86, 1.10, -3.66)
 *
 * Getting this wrong is not subtle but it is silent: the first version used
 * a plausible-looking [2.6, 1.6, 3.4], which in these coordinates is outside
 * the room entirely, so the scene rendered the back of a wall.
 *
 * FOV is vertical in three and horizontal in Blender. A 32mm lens on a 36mm
 * sensor is 58.7 degrees horizontally, which at 16:9 is ~35 vertically.
 */
const CAMERA_POSITION: [number, number, number] = [1.05, 1.64, -0.66];
const CAMERA_TARGET: [number, number, number] = [2.86, 1.1, -3.66];
const CAMERA_FOV = 35;

/**
 * Geometry is meshopt-compressed, and that is a CSP decision rather than a
 * performance one.
 *
 * The obvious choices — Draco for geometry, KTX2/Basis for textures — are
 * both Emscripten embind builds, and embind constructs its invoker
 * functions at runtime with `new Function`. This site's CSP has no
 * 'unsafe-eval' (lib/csp.ts), so both throw EvalError inside the decoder
 * worker and the model never appears. That failure is completely silent:
 * the poster underneath keeps rendering, so the page looks correct, the
 * build passes, and nothing surfaces the loss. tests/hero3d.spec.ts exists
 * because of exactly this.
 *
 * meshoptimizer's decoder is hand-written, contains no eval, and embeds its
 * own WebAssembly as base64 inside the module — so there is no decoder file
 * to host and, critically, no CDN fetch. three's DRACOLoader and drei's
 * useGLTF both default to Google's gstatic CDN, which on a healthcare site
 * would mean every visitor's IP reaching a third party. Nothing here
 * touches the network except the model itself.
 *
 * Do not "restore" Draco. It cannot work here.
 */
function useBayModel() {
  return useLoader(GLTFLoader, MODEL, (loader) => {
    (loader as GLTFLoader).setMeshoptDecoder(MeshoptDecoder);
  });
}

function Bay({ onReady }: { onReady: () => void }) {
  const { scene } = useBayModel();
  const gl = useThree((s) => s.gl);
  const threeScene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);

  /**
   * Image-based lighting from three's own procedural RoomEnvironment.
   *
   * Deliberately NOT drei's <Environment preset="...">: that fetches an HDRI
   * from a third-party CDN (raw.githack.com) at runtime — an undeclared
   * external dependency, a visitor-IP leak, and a hard failure under our
   * strict CSP. RoomEnvironment is generated on the GPU from geometry that
   * ships inside three, so it costs one render at mount and zero network,
   * and it is what makes the materials read as a lit clinical room rather
   * than as flat shaded boxes. Three directional lights cannot do this.
   */
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    threeScene.environment = env.texture;

    return () => {
      threeScene.environment = null;
      env.texture.dispose();
      pmrem.dispose();
    };
  }, [gl, threeScene]);

  // Shadow casting is set here rather than in the export: glTF carries no
  // per-object shadow flags, and the budget allows exactly one shadow-casting
  // light, so every mesh must opt in explicitly.
  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    onReady();
    // frameloop is "demand": without this the scene loads and never draws.
    invalidate();
  }, [scene, onReady, invalidate]);

  // Dispose GPU resources on unmount. Without this, geometries, textures and
  // the WebGL context leak, and mobile Safari kills the tab on a second
  // visit to the page.
  useEffect(() => {
    return () => {
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          if (!m) continue;
          for (const value of Object.values(m)) {
            if (value instanceof THREE.Texture) value.dispose();
          }
          m.dispose();
        }
      });
      gl.dispose();
    };
  }, [scene, gl]);

  return <primitive object={scene} />;
}

/**
 * A very slow, very small orbital drift.
 *
 * Vestibular safety is a hard rule (docs/03-3d-production-spec.md), so this
 * is deliberately below the threshold at which motion reads as motion: a few
 * degrees over a minute, easing to a stop the moment the visitor touches the
 * controls. It exists only to signal "this is live, you can move it" — a
 * completely static canvas is indistinguishable from the poster underneath
 * it, which would make the whole WebGL layer pointless.
 *
 * It never runs under reduced motion, because the capability gate in
 * lib/capability.ts refuses to mount the canvas at all in that case.
 */
function Drift({ enabled }: { enabled: React.RefObject<boolean> }) {
  const camera = useThree((s) => s.camera);

  // Orbit around the look-at point, not around the world origin. Orbiting
  // the origin swings the camera through the room's corner, because the bay
  // is built in positive-x space with the origin outside the framing.
  const { radius, base, height } = useMemo(() => {
    const [tx, ty, tz] = CAMERA_TARGET;
    const dx = camera.position.x - tx;
    const dz = camera.position.z - tz;
    return {
      radius: Math.hypot(dx, dz),
      base: Math.atan2(dx, dz),
      height: camera.position.y - ty,
    };
  }, [camera]);

  const t = useRef(0);

  useFrame((_, delta) => {
    if (!enabled.current) return;
    t.current += delta * 0.03;
    const a = base + Math.sin(t.current) * 0.05; // ~3 degrees either side
    const [tx, ty, tz] = CAMERA_TARGET;
    camera.position.set(
      tx + Math.sin(a) * radius,
      ty + height,
      tz + Math.cos(a) * radius,
    );
    camera.lookAt(tx, ty, tz);
  });

  return null;
}

export default function HeroScene({ onReady }: { onReady: () => void }) {
  // Drift stops permanently on first interaction. A camera that resumes
  // moving after the visitor let go feels broken, not alive.
  const drifting = useRef(true);

  return (
    <Canvas
      // dpr capped at 2: retina phones otherwise render at 3x and drop frames.
      dpr={[1, 2]}
      // "demand" renders only when something changes — a large power and
      // thermal saving. Drift calls invalidate() through useFrame, so the
      // loop still runs while it is active and stops dead when it is not.
      frameloop="demand"
      shadows="soft"
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: true,
      }}
      // 40mm-equivalent at standing eye height — a natural clinical
      // viewpoint. Wide-angle reads as amateur (docs/03-3d-production-spec.md).
      camera={{ fov: CAMERA_FOV, position: CAMERA_POSITION }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        // Tuned against the poster by eye, not guessed: real-time shading
        // with an environment map and no global illumination reads brighter
        // and flatter than the path-traced still, so at 1.0 the canvas
        // fading in over it was a visible jump in brightness. Pulling
        // exposure down lands the two close enough that the cross-fade
        // reads as the image coming alive rather than as a swap.
        gl.toneMappingExposure = 0.82;
      }}
    >
      <Suspense fallback={null}>
        <Bay onReady={onReady} />
        <Drift enabled={drifting} />
      </Suspense>

      {/* Exactly one shadow-casting light — the budget allows no more. The
          ambient fill comes from the environment map, not from lights. */}
      <directionalLight
        position={[3, 6, 2]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <ambientLight intensity={0.15} />

      <OrbitControls
        // The user moves the camera or it holds still. No involuntary
        // motion beyond the drift above — vestibular safety is a hard rule
        // here, not a preference.
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.9}
        rotateSpeed={0.4}
        target={CAMERA_TARGET}
        onStart={() => {
          drifting.current = false;
        }}
      />
    </Canvas>
  );
}
