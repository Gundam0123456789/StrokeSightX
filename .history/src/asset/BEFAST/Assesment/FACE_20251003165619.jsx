import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../../../component/auth";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import Swal from "sweetalert2";
import "./FaceAsymmetry.css";
import { useTranslation } from 'react-i18next';
import LanguageSwitch from "../../../component/LanguageSwitch";

// ── Config ──────────────────────────────────────────────────────────────
const LOCAL_PATH_ROOT = "/models";
const LOCAL_PATH_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL)
  ? import.meta.env.BASE_URL
  : (process.env.PUBLIC_URL || "/");
const PUBLIC_URL = process.env.PUBLIC_URL ?? "";

const MIRRORS = [
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model",
  "https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js/weights",
];

const MANIFEST_NAME = "face_landmark_68_model-weights_manifest.json";

const DETECTOR_OPTS = new faceapi.SsdMobilenetv1Options({
  minConfidence: 0.6,
  maxResults: 1,
});

export default function FaceAsymmetry() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(0); // 0 = no countdown
  const countdownRef = useRef(null);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [faceCentered, setFaceCentered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [imageCaptured, setImageCaptured] = useState(false);
  const MIRROR_PREVIEW = true;

  const loopRef = useRef(null);
  
  // ── Lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    const patientId = localStorage.getItem("patientId");
    



    (async () => {
      try {
        setLoading(true);
        const baseUrl = await resolveModelBaseUrl();
        await loadModels(baseUrl);
        await startCamera();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    })();
    return () => stopEverything();
    if (countdownRef.current) clearInterval(countdownRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // First effect: load models only
/*useEffect(() => {
  const patientId = localStorage.getItem("patientId");
  if (!patientId) {
    navigate('/patientDetail');
    return;
  }
  (async () => {
    try {
      setLoading(true);
      const baseUrl = await resolveModelBaseUrl();
      await loadModels(baseUrl);
      // DO NOT call startCamera() here!
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  })();
  return () => stopEverything();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);*/

// New effect: actually start camera only after <video> is mounted and loading is done
useEffect(() => {
  if (!loading && videoRef.current) {
    startCamera();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [loading, videoRef]);

  // ── Model loader with path probing ────────────────────────────────────
  const resolveModelBaseUrl = async () => {
    const candidates = [
      LOCAL_PATH_ROOT,
      `${LOCAL_PATH_BASE}models`,
      `${PUBLIC_URL}/models`,
      ...MIRRORS,
    ];
    for (const url of candidates) {
      const probeUrl = `${url.replace(/\/$/, "")}/${MANIFEST_NAME}`;
      try {
        const r = await fetch(probeUrl, { method: "HEAD" });
        if (r.ok) {
          console.info(`✅ face‑api models found at ${url}`);
          return url;
        }
      } catch (_) {}
    }
    throw new Error(
      "Failed to locate face‑recognition models. Ensure /models exists or allow internet to fetch CDN weights."
    );
  };

  const loadModels = (baseUrl) =>
    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(baseUrl),
      faceapi.nets.faceLandmark68Net.loadFromUri(baseUrl),
    ]);

  // ── Camera helpers ────────────────────────────────────────────────────
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
    });
    let retries = 0;
    while (!videoRef.current && retries < 10) {
      await new Promise(res => setTimeout(res, 50));
      retries++;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    } else {
      throw new Error("Camera error: video element not ready.");
    }
  };

  const stopEverything = () => {
  if (videoRef.current?.srcObject) {
    videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    videoRef.current.srcObject = null; // Optionally clear
  }
  clearInterval(loopRef.current);
  loopRef.current = null;
};

  // ── Geometry helpers ──────────────────────────────────────────────────
  const deg = (rad) => (rad * 180) / Math.PI;
  const eyeCenter = (lms, idx) => {
    const pts = idx.map((i) => lms[i]);
    return {
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    };
  };
  const headRoll = (lms) => {
    const L = eyeCenter(lms, [36, 37, 38, 39, 40, 41]);
    const R = eyeCenter(lms, [42, 43, 44, 45, 46, 47]);
    return deg(Math.atan2(R.y - L.y, R.x - L.x));
  };

  const PAIRS = [
    [17, 26], [18, 25], [19, 24], [20, 23], [21, 22],
    [36, 45], [39, 42], [37, 44], [40, 47], [31, 35],
    [48, 54], [49, 53], [50, 52], [61, 63], [62, 66],
  ];

  const symmetryScore = (lms) => {
    const nose = lms[30];
    const sum = PAIRS.reduce((acc, [l, r]) => {
      const L = lms[l];
      const R = lms[r];
      return acc + Math.hypot(L.x - (2 * nose.x - R.x), L.y - R.y);
    }, 0);
    const iod = Math.hypot(lms[36].x - lms[45].x, lms[36].y - lms[45].y);
    return sum / PAIRS.length / iod;
  };

  // ── Live preview loop + auto-capture ─────────────────────────────────
  const onPlay = () => {
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(async () => {
      if (detecting || finished || imageCaptured) return;
      if (!canvasRef.current || !videoRef.current) return;

      const det = await faceapi
        .detectSingleFace(videoRef.current, DETECTOR_OPTS)
        .withFaceLandmarks();

      if (!canvasRef.current || !videoRef.current) return;

      const dim = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, dim.width, dim.height);

      if (det) {
        const resized = faceapi.resizeResults(det, dim);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);

        // centre & size check
        const box = resized.detection.box;
        const centreOK =
          Math.abs(box.x + box.width / 2 - dim.width / 2) < 50 &&
          Math.abs(box.y + box.height / 2 - dim.height / 2) < 50 &&
          box.width > 160;
        setFaceCentered(centreOK);

        // === AUTO-CAPTURE ===
        if (centreOK && !detecting && !imageCaptured) {
  setFaceCentered(true);
  // Start countdown if not already started
  if (countdown === 0 && !countdownRef.current) {
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setCountdown(0);
          setImageCaptured(true);
          captureAndAnalyze(); // AUTO-CAPTURE!
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }
} else {
  setFaceCentered(false);
  // Cancel countdown if user moves out
  if (countdownRef.current) {
    clearInterval(countdownRef.current);
    countdownRef.current = null;
    setCountdown(0);
  }
}

      } else {
        setFaceCentered(false);
      }
    }, 250);
  };

  const captureAndAnalyze = async () => {
    setDetecting(true);
    // 1. Capture current frame to a temp canvas
    const video = videoRef.current;
    if (!video) {
      setDetecting(false);
      setImageCaptured(false);
      return;
    }
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    tempCanvas.getContext("2d").drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    // 2. Analyze the static image
    const det = await faceapi
      .detectSingleFace(tempCanvas, DETECTOR_OPTS)
      .withFaceLandmarks();

    if (!det) {
      setDetecting(false);
      Swal.fire("Error", "ไม่สามารถวิเคราะห์ภาพได้ กรุณาลองใหม่", "error");
      setImageCaptured(false); // allow retry
      return;
    }
    // 3. Calculate symmetry
    const lms = det.landmarks.positions;
    const score = symmetryScore(lms);
    const flag = score > 0.15 ? "yes" : "no";
    await saveToFirebase(score, flag);

    setFinished(true);
    setDetecting(false);

    Swal.fire({
      title: t('standyes'),
      icon: "success",
      confirmButtonText: "ถัดไป",
      allowOutsideClick: false,
    }).then(() => navigate("/BEFAST_MAIN_ARM"));
  };

  const saveToFirebase = async (score, flag) => {
    try {
      const pid = localStorage.getItem("patientId");
      if (!pid) return navigate("/patientDetail");
      await setDoc(
        doc(firestore, "patients_topform", pid),
        {
          faceAsymmetryScore: score.toFixed(3),
          faceAsymmetryResult: flag,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Failed to save result", "error");
    }
  };

  // --- The rest: Render/JSX
  return (
    <div className="face-asymmetry-container">
      <LanguageSwitch />
      <h2 className="face-asymmetry-title" style={{ color: "#b897ff" }}>
        {t('faceheader')}
      </h2>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Loading facial-recognition models…</p>
        </div>
      ) : (
        <>
          <div className="video-canvas-wrapper">
            {!finished && (
              <>
               <video
                 ref={videoRef}
                 autoPlay
                 muted
                 onPlay={onPlay}
                 className={`video-element ${MIRROR_PREVIEW ? 'mirror' : ''}`}
               />
               <canvas ref={canvasRef} className={`canvas-overlay ${MIRROR_PREVIEW ? 'mirror' : ''}`} />
                <div className="capture-frame">
                  <div className="frame-border" />
                  {faceCentered && countdown > 0 && (
                    <div className="countdown-overlay">
                      <div className="countdown-circle">{countdown}</div>
                      <p>{t("staystill")} {countdown}…</p>
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
          <Link to="/BEFAST_MAIN_ARM" className='login'>next</Link>
          <div className="instructions">
            {!finished ? (
              <>
                <p style={{ marginTop: 20 }}>{t("instructionforface1")}</p>
                <p>{t("instructionforface2")}</p>
                {faceCentered && !detecting && !imageCaptured && (
                  <p className="face-detected">{</p>
                )}
              </>
            ) : (
              <p className="assessment-complete" style={{ marginTop: 20 }}>
                กำลังแสดงผลลัพธ์…
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
