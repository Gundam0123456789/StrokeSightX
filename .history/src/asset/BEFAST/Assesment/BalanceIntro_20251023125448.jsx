import React from 'react';
import './BalanceIntro.css';
import doctorbalance from '../asset_pic/doctorbalance.png';
import strokelogo from '../asset_pic/strokesightlogo.png';
import { Link, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import balance from '../asset_vdo/balance.mp4';
import BalanceInstruction from "./audio/B_INSTRUCTION.MP3";

export default function BalanceIntro() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const patientName = localStorage.getItem('patientName');
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
          <div className="balance-title">BALANCE</div>
          <div className="balance-subtitle">{t("exam")}</div>
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
                <source src={balance} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>

        <div className="doctor-section">
          <Link to="/BALANCE" className="start-btn">{t("Next")}</Link>
          <img src={doctorbalance} className="doctor-img" alt="doctor" />
        </div>
      </div>
    <audio ref={audioRef} src={BalanceInstruction} />
    </div>
    </>
  );
}
