  //Brain3DHeatmap.jsx
  import React, { Suspense, useMemo, useRef, useEffect, useCallback, useState } from "react";
  import { Canvas } from "@react-three/fiber";
  import { OrbitControls, useGLTF } from "@react-three/drei";
  import * as THREE from "three";

  function BrainModel({ plane, offset }) {
    const { scene } = useGLTF("/models/brain.glb");

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

    const brain = useMemo(() => {
      const cloned = scene.clone(true);

      cloned.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.clippingPlanes = clippingPlanes;
          child.material.clipShadows = true;
          child.material.side = THREE.DoubleSide;
          child.material.transparent = false;
          child.material.opacity = 1;
          child.material.metalness = 0.2;
          child.material.roughness = 0.4;
        }
      });

      return cloned;
    }, [scene, clippingPlanes]);

    return <primitive object={brain} scale={1.2} />;
  }

  export default function BrainViewer({ plane, offset }) {
    const controlsRef = useRef(null);
    const cameraRef = useRef(null);

    const [initialView] = useState(() => ({
      camPos: new THREE.Vector3(2, 2, 2),
      target: new THREE.Vector3(0, 0, 0),
    }));

    useEffect(() => {
      if (!controlsRef.current) return;

      controlsRef.current.enablePan = true;
      controlsRef.current.enableRotate = true;
      controlsRef.current.enableZoom = true;
      controlsRef.current.minDistance = 1.5;
      controlsRef.current.maxDistance = 5;

      controlsRef.current.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.ROTATE,
        RIGHT: THREE.MOUSE.DOLLY,
      };
    }, []);

    const handleReset = useCallback(() => {
      if (!controlsRef.current || !cameraRef.current) return;
      cameraRef.current.position.copy(initialView.camPos);
      controlsRef.current.target.copy(initialView.target);
      controlsRef.current.update();
    }, [initialView]);

    return (
      <>
        {/* Background */}
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

        {/* Brain Canvas */}
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
            onCreated={({ camera }) => (cameraRef.current = camera)}
            gl={{ localClippingEnabled: true }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} />
              <directionalLight position={[-5, -5, -2]} intensity={0.4} />
              <BrainModel plane={plane} offset={offset} />
              <OrbitControls ref={controlsRef} />
            </Suspense>
          </Canvas>

          {/* Reset View Button */}
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
