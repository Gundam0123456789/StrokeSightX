// BrainAtlasEmbed.jsx
import React, { useMemo, useState, useEffect } from "react";
import BrainViewer from "./BrainViewer/BrainViewer.jsx";


export default function Brain() {
  const options = useMemo(() => [
    { label: "Medulla oblongata", hash: "brain-stem:-medulla-oblongata" },
    { label: "Pons", hash: "brain-stem:-pons" },
    { label: "Midbrain", hash: "brain-stem:-midbrain" },
    { label: "Thalamus", hash: "diencephalon:-thalamus" },
    { label: "Postcentral gyrus", hash: "cerebral-cortex:-postcentral-gyrus" },
  ], []);

  const [selectedHash, setSelectedHash] = useState("brain-stem:-medulla-oblongata");
  const [blocked, setBlocked] = useState(false);

  const base = "https://neurotorium.org/tool/brain-atlas/#";
  const src = base + encodeURI(selectedHash);

  // ถ้า iframe ใช้ไม่ได้ ส่วนใหญ่ onLoad จะไม่ยิง เราตั้ง timeout เป็นตัวตัดสินใจ
  useEffect(() => {
    setBlocked(false);
    const t = setTimeout(() => setBlocked(true), 1800);
    return () => clearTimeout(t);
  }, [src]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Brain Atlas</h1>
          <p className="text-sm text-slate-500">ดูด้วยแหล่งภายนอกหรือ fallback เป็น viewer ของเรา</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="w-72 rounded-lg border px-3 py-2 text-sm"
            value={selectedHash}
            onChange={(e) => setSelectedHash(e.target.value)}
          >
            {options.map(o => <option key={o.hash} value={o.hash}>{o.label}</option>)}
          </select>
          <a href={src} target="_blank" rel="noreferrer" className="border rounded-lg px-3 py-2 text-sm">
            Open original
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <div className="text-sm font-semibold">Neurotorium Viewer</div>
            <div className="text-xs text-slate-500 truncate">{src}</div>
          </div>

          {/* ถ้าโดนบล็อก ให้โชว์ BrainViewer (GLB จาก URL ภายนอก) */}
          {!blocked ? (
            <div style={{ width: "100%", height: "78vh" }}>
              <iframe
                key={src}
                src={src}
                title="Neurotorium Brain Atlas"
                style={{ width: "100%", height: "100%", border: 0 }}
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                ไม่สามารถฝัง neurotorium.org ได้ (ป้องกันการ embed) — แสดงตัวดู 3D ของเราทดแทน
              </div>
              <BrainViewer
                // ถ้าต้องการตั้งโมเดลสมองจาก URL ภายนอก เปลี่ยนค่า DEFAULT_MODEL_URL ใน BrainViewer ให้ชี้ไปที่ GLB ของคุณ
                selectedSlug="" 
                catalog={[]} 
              />
              <div className="text-xs text-slate-500 mt-2">
                ต้องการดูของแท้? กด “Open original” ที่มุมขวาบนเพื่อเปิดหน้า Neurotorium ในแท็บใหม่
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
