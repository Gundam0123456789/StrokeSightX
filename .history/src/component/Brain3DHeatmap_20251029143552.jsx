import React, { useState } from "react";
import BrainViewer from "./BrainViewer";


export function Brain3DHeatmap() {
  // plane = แนวตัด
  const [plane, setPlane] = useState("sagittal");

  // offset = ระยะการตัด
  // ลองเริ่มจาก 0 แล้วให้ขยับได้ช่วงประมาณ -1 ถึง +1 ก่อน
  // (เดี๋ยวเราปรับช่วงทีหลังถ้ามันตัดเร็วไป/ช้าไป)
  const [offset, setOffset] = useState(0);

  // กำหนดช่วง min/max ต่อแนวตัด
  // (เพราะโมเดลอาจจะกว้างแกน X มากกว่าแกน Y)
  function getRangeForPlane(p) {
    switch (p) {
      case "sagittal":
        return { min: -1, max: 1 };
      case "coronal":
        return { min: -1, max: 1 };
      case "horizontal":
        return { min: -1, max: 1 };
      default:
        return { min: -1, max: 1 };
    }
  }

  const { min, max } = getRangeForPlane(plane);

  return (
    <div
      style={{
        padding: "2rem",
        color: "white",
        backgroundColor: "#AFBCC4",
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontSize: "clamp(2rem, 4vw, 6rem)",
            marginBottom: "0.5rem",
            color: "#fff",
          }}
        >
          StrokeSight 3D Heatmap
        </div>

      </div>

      {/* Controls Row */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        {/* ปุ่ม plane */}
        <div style={{ display: "flex", gap: "0.6rem",  }}>
          {[
            { key: "sagittal", label: "Sagittal" },
            { key: "horizontal", label: "Horizontal" },
            { key: "coronal", label: "Coronal" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setPlane(item.key);
                setOffset(0); // reset slice ตรงกลางเวลาสลับ plane ใหม่
              }}
              style={{
                border: "none",
                borderRadius: "9999px",
                padding: "0.5rem 1rem",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor:
                  plane === item.key ? "#616edf" : "#e2e8f0",
                color: plane === item.key ? "#fff" : "#616edf",
                fontSize: "0.9rem",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* slider group */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(15,23,42,0.4)",
            borderRadius: "0.75rem",
            padding: "0.6vw 2.5vw",
          }}
        >
          {/* custom slider wrapper */}
          <div style={{ minWidth: "200px" }}>
            <input
              type="range"
              min={min}
              max={max}
              step={0.01}
              value={offset}
              onChange={(e) => setOffset(parseFloat(e.target.value))}
              style={{
                width: "250px",
                height: "8px",
                borderRadius: "4px",
                // ด้านล่างนี้เป็น basic browser range style; ถ้าอยากสวยเป๊ะเหมือนดั้มเดี๋ยวทำ CSS เพิ่มได้
              }}
            />
          </div>
        </div>
      </div>

      {/* Viewer */}
      <BrainViewer plane={plane} offset={offset} />
    </div>
  );
}
