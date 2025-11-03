import React from "react";
import '../../component/LoginRegister.css'
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import EYEcomponent2 from "./asset_pic/EYEcomponent2.png"
import plus from '../../component/pic/Plus asset.png'
 

export function BEFAST_MAIN_EYES2 () {
    const patientName = localStorage.getItem('patientName');
     const { t } = useTranslation();
  if (!patientName) {
        return <Navigate to="/PatientDetail" replace />;
      }
 return(
    <div>
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
              {t("eye1")}
              </div>
              <div className="image-container">
                  <img src={EYEcomponent2} className="centerpictureMAINEYE"></img>
              </div>

              <Link to="/EYEsIntro"className="insideStart">{t("start")}</Link>
            </div>
        </div>
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