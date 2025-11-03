import React, { useState } from "react";
import { Link } from "react-router-dom";
import BrainViewer from "./BrainViewer";
import logo from "./pic/BrainSideLogo.png";

export function Brain3DHeatmap() {
  // --- slice plane + offset logic ---
  const [plane, setPlane] = useState("sagittal"); // "sagittal" | "horizontal" | "coronal"
  const [offset, setOffset] = useState(0); // -1 to +1

  // --- draggable brain state ---
  // starting position of the brain on screen (px from top-left of the viewport)
  const [brainPos, setBrainPos] = useState({ x: 900, y: 350 });

  // drag helpers
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  function handleBrainMouseDown(e) {
    setDragging(true);

    // where inside the brain box did the user click?
    const boxRect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - boxRect.left,
      y: e.clientY - boxRect.top,
    });

    // prevent text selection while dragging
    e.preventDefault();
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

  // range for offset slider per plane (right now all the same but ready to customize)
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

  return (
    <>
      {/* --------- LAYER 1: Fullscreen background --------- */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#AFBCC4", // StrokeSight soft blue/grey
          zIndex: 0,
        }}
      />

      {/* --------- LAYER 2: Draggable brain --------- */}
      {/* This layer listens for mouse move/up so dragging keeps working even if you move fast */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none", // default = clicks go through
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* This is the actual draggable hitbox for the brain */}
        <div
          onMouseDown={handleBrainMouseDown}
          style={{
            position: "absolute",
            left: brainPos.x,
            top: brainPos.y,
            width: "500px",
            height: "350px",
            cursor: dragging ? "grabbing" : "grab",
            // We RE-ENABLE pointer events here so we can drag/zoom/rotate brain
            pointerEvents: "auto",
            backgroundColor: "transparent",
            // no border, no shadow -> brain feels like floating
          }}
        >
          <BrainViewer plane={plane} offset={offset} />
        </div>
      </div>

      {/* --------- LAYER 3: UI (title, plane buttons, slider, logo) --------- */}
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
        {/* Header row: title + logo link */}
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

        {/* Plane buttons */}
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
                setOffset(0); // reset slice center whenever plane changes
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

        {/* Offset slider group */}
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
