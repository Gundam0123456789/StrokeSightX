import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./user-training.css";
import "./Aboutus.css";
import Stroke from "./pic/StrokeAwareButton.png";
import { useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown/Dropdown";
import Dropitem from "./Dropdown/Dropitem";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "./LanguageSwitch";

import Pan from "./pic/kuyPan.png"
import Din1 from "./pic/maDin.jpg"
import Din2 from "./pic/maDin2.jpg"
import Jing from "./pic/nongjing.jpg"
import Gundam from "./pic/MrGundam.png"
import Mee from "./pic/PMee.png"


function About() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // state for hamburger menu
  const [menuOpen, setMenuOpen] = useState(false);

  // sample list for the Dropdown
  const assessment = ["NIHSS", "ASIS"];

  // helper: navigate & close menu (useful on mobile)
  const go = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
        <div className="header-container">
            <div className="logo-section">
                <div className="StrokeAwareCenter">
                <img src={Stroke} alt="Stroke Aware" className="PlusIconCenter" />
                </div>
            </div>

            {/* Hamburger Icon */}
            <button
                type="button"
                className="menu-toggle"
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
            >
                ☰
            </button>

            {/* NAV MENU */}
            <nav className={`nav-menu ${menuOpen ? "active" : ""}`} aria-label="Main">
                <button className="btn-dro2" onClick={() => go("/inform")}>
                {t("main")}
                </button>

                <Dropdown
                buttonText={t("assessment")}
                type="assessment"
                content={assessment.map((item, id) => (
                    <Dropitem key={id}>{item}</Dropitem>
                ))}
                />

                <button className="btn-dro2" onClick={() => go("/DoctorDashboard")}>
                {t("dashboard")}
                </button>

                <button className="btn-dro2" onClick={() => go("/SearchByIdCardAngel")}>
                {t("seacher")}
                </button>

                <button className="btn-dro2" onClick={() => go("/Training")}>
                {t("train")}
                </button>

                <LanguageSwitch />
            </nav>
        </div>

        <div className="con">
            <div className="leftbox">
                <img src={Mee} className="size-pic"></img>
            </div>
            <div className="rightboxleft">
                <div className="Name1">นาย ภูดิส วังธิยอง (หมีพู)</div>
                <div className="All">
                    <div className="text-place">ตำแหน่ง<span>: หัวหน้าทีม</span></div>
                    <div className="text-work">หน้าที่<span>: Back-End</span></div>
                    <div className="text-age">อายุ<span>:  17</span></div>
                    <div className="text-grade">ชั้นการศึกษา<span>: มัธยมปีที่ 5 </span></div>
                    
                </div>
            </div>
        </div>

        <div className="con1">
            <div className="rightboxright">
                <div className="Name2">นาย ปัณณวัฒน์  เลิศมัลลิกาพร (ข้าวปั้น)</div>
                 <div className="All">
                    <div className="text-place1">ตำแหน่ง<span>: รองหัวหน้าทีม</span></div>
                    <div className="text-work1">หน้าที่<span>: Front-End</span></div>
                    <div className="text-age1">อายุ<span>:  16</span></div>
                    <div className="text-grade1">ชั้นการศึกษา<span>: มัธยมปีที่ 5 </span></div>
                    
                </div>
            </div>
            <div className="leftbox">
                <img src={Pan} className="size-pic2"></img>
            </div>
        </div>

        <div className="con11">
            <div className="leftbox">  
                <img src={Din1} className="size-pic"></img>
            </div>  
            <div className="rightboxleft">
                <div className="Name1">นาย พสุธันส์ ศิริพรเลิศ (ดิน)</div>
                <div className="All">
                    <div className="text-place">ตำแหน่ง<span>: ลูกกระจ๊อกกันดั้ม</span></div>
                    <div className="text-work">หน้าที่<span>: Front-End</span></div>
                    <div className="text-age">อายุ<span>:  15</span></div>
                    <div className="text-grade">ชั้นการศึกษา<span>: มัธยมปีที่ 4 </span></div>
                    
                </div>
            </div>

        </div>
        <div className="con1">
            <div className="rightboxright">
                <div className="Name2">นางสาว ชญาฐิตา พิศุทธิโชติ (จิงจิง)</div>
                 <div className="All">
                    <div className="text-place1">ตำแหน่ง<span>: ลูกทีม</span></div>
                    <div className="text-work1">หน้าที่<span>: Front-End</span></div>
                    <div className="text-age1">อายุ<span>:  15</span></div>
                    <div className="text-grade1">ชั้นการศึกษา<span>: มัธยมปีที่ 4 </span></div>
                    
                </div>
            </div>
            <div className="leftbox">
                <img src={Jing} className="size-pic2"></img>
            </div>
        </div>

        <div className="con11">
            <div className="leftbox"> 
                <img src={Gundam} className="size-pic"></img>
            </div>
            <div className="rightboxleft">
                <div className="Name1">นาย ณัฏฐพัชร์ สิริสว่างเมฆ (กันดั้ม)</div>
                 <div className="All">
                    <div className="text-place">ตำแหน่ง<span>: ลูกพี่น้องดิน</span></div>
                    <div className="text-work">หน้าที่<span>: Front-End</span></div>
                    <div className="text-age">อายุ<span>:  16</span></div>
                    <div className="text-grade">ชั้นการศึกษา<span>: มัธยมปีที่ 5 </span></div>
                </div>
            </div>
        </div>
        <div style={{height: '10vw'}}>

        </div>
    </>
  );
}

export default About;
