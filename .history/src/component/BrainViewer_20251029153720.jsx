<<<<<<< HEAD
import React, { Suspense, useMemo, useRef, useEffect } from "react";
=======
import React, { Suspense, useMemo } from "react";
>>>>>>> 289b50826ec1da243405f51f8fc0149e15c0ef6d
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function BrainModel({ plane, offset }) {
<<<<<<< HEAD
  const { scene } = useGLTF("/models/brain.glb");

  const clippingPlanes = useMemo(() => {
    switch (plane) {
      case "sagittal":
        return [new THREE.Plane(new THREE.Vector3(1, 0, 0), offset)];
      case "coronal":
        return [new THREE.Plane(new THREE.Vector3(0, 0, 1), offset)];
      case "horizontal":
=======
  // โหลดโมเดลจาก public/models/brain.glb
  const { scene } = useGLTF("/models/brain.glb");

  // กำหนด clipping plane ตามประเภท slice + ระยะ offset
  // หมายเหตุ: THREE.Plane(normal, constant)
  // จุดสำคัญ: constant คือระยะการเลื่อนระนาบตัด
  const clippingPlanes = useMemo(() => {
    switch (plane) {
      case "sagittal":
        // ตัดซ้าย-ขวา (แกน X)
        // normal (1,0,0) หมายถึงตัดจากซ้ายไปขวา
        return [new THREE.Plane(new THREE.Vector3(1, 0, 0), offset)];
      case "coronal":
        // ตัดหน้า-หลัง (แกน Z)
        // normal (0,0,1) หมายถึงตัดจากหน้าไปหลัง
        return [new THREE.Plane(new THREE.Vector3(0, 0, 1), offset)];
      case "horizontal":
        // ตัดบน-ล่าง (แกน Y)
        // normal (0,-1,0) เพื่อให้ offset เป็นไปในทิศที่ intuitive (เลื่อนขึ้นดูข้างใน)
>>>>>>> 289b50826ec1da243405f51f8fc0149e15c0ef6d
        return [new THREE.Plane(new THREE.Vector3(0, -1, 0), offset)];
      default:
        return [];
    }
  }, [plane, offset]);

<<<<<<< HEAD
=======
  // clone scene แล้วอัด material ที่มี clippingPlanes
>>>>>>> 289b50826ec1da243405f51f8fc0149e15c0ef6d
  const brain = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child.isMesh) {
<<<<<<< HEAD
        child.material = child.material.clone();
        child.material.clippingPlanes = clippingPlanes;
        child.material.clipShadows = true;
=======
        // ทำ material ส่วนตัว ไม่ไปแก้ของ original
        child.material = child.material.clone();

        // ใส่ clipping
        child.material.clippingPlanes = clippingPlanes;
        child.material.clipShadows = true;

        // ให้เห็นผิวตัดชัดขึ้น (กันโปร่ง)
>>>>>>> 289b50826ec1da243405f51f8fc0149e15c0ef6d
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

  // ref to the OrbitControls instance
  const controlsRef = useRef();
  const orbitRef = useRef();
  const cameraRef = useRef();
  const handleReset = () => {
    if (orbitRef.current && cameraRef.current) {
      // Reset camera position
      cameraRef.current.position.set(2, 2, 2);
      cameraRef.current.lookAt(0, 0, 0);
      // Reset orbit target
      orbitRef.current.target.set(0, 0, 0);
      orbitRef.current.update();
    }
  };
  // after the controls mount, override button mapping
  useEffect(() => {
    if (!controlsRef.current) return;

    // allow panning
    controlsRef.current.enablePan = true;

    // still allow rotation (you can set this false if you don't want rotation at all)
    controlsRef.current.enableRotate = true;

    controlsRef.current.minDistance = 1.5;
    controlsRef.current.maxDistance = 5;
    controlsRef.current.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.DOLLY, // DOLLY = zoom
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "url('./pic/DOT.png')",
        backgroundRepeat: "repeat",       // ✅ tile the texture
        backgroundSize: "512px 512px",    // ✅ controls how dense the dots look
        backgroundColor: "#B6B9BA",       // ✅ base color behind the texture
        backgroundPosition: "center",
        zIndex: -1,
      }}
    >
      <Canvas
        camera={{ position: [2, 2, 2], fov: 45 }}
        onCreated={({ camera }) => (cameraRef.current = camera)}
        gl={{ localClippingEnabled: true }}
      >
        <Suspense fallback={null}>
          {/* lights */}
        gl={{ localClippingEnabled: true }}

          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-5, -5, -2]} intensity={0.4} />

      < HEAD
          {/* brain model */}
          <BrainModel plane={plane} offset={offset} />
          <OrbitControls
            ref={orbitRef}
            enablePan={true}   // ✅ can move
            enableRotate={true}
            enableZoom={true}
            maxDistance={5}    // ✅ limit zoom out
            minDistance={1.5}    // ✅ limit zoom in
          />
          {/* orbit controls */}
          <OrbitControls ref={controlsRef} />
        </Suspense>
      </Canvas>
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

           <Suspense> 
            {/* โมเดลสมองพร้อม slice */}
            <BrainModel plane={plane} offset={offset} />

            {/* หมุน/ซูม */}
            <OrbitControls enablePan={false} />
          </Suspense>

)
}