import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import './EYE.css';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore  } from '../../../component/auth';
import EYESpace from './EYESpace.png'
import { useNavigate } from 'react-router-dom';
import Audiobutton from "./NarratorAsset/Audiobutton.png";
import Audiomutebutton from "./NarratorAsset/Audiomutebutton.png";
import EYEnarrator from "./NarratorAsset/EYEnarrator.mp3"

function EYE() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('notice');
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [missedCount, setMissedCount] = useState(0);
  const [dotsShown, setDotsShown] = useState(0);
  const [countdown, setCountdown] = useState(0); // New state for countdown
  const [topLeftClick, setTopLeftClick] = useState(0);
  const [topRightClick, setTopRightClick] = useState(0);
  const [bottomLeftClick, setBottomLeftClick] = useState(0);
  const [bottomRightClick, setBottomRightClick] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const scoreRef = useRef(0);
  const missedCountRef = useRef(0);
  const dotsShownRef = useRef(0);

  const stimulusQueue = useRef([]);
  const countdownRef = useRef(null);
  const stimulusTimeoutRef = useRef(null);
  const cooldownTimeoutRef = useRef(null);
  const startCountdownRef = useRef(null); // New ref for countdown timer

  const generateRandomPosition = (quarter) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    let minX, maxX, minY, maxY;

    switch (quarter) {
      case 'top-left':
        minX = 50; maxX = screenWidth / 2 - 50;
        minY = 50; maxY = screenHeight / 2 - 50;
        break;
      case 'top-right':
        minX = screenWidth / 2 + 50; maxX = screenWidth - 50;
        minY = 50; maxY = screenHeight / 2 - 50;
        break;
      case 'bottom-left':
        minX = 50; maxX = screenWidth / 2 - 50;
        minY = screenHeight / 2 + 50; maxY = screenHeight - 50;
        break;
      case 'bottom-right':
        minX = screenWidth / 2 + 50; maxX = screenWidth - 50;
        minY = screenHeight / 2 + 50; maxY = screenHeight - 50;
        break;
      default:
        minX = 50; maxX = screenWidth / 2 - 50;
        minY = 50; maxY = screenHeight / 2 - 50;
    }

    return {
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY,
    };
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  const startTest = () => {
    setScore(0);
    setMissedCount(0);
    setDotsShown(0);
    scoreRef.current = 0;
    missedCountRef.current = 0;
    dotsShownRef.current = 0;
    stimulusQueue.current = [];
    setCurrentStimulus(null);
    setTimeLeft(60);
    
    // Start 3-second countdown
    setCountdown(5);
    setStage('countdown');
    
    startCountdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(startCountdownRef.current);
          setStage('test');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishTest = async () => {
    clearInterval(countdownRef.current);
    clearTimeout(stimulusTimeoutRef.current);
    clearTimeout(cooldownTimeoutRef.current);
    setCurrentStimulus(null);
    
    const resultToStore = missedCountRef.current >= 6 ? "yes" : "no";
    const patientId = localStorage.getItem("patientId");
    
    if (!patientId) {
      Swal.fire('ไม่พบข้อมูลผู้ป่วย', 'กรุณากรอกข้อมูลผู้ป่วยก่อนเริ่มการทดสอบ', 'error');
      navigate('/patientDetail');
      return;
    }

    try {
      const docRef = doc(firestore , "patients_topform", patientId);
      await updateDoc(docRef, {
        eyeTestResult: resultToStore,
        eyeTestDotsShown: dotsShownRef.current,
        eyeTestMissed: missedCountRef.current,
        eyeTestClicked: scoreRef.current,
        topLeftClick,
        topRightClick,
        bottomLeftClick,
        bottomRightClick,
      });
    } catch (err) {
      console.error("Error updating Firebase:", err);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกผลได้", "error");
      return;
    }

    Swal.fire({
      title: "ประเมินเสร็จสิ้น",
      icon: "success",
      confirmButtonText: "ถัดไป"
    }).then(() => {
      navigate('/BEFAST_MAIN_FACE');
    });

    setStage("result");
  };

  useEffect(() => {
    if (stage !== 'test') return;

    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const runStimulusLoop = () => {
  if (dotsShownRef.current >= 30) {
    finishTest();
    return;
  }

  const quarters = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  const quarter = quarters[Math.floor(Math.random() * quarters.length)];
  const pos = generateRandomPosition(quarter);
  const id = Date.now();

  const stim = {
    id,
    x: pos.x,
    y: pos.y,
    color: '#ffffff',
    shownAt: Date.now(),
    quarter
  };

  setCurrentStimulus(stim);
  stimulusQueue.current.push(stim);
  
  setDotsShown(prev => {
    const updated = prev + 1;
    dotsShownRef.current = updated;
    return updated;
  });

  stimulusTimeoutRef.current = setTimeout(() => {
    const matched = stimulusQueue.current.find(s => s.id === id);
    if (matched && !matched.hit) {
      setMissedCount(prev => {
        const updated = prev + 1;
        missedCountRef.current = updated;
        return updated;
      });
    }

    setCurrentStimulus(null);

    cooldownTimeoutRef.current = setTimeout(() => {
      if (stage === 'test') {
        runStimulusLoop();
      }
    }, Math.floor(Math.random() * (2000 - 800 + 1)) + 800);
  }, 500);
};

    runStimulusLoop();

    return () => {
      clearInterval(countdownRef.current);
      clearTimeout(stimulusTimeoutRef.current);
      clearTimeout(cooldownTimeoutRef.current);
    };
  }, [stage]);

  useEffect(() => {
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.warn("Auto-play failed:", e));
      }
    }, []);

  useEffect(() => {
    return () => {
      // Clean up countdown timer when component unmounts
      if (startCountdownRef.current) {
        clearInterval(startCountdownRef.current);
      }
    };
  }, []);

  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.code === 'Space' && currentStimulus) {
      const { quarter } = currentStimulus;

      switch (quarter) {
        case 'top-left':
          setTopLeftClick(c => c + 1);
          break;
        case 'top-right':
          setTopRightClick(c => c + 1);
          break;
        case 'bottom-left':
          setBottomLeftClick(c => c + 1);
          break;
        case 'bottom-right':
          setBottomRightClick(c => c + 1);
          break;
        default:
          break;
      }

      const updatedQueue = stimulusQueue.current.map(stim =>
        stim.id === currentStimulus.id ? { ...stim, hit: true } : stim
      );
      stimulusQueue.current = updatedQueue;

      setScore(prev => {
        const updated = prev + 1;
        scoreRef.current = updated;
        return updated;
      });

      setCurrentStimulus(null);
    }
  };


  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [currentStimulus]);

 useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.warn("Auto-play failed:", e));
    }
  }, []);
  return (
    <div className="container">
      {stage === 'notice' && (
        <div className="notice" style={{ fontFamily: "Prompt", marginTop: "40px", width:"880px" }}>
          <div className='EYEheader' style={{fontSize:"70px"}}>แบบประเมินสายตา</div>
          <h2 style={{ fontSize: "35px", textDecoration:"underline" }}>วิธีการประเมิน</h2>
          <div className='steps' style={{fontSize:"22px", textAlign:"left", marginLeft:"20px",color: "#787878"}}>
            <p>1. นั่งหน้าตรงเข้าหาหน้าจอ ห่างจากหน้าจอ ครึ่งแขน</p>
            <p>2. จ้องจุดสีเขียวกลางหน้าจอตลอดเวลาขณะทำการประเมิน</p>
            <p>3. หากเห็นจุดสีขาวขึ้นบนหน้าจอ ให้กด "Space Bar"</p>
          </div>
             
            <audio ref={audioRef} src={EYEnarrator} autoPlay />
            <button onClick={toggleMute} className="ismutepicEYE" style={{ background: "none", border: "none" }}>
              <img src={isMuted ? Audiobutton : Audiomutebutton} style={{ width: "50px", height: "auto" }} alt="Audio Toggle" />
            </button>
          
          <img src={EYESpace} style={{ height: "180px", width: "auto", marginBottom: "20px" }} />
          <h2 style={{ fontSize: "25px", color: "red" }}>⚠️ คำเตือน ⚠️</h2>
          <p style={{ fontSize: "25px" }}>หากรู้สึกเวียนหัว โปรดหยุดใช้งานทันที</p>
          <button
            className="insideStart"
            onClick={startTest}
            style={{ display: "block", margin: "0 auto", fontWeight:"500", fontSize:"25px" }}
          >
            เริ่ม
          </button>
        </div>
      )}
      
      {stage === 'countdown' && (
        <div className="countdown-overlay-EYE">
          <div className="fixation-dot"></div>
          <div className="countdown-text-EYE">{countdown}</div>
        </div>
      )}
      
      {stage === 'test' && (
        <>
          <div className="info-bar">
            <div className="timer">⏱ เหลือเวลา: {timeLeft}s</div>
            <div className="score">คะแนน: {score}</div>
            <div className="dots-count">จุดที่แสดง: {dotsShown}/30</div>
          </div>
          <div className="screen">
            <div className="fixation-dot"></div>
            {currentStimulus && (
              <div
                className="stimulus-dot"
                style={{
                  left: `${currentStimulus.x}px`,
                  top: `${currentStimulus.y}px`,
                  backgroundColor: currentStimulus.color,
                }}
              ></div>
            )}
          </div>
        </>
      )}
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
  );
}

export default EYE;