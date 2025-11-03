import React, {
  Suspense,
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/** โหลดสมองแต่ละส่วน */
function BrainPart({ url, position = [0, 0, 0], plane, offset }) {
  const { scene } = useGLTF(url);

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

  const mesh = useMemo(() => {
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

  return <primitive object={mesh} scale={1.2} position={position} />;
}

/** viewer หลัก */
export default function BrainViewer({ plane, offset }) {
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  const [initialView] = useState(() => ({
    camPos: new THREE.Vector3(2, 2, 2),
    target: new THREE.Vector3(0, 0, 0),
  }));

  const handleResetView = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current) return;
    cameraRef.current.position.copy(initialView.camPos);
    controlsRef.current.target.copy(initialView.target);
    controlsRef.current.update();
  }, [initialView]);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.enableRotate = true;
    controlsRef.current.enablePan = true;
    controlsRef.current.enableZoom = true;
    controlsRef.current.minDistance = 1.5;
    controlsRef.current.maxDistance = 5;
  }, []);

  return (
    <>
      <Canvas
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          backgroundImage: "url('./pic/DOT.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "512px 512px",
          backgroundColor: "#B6B9BA",
          backgroundPosition: "center",
        }}
        camera={{ position: [2, 2, 2], fov: 45 }}
        onCreated={({ camera }) => (cameraRef.current = camera)}
        gl={{ localClippingEnabled: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -5, -2]} intensity={0.4} />

        <Suspense fallback={null}>
          <BrainPart url="/models/Front.glb"  plane={plane} offset={offset} />
          <BrainPart url="/models/Parietal.glb" plane={plane} offset={offset} />
          <BrainPart url="/models/Temporal.glb" plane={plane} offset={offset} />
          <BrainPart url="/models/Occiptal.glb" plane={plane} offset={offset} />
          <BrainPart url="/models/Cerebellum.glb" plane={plane} offset={offset} /> 
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableRotate={true}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={5}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            RIGHT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
          }}
        />
      </Canvas>

      <button
        onClick={handleResetView}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 20,
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
