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
        backgroundColor: "#B6B9BA" ,
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: "clamp(1.2rem, 2vw, 2rem)",
            marginBottom: "0.5rem",
          }}
        >
          Str
        </h1>
        <p
          style={{
            maxWidth: "600px",
            color: "#cbd5e1",
            lineHeight: 1.4,
            fontSize: "clamp(0.9rem, 1vw, 1rem)",
          }}
        >
          Select anatomical plane and drag the slider to move the slice.
        </p>
      </div>

      {/* Controls Row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        {/* ปุ่ม plane */}
        <div style={{ display: "flex", gap: "0.6rem" }}>
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
                  plane === item.key ? "#334155" : "#e2e8f0",
                color: plane === item.key ? "#fff" : "#334155",
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
            gap: "0.6rem",
            backgroundColor: "rgba(15,23,42,0.4)",
            borderRadius: "0.75rem",
            padding: "0.6rem 0.8rem",
          }}
        >
          {/* icon (placeholder ด้วย emoji/shape ไปก่อน) */}
          <div
            style={{
              width: "24px",
              height: "24px",
              color: "#fff",
              fontSize: "0.8rem",
              lineHeight: "24px",
              textAlign: "center",
              fontWeight: "600",
              borderRadius: "4px",
              border: "2px solid #fff",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "3px",
                right: "3px",
                top: "4px",
                bottom: "4px",
                border: "2px solid #fff",
              }}
            />
          </div>

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
                width: "200px",
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
