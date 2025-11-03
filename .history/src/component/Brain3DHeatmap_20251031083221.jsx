import React, { useState } from "react";
import BrainViewer from "./BrainViewer";
import { Link } from "react-router-dom";
import logo from "./pic/BrainSideLogo.png";

export function Brain3DHeatmap() {
  const [plane, setPlane] = useState("sagittal");
  const [offset, setOffset] = useState(0);

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
    <>
      {/* Brain viewer in the background */}
      <BrainViewer plane={plane} offset={offset} />

      {/* UI overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          padding: "2rem",
          color: "white",
          fontFamily: "Poppins, sans-serif",
          zIndex: 10,
          pointerEvents: "none", // 👈 let drag go through by default
        }}
      >
        {/* HEADER ROW */}
        <div
          style={{
            display: "flex",
            fontSize: "clamp(1.5rem, 3.5vw, 5.5rem)",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#616edf",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "auto", // 👈 clickable
          }}
        >
          <div>NeuroSight</div>
          <h2>a</h2>

          <Link to="/Inform" style={{ textDecoration: "none" }}>
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

        {/* CONTROL PANEL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            maxWidth: "400px",
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
            backdropFilter: "blur(4px)",
            pointerEvents: "auto", // 👈 this block is interactable
          }}
        >
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
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* slice offset slider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
              color: "#fff",
              fontSize: "0.9rem",
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
                width: "200px",
                height: "8px",
                borderRadius: "4px",
                cursor: "pointer",
                accentColor: "#616edf",
              }}
            />
            <div style={{ minWidth: "60px", fontWeight: 500 }}>
              {offset.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
