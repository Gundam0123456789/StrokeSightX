import React from 'react';
import './BalanceIntro.css';
import doctorbalance from '../asset_pic/doctorbalance.png';
import strokelogo from '../asset_pic/strokesightlogo.png';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
/* video and audio */

import face from '../asset_vdo/face.mp4';
import faceinstruction from "./audio/F_INSTRUCTION.MP3";


export default function FaceIntro() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    const playAudio = async () => {
      try {
        await audio.play();
        console.log("Audio started automatically!");
      } catch (err) {
        console.log("Autoplay blocked:", err);
      }
    };
    playAudio();
  }, []);
  return (
    <>
      <div className="balance-header">
        <div className="header-left">
          <h1 className="balance-title">FACE</h1>
          <p className="balance-subtitle">{t("exam")}</p>
        </div>
    
        <div className="header-right">
            <img src={strokelogo} className="strokelogo"></img>
        </div>
      </div>
    <div className="balance-container">
      <div className="balance-content">
        <div className="evaluation-box">
            <video  style={{
                    width: '100%',
                    height:'30vw',
                    borderRadius: '12px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }} controls>
                <source src={face} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>

        <div className="doctor-section">
          <Link to="/FACE " className="start-btn">ถัดไป</Link>
          <img src={doctorbalance} className="doctor-img" alt="doctor" />
        </div>
      </div>
      <audio ref={audioRef} src={faceinstruction} />
    </div>
    </>
  );
}
