import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../component/LoginRegister.css';
import Doctor from './asset_pic/Doctor-Detail.png';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import { useTranslation } from "react-i18next";



export function BEFAST_MAIN_Detail() {
  const { t } = useTranslation('assessment');

  const questions = [
    { id: 'question1', text: t("question1") },
    { id: 'question2', text: t("question2") },
    { id: 'question3', text: t("question3") },
    { id: 'question4', text: t("question4") },
    { id: 'question5', text: t("question5") },
    { id: 'question6', text: t("question6") },
  ];
   const [answers, setAnswers] = useState(
    () => Array.from({ length: questions.length }, () => ({ text: '', none: false }))
  );
  // ครบเมื่อ ข้อใดข้อหนึ่งมี text หรือ ติ๊ก "ไม่มี"
  const allAnswered = answers.every(a => a.none || a.text.trim() !== '');

  const container = {
  fontFamily: "'Prompt', sans-serif",
  width: "clamp(30rem, 60vw, 90rem)",
  margin: "0 auto",
  padding: "20px",
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  display: "flex",
  alignItems: "flex-start",
  gap: "1rem",
  flexWrap: "wrap",        // lets them stack on small screens
  };
  const left  = { width: "clamp(10rem, 30vw, 35rem)" };
  const right = { flex: 1, minWidth: 0, position: "relative", alignSelf: "flex-start" };
  const imgStyle = { display: 'block', width: "clamp(10rem , 20vw, 40rem)", height: "clamp(10rem , 18vw, 40rem)", marginTop: '7vw', marginLeft:"4vw"};

  return (
    <>
      <div className="Detail">ซักประวัติ</div>

      <div style={container}>
        <section style={left}>
          <div className="Helo">
            {questions.map((q, index) => {
              <li key={q.id}>{q.text}</li>
              const a = answers[index];
              return (
                <div key={index} >
                  <p className='Helo'>{q.text}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom:'16px' }}>
                    <input
                      type="text"
                      placeholder="พิมพ์คำตอบของคุณตรงนี้"
                      className="BTN-02"
                      value={a.text}
                      disabled={a.none}              
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
          <a className={`next-btn ${allAnswered ? 'is-enabled' : 'is-disabled'}`}>
            <Link
              to={allAnswered ? "/BEFAST_MAIN_BALANCE" : "#"}
              className="next-btn"
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
          </a>
          <img src={Doctor} alt="Doctor" style={imgStyle} />
        </aside>

        {/* ปุ่มลัดไว้เดิม */}
        <Link to="/BEFAST_MAIN_BALANCE" className="login">next</Link>
      </div>
    </>
  );
}