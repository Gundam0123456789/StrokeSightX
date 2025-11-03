import React, { useState } from "react";
import BrainViewer from "./BrainViewer";
import { Link } from "react-router-dom";
import logo from "./pic/BrainSideLogo.png";

export function Brain3DHeatmap() {
  // plane = แนวตัด (sagittal / horizontal / coronal)
  const [plane, setPlane] = useState("sagittal");

  // offset = ระยะการตัดในแนว plane นั้น ๆ
  const [offset, setOffset] = useState(0);

  // กำหนดช่วง min/max ต่อแนวตัด (ตอนนี้เหมือนกันหมด)
  function getRangeForPlane(p) {
    switch (p) {
      case "sagittal":
      case "coronal":
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
        backgroundColor: "#1e293b", // dark blue/gray bg behind controls (not behind canvas; canvas has its own bg layer)
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
        color: "white",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          fontSize: "clamp(2rem, 4vw, 6rem)",
          fontWeight: "bold",
          marginBottom: "0.5rem",
          padding: "0.5vw",
          color: "#616edf",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>StrokeSight 3D HeatMap</div>

        <Link to="/Inform">
          <img
            src={logo}
            alt="StrokeSight"
            style={{
              width: "7vw",
              height: "7vw",
              objectFit: "contain",
            }}
          />
        </Link>
      </div>

      {/* Controls Row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        {/* Plane select buttons */}
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
                setOffset(0); // reset slice to center when switching plane
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

        {/* Offset slider group */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            backgroundColor: "rgba(15,23,42,0.4)", // translucent dark box
            borderRadius: "0.75rem",
            padding: "0.8vw 3vw",
          }}
        >
          {/* Slider itself */}
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
                cursor: "pointer",
              }}
            />
          </div>

          {/* offset readout (optional but useful for debugging) */}
          <div
            style={{
              minWidth: "60px",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "#fff",
            }}
          >
            {offset.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 3D Viewer */}
      <BrainViewer plane={plane} offset={offset} />
    </div>
  );
}
