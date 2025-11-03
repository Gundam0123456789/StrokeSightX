import React, {
  Suspense,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ------------- Brain mesh with clipping -------------
function BrainModel({ plane, offset }) {
  // load the model from public/models/brain.glb
  const { scene } = useGLTF("/models/brain.glb");

  // decide which clipping plane to use
  // plane:
  //  - sagittal     (slice along X)
  //  - coronal      (slice along Z)
  //  - horizontal   (slice along Y)
  const clippingPlanes = useMemo(() => {
    switch (plane) {
      case "sagittal":
        // cut left-right
        return [new THREE.Plane(new THREE.Vector3(1, 0, 0), offset)];
      case "coronal":
        // cut front-back
        return [new THREE.Plane(new THREE.Vector3(0, 0, 1), offset)];
      case "horizontal":
        // cut top-bottom
        // note (0,-1,0) so positive offset feels like slicing upward
        return [new THREE.Plane(new THREE.Vector3(0, -1, 0), offset)];
      default:
        return [];
    }
  }, [plane, offset]);

  // clone scene and apply material overrides so we don't mutate original GLTF materials
  const brain = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material.clone();

        // apply slicing
        mat.clippingPlanes = clippingPlanes;
        mat.clipShadows = true;

        // visual tweaks
        mat.side = THREE.DoubleSide;
        mat.transparent = false;
        mat.opacity = 1;
        mat.metalness = 0.2;
        mat.roughness = 0.4;

        child.material = mat;
      }
    });

    return cloned;
  }, [scene, clippingPlanes]);

  return <primitive object={brain} scale={1.2} />;
}

// ------------- Main Viewer -------------
export default function BrainViewer({ plane, offset }) {
  // refs to control camera and orbit
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  // store the initial camera position / target so reset works
  const [initialView] = useState(() => ({
    camPos: new THREE.Vector3(2, 2, 2),
    target: new THREE.Vector3(0, 0, 0),
  }));

  // optional: configure extra things after mount
  useEffect(() => {
    if (!controlsRef.current) return;

    controlsRef.current.enablePan = true;
    controlsRef.current.enableRotate = true;
    controlsRef.current.enableZoom = true;

    // limit zoom distance so it doesn't fly away or inside too deep
    controlsRef.current.minDistance = 1.5;
    controlsRef.current.maxDistance = 5;
  }, []);

  // Reset View button handler
  const handleReset = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current) return;

    // move camera back to start
    cameraRef.current.position.copy(initialView.camPos);

    // reset what the camera is looking at
    controlsRef.current.target.copy(initialView.target);

    // update OrbitControls so it uses new target right now
    controlsRef.current.update();
  }, [initialView]);

  return (
    <>
      {/* Background layer behind everything */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('./pic/DOT.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "512px 512px",
          backgroundColor: "#B6B9BA",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      />

      {/* Foreground layer that actually holds the Canvas and button */}
      <div
        style={{
          position: "relative",
          inset: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <Canvas
          camera={{ position: [2, 2, 2], fov: 45 }}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
          }}
          gl={{ localClippingEnabled: true }}
        >
          <Suspense fallback={null}>
            {/* lights */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <directionalLight position={[-5, -5, -2]} intensity={0.4} />

            {/* the brain model with slicing */}
            <BrainModel plane={plane} offset={offset} />

            {/* OrbitControls (ONE TIME ONLY) */}
            <OrbitControls
              ref={controlsRef}
              enablePan={true}
              enableRotate={true}
              enableZoom={true}
              minDistance={1.5}
              maxDistance={5}
              mouseButtons={{
                LEFT: THREE.MOUSE.ROTATE,   // left drag = spin
                RIGHT: THREE.MOUSE.PAN,     // right drag = move
                MIDDLE: THREE.MOUSE.DOLLY,  // middle drag = zoom
              }}
            />
          </Suspense>
        </Canvas>

        {/* Reset View button */}
        <button
          onClick={handleReset}
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "0.7rem 1.1rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          Reset View
        </button>
      </div>
    </>
  );
}
