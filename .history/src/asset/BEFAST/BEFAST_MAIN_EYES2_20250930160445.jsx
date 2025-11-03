import React from "react";
import '../../component/LoginRegister.css'
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import EYEcomponent2 from "./asset_pic/EYEcomponent2.png"
import plus from '../../component/pic/Plus asset.png'
 

export function BEFAST_MAIN_EYES2 () {
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
        
        <div className="MiddleBoxTestRowEYE">
              <div className="insideTitleBEFAST" style={{fontFamily:"Poppins"}}>
              E Y E S 
              </div>
              
              <div className="insideTitleTH" style={{fontFamily:"Prompt"}}>
              แบบประเมินการตอบสนองของตา
              </div>
              <div className="TitleTH" style={{fontFamily:"Prompt"}}>
              การวิเคราะห์ความสามารถในการกรอกตาของผู้ป่วย
              </div>
              <div className="image-container">
                  <img src={EYEcomponent2} className="centerpictureMAINEYE"></img>
              </div>

              <Link to="/EYEsIntro"className="insideStart">เริ่มทำ</Link>
            </div>
        </div>
        <Link to="/BEFAST_MAIN_FACE" className='login'>next</Link>
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
    </div>
 )
}