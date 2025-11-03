import React from "react";
import '../../component/LoginRegister.css';
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import FACEcomponent from "./asset_pic/FACEcomponent.png";
import plus from '../../component/pic/Plus asset.png';

export function BEFAST_MAIN_FACE () {
  const patientName = localStorage.getItem('patientName');
   const { t } = useTranslation();
  /*if (!patientName) {
        return <Navigate to="/PatientDetail" replace />;
      }*/

  return (
    <div>
      <div className="StrokeAwareCenter" style={{ fontWeight: 'bold', letterSpacing: "5px" }}>
        B E F A S T
      </div>
      <div className="StrokeAwareTopRight">
        Stroke Sight
        <img src={plus} style={{ marginLeft: "20px", marginBottom: "2px" }} alt="plus icon" />
      </div>

      <div className="d-flex justify-content-center gap-4 mt-4 BoxContainer">
        <div className="MiddleBoxTestRowFACE">
          <div className="insideTitleBEFAST" style={{ fontFamily: "Poppins" }}>
            F A C E
          </div>
          <div className="insideTitleTH" style={{ fontFamily: "Prompt" }}>
            แบบประเมินความปกติของใบหน้า
          </div>
          <div className="TitleTH" style={{ fontFamily: "Prompt" }}>
            {t("face1")}
          </div>
          <div className="image-container">
            <img src={FACEcomponent} className="centerpictureMAIN2" alt="face assessment" />
          </div>
          <Link to="/FaceIntro" className="insideStart">{t("start")}</Link>
        </div>
      </div>

      <Link to="/BEFAST_MAIN_ARM" className='login'>next</Link>

      {patientName && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            fontFamily: "Prompt",
            background: "#f0f0f0",
            padding: "8px 16px",
            borderRadius: "8px",
            boxShadow: "0 0 5px rgba(0,0,0,0.1)",
          }}
        >
          👤 {patientName}
        </div>
      )}
    </div>
  );
}