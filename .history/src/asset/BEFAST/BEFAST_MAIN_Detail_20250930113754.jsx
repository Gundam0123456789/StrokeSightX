import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../component/LoginRegister.css';
import Doctor from './asset_pic/Doctor-Detail.png';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';

const questions = [
  { text: "คุณเคยมีอาการมองไม่ชัด" },
  { text: "ประวัติการเจ็บป่วยในอดีตที่สำคัญ และเกี่ยวข้องกับปัญหาที่มาหรืออาจส่งผลต่อปัญหาปัจจุบัน" },
  { text: "ประวัติความเจ็บป่วยในครอบครัวที่เกี่ยวข้องกับการเจ็บป่วยในครั้งนี้" },
  { text: "ประวัติการแพ้ยา / ประวัติการรักษาที่ผ่านมา" },
  { text: "ประวัติการใช้สารเสพติด การสูบบุหรี่ การดื่มสุรา โดยระบุจำนวน ความถี่ และระยะเวลา" },
  { text: "ประวัติการผ่าตัด (ถ้ามี)" },
];

export function BEFAST_MAIN_Detail() {
  // answers: [{ text: string, none: boolean }, ...]
  const [answers, setAnswers] = useState(() =>
    Array.from({ length: questions.length }, () => ({ text: '', none: false }))
  );

  // ครบเมื่อ ข้อใดข้อหนึ่งมี text หรือ ติ๊ก "ไม่มี"
  const allAnswered = answers.every(a => a.none || a.text.trim() !== '');

  const container = {
    fontFamily: "'Prompt', sans-serif",
    width: "clamp(30rem, 60vw, 90rem)",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#ffffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };
  const left = { width:"clamp(5rem, 20vw, 25rem)",backgroundColor: "#76b624ff", };
  const right = { position: 'relative', alignSelf: 'start',backgroundColor: "#630000ff", };
  const nextBtn = {
    position: 'relative',
    zIndex: 9999,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '0.5vh 1vh',
    borderRadius: "clamp(0.5rem , 0.8vw , 1.1rem)",
    textDecoration: 'none',
    background: allAnswered ? '#616edf' : '#9aa0a6',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '3vw',
    marginTop: '5vw'
  };
  const imgStyle = { display: 'block', width: "clamp(20rem , 30vw, 40rem)", height: 'auto', marginTop: '-3vw' };

  return (
    <>
      <div className="Detail">ซักประวัติ</div>

      <div style={container}>
        <section style={left}>
          <div className="Helo">
            {questions.map((q, index) => {
              const a = answers[index];
              return (
                <div key={index} style={{ marginBottom: 16 }}>
                  <p style={{ marginBottom: 8 }}>{q.text}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="text"
                      placeholder="พิมพ์คำตอบของคุณตรงนี้"
                      className="BTN-02"
                      value={a.text}
                      disabled={a.none}              // ถ้าติ๊ก "ไม่มี" ให้ปิดการพิมพ์
                      onChange={(e) => {
                        const value = e.target.value;
                        setAnswers(prev => {
                          const next = [...prev];
                          next[index] = { ...next[index], text: value };
                          return next;
                        });
                      }}
                    />

                    <label className="chk" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        className="BTN-yesno"
                        checked={a.none}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAnswers(prev => {
                            const next = [...prev];
                            // ถ้าติ๊ก "ไม่มี" ให้เคลียร์ข้อความเพื่อกันสับสน
                            next[index] = { text: checked ? '' : next[index].text, none: checked };
                            return next;
                          });
                        }}
                        aria-label="ไม่มี"
                        title="ไม่มี"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside style={right}>
          <Link
            to={allAnswered ? "/BEFAST_MAIN_BALANCE" : "#"}
            style={nextBtn}
            onClick={(e) => {
              if (!allAnswered) {
                e.preventDefault();
                Swal.fire({
                  title: 'กรุณาตรวจสอบข้อมูล',
                  text: 'กรอกข้อมูลให้ครบถ้วน (ตอบหรือเลือก "ไม่มี" ให้ครบทุกข้อ)',
                  icon: 'error'
                });
              }
            }}
          >
            ถัดไป
          </Link>

          <img src={Doctor} alt="Doctor" style={imgStyle} />
        </aside>

        {/* ปุ่มลัดไว้เดิม */}
        <Link to="/BEFAST_MAIN_BALANCE" className="login">next</Link>
      </div>
    </>
  );
}