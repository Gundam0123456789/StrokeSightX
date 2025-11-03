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

// ---------------------------
// Brain model with clipping
// ---------------------------
function BrainModel({ plane, offset }) {
  const { scene } = useGLTF("/models/brain.glb");

  // choose which plane to clip with
  const clippingPlanes = useMemo(() => {
    switch (plane) {
      case "sagittal":
        // cut left/right along X
        return [new THREE.Plane(new THREE.Vector3(1, 0, 0), offset)];
      case "coronal":
        // cut front/back along Z
        return [new THREE.Plane(new THREE.Vector3(0, 0, 1), offset)];
      case "horizontal":
        // cut top/bottom along Y
        // using (0,-1,0) so positive offset feels like moving "up"
        return [new THREE.Plane(new THREE.Vector3(0, -1, 0), offset)];
      default:
        return [];
    }
  }, [plane, offset]);

  // clone the glTF scene and apply our own materials
  const brain = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material.clone();

        // clipping
        mat.clippingPlanes = clippingPlanes;
        mat.clipShadows = true;

        // surface style
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

// ---------------------------
// Main Viewer
// ---------------------------
export default function BrainViewer({ plane, offset }) {
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  // remember initial camera + target so we can reset
  const [initialView] = useState(() => ({
    camPos: new THREE.Vector3(2, 2, 2),
    target: new THREE.Vector3(0, 0, 0),
  }));

  // setup OrbitControls after mount (safety)
  useEffect(() => {
    if (!controlsRef.current) return;

    // allow basic interactions
    controlsRef.current.enablePan = true;
    controlsRef.current.enableRotate = true;
    controlsRef.current.enableZoom = true;

    // limit zoom so the model doesn't disappear
    controlsRef.current.minDistance = 1.5;
    controlsRef.current.maxDistance = 5;
  }, []);

  // reset button handler
  const handleReset = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current) return;

    // move camera back
    cameraRef.current.position.copy(initialView.camPos);

    // reset OrbitControls target
    controlsRef.current.target.copy(initialView.target);

    // update controls so it applies immediately
    controlsRef.current.update();
  }, [initialView]);

  return (
    <>
      {/* BACKGROUND behind everything */}
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

      {/* FOREGROUND viewer layer */}
      <div
        style={{
          position: "relative",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
          overflow: "hidden",
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

            {/* brain model */}
            <BrainModel plane={plane} offset={offset} />

            {/* orbit controls */}
            <OrbitControls
              ref={controlsRef}
              enablePan={true}
              enableRotate={true}
              enableZoom={true}
              minDistance={1.5}
              maxDistance={5}
              mouseButtons={{
                LEFT: THREE.MOUSE.ROTATE, // left drag = spin
                RIGHT: THREE.MOUSE.PAN,   // right drag = drag/move
                MIDDLE: THREE.MOUSE.DOLLY // middle drag = zoom
              }}
            />
          </Suspense>
        </Canvas>

        {/* reset button */}
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
