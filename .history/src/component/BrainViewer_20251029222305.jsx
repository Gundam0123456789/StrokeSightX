import React, {
  Suspense,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ========== Brain mesh with clipping ==========
function BrainModel({ plane, offset }) {
  const { scene } = useGLTF("/models/brain.glb");

  // choose clipping plane
  const clippingPlanes = useMemo(() => {
    switch (plane) {
      case "sagittal":
        // slice along X (left-right cut)
        return [new THREE.Plane(new THREE.Vector3(1, 0, 0), offset)];
      case "coronal":
        // slice along Z (front-back cut)
        return [new THREE.Plane(new THREE.Vector3(0, 0, 1), offset)];
      case "horizontal":
        // slice along Y (top-bottom cut)
        return [new THREE.Plane(new THREE.Vector3(0, -1, 0), offset)];
      default:
        return [];
    }
  }, [plane, offset]);

  // clone + apply material overrides so we don't mutate original glb
  const brain = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material.clone();

        mat.clippingPlanes = clippingPlanes;
        mat.clipShadows = true;

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


// ========== Fullscreen background viewer ==========
export default function BrainViewer({ plane, offset }) {
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  // keep a snapshot of initial camera + target
  const [initialView] = useState(() => ({
    camPos: new THREE.Vector3(2, 2, 2),
    target: new THREE.Vector3(0, 0, 0),
  }));

  // configure zoom limits etc after controls mount
  useEffect(() => {
    if (!controlsRef.current) return;

    // allow all 3 interactions
    controlsRef.current.enableRotate = true; // spin
    controlsRef.current.enablePan = true;    // drag / move
    controlsRef.current.enableZoom = true;   // zoom

    // zoom limit so it won't explode or disappear
    controlsRef.current.minDistance = 1.5;
    controlsRef.current.maxDistance = 5;
  }, []);

  // reset camera helper (if you still want a reset button in overlay UI later)
  const handleResetView = () => {
    if (!controlsRef.current || !cameraRef.current) return;
    cameraRef.current.position.copy(initialView.camPos);
    controlsRef.current.target.copy(initialView.target);
    controlsRef.current.update();
  };

  return (
    <>
      {/* the 3D brain as FULL BACKGROUND */}
      <Canvas
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1, // behind UI
          backgroundColor: "#0f172a",
          backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0) 60%)",
          backgroundSize: "cover",
        }}
        camera={{ position: [2, 2, 2], fov: 45 }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
        gl={{ localClippingEnabled: true }}
      >
        <Suspense fallback={null}>
          {/* lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-5, -5, -2]} intensity={0.4} />

          {/* brain model */}
          <BrainModel plane={plane} offset={offset} />

          {/* orbit controls with custom mouse mapping */}
          <OrbitControls
            ref={controlsRef}
            // allow all interactions
            enablePan={true}
            enableRotate={true}
            enableZoom={true}
            minDistance={1.5}
            maxDistance={5}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,   // left drag => spin
              RIGHT: THREE.MOUSE.PAN,     // right drag => drag/move brain
              MIDDLE: THREE.MOUSE.DOLLY,  // middle drag => zoom
            }}
          />
        </Suspense>
      </Canvas>

      {/* OPTIONAL overlay button to reset view (floating on top of everything) */}
      <button
        onClick={handleResetView}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 10,
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
    </>
  );
}
