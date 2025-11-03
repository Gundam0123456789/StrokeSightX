import React, { useState } from "react";
import { Link } from "react-router-dom";
import BrainViewer from "./BrainViewer";
import logo from "./pic/BrainSideLogo.png";

export function Brain3DHeatmap() {
  const [plane, setPlane] = useState("sagittal");
  const [offset, setOffset] = useState(0);

  // --- Drag state ---
  const [brainPos, setBrainPos] = useState({ x: 900, y: 350 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleBrainMouseDown = (e) => {
    setDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setBrainPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };
  const handleMouseUp = () => setDragging(false);

  const { min, max } = { min: -1, max: 1 };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #AFBCC4 0%, #6b7d8a 100%)",
        overflow: "hidden",
        zIndex: 1,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 🧠 Floating Brain */}
      <div
        onMouseDown={handleBrainMouseDown}
        style={{
          position: "absolute",
          left: brainPos.x,
          top: brainPos.y,
          width: "600px",
          height: "450px",
          cursor: dragging ? "grabbing" : "grab",
          pointerEvents: "auto",
          backgroundColor: "transparent",
        }}
      >
        <BrainViewer plane={plane} offset={offset} />
      </div>

      {/* 🧩 UI Overlay */}
      <div
        style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          color: "white",
          fontFamily: "Poppins, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          zIndex: 2,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "90vw",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 700,
              margin: 0,
            }}
          >
            StrokeSight 3D Heatmap
          </h1>

          <Link to="/Inform">
            <img
              src={logo}
              alt="StrokeSight Info"
              style={{
                width: "clamp(50px, 7vw, 80px)",
                height: "clamp(50px, 7vw, 80px)",
              }}
            />
          </Link>
        </div>

        {/* Plane Buttons */}
        <div style={{ display: "flex", gap: "0.6rem" }}>
          {["sagittal", "horizontal", "coronal"].map((key) => (
            <button
              key={key}
              onClick={() => {
                setPlane(key);
                setOffset(0);
              }}
              style={{
                border: "none",
                borderRadius: "9999px",
                padding: "0.5rem 1rem",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor:
                  plane === key ? "#616edf" : "rgba(255,255,255,0.8)",
                color: plane === key ? "#fff" : "#616edf",
                fontSize: "0.9rem",
              }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        {/* Slider */}
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
    </div>
  );
}
