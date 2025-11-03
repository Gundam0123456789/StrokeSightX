Brain3DHeatmap.jsx
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

  const { min, max } = getRangeForPlane(plane);

  return (
  <>
    {/* 1. Fullscreen background layer */}
    <div
      style={{
        position: "fixed",
        inset: 0, // same as top:0,left:0,right:0,bottom:0
        backgroundColor: "#AFBCC4", // same tone as screenshot
        // if you want gradient instead, swap the 2 lines:
        // background: "linear-gradient(135deg, #AFBCC4 0%, #616edf 100%)",
        // backgroundColor: undefined,
        zIndex: 0,
      }}
    />

    {/* 2. Brain layer (center of screen) */}
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none", // so UI on top is still clickable
        zIndex: 1,
      }}
    >
      <div
        style={{
          width: "600px",
          height: "400px",
          pointerEvents: "auto", // BrainViewer can still receive mouse drag/OrbitControls
          backgroundColor: "rgba(255, 0, 0, 0)", // transparent
        }}
      >
        <BrainViewer plane={plane} offset={offset} />
      </div>
    </div>

    {/* 3. UI layer (buttons, sliders, title, logo) */}
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
      }}
    >
      {/* Header row (title + logo link on the far right) */}
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

      {/* Controls: plane buttons */}
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
              setOffset(0);
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

      {/* Slider group */}
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
          min={-1}
          max={1}
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