import React, { useMemo, useState } from "react";

/**
 * BrainAtlasEmbed
 * - เลือกส่วนสมองจาก dropdown → เปลี่ยน URL neurotorium อัตโนมัติ
 * - ไม่ต้องอัปโหลดไฟล์ 3D เอง
 * - รองรับ full screen
 */
export default function BrainAtlasEmbed() {
  // รายการส่วนสมองยอดนิยม (เพิ่ม/แก้ได้ตามต้องการ)
  const options = useMemo(
    () => [
      { label: "Cerebrum (สมองใหญ่)", hash: "cerebrum" },
      { label: "Cerebellum (สมองน้อย)", hash: "cerebellum" },
      { label: "Brain stem (ก้านสมอง)", hash: "brain-stem" },
      { label: "Medulla oblongata", hash: "brain-stem:-medulla-oblongata" },
      { label: "Pons", hash: "brain-stem:-pons" },
      { label: "Midbrain", hash: "brain-stem:-midbrain" },
      { label: "Thalamus", hash: "diencephalon:-thalamus" },
      { label: "Hippocampus", hash: "temporal-lobe:-hippocampus" },
      { label: "Amygdala", hash: "temporal-lobe:-amygdala" },
      { label: "Postcentral gyrus", hash: "cerebral-cortex:-postcentral-gyrus" },
      { label: "Precentral gyrus", hash: "cerebral-cortex:-precentral-gyrus" },
      { label: "Corpus callosum", hash: "cerebral-hemispheres:-corpus-callosum" },
      { label: "Basal ganglia", hash: "telencephalon:-basal-ganglia" },
    ],
    []
  );

  // ค่าเริ่มต้น: medulla ตามที่ขอ
  const [selectedHash, setSelectedHash] = useState("brain-stem:-medulla-oblongata");

  const base = "https://neurotorium.org/tool/brain-atlas/#";
  const src = base + encodeURI(selectedHash);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Brain Atlas (Embed)</h1>
            <p className="text-sm text-slate-500">เลือกส่วนสมอง แล้วดูแบบอินเทอร์แอคทีฟจาก Neurotorium</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <select
              className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedHash}
              onChange={(e) => setSelectedHash(e.target.value)}
              aria-label="เลือกส่วนสมอง"
            >
              {options.map((opt) => (
                <option key={opt.hash} value={opt.hash}>
                  {opt.label}
                </option>
              ))}
            </select>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              title="เปิดดูในแท็บใหม่"
            >
              Open original
            </a>
          </div>
        </div>
      </div>

      {/* Viewer */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
            <div className="text-sm font-semibold text-slate-700">Neurotorium Viewer</div>
            <div className="text-xs text-slate-500 truncate">{src}</div>
          </div>

          <div style={{ width: "100%", height: "78vh" }}>
            <iframe
              key={src}                // ให้รีโหลดเมื่อ URL เปลี่ยน
              src={src}
              title="Neurotorium Brain Atlas"
              style={{ width: "100%", height: "100%", border: "0" }}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
