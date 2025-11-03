import React, { useState } from "react";
import { Link } from "react-router-dom";
import BrainViewer from "./BrainViewer";
import logo from "./pic/BrainSideLogo.png";

export function Brain3DHeatmap() {
  // --- Plane & Offset (slice control) ---
  const [plane, setPlane] = useState("sagittal"); // "sagittal" | "horizontal" | "coronal"
  const [offset, setOffset] = useState(0); // slice depth

  // ให้เราแมปช่วง slider ตาม plane (พร้อมขยายทีหลังถ้าแกนไม่เท่ากัน)
  function getRangeForPlane(p) {
    switch (p) {
      case "sagittal":
        return { min: -1, max: 1 };
      case "horizontal":
        return { min: -1, max: 1 };
      case "coronal":
        return { min: -1, max: 1 };
      default:
        return { min: -1, max: 1 };
    }
  }
  const { min, max } = getRangeForPlane(plane);

  // --- Dragging brain around the screen ---
  // จุดเริ่มต้นของสมองบนจอในพิกเซล (ปรับได้ตามใจว่าจะวางตรงไหนตอนโหลด)
  const [brainPos, setBrainPos] = useState({ x: 900, y: 350 });

  // state ระหว่างลาก
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  function handleBrainMouseDown(e) {
    setDragging(true);

    const boxRect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - boxRect.left,
      y: e.clientY - boxRect.top,
    });

    e.preventDefault(); // ไม่ให้ select text
  }

  function handleMouseMove(e) {
    if (!dragging) return;
    setBrainPos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  }

  function handleMouseUp() {
    setDragging(false);
  }

  return (
    <>
      {/* LAYER 1: พื้นหลังเต็มจอ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#AFBCC4", // โทน StrokeSight ฟ้าเทา
          zIndex: 0,
        }}
      />

      {/* LAYER 2: สมอง (ลากได้) */}
      {/* เรารับ mouseMove/mouseUp บน layer นี้เพื่อให้ลากลื่น */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none", // โดย default ปล่อยให้คลิกทะลุ
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          onMouseDown={handleBrainMouseDown}
          style={{
            position: "absolute",
            left: brainPos.x,
            top: brainPos.y,

            // ขนาดของ "hitbox" ที่สมองอยู่ข้างใน
            width: "600px",
            height: "450px",

            cursor: dragging ? "grabbing" : "grab",

            // อันนี้สำคัญ: เปิด pointerEvents แค่ในกล่องสมอง
            // เพื่อให้ยังสามารถลากกล่องได้ + ใช้ OrbitControls ข้างในได้
            pointerEvents: "auto",

            backgroundColor: "transparent", // มองไม่เห็นกล่อง
            userSelect: "none",
          }}
        >
          <BrainViewer plane={plane} offset={offset} />
        </div>
      </div>

      {/* LAYER 3: UI คุม plane/slider/โลโก้ */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "2rem",
          color: "white",
          fontFamily: "Poppins, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "90vw",
        }}
      >
        {/* Row: Title + Logo ด้านขวา */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            alignItems: "flex-start",
            rowGap: "0.75rem",
          }}
        >
          <div
            style={{
              fontSize: "clamp(1.5rem, 4vw, 3rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              color: "#fff",
            }}
          >
            StrokeSight 3D Heatmap
          </div>

          <Link
            to="/Inform"
            style={{
              textDecoration: "none",
            }}
          >
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
        </div>

        {/* ปุ่มเปลี่ยนแนวตัด */}
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
                setOffset(0); // reset slice ตรงกลางทุกครั้งที่เปลี่ยน plane
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

        {/* Slider ปรับตำแหน่ง slice (offset) */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            width: "clamp(250px, 40vw, 350px)",
            backdropFilter: "blur(4px)",
          }}
        >
          <input
            type="range"
            min={min}
            max={max}
            step={0.01}
            value={offset}
            onChange={(e) => setOffset(parseFloat(e.target.value))}
            style={{
              width: "100%",
              height: "8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
        </div>
      </div>
    </>
  );
}
