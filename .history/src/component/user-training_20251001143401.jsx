import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./user-training.css";
import Stroke from "./pic/StrokeAwareButton.png";
import { useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown/Dropdown";
import Dropitem from "./Dropdown/Dropitem";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "./LanguageSwitch";

/* videos — import each explicitly (or use public/ paths consistently) */
import personal from "./videos/personal.mp4";
/*import balanceVid from "./videos/balance.mp4";
import eyeVid from "./videos/vision.mp4";
import faceVid from "./videos/face.mp4";
import armVid from "./videos/muscle.mp4";
import speechVid from "./videos/speech.mp4";*/

/* pictures */
import balancepic from "./pic/balancesmall.png";
import eyepic from "./pic/eyesmall.png";
import facepic from "./pic/facesmall.png";
import armpic from "./pic/armsmall.png";
import speechpic from "./pic/speechsmall.png";

export function Training() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const assessment = ["NIHSS", "Assessment"];

  // 1) stable IDs
  const IDS = ["detail", "balance", "eye", "face", "arm", "speech"];

  // 2) label by translation (keys should exist in your i18n)
  const label = (id) => {
    switch (id) {
      case "detail": return t("detail");
      case "balance": return t("balance");
      case "eye": return t("eye");
      case "face": return t("face");
      case "arm": return t("arm");
      case "speech": return t("speech");
      default: return id;
    }
  };
    const assessmentbtn = [
  { label: "NIHSS", path: "/About" },
  { label: "Assessment", path: "/PatientDetail" }
  ];

  // 3) content by ID (put your localized strings here or use t("..."))
  const CONTENT = {
    detail: "How to fill in personal information and how to use an ID card as a substitute",
    balance: "How to assist with the assessment correctly",
    eye: "How to assist with the assessment correctly",
    face: "How to assist with the assessment correctly",
    arm: "How to assist with the assessment correctly",
    speech: "How to assist with the assessment correctly",
  };

  // 4) images by ID
  const IMAGES = {
    balance: balancepic,
    eye: eyepic,
    face: facepic,
    arm: armpic,
    speech: speechpic,
  };

  // 5) videos by ID---------------------------------------------------------- edit
  const VIDEOS = {
    detail: personal,
    balance: personal,
    eye: personal,
    face: personal,
    arm: personal,
    speech: personal,
  };

  const [activeId, setActiveId] = useState(IDS[0]); // 'detail'

  return (
    <div>
      {/* NAVBAR */}
      <div className="header-container">
        <div className="logo-section">
          <div className="StrokeAwareCenter">
            <img src={Stroke} className="PlusIconCenter" alt="Stroke Aware" />
          </div>
        </div>

        {/* Hamburger Icon */}
        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

        {/* NAV MENU */}
        <div className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <div className="btn-drop" onClick={() => navigate("/inform")}>
            {t("main")}
          </div>

          <Dropdown
            buttonText={t("assessment")}
            type="assessment"
            content={assessment.map((item, id) => (
              <Dropitem key={id}>{item}</Dropitem>
            ))}
          />

          <div className="btn-drop" onClick={() => navigate("/DoctorDashboard")}>
            {t("dashboard")}
          </div>

          <div className="btn-drop" onClick={() => navigate("/SearchByIdCardAngel")}>
            {t("seacher")}
          </div>

          <div className="btn-drop1" onClick={() => navigate("/Training")}>
            {t("train")}
          </div>

          <LanguageSwitch />
        </div>
      </div>

      {/* Banner */}
      <div>
        <div className="banner1-2">
          <div className="headtext1">{t("train")}</div>
          <div className="headtext2">{t("for")}</div>
          
        </div>
      </div>

      {/* Layout */}
      <div className="training-layout">
        {/* Left Sidebar */}
        <div className="sidebar">
          {IDS.map((id) => (
            <button
              key={id}
              className={`menu-btn ${activeId === id ? "active" : ""}`}
              onClick={() => setActiveId(id)}
            >
              {label(id)}
              <span className="arrow">{activeId === id ? "›" : "⌄"}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="content">
          <div className="topcontent">
            <div className="intopcontent">
              <h2>{label(activeId)}</h2>
              <p style={{color:"#9e9e9eff"}}>{CONTENT[activeId]}</p>
            </div>
            <div className="picintopconten">
              {IMAGES[activeId] && (
                <div className="picture">
                  <img
                    src={IMAGES[activeId]}
                    alt={label(activeId)}
                    style={{ maxWidth: "100%", height: "auto", display: "block" }}
                  />
                </div>
              )}
            </div>
          </div>

          {VIDEOS[activeId] && (
            <video
              controls
              className="vido"
            >
              <source src={VIDEOS[activeId]} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}
