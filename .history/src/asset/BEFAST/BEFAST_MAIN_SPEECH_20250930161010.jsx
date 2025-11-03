import React from "react";
import '../../component/LoginRegister.css'
import { Link, Navigate } from "react-router-dom";

import SPEECHcomponent from "./asset_pic/SPEECHcomponent.png"
import plus from '../../component/pic/Plus asset.png'
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import speechinstruction from './asset_audio/S_INSTRUCTION .MP3'


export function BEFAST_MAIN_SPEECH () {
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
    const patientName = localStorage.getItem('patientName');

  /*if (!patientName) {
        return <Navigate to="/PatientDetail" replace />;
      }*/
  
 return(
    <div>
        <div className="StrokeAwareCenter" style={{fontWeight:'bold', letterSpacing:"5px"}}>
            B E F A S T
        </div>
        <div className="StrokeAwareTopRight">
                              Stroke Sight
                              <img src={plus} style={{marginLeft:"20px", marginBottom:"2px"}}></img>
                            </div>
        <div className="d-flex justify-content-center gap-4 mt-4 BoxContainer">
        
        <div className="MiddleBoxTestRowSPEECH">
                    <div className="insideTitleBEFAST" style={{fontFamily:"Poppins"}}>
                    S P E E C H
                    </div>
                    <div className="insideTitleTH" style={{fontFamily:"Prompt"}}>
                    แบบประเมินความสามารถในการพูด
                    </div>
                    <div className="TitleTH" style={{fontFamily:"Prompt"}}>
                      {t("speech1")}  
                    </div>
                    <div className="image-container">
                        <img src={SPEECHcomponent} className="centerpictureMAIN4"></img>
                    </div>
                    <Link to="/Speech"className="insideStart">{t("start")}</Link>
            </div>
        </div>
        {/* <Link to="/BEFAST_MAIN_TIME" className='login'>next</Link> */}
        {patientName && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              fontFamily: 'Prompt',
              background: '#f0f0f0',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)'
            }}>
              👤 {patientName}
            </div>
      )}
      <Link to="/BEFAST_MAIN_TIME" className='login'>next</Link>
      <audio ref={audioRef} src={speechinstruction} />
    </div>
 )
}