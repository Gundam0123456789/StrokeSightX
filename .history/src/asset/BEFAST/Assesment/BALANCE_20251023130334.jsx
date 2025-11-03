import React, { useRef, useEffect, useState } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Pose } from "@mediapipe/pose";
import { useNavigate, Navigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../component/auth";
import BALANCEnarrator from "./NarratorAsset/BALANCEnarrator.mp3";
import Swal from "sweetalert2";
import Audiobutton from "./NarratorAsset/Audiobutton.png";
import Audiomutebutton from "./NarratorAsset/Audiomutebutton.png";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "../../../component/LanguageSwitch";

// ====== CONSTANTS (ย้ายขึ้นมาด้านบนเพื่อไม่ให้ถูกอ้างอิงก่อนประกาศ) ======
const HORIZONTAL_LINE_RATIO = 0.7;
const ALLOWABLE_Y_DIFF = 0.07;

const BALANCE = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const cameraInstance = useRef(null);
  const hasSpoken = useRef(false); // กันพูดซ้ำ

  const patientId = localStorage.getItem("patientId");
  const patientName = localStorage.getItem("patientName");

  const [balanceScore, setBalanceScore] = useState(100);
  const [average, setAverage] = useState(null);
  const [balanceFlag, setBalanceFlag] = useState(null);
  const [isCalculatingAverage, setIsCalculatingAverage] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [startTriggered, setStartTriggered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [testPhase, setTestPhase] = useState("standby");
  const [isInCenter, setIsInCenter] = useState(false);
  const [centerCheckPassed, setCenterCheckPassed] = useState(false);
  const [deviation, setDeviation] = useState(null);
  const [standbyTimer, setStandbyTimer] = useState(10);

  const { t, i18n } = useTranslation();

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // map ภาษาแบบง่าย ๆ ตาม i18n
    const lang = i18n?.language || "th";
    utterance.lang = lang.startsWith("en") ? "en-US" : "th-TH";
    speechSynthesis.speak(utterance);
  };

  if (!patientName) {
    return <Navigate to="/PatientDetail" replace />;
  }

  // นับถอยหลังช่วง standby (ต้องยืนให้อยู่กลางเส้นทันเวลา)
  useEffect(() => {
    if (!startTriggered || testPhase !== "standby" || centerCheckPassed) return;
    if (standbyTimer === 0) {
      handleFailAssessment();
      return;
    }
    const timer = setTimeout(() => setStandbyTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [standbyTimer, testPhase, startTriggered, centerCheckPassed]);

  // เริ่ม Mediapipe Pose เมื่อ startTriggered = true
  useEffect(() => {
    if (!startTriggered) return;
    if (!videoRef.current || !canvasRef.current) return;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) await pose.send({ image: videoRef.current });
      },
      width: 740,
      height: 580,
    });

    camera.start();
    cameraInstance.current = camera;

    return () => {
      if (cameraInstance.current) {
        cameraInstance.current.stop();
        cameraInstance.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTriggered]);

  // เคาน์ต์ดาวน์เฟสเดิน/เก็บค่า
  useEffect(() => {
    if (countdown === null) return;

    const timer = setTimeout(() => {
      if (countdown > 0) {
        setCountdown((c) => c - 1);
        if (countdown === 8 && !hasSpoken.current) {
          speak(t("startwalk") || "เริ่มเดินได้");
          hasSpoken.current = true;
        }
      } else {
        if (testPhase === "counting") {
          startCollectingBalance();
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, testPhase]);

  // ตรวจว่าอยู่กลางเส้นแล้วค่อยเริ่มนับถอยหลัง
  useEffect(() => {
    if (
      testPhase === "standby" &&
      !centerCheckPassed &&
      deviation !== null &&
      deviation.x < 0.02 &&
      deviation.y < ALLOWABLE_Y_DIFF
    ) {
      setIsInCenter(true);
      setCenterCheckPassed(true);
      setCountdown(8);
      setTestPhase("counting");
      hasSpoken.current = false;
    }
  }, [testPhase, centerCheckPassed, deviation]);

  const handleFailAssessment = async () => {
    setShowInstructions(false);
    setTestPhase("finished");
    setStartTriggered(false);

    try {
      const docId = localStorage.getItem("patientId");
      if (docId) {
        const docRef = doc(firestore, "patients_topform", docId);
        await updateDoc(docRef, {
          balanceResult: "yes",
          balanceAverage: 0,
        });
      }
    } catch (err) {
      console.error("Error updating Firebase:", err);
    }

    Swal.fire({
      title: t("standno"),
      icon: "warning",
      confirmButtonText: t("Next"),
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/BEFAST_MAIN_EYES2");
      }
    });
  };

  const handleStart = () => {
    setShowInstructions(false);
    setStartTriggered(true);
    setTestPhase("standby");
    setCountdown(null);
    setIsInCenter(false);
    setCenterCheckPassed(false);
    setDeviation(null);
    setStandbyTimer(10);

    // เล่นเสียงหลังผู้ใช้กดปุ่ม (user gesture) กัน autoplay block
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.warn("Play failed:", e));
    }
  };

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    // mirror
    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, width, height);
    drawCenterLine(ctx, width, height);

    if (results.poseLandmarks) {
      drawSkeleton(ctx, results.poseLandmarks, width, height);
      drawLandmarks(ctx, results.poseLandmarks, width, height);
      checkBalance(results.poseLandmarks);
    }

    ctx.restore();
  };

  const drawCenterLine = (ctx, width, height) => {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    const horizontalLineY = height * HORIZONTAL_LINE_RATIO;
    ctx.beginPath();
    ctx.moveTo(0, horizontalLineY);
    ctx.lineTo(width, horizontalLineY);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  const drawSkeleton = (ctx, landmarks, width, height) => {
    ctx.strokeStyle = "#4169E1";
    ctx.lineWidth = 2;
    const connections = [
      [11, 12],
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      [11, 23],
      [12, 24],
      [23, 24],
      [23, 25],
      [25, 27],
      [27, 29],
      [29, 31],
      [24, 26],
      [26, 28],
      [28, 30],
      [30, 32],
    ];
    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        ctx.beginPath();
        ctx.moveTo(landmarks[start].x * width, landmarks[start].y * height);
        ctx.lineTo(landmarks[end].x * width, landmarks[end].y * height);
        ctx.stroke();
      }
    });
  };

  const drawLandmarks = (ctx, landmarks, width, height) => {
    ctx.fillStyle = "#FFA500";
    landmarks.forEach((lm) => {
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const checkBalance = (landmarks) => {
    if (!landmarks[11] || !landmarks[12]) return;
    const left = landmarks[11];
    const right = landmarks[12];
    const midX = (left.x + right.x) / 2;
    const midY = (left.y + right.y) / 2;

    const devX = Math.abs(midX - 0.5);
    const devY = Math.abs(midY - HORIZONTAL_LINE_RATIO);

    const percent = Math.max(0, 1 - devX * 2) * 100;
    setBalanceScore(parseFloat(percent.toFixed(2)));
    setDeviation({ x: devX, y: devY });
  };

  const startCollectingBalance = () => {
    if (isCalculatingAverage) return;

    if (videoRef.current) {
      videoRef.current.pause();
      const stream = videoRef.current.srcObject;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    }

    setIsCalculatingAverage(true);
    setAverage(null);
    setBalanceFlag(null);

    const samples = [];
    const interval = setInterval(() => samples.push(balanceScore), 100);

    setTimeout(async () => {
      clearInterval(interval);
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      const avgFixed = Number.isFinite(avg) ? avg.toFixed(2) : "0.00";
      const flag = avg < 70 ? "yes" : "no";

      setAverage(avgFixed);
      setBalanceFlag(flag);
      setIsCalculatingAverage(false);

      try {
        const docId = localStorage.getItem("patientId");
        if (docId) {
          const docRef = doc(firestore, "patients_topform", docId);
          await updateDoc(docRef, {
            balanceResult: flag,
            balanceAverage: avgFixed,
          });
        }
      } catch (err) {
        console.error("Error updating Firebase:", err);
      }

      Swal.fire({
        title: t("standyes"),
        icon: "success",
        confirmButtonText: t("Next"),
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/BEFAST_MAIN_EYES2");
        }
      });
    }, 1000);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  return (
    <div className="container">
      {/* Top bar: ชื่อหน้ากับสวิตช์ภาษา */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 800,
          margin: "0 auto",
          paddingTop: 8,
        }}
      >
        <div className="BALANCEheader" style={{ fontFamily: "Prompt", fontSize: 24 }}>
          {t("balance")}
        </div>
        <LanguageSwitch />
      </div>

      {showInstructions && (
        <div className="instruction-popup" style={{ alignItems: "center", textAlign: "center" }}>
          <div className="popup-content" style={{ fontFamily: "Prompt" }}>
            <h2 style={{ fontSize: "35px", marginTop: "20px", textDecoration: "underline" }}>
              {t("howtodo")}
            </h2>
            <div className="instruction-steps" style={{ color: "#787878", marginLeft: "-30px" }}>
              <div className="step">1. {t("Exforbalance1")}</div>
              <div className="step">2. {t("Exforbalance2")}</div>
            </div>

            {/* เอา autoplay ออก แล้วไปเล่นหลังผู้ใช้กด Start */}
            <audio ref={audioRef} src={BALANCEnarrator} />

            <div className="ismutepiccontainer">
              <button onClick={toggleMute} className="ismutepicBALANCE">
                <img
                  src={isMuted ? Audiobutton : Audiomutebutton}
                  style={{ width: "60px", height: "auto" }}
                  alt="Audio Toggle"
                />
              </button>
            </div>

            <button onClick={handleStart} className="insideStart" style={{ marginTop: "-20px", marginBottom: "20px" }}>
              {t("start")}
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        {testPhase === "standby" && !isInCenter && (
          <>
            <p style={{ fontSize: 24, fontFamily: "Prompt", fontWeight: "bold", marginTop: 20 }}>{t("stand")}</p>
            <p style={{ fontSize: 24, color: "#b22", fontFamily: "Prompt", marginTop: "-1vw" }}>
              {t("time")}
              {standbyTimer} {t("second")}
            </p>
          </>
        )}

        {testPhase === "counting" && countdown !== true && (
          <>
            <p style={{ fontSize: 24, fontFamily: "Prompt", fontWeight: "bold" }}>
              {/* แสดง “เริ่มเดินได้” ไปแล้วผ่าน voice ที่วินาที 8 */}
              <span style={{ color: "lime" }}>{t("startwalk")}</span>{" "}
              <span style={{ fontWeight: "bold" }}> {t("timeleft")}</span>
            </p>
            <p style={{ fontSize: 32, fontFamily: "Prompt", fontWeight: "bold", marginTop: "-1vw" }}>
              {countdown} {t("second")}
            </p>
          </>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: "absolute",
            left: "-10000px", // ซ่อนนอกจอ
            top: "-9px",
            width: "1px",
            height: "1px",
          }}
        />

        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={`${testPhase === "standby" ? "VideoBoxred" : "VideoBoxgreen"} ${
            startTriggered ? "active" : ""
          }`}
          style={{ visibility: startTriggered ? "visible" : "hidden", marginTop: "-16px" }}
        />
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
};

export default BALANCE;
