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
// Brain model with slicing
// ---------------------------
function BrainModel({ plane, offset }) {
  // load the brain model from public/models/brain.glb
  const { scene } = useGLTF("/models/brain.glb");

  // Decide which clipping plane to apply based on props
  // plane:
  //   "sagittal"    => slice left/right  (X axis)
  //   "coronal"     => slice front/back (Z axis)
  //   "horizontal"  => slice up/down    (Y axis)
  // offset:
  //   how far the plane is from origin
  const clippingPlanes = useMemo(() => {
    switch (plane) {
      case "sagittal":
        return [new THREE.Plane(new THREE.Vector3(1, 0, 0), offset)];
      case "coronal":
        return [new THREE.Plane(new THREE.Vector3(0, 0, 1), offset)];
      case "horizontal":
        // using (0, -1, 0) so positive offset feels like "move upward"
        return [new THREE.Plane(new THREE.Vector3(0, -1, 0), offset)];
      default:
        return [];
    }
  }, [plane, offset]);

  // clone the scene and apply a custom material (so we don't mutate the original glTF materials)
  const brain = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material.clone();

        // apply clipping planes
        mat.clippingPlanes = clippingPlanes;
        mat.clipShadows = true;

        // nicer surface look
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
// Main viewer component
// ---------------------------
export default function BrainViewer({ plane, offset }) {
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  // keep initial camera + controls target so reset works
  const [initialView] = useState(() => ({
    camPos: new THREE.Vector3(2, 2, 2), // where camera starts
    target: new THREE.Vector3(0, 0, 0), // what camera looks at
  }));

  // configure OrbitControls (pan / zoom limits / custom mouse mapping)
  useEffect(() => {
    if (!controlsRef.current) return;

    // allow interactions
    controlsRef.current.enablePan = true;
    controlsRef.current.enableRotate = true;
    controlsRef.current.enableZoom = true;

    // zoom distance limits so you can't zoom into infinity or lose brain
    controlsRef.current.minDistance = 1.5;
    controlsRef.current.maxDistance = 5;

    // mouse mapping:
    //   LEFT   -> pan (drag brain around)
    //   MIDDLE -> rotate
    //   RIGHT  -> dolly (zoom)
    controlsRef.current.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.DOLLY,
    };
  }, []);

  // reset to the initial view
  const handleReset = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current) return;

    // restore camera pos
    cameraRef.current.position.copy(initialView.camPos);

    // restore controls target
    controlsRef.current.target.copy(initialView.target);

    // force OrbitControls to update after changing target
    controlsRef.current.update();
  }, [initialView]);

  return (
    <>
      {/* ---------- FULLSCREEN BACKGROUND LAYER (behind everything) ---------- */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('./pic/DOT.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "512px 512px", // adjust tile density
          backgroundColor: "#B6B9BA",
          backgroundPosition: "center",
          zIndex: -1, // behind canvas and UI
        }}
      />

      {/* ---------- BRAIN VIEWER LAYER (Canvas + button) ---------- */}
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
          // store a ref to the camera so we can reset it
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

            {/* brain model with slice */}
            <BrainModel plane={plane} offset={offset} />

            {/* orbit controls with custom behavior */}
            <OrbitControls ref={controlsRef} 
              minDistance={2} 
              maxDistance={6}
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
