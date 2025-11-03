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
    {/* fullscreen background */}
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#AFBCC4", // same tone
        zIndex: 0,
      }}
    />

    {/* draggable brain layer */}
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
      }}
      // we listen here so dragging still works even if you move fast
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
          width: "400px",      // size of the brain viewport
          height: "300px",
          cursor: dragging ? "grabbing" : "grab",
          // transparent box that holds the <Canvas />
          backgroundColor: "transparent",
          // turn off pointer-events blocking UI: we ONLY want dragging if you click the brain box
          // so we do NOT disable pointerEvents here
        }}
      >
        <BrainViewer plane={plane} offset={offset} />
      </div>
    </div>

    {/* UI layer on top */}
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
      {/* Top row: title + logo */}
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

      {/* plane buttons */}
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

      {/* slider */}
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

return (
  <>
    {/* fullscreen background */}
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#AFBCC4", // same tone
        zIndex: 0,
      }}
    />

    {/* draggable brain layer */}
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
      }}
      // we listen here so dragging still works even if you move fast
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
          width: "400px",      // size of the brain viewport
          height: "300px",
          cursor: dragging ? "grabbing" : "grab",
          // transparent box that holds the <Canvas />
          backgroundColor: "transparent",
          // turn off pointer-events blocking UI: we ONLY want dragging if you click the brain box
          // so we do NOT disable pointerEvents here
        }}
      >
        <BrainViewer plane={plane} offset={offset} />
      </div>
    </div>

    {/* UI layer on top */}
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
      {/* Top row: title + logo */}
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

      {/* plane buttons */}
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

      {/* slider */}
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