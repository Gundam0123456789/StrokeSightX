// BEFAST_MAIN_TIME.jsx
import React, { useState } from "react";
import "../../component/LoginRegister.css";
import { useNavigate, Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import { doc, setDoc } from "firebase/firestore"; // ✅ ใช้ setDoc + merge
import { firestore } from "../../component/auth";  // ✅ ให้แน่ใจว่าอันนี้คือ instance ที่ init แล้ว
import TIMEcomponent from "./asset_pic/TIMEcomponent.png";
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../component/LanguageSwitch';

import plus from "../../component/pic/Plus asset.png";

export function BEFAST_MAIN_TIME() {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  // แนะนำให้ใช้ patientId เป็น docId (unique) ถ้าไม่มีให้ fallback เป็น patientName
  const patientName = localStorage.getItem("patientName");
  const patientId = localStorage.getItem("patientId");
  const docId = patientId || patientName || "";

  // ถ้าต้อง “บังคับ” ให้มีผู้ป่วยก่อนเข้าหน้านี้ เปิดบรรทัดล่าง
  // if (!docId) return <Navigate to="/PatientDetail" replace />;

  const handleSubmit = async () => {
    // กันกดซ้ำ
    if (isSubmitting) return;

    // 1) validate input
    if (hours === "" || minutes === "" || isNaN(hours) || isNaN(minutes)) {
      Swal.fire({
        icon: "error",
        title: "กรอกข้อมูลไม่ถูกต้อง",
        text: "กรุณากรอกตัวเลขเท่านั้น",
        customClass: { text: "swal-text" },
      });
      return;
    }

    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (h < 0 || h > 23 || m < 0 || m > 59) {
      Swal.fire({
        icon: "error",
        title: "กรอกข้อมูลไม่ถูกต้อง",
        text: "ชั่วโมงต้องอยู่ระหว่าง 0-23 และนาทีต้องอยู่ระหว่าง 0-59",
        customClass: { text: "swal-text" },
      });
      return;
    }

    if (!docId) {
      Swal.fire({
        icon: "error",
        title: "ไม่พบข้อมูลผู้ป่วย",
        text: "กรุณากรอกข้อมูลผู้ป่วยก่อน (patientId / patientName)",
      });
      return;
    }

    const totalHours = h + m / 60;
    const TimeFactor = `${h}.${m.toString().padStart(2, "0")}`; // เช่น 2.05

    setIsSubmitting(true);

    const save = async (lat, lng) => {
      try {
        const ref = doc(firestore, "patients_topform", docId);
        await setDoc(
          ref,
          {
            TimeFactor,
            lat: lat ?? null,
            lng: lng ?? null,
            updatedAt: new Date().toISOString(), // บันทึกเวลาอัปเดตล่าสุด (optional)
          },
          { merge: true } // ✅ สร้างถ้าไม่มีก็ได้ อัปเดตถ้ามีแล้ว
        );

        // ถ้าต้องการลบเฉพาะชื่อออกจาก localStorage ก็ทำได้
        // localStorage.removeItem("patientName");

        if (totalHours > 4.5) {
          await Swal.fire({
            icon: "warning",
            title: "อาการนานเกิน 4.5 ชั่วโมง",
            text: "โปรดรับผลการประเมินทั้งหมดที่หน้าต่อไป",
            confirmButtonText: "ตกลง",
          });
        } else if (totalHours > 1) {
          await Swal.fire({
            icon: "info",
            title: "อาการนานเกิน 1 ชั่วโมง",
            text: "โปรดรับผลการประเมินทั้งหมดที่หน้าต่อไป",
            confirmButtonText: "ตกลง",
          });
        }

        navigate("/tele");
      } catch (error) {
        console.error("Firestore write failed:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง",
          confirmButtonText: "ตกลง",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    // 3) ตำแหน่งพิกัด (มี fallback)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => save(coords.latitude, coords.longitude),
      () => save(null, null)
    );
  };

  return (
    <div
      style={{
        pointerEvents: isSubmitting ? "none" : "auto",
        opacity: isSubmitting ? 0.5 : 1,
      }}
    >
      <LanguageSwitch />
      <div
        className="StrokeAwareCenter"
        style={{ fontWeight: "bold", letterSpacing: "5px" }}
      >
        B E F A S T
      </div>

      <div className="StrokeAwareTopRight">
        Stroke Sight
        <img
          src={plus}
          alt=""
          style={{ marginLeft: "20px", marginBottom: "2px" }}
        />
      </div>

      <div className="d-flex justify-content-center gap-4 mt-4 BoxContainer">
        <div className="MiddleBoxTestRowTIME">
          <div className="insideTitleBEFAST" style={{ fontFamily: "Poppins" }}>
            T I M E
          </div>

          <div className="image-container">
            <img src={TIMEcomponent} className="centerpictureMAIN5" alt="" />
          </div>

          <div className="insideTitleTHTIME" style={{ fontFamily: "Prompt" }}>
            {t("time-question")}{" "}
            <span style={{ fontWeight: "700", textDecoration: "underline" }}>
              ({t("any")})
            </span>
            <p style={{ fontWeight: "500", color: "#787878" }}>
              ** {t("none")} 0 : 0**
            </p>
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "45px",
                marginLeft: "-15px",
                fontFamily: "Prompt",
                fontWeight: "600",
                fontSize: "25px",
              }}
            >
              <div>{t("hour")}</div>
              <div>{t("min")}</div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()} // กัน scroll เปลี่ยนเลขโดยไม่ตั้งใจ
                style={{
                  width: "60px",
                  height: "60px",
                  fontSize: "24px",
                  textAlign: "center",
                  borderRadius: "10px",
                  border: "1px solid gray",
                  fontFamily: "Prompt",
                }}
                inputMode="numeric"
                placeholder="0"
              />
              <div style={{ fontSize: "24px" }}>:</div>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                style={{
                  width: "60px",
                  height: "60px",
                  fontSize: "24px",
                  textAlign: "center",
                  borderRadius: "10px",
                  border: "1px solid gray",
                  fontFamily: "Prompt",
                }}
                inputMode="numeric"
                placeholder="0"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="insideStart"
            disabled={isSubmitting}
            style={{
              marginTop: "20px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontFamily: "Prompt",
            }}
          >
            {isSubmitting ? "กำลังประมวลผล..." : }
          </button>
        </div>
      </div>

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
