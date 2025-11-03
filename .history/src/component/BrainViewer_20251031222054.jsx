// BrainViewer.jsx (ส่วนที่อยู่ภายใน <Canvas>)
// เพิ่มชิ้นสมองที่คลิกได้ + แสดงข้อความเมื่อเลือก

import React, { Suspense, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

// ----- คำอธิบายแต่ละส่วน (แก้ข้อความได้ตามต้องการ) -----
const PART_INFO = {
  Frontal: "Frontal lobe: การวางแผน การตัดสินใจ บุคลิกภาพ การเคลื่อนไหว",
  Parietal: "Parietal lobe: การรับความรู้สึกผิวหนัง การรับรู้ตำแหน่งอวัยวะ",
  Temporal: "Temporal lobe: การได้ยิน ภาษา ความจำ",
  Occipital: "Occipital lobe: การมองเห็น (visual processing)",
  Cerebellum: "Cerebellum: การทรงตัว การประสานการเคลื่อนไหว",
};

// ----- คอมโพเนนต์สำหรับโหลด 1 ส่วน และรองรับคลิก/โฮเวอร์ -----
function BrainPart({ url, name, color = "#ffffff", selected, onSelect }) {
  const { scene } = useGLTF(url);

  // ปรับเมททีเรียลเพื่อให้เปลี่ยนสีตอน hover/selected
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.2,
      roughness: 0.5,
    });
    return m;
  }, [color]);

  // ทำสำเนาซีนแล้วอัดเมททีเรียลเดียวกันให้ทุก mesh
  const part = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = material.clone();
      }
    });
    return cloned;
  }, [scene, material]);

  // ไฮไลต์ถ้า selected/hover
  const [hovered, setHovered] = useState(false);
  const finalColor = hovered || selected ? "#ffd54f" : color;
  useMemo(() => {
    part.traverse((child) => {
      if (child.isMesh) child.material.color.set(finalColor);
    });
  }, [part, finalColor]);

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(name);
      }}
    >
      <primitive object={part} />
      {/* ป้ายชื่อเล็ก ๆ ลอยเหนือชิ้น (เอาออกได้) */}
      {hovered && (
        <Html center distanceFactor={10}>
          <div
            style={{
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 8,
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function BrainViewerClickable() {
  const [selectedPart, setSelectedPart] = useState(null);

  return (
    <>
      <Canvas
        camera={{ position: [2.2, 1.8, 2.2], fov: 45 }}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          background: "#bfc3c5",
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-5, -3, -2]} intensity={0.5} />

          {/* โหลด 5 ส่วน (ตั้งตำแหน่ง/scale เท่าเดิมทั้งหมด) */}
          <group position={[0, 0, 0]} scale={1.0}>
            <BrainPart
              url="/models/Frontal.glb"
              name="Frontal"
              selected={selectedPart === "Frontal"}
              onSelect={setSelectedPart}
            />
            <BrainPart
              url="/models/Parietal.glb"
              name="Parietal"
              selected={selectedPart === "Parietal"}
              onSelect={setSelectedPart}
            />
            <BrainPart
              url="/models/Temporal.glb"
              name="Temporal"
              selected={selectedPart === "Temporal"}
              onSelect={setSelectedPart}
            />
            <BrainPart
              url="/models/Occipital.glb"
              name="Occipital"
              selected={selectedPart === "Occipital"}
              onSelect={setSelectedPart}
            />
            <BrainPart
              url="/models/Cerebellum.glb"
              name="Cerebellum"
              selected={selectedPart === "Cerebellum"}
              onSelect={setSelectedPart}
            />
          </group>

          <OrbitControls
            enablePan
            enableRotate
            enableZoom
            minDistance={1.2}
            maxDistance={6}
            mouseButtons={{
              LEFT: 0, // ROTATE
              MIDDLE: 1, // DOLLY
              RIGHT: 2, // PAN
            }}
          />
        </Suspense>
      </Canvas>

      {/* แผงข้อความอธิบายส่วนที่ถูกคลิก */}
      <div
        style={{
          position: "fixed",
          left: 16,
          bottom: 16,
          maxWidth: 380,
          padding: "12px 14px",
          background: "rgba(15,23,42,0.7)",
          color: "#fff",
          borderRadius: 12,
          backdropFilter: "blur(6px)",
          lineHeight: 1.5,
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          {selectedPart ? selectedPart : "คลิกเลือกส่วนของสมอง"}
        </div>
        <div style={{ opacity: 0.9, fontSize: 14 }}>
          {selectedPart ? PART_INFO[selectedPart] : "แตะบนโมเดลเพื่อดูคำอธิบาย"}
        </div>
      </div>
    </>
  );
}
