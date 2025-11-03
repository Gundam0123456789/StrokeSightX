import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';
import './ARM.css';
import { Link, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore  } from '../../../component/auth';
import Swal from 'sweetalert2';

import Audiobutton from "./NarratorAsset/Audiobutton.png";
import Audiomutebutton from "./NarratorAsset/Audiomutebutton.png";
import ARMnarrator from "./NarratorAsset/ARMnarrator.mp3";
import ArmRaise from './ArmRaise.png';

const ArmStrengthTest = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const mpCameraRef = useRef(null);
  const countdownTimer = useRef(null);
  const audioRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isInPosition, setIsInPosition] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [correctPoseTime, setCorrectPoseTime] = useState(0);
  const [showPopup, setShowPopup] = useState(true);
  const [testCompleted, setTestCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [allowed, setAllowed] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [armResult, setArmResult] = useState(null);

  const targetArmAngle = 90;
  const angleTolerance = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const patientName = localStorage.getItem('patientName');

  }, [navigate]);

  useEffect(() => {
    if (allowed !== true) return;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    pose.onResults((results) => {
      if (isReady && testStarted && !testCompleted) {
        processResults(results);
      }
    });

    poseRef.current = pose;
    setIsReady(true);

    return () => {
      if (poseRef.current) {
        try {
          poseRef.current.close();
        } catch (e) {
          console.warn('Error closing pose:', e);
        }
      }
      clearInterval(countdownTimer.current);
    };
  }, [allowed, isReady, testStarted, testCompleted]);

  useEffect(() => {
     navigator.mediaDevices.getUserMedia({ video: true })
    .then(() => setAllowed(true))
    .catch(() => setAllowed(false));
    if (allowed !== true) return;
    if (!webcamRef.current?.video || !isReady || !testStarted || testCompleted) return;

    const videoElement = webcamRef.current.video;

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        try {
          if (poseRef.current && !testCompleted) {
            await poseRef.current.send({ image: videoElement });
          }
        } catch (e) {
          console.warn('Error sending frame to pose:', e);
        }
      },
      width: 640,
      height: 480,
    });

    camera.start();
    mpCameraRef.current = camera;

    return () => {
      if (mpCameraRef.current) {
        try {
          mpCameraRef.current.stop();
        } catch (e) {
          console.warn('Error stopping camera:', e);
        }
      }
    };
  }, [allowed, isReady, testStarted, testCompleted]);

  useEffect(() => {
    
    if (allowed !== true) return;
    if (testStarted && countdown > 0 && !testCompleted) {
      countdownTimer.current = setInterval(() => {
        setCountdown((prev) => {
          const newCount = prev - 1;
          const newProgress = ((15 - newCount) / 15) * 100;
          setProgress(newProgress);

          if (isInPosition) {
            setCorrectPoseTime((prevTime) => prevTime + 1);
          }

          if (newCount <= 0) {
            clearInterval(countdownTimer.current);
            setTestCompleted(true);
            setTestStarted(false);
            
            // Determine result and store to Firebase
            const result = correctPoseTime >= 10 ? "no" : "yes";
            setArmResult(result);
            storeArmResult(result);
            
            return 0;
          }
          return newCount;
        });
      }, 1000);
    } else {
      clearInterval(countdownTimer.current);
    }
    return () => clearInterval(countdownTimer.current);
  }, [allowed, testStarted, isInPosition, testCompleted, correctPoseTime]);

  const storeArmResult = async (result) => {
  try {
    const docId = localStorage.getItem("patientId");
    if (docId) {
      const docRef = doc(firestore , "patients_topform", docId);
      await updateDoc(docRef, {
        armResult: result
      });
      console.log("Arm test result saved to Firestore");

    await Swal.fire({
      title: 'ประเมินเสร็จสิ้น',
      icon: 'success',
      confirmButtonText: 'ถัดไป'
    }).then(() => changePage());


      changePage(); // 🔁 go to next page after confirmation
    }
  } catch (err) {
    console.error("Error updating Firestore:", err);
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถบันทึกผลการประเมินได้',
      icon: 'error',
      timer: 1000
    });
  }
};


  const calculateAngle = (A, B, C) => {
    const radians = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  const isWristAboveShoulder = (shoulder, wrist, canvasHeight) => {
    return wrist.y * canvasHeight < shoulder.y * canvasHeight;
  };

  const processResults = (results) => {
    const canvasElement = canvasRef.current;
    if (!canvasElement || !webcamRef.current?.video) return;

    const canvasCtx = canvasElement.getContext('2d');
    canvasElement.width = webcamRef.current.video.videoWidth;
    canvasElement.height = webcamRef.current.video.videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);

    const landmarks = results.poseLandmarks;
    if (!landmarks) {
      canvasCtx.restore();
      return;
    }

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    let anyArmCorrect = false;

    ['left', 'right'].forEach((side) => {
      const shoulder = side === 'right' ? rightShoulder : leftShoulder;
      const wrist = side === 'right' ? rightWrist : leftWrist;

      if (shoulder && wrist) {
        const shoulderPoint = { x: shoulder.x * canvasElement.width, y: shoulder.y * canvasElement.height };
        const wristPoint = { x: wrist.x * canvasElement.width, y: wrist.y * canvasElement.height };

        if (isWristAboveShoulder(shoulder, wrist, canvasElement.height)) {
          const armAngle = calculateAngle(
            shoulderPoint,
            wristPoint,
            { x: wristPoint.x, y: shoulderPoint.y }
          );

          const inTarget = Math.abs(armAngle - targetArmAngle) < angleTolerance;
          if (inTarget) anyArmCorrect = true;

          canvasCtx.strokeStyle = inTarget ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255, 82, 82, 0.8)';
          canvasCtx.lineWidth = 4;
          canvasCtx.beginPath();
          canvasCtx.moveTo(shoulderPoint.x, shoulderPoint.y);
          canvasCtx.lineTo(wristPoint.x, wristPoint.y);
          canvasCtx.stroke();

          canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          canvasCtx.font = 'bold 16px Arial';
          canvasCtx.fillText(`${Math.round(armAngle)}°`, wristPoint.x - 40, wristPoint.y - 10);

          if (!inTarget) {
            canvasCtx.fillStyle = 'rgba(255, 82, 82, 0.8)';
            canvasCtx.fillText(`Target: ${targetArmAngle}°`, wristPoint.x - 40, wristPoint.y + 20);
          }
        }
      }
    });

    setIsInPosition(anyArmCorrect);
    drawConnectors(canvasCtx, landmarks, Pose.POSE_CONNECTIONS, {
      color: '#FFFFFF80',
      lineWidth: 1,
    });
    canvasCtx.restore();
  };

  const startTest = () => {
    setShowPopup(false);
    setTestStarted(true);
    setCountdown(15);
    setTestCompleted(false);
    setCorrectPoseTime(0);
    setProgress(0);
  };

  const changePage = () => {
    if (mpCameraRef.current) {
      try {
        mpCameraRef.current.stop();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
    }
    const stream = webcamRef.current?.video?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate("/BEFAST_MAIN_SPEECH");
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  const getCircleColor = () => {
    return isInPosition ? '#4CAF50' : '#FF9800';
  };

  if (allowed === null) return <div>Loading...</div>;
  if (allowed === false) return null;

  return (
    <div className="arm-test-container">
      <div className='HeaderARM'>แบบประเมินภาวะอ่อนแรง</div>
<Link to="/BEFAST_MAIN_SPEECH" className='login'>next</Link>
      {showPopup && (
        <div className="instruction-popup">
          <div className="popup-content" style={{ fontFamily: "Prompt" }}>
            <h2 style={{ fontSize: "35px" }}>วิธีการประเมิน</h2>
            <div className="instruction-steps">
              <div className="step">1. ยืนหันข้าง 70 องศา ให้กับกล้อง</div>
              <div className="step">2. ยกแขนขึ้น 90 องศา</div>
              <div className="step">3. ยกแขนค้างไว้ 10 วินาที</div>
              <div className='ArmRaiseContainer'><img src={ArmRaise} className='ArmRaise' alt="Arm Raise Example" /></div>
            </div>
            <audio ref={audioRef} src={ARMnarrator} autoPlay />
            <div className="ismutepiccontainer">
              <button onClick={toggleMute} className="ismutepicARM">
                <img src={isMuted ? Audiobutton : Audiomutebutton} style={{width:"60px", height:"auto"}} alt="Audio Toggle" />
              </button>
            </div>
            <button onClick={startTest} className="insideStart">เริ่ม</button>
          </div>
        </div>
      )}

      <div className="camera-container">
      <Webcam 
         ref={webcamRef}
         className="webcam-feed"
         screenshotFormat="image/jpeg"
         videoConstraints={{ facingMode: 'user' }}
         mirrored
       />
        <canvas ref={canvasRef} className="overlay-canvas" />
      </div>

      {testStarted && (
    <div className="test-status-overlay">
      <div className="test-status">
        <div className="progress-container">
          <svg className="progress-circle" viewBox="0 0 36 36">
            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path
              className="circle-fill"
              stroke={getCircleColor()}
              strokeDasharray={`${progress}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="countdown-text">{countdown}s</div>
        </div>
        <p className={`status-message ${isInPosition ? 'success' : 'warning'}`}>
          {isInPosition ? <span className="pulse-icon">✓</span> : <span>!</span>} {isInPosition ? 'Hold steady!' : 'Raise your arm to 90°'}
        </p>
        
      </div>
    </div>
  )}

    </div>
  );
};

export default ArmStrengthTest;