import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function BrainModel({ plane, offset }) {
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
        return [new THREE.Plane(new THREE.Vector3(0, -1, 0), offset)];
      default:
        return [];
    }
  }, [plane, offset]);

  // clone scene แล้วอัด material ที่มี clippingPlanes
  const brain = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child.isMesh) {
        // ทำ material ส่วนตัว ไม่ไปแก้ของ original
        child.material = child.material.clone();

        // ใส่ clipping
        child.material.clippingPlanes = clippingPlanes;
        child.material.clipShadows = true;

        // ให้เห็นผิวตัดชัดขึ้น (กันโปร่ง)
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
  return (
    <div
      style={{
        width: "100%",
        height: "70vh",
        background: "#0f172a",
        borderRadius: "1rem",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [2, 2, 2], fov: 45 }}
        gl={{ localClippingEnabled: true }}
      >
        <Suspense fallback={null}>
          {/* แสง */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-5, -5, -2]} intensity={0.4} />

          {/* โมเดลสมองพร้อม slice */}
          <BrainModel plane={plane} offset={offset} />

          {/* หมุน/ซูม */}
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
