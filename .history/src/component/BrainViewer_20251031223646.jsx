// BrainScene.jsx
import React, { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// --------- เนื้อหาแต่ละส่วน (แก้ข้อความ/อ้างอิงได้ตามต้องการ) ----------
const PARTS = {
  Frontal: {
    title: "Cerebral cortex: Prefrontal cortex",
    desc:
      "Prefrontal cortex อยู่ที่กลีบหน้า มีบทบาทด้าน executive functions, การตัดสินใจ, บุคลิกภาพ และการเชื่อมโยงประสบการณ์เพื่อการคิดเชิงนามธรรม",
    refs: [
      "Snell R. Clinical Neuroanatomy. Wolters Kluwer; 2010:284-303.",
      "Grow WA. In: Haines DE, Mihailoff GA, eds. Fundamental Neuroscience for Basic and Clinical Applications. Elsevier; 2018:468–479."
    ],
    ctas: [{ label: "Depression" }, { label: "Schizophrenia" }],
    url: "/models/Front.glb",
  },
  Parietal: {
    title: "Parietal lobe",
    desc: "ประมวลผลความรู้สึกจากผิวหนัง การรับรู้ตำแหน่งอวัยวะ (proprioception) และการบูรณาการหลาย modality",
    refs: [],
    ctas: [{ label: "Neglect syndrome" }],
    url: "/models/Parietal.glb",
  },
  Temporal: {
    title: "Temporal lobe",
    desc: "เกี่ยวข้องกับการได้ยิน ภาษา และความจำ (hippocampus อยู่บริเวณนี้)",
    refs: [],
    ctas: [{ label: "Aphasia (Wernicke)" }],
    url: "/models/Temporal.glb",
  },
  Occipital: {
    title: "Occipital lobe",
    desc: "ศูนย์ประมวลผลการมองเห็นหลัก (V1–V5) ความเสียหายทำให้เกิด cortical blindness/visual agnosia",
    refs: [],
    ctas: [{ label: "Visual field defect" }],
    url: "/models/Occipital.glb",
  },
  Cerebellum: {
    title: "Cerebellum",
    desc: "การทรงตัวและการประสานการเคลื่อนไหว; lesion ทำให้ ataxia, dysmetria",
    refs: [],
    ctas: [{ label: "Ataxia" }],
    url: "/models/Cerebellum.glb",
  },
};

// --------- 3D Part (โหลดไฟล์ glb และรองรับคลิก/ไฮไลต์) ----------
function BrainPart({ partKey, selectedKey, onSelect }) {
  const { url } = PARTS[partKey];
  const { scene } = useGLTF(url);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d5c0b2",
        roughness: 0.45,
        metalness: 0.2,
      }),
    []
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
  const { title, desc, refs, ctas } = PARTS[selectedKey];

  return (
    <div style={panelWrap}>
      <div style={panelCard}>
        <div style={panelHeader}>
          <h1 style={{ margin: 0, lineHeight: 1.1 }}>{title}</h1>
          <button onClick={onClose} style={closeBtn}>⌃</button>
        </div>
        <p style={panelText}>{desc}</p>

        {refs?.length > 0 && (
          <>
            <div style={panelSubTitle}>References</div>
            <ol style={{ marginTop: 8 }}>
              {refs.map((r, i) => (
                <li key={i} style={{ fontSize: 14, opacity: 0.85 }}>{r}</li>
              ))}
            </ol>
          </>
        )}

        <div style={{ marginTop: 16 }}>
          {ctas?.map((c, i) => (
            <button key={i} style={ctaBtn}>
              {c.label} →
            </button>
          ))}
        </div>

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

          {/* วางทั้ง 5 ชิ้นในตำแหน่ง/สเกลเดียวกัน (ไฟล์ต้อง align มาจาก Blender แล้ว) */}
          <group position={[0, 0, 0]} scale={1}>
            {Object.keys(PARTS).map((k) => (
              <BrainPart
                key={k}
                partKey={k}
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
              />
            ))}
          </group>

          <OrbitControls enablePan enableRotate enableZoom minDistance={1.2} maxDistance={6} />
        </Suspense>
      </Canvas>

      {/* แผงข้อมูลซ้ายมือ */}
      <InfoPanel selectedKey={selectedKey} onClose={() => setSelectedKey(null)} />

      {/* โลโก้/หัวเรื่องด้านบนซ้าย (ถ้าต้องการ) */}
      <div style={brand}>
        <div style={{ fontSize: 44, fontWeight: 800, color: "#6b74f7" }}>NeuroSight</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#2c2d30", opacity: 0.85 }}>StrokeSight</div>
      </div>
    </>
  );
}

// --------- styles (inline เพื่อความเร็ว) ----------
const brand = {
  position: "fixed",
  left: 24,
  top: 16,
  userSelect: "none",
};

const panelWrap = {
  position: "fixed",
  left: 20,
  top: 20,
  bottom: 20,
  width: 540,
  pointerEvents: "none",
};

const panelCard = {
  height: "100%",
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

const panelSubTitle = { marginTop: 16, fontWeight: 700, opacity: 0.85 };

const ctaBtn = {
  display: "block",
  width: "100%",
  textAlign: "left",
  marginTop: 10,
  padding: "12px 16px",
  borderRadius: 999,
  border: "none",
  background: "#4b3428",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

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
