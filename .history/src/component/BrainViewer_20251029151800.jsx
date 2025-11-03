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

function BrainModel({ plane, offset }) {
  const { scene } = useGLTF("/models/brain.glb");

  // สร้าง clipping plane สำหรับการ slice สมอง
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

  // clone scene เพื่อใส่ material ใหม่ที่รองรับ clipping
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

  // จำตำแหน่งกล้องเริ่มต้น
  const [initialView] = useState(() => ({
    camPos: new THREE.Vector3(2, 2, 2),
    target: new THREE.Vector3(0, 0, 0),
  }));

  useEffect(() => {
    if (!controlsRef.current) return;

    controlsRef.current.enablePan = true;
    controlsRef.current.enableRotate = true;
    controlsRef.current.enableZoom = true;

    // จำกัดระยะซูม
    controlsRef.current.minDistance = 0.8;
    controlsRef.current.maxDistance = 6;

    // ✅ Fix: ปรับปุ่มเมาส์ให้ intuitive
    // ซ้าย = หมุน, ขวา = ลาก, scroll = ซูม
    controlsRef.current.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.PAN,
    };

    // รองรับ touch (มือถือ)
    controlsRef.current.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    // กันไม่ให้หมุนกลับหัว
    controlsRef.current.minPolarAngle = 0.3;
    controlsRef.current.maxPolarAngle = Math.PI - 0.3;
  }, []);

  // ปุ่ม reset มุมมอง
  const handleReset = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current) return;
    cameraRef.current.position.copy(initialView.camPos);
    controlsRef.current.target.copy(initialView.target);
    controlsRef.current.update();
  }, [initialView]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundAttachment
        overflow: "visible",
        borderRadius: 0,
        boxShadow: "none",
        pointerEvents: "auto",
      }}
    >
      <Canvas
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          backgroundColor: "transparent",
          pointerEvents: "auto",
        }}
        camera={{ position: [2, 2, 2], fov: 45 }}
        onCreated={({ camera, gl }) => {
          cameraRef.current = camera;
          gl.setClearColor(0x000000, 0); // ทำให้โปร่งใสจริง
        }}
        gl={{ localClippingEnabled: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* แสง */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-5, -5, -2]} intensity={0.4} />

          {/* โมเดลสมอง */}
          <BrainModel plane={plane} offset={offset} />

          {/* ควบคุมการหมุน / ซูม / แพน */}
          <OrbitControls ref={controlsRef} />
        </Suspense>
      </Canvas>

      {/* ปุ่ม Reset View */}
      <button
        onClick={handleReset}
        style={{
          position: "absolute",
          bottom: "-2.5rem",
          right: "0",
          backgroundColor: "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: "999px",
          padding: "0.6rem 1rem",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          userSelect: "none",
        }}
      >
        Reset View
      </button>
    </div>
  );
}
