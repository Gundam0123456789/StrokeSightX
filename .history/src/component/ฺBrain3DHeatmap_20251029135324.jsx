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

// ===== Model with heatmap coloring =====
function HeatmapBrain({ plane, offset, heatmapIntensity = 1.0 }) {
  // load same brain model
  const { scene } = useGLTF("/models/brain.glb");

  // slicing planes like BrainViewer
  const clippingPlanes = useMemo(() => {
    switch (plane) {
      case "sagittal":
        return [new THREE.Plane(new THREE.Vector3(1, 0, 0), offset)];
      case "coronal":
        return [new THREE.Plane(new THREE.Vector3(0, 0, 1), offset)];
      case "horizontal":
        return [new THREE.Plane(new THREE.Vector3(0, -1, 0), offset)];
      default:
        return [];
    }
  }, [plane, offset]);

  // clone + apply heatmap material
  const paintedBrain = useMemo(() => {
    const root = scene.clone(true);

    root.traverse((child) => {
      if (child.isMesh) {
        // make sure we don't mutate original gltf
        const mat = child.material.clone();

        // base PBR look
        mat.metalness = 0.2;
        mat.roughness = 0.4;
        mat.side = THREE.DoubleSide;
        mat.transparent = false;
        mat.opacity = 1;

        // clipping
        mat.clippingPlanes = clippingPlanes;
        mat.clipShadows = true;

        // --- HEATMAP COLOR LOGIC ---
        // for now we'll tint the material toward "hot" color (e.g. orange/red)
        // you can later replace this with your per-vertex or texture data.
        // heatmapIntensity (0 → normal gray, 1 → strong orange)
        const coolColor = new THREE.Color("#d9d9d9"); // light gray
        const hotColor = new THREE.Color("#ff6b00");  // orange-ish

        // lerp between cool and hot
        const finalColor = coolColor.lerp(hotColor, heatmapIntensity);

        mat.color = finalColor;

        child.material = mat;
      }
    });

    return root;
  }, [scene, clippingPlanes, heatmapIntensity]);

  return <primitive object={paintedBrain} scale={1.2} />;
}

// ===== Main Viewer with reset, background, controls =====
export default function Brain3DHeatmap({ plane, offset, heatmapIntensity }) {
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  // remember the starting camera + target
  const [initialView] = useState(() => ({
    camPos: new THREE.Vector3(2, 2, 2),
    target: new THREE.Vector3(0, 0, 0),
  }));

  // configure OrbitControls just like BrainViewer
  useEffect(() => {
    if (!controlsRef.current) return;

    controlsRef.current.enablePan = true;
    controlsRef.current.enableRotate = true;
    controlsRef.current.enableZoom = true;

    controlsRef.current.minDistance = 1.5;
    controlsRef.current.maxDistance = 5;

    // left drag → pan
    // middle drag → rotate
    // right drag → zoom
    controlsRef.current.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.DOLLY,
    };
  }, []);

  // reset camera + target
  const handleReset = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current) return;

    cameraRef.current.position.copy(initialView.camPos);
    controlsRef.current.target.copy(initialView.target);
    controlsRef.current.update();
  }, [initialView]);

  return (
    <>
      {/* SAME fullscreen dotted background */}
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

      {/* the 3D view space */}
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
            {/* lights (same lighting profile) */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <directionalLight position={[-5, -5, -2]} intensity={0.4} />

            {/* brain with heatmap tint */}
            <HeatmapBrain
              plane={plane}
              offset={offset}
              heatmapIntensity={heatmapIntensity ?? 1.0}
            />

            <OrbitControls ref={controlsRef} />
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
