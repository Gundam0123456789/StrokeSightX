// BrainScene.jsx
import React, { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// --------- เนื้อหาแต่ละส่วน ----------
const PARTS = {
  Frontal: {
    title: "Cerebral cortex: Prefrontal cortex",
    desc:
      "Prefrontal cortex อยู่ที่กลีบหน้า มีบทบาทด้าน executive functions, การตัดสินใจ, บุคลิกภาพ และการเชื่อมโยงประสบการณ์เพื่อการคิดเชิงนามธรรม",
    url: "/models/Front.glb",
  },
  Parietal: {
    title: "Parietal lobe",
    desc: "ประมวลผลความรู้สึกจากผิวหนัง การรับรู้ตำแหน่งอวัยวะ (proprioception) และการบูรณาการหลาย modality",
    url: "/models/Parietal.glb",
  },
  Temporal: {
    title: "Temporal lobe",
    desc: "เกี่ยวข้องกับการได้ยิน ภาษา และความจำ (hippocampus อยู่บริเวณนี้)",
    url: "/models/Temporal.glb",
  },
  Occipital: {
    title: "Occipital lobe",
    desc: "ศูนย์ประมวลผลการมองเห็นหลัก (V1–V5) ความเสียหายทำให้เกิด cortical blindness/visual agnosia",
    url: "/models/Occipital.glb",
  },
  Cerebellum: {
    title: "Cerebellum",
    desc: "การทรงตัวและการประสานการเคลื่อนไหว; lesion ทำให้ ataxia, dysmetria",
    url: "/models/Cerebellum.glb",
  },
};

// --------- 3D Part (โหลดไฟล์ glb + hover + click) ----------
function BrainPart({ partKey, onSelect }) {
  const { url } = PARTS[partKey];
  const { scene } = useGLTF(url);
  const [hovered, setHovered] = useState(false);

  // วัสดุพื้นฐาน + เปลี่ยนค่าสีเมื่อ hover
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: hovered ? "#f4d06f" : "#d5c0b2", // << เปลี่ยนสีตอน hover
        roughness: 0.45,
        metalness: 0.2,
      }),
    [hovered]
  );

  const part = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((ch) => {
      if (ch.isMesh) ch.material = material.clone();
    });
    return c;
  }, [scene, material]);

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
        onSelect(partKey);
      }}
    >
      <primitive object={part} />
    </group>
  );
}

// --------- Side Panel ----------
function InfoPanel({ selectedKey, onClose }) {
  if (!selectedKey) return null;
  const { title, desc } = PARTS[selectedKey];

  return (
    <div style={panelWrap}>
      <div style={panelCard}>
        <div style={panelHeader}>
          <h1 style={{ margin: 0, lineHeight: 1.1 }}>{title}</h1>
          <button onClick={onClose} style={closeBtn}>⌃</button>
        </div>
        <p style={panelText}>{desc}</p>
        <button onClick={onClose} style={backBtn}>← Back to the brain</button>
      </div>
    </div>
  );
}

// --------- Scene หลัก ----------
export default function BrainScene() {
  const [selectedKey, setSelectedKey] = useState(null);

  return (
    <>
      <Canvas
        camera={{ position: [2.2, 1.8, 2.2], fov: 45 }}
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", background: "#c9ccce" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 6, 5]} intensity={1.2} />
          <directionalLight position={[-5, -3, -2]} intensity={0.5} />

          {/* วางทั้ง 5 ชิ้น (ไฟล์ต้อง align มาจาก Blender แล้ว) */}
          <group position={[0, 0, 0]} scale={1}>
            {Object.keys(PARTS).map((k) => (
              <BrainPart
                key={k}
                partKey={k}
                onSelect={setSelectedKey}
              />
            ))}
          </group>

          <OrbitControls enablePan enableRotate enableZoom minDistance={1.2} maxDistance={6} />
        </Suspense>
      </Canvas>

      {/* แผงข้อมูลซ้ายมือ */}
      <InfoPanel selectedKey={selectedKey} onClose={() => setSelectedKey(null)} />
    </>
  );
}

// --------- styles ----------
const panelWrap = {
  position: "fixed",
  left: 20,
  top: 20,
  bottom: 20,
  width: 540,
  pointerEvents: "none",
};

const panelCard = {
  marginTop: "20vw",
  height: "20vw",
  background: "rgba(255,255,255,0.9)",
  borderRadius: 14,
  padding: 24,
  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
  overflow: "auto",
  pointerEvents: "auto",
};

const panelHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const panelText = { fontSize: 16, lineHeight: 1.5, marginTop: 8 };

const backBtn = {
  marginTop: 16,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #cfd3d7",
  background: "#f5f6f7",
  cursor: "pointer",
};

const closeBtn = {
  border: "none",
  background: "#efefef",
  width: 32,
  height: 32,
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 700,
};
