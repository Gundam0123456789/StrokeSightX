import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../component/LoginRegister.css';
import Doctor from './asset_pic/Doctor-Detail.png';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import welcomeSound from "./asset_audio/BEFAST_PT_DETAIL.MP3";

const questions = [
  { text: "อาการหรือปัญหาที่ต้องเข้ารับการรักษา" },
  { text: "คุณเคยมีอาการมองไม่ชัด" },
  { text: "ประวัติการเจ็บป่วยในอดีตที่สำคัญ และเกี่ยวข้องกับปัญหาที่มาหรืออาจส่งผลต่อปัญหาปัจจุบัน" },
  { text: "ประวัติอื่น ๆ ที่เกี่ยวข้อง เช่น ประวัติส่วนตัว ประวัติครอบครัว" },
  { text: "ประวัติความเจ็บป่วยในครอบครัวที่เกี่ยวข้องกับการเจ็บป่วยในครั้งนี้" },
  { text: "ประวัติการแพ้ยา / ประวัติการรักษาที่ผ่านมา" },
  { text: "ประวัติการใช้สารเสพติด การสูบบุหรี่ การดื่มสุรา โดยระบุจำนวน ความถี่ และระยะเวลา" },
  { text: "ประวัติการผ่าตัด (ถ้ามี)" },
];

export function BEFAST_MAIN_Detail() {
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
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(''));
  const allAnswered = answers.every(v => v.trim() !== '');

  const container = {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: '24px',
    width: 'min(1100px, 92vw)',
    margin: '24px auto',
    padding: '16px',
    borderRadius: 12,
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'visible'
  };
  const left = { minWidth: 0 };
  const right = { position: 'relative', alignSelf: 'start' };
  const nextBtn = {
    position: 'relative',
    zIndex: 9999,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '0.5vh 1vh',
    borderRadius: 10,
    textDecoration: 'none',
    background: allAnswered ? '#616edf' : '#9aa0a6',
    color: '#fff',
    fontWeight: 'bold',
    fontSize:'3vw',
    marginTop:"5vw"
  };
  const imgStyle = {display: 'block', width: '100%', height: 'auto', marginTop:"-3vw"};


  return (
    <>
      <div className="Detail" >ซักประวัติ</div>

      <div style={container}>
        <section style={left}>
          {questions.map((q, index) => (
            <div key={index} style={{marginBottom: 16}}>
              <p style={{marginBottom: 8}}>{q.text}</p>
              <input
                type="text"
                placeholder="พิมพ์คำตอบ"
                value={answers[index]}
                onChange={(e) => {
                  setAnswers(prev => {
                    const next = [...prev];
                    next[index] = e.target.value;
                    return next;
                  });
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #d0d7de',
                  outline: 'none'
                }}
              />
            </div>
          ))}
        </section>

        <aside style={right}>
          {/* แสดงเสมอ แต่กันคลิกถ้ายังไม่ครบ -> ถ้าคลิกจะ alert */}
          <Link
            to={allAnswered ? "/BEFAST_MAIN_BALANCE" : "#"}
            style={nextBtn}
            onClick={(e) => {
              if (!allAnswered) {
                e.preventDefault();
                alert('กรอกให้ครบทุกข้อก่อนครับ');
              }
            }}
          >
            ถัดไป
          </Link>

          <img src={Doctor} alt="Doctor" style={imgStyle} />
        </aside>
        <Link to="/BEFAST_MAIN_BALANCE" className='login'>next</Link>
        <audio ref={audioRef} src={welcomeSound} />
      </div>


    
    </>
  );
}
