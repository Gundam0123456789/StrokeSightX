import React, { useState } from "react";
import BrainViewer from "./BrainViewer";
import { Link } from "react-router-dom";
import logo from "./pic/BrainSideLogo.png";

export function Brain3DHeatmap() {
  // plane = แนวตัด
  const [plane, setPlane] = useState("sagittal");

  // offset = ระยะการตัด
  // เริ่มที่ 0 แล้วให้ขยับในช่วง -1 ถึง +1
  const [offset, setOffset] = useState(0);

  // กำหนดช่วง min/max ต่อแนวตัด
  // (ถ้าอนาคตแกนกว้างไม่เท่ากันค่อยปรับทีละอันได้)
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
  const [brainPos, setBrainPos] = useState({ x: 300, y: 200 });

// ใช้เก็บ offset ตอนเริ่มลาก เพื่อให้ drag ไม่กระโดด
const [isDragging, setIsDragging] = useState(false);
const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

function handleMouseDown(e) {
  // หาตำแหน่งเมาส์เทียบกับตัว brainBox
  const boxRect = e.currentTarget.getBoundingClientRect();
  setIsDragging(true);
  setDragOffset({
    x: e.clientX - boxRect.left,
    y: e.clientY - boxRect.top,
  });
}

function handleMouseMove(e) {
  if (!isDragging) return;
  // อัปเดตตำแหน่งใหม่ = ตำแหน่งเมาส์ - offset ที่จำไว้
  setBrainPos({
    x: e.clientX - dragOffset.x,
    y: e.clientY - dragOffset.y,
  });
}

function handleMouseUp() {
  setIsDragging(false);
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
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          alignItems: "center",
          rowGap: "0.75rem",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: "clamp(1.5rem, 4vw, 3rem)",
            fontWeight: 600,
            lineHeight: 1.1,
          }}
        >
          StrokeSight 3D Heatmap
        </div>

        <Link to="/Inform" style={{ textDecoration: "none" }}>
          <img
            src={logo}
            alt="StrokeSight Info"
            style={{
              width: "clamp(40px, 7vw, 80px)",
              height: "clamp(40px, 7vw, 80px)",
              objectFit: "contain",
              borderRadius: "0.5rem",
            }}
          />
        </Link>
      </header>

      {/* Controls Row */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        {/* ปุ่มเลือก plane */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
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
                lineHeight: 1.2,
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
            flexWrap: "wrap",
            backgroundColor: "#d0d7e0ff",
            borderRadius: "0.75rem",
            padding: "0.6vw 2vw",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#1a1a1a",
              minWidth: "100px",
            }}
          >

          </div>

          <div style={{ minWidth: "200px" }}>
            <input
              type="range"
              min={min}
              max={max}
              step={0.01}
              value={offset}
              onChange={(e) => setOffset(parseFloat(e.target.value))}
              style={{
                width: "225px",
                height: "8px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </section>

      <main
        style={{
            flex: 1,
            minHeight: "50vh",
            position: "relative",      // สำคัญ! เพื่อให้ลูกวางแบบ absolute ด้านในได้
            borderRadius: "1rem",
            overflow: "hidden",
            background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0) 60%), #AFBCC4",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // กันค้าง drag ถ้าลากออกนอกกล่อง
        >
        {/* กล่องสมอง ลากได้ */}
        <div
            onMouseDown={handleMouseDown}
            style={{
            position: "absolute",
            left: brainPos.x,
            top: brainPos.y,
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            width: "400px",
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "1rem",
            backgroundColor: "rgba(188,203,212,0.15)", // โปร่งใสหน่อยๆ
            boxShadow:
                "0 20px 40px rgba(0,0,0,0.4), 0 0 60px rgba(97,110,223,0.4)",
            backdropFilter: "blur(4px)",
            }}
        >
            <BrainViewer plane={plane} offset={offset} />
        </div>
        </main>
    </div>
  );
}
