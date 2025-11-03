import React, { Suspense, useMemo, useRef, useEffect, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function BrainModel({ plane, offset }) {
  const { scene } = useGLTF("/models/brain.glb");
  const clippingPlanes = useMemo(() => {
    switch (plane) {
      case "sagittal": return [new THREE.Plane(new THREE.Vector3(1, 0, 0), offset)];
      case "coronal": return [new THREE.Plane(new THREE.Vector3(0, 0, 1), offset)];
      case "horizontal": return [new THREE.Plane(new THREE.Vector3(0, -1, 0), offset)];
      default: return [];
    }
  }, [plane, offset]);

  const brain = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material.clone();
        mat.clippingPlanes = clippingPlanes;
        mat.side = THREE.DoubleSide;
        mat.metalness = 0.2;
        mat.roughness = 0.4;
        child.material = mat;
      }
    });
    return cloned;
  }, [scene, clippingPlanes]);

  return <primitive object={brain} scale={1.2} />;
}

export default function BrainViewer({ plane, offset }) {
  const controlsRef = useRef();
  const cameraRef = useRef();

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.minDistance = 1.5;
    controlsRef.current.maxDistance = 5;
  }, []);

  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,             // ✅ brain behind everything
        backgroundColor: "#0f172a",
      }}
      camera={{ position: [2, 2, 2], fov: 45 }}
      onCreated={({ camera }) => (cameraRef.current = camera)}
      gl={{ localClippingEnabled: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -5, -2]} intensity={0.4} />
        <BrainModel plane={plane} offset={offset} />
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableRotate={true}
          enableZoom={true}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            RIGHT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
          }}
        />
      </Suspense>
    </Canvas>
  );
}
