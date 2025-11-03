import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginRegister.css";
import Stroke from "./pic/StrokeAwareButton.png";
import logofooter from "./pic/Brainwithlogo.png";
import prcANDnu from "./pic/prc-nu.png";
import { Link, useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown/Dropdown";
import Dropitem from "./Dropdown/Dropitem";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "./LanguageSwitch";

import PRC from "./pic/prc.png"
import NU from "./pic/nu.png"
/* pictures */
import balancepic from "./pic/balancesmall.png";
import eyepic from "./pic/eyesmall.png";
import facepic from "./pic/facesmall.png";
import armpic from "./pic/armsmall.png";
import speechpic from "./pic/speechsmall.png";
import timepic from "./pic/timesmall.png";

// sound
import welcomeSound from "./soundasset/Welcome.MP3";

export function Inform() {

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
// ------------------------------------
  const assessment = ["NIHSS", "Assessment"];
  
 const assessmentbtn = [
    { label: t("about"), path: "/About" },
    { label: t("assessment"), path: "/PatientDetail" }
  ];

  const items = [
    { key: "balancepic", img: balancepic, label: t("balance"), desc: t("content.balance") },
    { key: "eyepic", img: eyepic, label: t("eye"), desc: t("content.eye") },
    { key: "facepic", img: facepic, label: t("face"), desc: t("content.face") },
    { key: "armpic", img: armpic, label: t("arm"), desc: t("content.arm") },
    { key: "speechpic", img: speechpic, label: t("speech"), desc: t("content.speech") },
    { key: "timepic", img: timepic, label: t("time") || "วิธีการแจ้งเวลา", desc: t("content.time") || "อธิบายวิธีการแจ้งเวลาในการเกิดอาการ" },
  ];

  return (
    <div>
      {/* NAVBAR */}
      <div className="header-container">
        <div className="logo-section">
          <div className="StrokeAwareCenter">
            <img src={Stroke} />
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
              buttonText={t("Features")}
              type="assessment"
              content={assessmentbtn.map((item, id) => (
                <Dropitem key={id} to={item.path}>
                  {item.label}
                </Dropitem>
              ))}
          />

          <div className="btn-drop" onClick={() => navigate("/DoctorDashboard")}>
            {t("dashboard")}
          </div>
          <div className="btn-drop" onClick={() => navigate("/SearchByIdCardAngel")}>
            {t("seacher")}
          </div>

          <div className="btn-drop" onClick={() => navigate("/Training")}>
            {t("train")}
          </div>

          <LanguageSwitch />
        </div>
      </div>
      <div className="navbar-spacer"></div>

      {/* BANNER */}
       <div className="banner1-1">
        <div
          className="banner-content d-flex flex-column align-items-end justify-content-center text-end"
          style={{
            width: "fit-content",              
            padding : "0 2vw",    
            height: "100%",
            color: "white",
          }}
        >
          {/* กล่องข้อความ */}
          <div style={{ lineHeight: 1.4 }}>
            <div
              className="infor1-firstpic fw-semibold "
              style={{
                fontSize: "1.6vw",
                color: "#fff",
              }}
            >
              แพลตฟอร์มคัดกรองโรคหลอดเลือดสมองนอกโรงพยาบาลแบบเชิงรุก ด้วยเทคนิคASIS
            </div>

            <div
              className="infor3-firstpic"
              style={{
                fontSize: "1.4vw",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              StrokeSight: Prehospital Stroke Screening Platform using novel Acute Stroke Integrated Score
            </div>
          </div>

          {/* ปุ่มอยู่ข้างล่าง */}
          <button
            type="button"
            className="btn d-flex justify-content-center rounded-pill border-0 fw-bold mt-3 shadow"
            style={{
              backgroundColor: "#616edf",
              color: "#fff",
              fontSize: "1.5vw",
              padding: "0.8vw 1.7vw",
              whiteSpace: "nowrap",
            }}
            onClick={() => navigate("/PatientDetail")}
          >
            {t("start")}
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: "0.5vw", background: "#616edf" }}></div>

      <div className="banner2">
         <div className="Boxofpic">
            <div className="pic balanceinthebox" data-label="การทรงตัว" data-desc="" tabIndex="0" role="button" aria-label="การทรงตัว">
              <img src={balancepic} alt="การทรงตัว" />
            </div>

            <div className="pic eyeinthebox" data-label="สายตา" data-desc="" tabIndex="0" role="button" aria-label="สายตา">
              <img src={eyepic} alt="สายตา" />
            </div>

            <div className="pic faceinthebox" data-label="ใบหน้า" data-desc="" tabIndex="0" role="button" aria-label="ใบหน้า">
              <img src={facepic} alt="ใบหน้า" />
            </div>

            <div className="pic arminthEbox arminthebox" data-label="กล้ามเนื้ออ่อนแรง" data-desc="" tabIndex="0" role="button" aria-label="กล้ามเนื้ออ่อนแรง">
              <img src={armpic} alt="กล้ามเนื้ออ่อนแรง" />
            </div>

            <div className="pic speechinthebox" data-label="การพูด" data-desc="" tabIndex="0" role="button" aria-label="การพูด">
              <img src={speechpic} alt="การพูด" />
            </div>

            <div className="pic timeinthebox" data-label="เวลา" data-desc="" tabIndex="0" role="button" aria-label="เวลา">
              <img src={timepic} alt="เวลา" />
            </div>
          </div>
        <div className="banner-con1">
          <div className="infor1-banner2">DASHBOARD</div>
          <div className="infor2-banner2">{t("follow")}</div>
          <div className="infor3-banner2">{t("danger")}</div>
          <div className="Start1" onClick={() => navigate("/DoctorDashboard")}>
            <div class="fw-semibold text-white fs-5 Start-text-enter">{t("enter")}</div>
          </div>
        </div>
      </div>

      <div className="banner3">
        <div className="footer-left">
          <img src={logofooter} alt="logo" className="footer-logo" />
            <div className="footertext1">
            แพลตฟอร์มคัดกรองโรคหลอดเลือดสมองนอกโรงพยาบาลแบบเชิงรุกด้วยเทคนิคใหม่เอซิสผ่านปัญญาประดิษฐ์
            </div>
            <div className="footertext2">
              Prehospital Stroke Screening Platform using novel Acute Stroke Integrated Score (ASIS) with Artificial Intelligence
            </div>
        </div>

        <div className="footer-right">
          <div className="fw-bold text-end d-fixed"style={{fontSize: 'clamp(0.8rem, 4vw, 10rem)',color: '#166989',marginBottom: '0.5rem'}}>STROKE SIGHT</div>
          <div className="footertext4">{t("address")}</div>
          <div className="footertext5">053-242550, 053-242038</div>
          <div className="footertext6">StrokeSight@gmail.com</div>
         
          <div className="footertext7">
            <span classname="kuy">KEY PARTNER</span><br />
            <a href="https://www.prc.ac.th/#">
              <img src={PRC} className="footerpic" alt="partners"/>
            </a>
            <a href="https://www.nu.ac.th/">
            <img src={NU} className="footerpic" alt="partners" />
            </a>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center text-white w-100"style={{backgroundColor: '#ADADAD', marginTop:'0.7vw' }}>
        Copyright © 2025 StrokeSight ®
      </div>       
    <audio ref={audioRef} src={welcomeSound} />
    </div>
  );
}
