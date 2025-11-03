import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Aboutus.css";
import Dropdown from "./Dropdown/Dropdown";
import Dropitem from "./Dropdown/Dropitem";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "./LanguageSwitch";
import Stroke from "./pic/StrokeAwareButton.png";

import Gundam from "./pic/MrGundam.png"
import Meephoo from "./pic/PMee.png"
import Din from "./pic/maDin.jpg"
import Jing from "./pic/nongjing.jpg"
import Kaopan from "./pic/kuyPan.png"
import Fandawn from "./pic/fandawn.jpeg"
import Krunew from "./pic/krunew.png"

import IG from "./pic/Instagram_logo.png"





export default function TeamScroller() {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const [active, setActive] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const assessment = ["NIHSS", "Assessment"];
  
  const TEAM = [
    {
      name: t("fullname1"),
      role: "Founder & Backend Developer",
      bio: "",
      photo: Meephoo,
      links: { linkedin: "#", IG: "https://www.instagram.com/moophee_/" }
    },
    {
      name: t("fullname2"),
      role: "Founder & Head Of Software Developer" ,
      bio: "",
      photo: Kaopan,
      links: { linkedin: "#", IG: "https://www.instagram.com/iluavsamoyed/" }
    },
    {
      name: t("fullname3"),
      role: "CoFounder & Head Of Software Developer",
      bio: "",
      photo: Jing,
      links: { linkedin: "#", IG: "https://www.instagram.com/truly_rreal/" }
    },
    {
      name: t("fullname4"),
      role: "CoFounder & Hardware Engineer",
      bio: "",
      photo: Din,
      links: { linkedin: "#", IG: "https://www.instagram.com/dindin_1039/" }
    },
    {
      name: t("fullname5"),
      role: "Software Developer",
      bio: "",
      photo: Gundam,
      links: { linkedin: "#", IG: "https://www.instagram.com/natthaphat_bigbelly/" }
    },
    {
      name: t("fullname6"),
      role: "CFO",
      bio: "",
      photo: Fandawn,
      links: { linkedin: "#", IG: "https://www.instagram.com/dxwntichakn/" }
    },
    {
      name: t("fullname7"),
      role: "Software Consult",
      bio: "",
      photo: Krunew,
      links: { linkedin: "#", IG: "https://www.instagram.com/krittipong_new/" }
    },
  ];

  const assessmentbtn = [
    { label: "NIHSS", path: "/About" },
    { label: "Assessment", path: "/PatientDetail" }
  ]
  // Observe which card is in view
  useEffect(() => {
    const options = { root: containerRef.current, threshold: 0.6 };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.idx);
          setActive(idx);
        }
      });
    }, options);

    cardRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (idx) => {
    const clamped = Math.max(0, Math.min(idx, TEAM.length - 1));
    const el = cardRefs.current[clamped];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goTo(active + 1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goTo(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
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
                buttonText={t("assessment")}
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
        <section className="team-scroller" ref={containerRef} aria-label="Our Team">
        {TEAM.map((m, i) => (
            <article
            key={i}
            className="member"
            data-idx={i}
            ref={(el) => (cardRefs.current[i] = el)}
            >
            <div className="member-inner">
                <img className="avatar" src={m.photo} alt={`${m.name} portrait`} />
                <div className="info">
                <h2>{m.name}</h2>
                <p className="role">{m.role}</p>
                <p className="bio">{m.bio}</p>
                <div className="links">
                    {m.links.IG && (
                    <a href={m.links.IG} target="_blank" rel="noreferrer">
                      <img src={IG} className="picoflogo"></img>
                      Instagram
                    </a>
                    )}
                </div>
                </div>
            </div>
            </article>
        ))}

        {/* Sticky controls */}
        <div className="controls" role="navigation" aria-label="Member navigation">
            <div className="dots">
            {TEAM.map((_, i) => (
                <button
                key={i}
                className={`dot ${i === active ? "active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to ${i + 1}`}
                />
            ))}
            </div>
        </div>
        </section>
    </>
  );
}
