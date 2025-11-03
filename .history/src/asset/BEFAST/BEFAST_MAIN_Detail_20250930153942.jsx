import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../component/LoginRegister.css';
import Doctor from './asset_pic/Doctor-Detail.png';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../component/LanguageSwitch';

export function BEFAST_MAIN_Detail() {
  const { t } = useTranslation(); // defaultNS: assessment OR call with this ns
  const navigate = useNavigate();

  const questions = [
    { id: 'question1', text: t('question1') },
    { id: 'question2', text: t('question2') },
    { id: 'question3', text: t('question3') },
    { id: 'question4', text: t('question4') },
    { id: 'question5', text: t('question5') },
    { id: 'question6', text: t('question6') },
  ];

  const [answers, setAnswers] = useState(
    () => Array.from({ length: questions.length }, () => ({ text: '', none: false }))
  );

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
    flexWrap: "wrap",
  };
  const left  = { width: "clamp(10rem, 30vw, 35rem)" };
  const right = { flex: 1, minWidth: 0, position: "relative", alignSelf: "flex-start" };
  const imgStyle = { display: 'block', width: "clamp(5rem, 20vw, 40rem)", height: "clamp( 5rem, 18vw, 30rem)", marginTop:"5vw",marginLeft: "clamp(6rem, 2vw, 4rem)", position: "fixed",display:"flex" };

  const handleTextChange = (index, value) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = { ...next[index], text: value };
      return next;
    });
  };

  const handleNoneToggle = (index, checked) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = { text: checked ? '' : next[index].text, none: checked };
      return next;
    });
  };

  return (
    <>
      <div className="Detail">{t("history")} </div>
       <LanguageSwitch />
      <div style={container}>
        <section style={left}>
          <div className="Helo">
            {questions.map((q, index) => {
              const a = answers[index];
              return (
                <div key={q.id} style={{ marginBottom: 16 }}>
                  <p className="Helo">{q.text}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="text"
                      placeholder={t('placehold')}
                      className="BTN-02"
                      value={a.text}
                      disabled={a.none}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                    />

                    <label className="chk">
                      <input
                        id={`none-${index}`}
                        type="checkbox"
                        className="BTN-yesno"
                        checked={a.none}
                        onChange={(e) => handleNoneToggle(index, e.target.checked)}
                        aria-labelledby={`none-label-${index}`}
                      />
                      <span id={`none-label-${index}`} className="yesno-label">
                        {t('nohave')}
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside style={right}>
          {/* Style the Link directly; no nested <a> */}
          <Link
            to={allAnswered ? "/BEFAST_MAIN_BALANCE" : "#"}
            className={`next-btn ${allAnswered ? 'is-enabled' : 'is-disabled'}`}
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
            {t("Next")}
          </Link>

          <img src={Doctor} alt="Doctor" style={imgStyle} />
        </aside>

        {/* ปุ่มลัดไว้เดิม */}
        <Link to="/BEFAST_MAIN_BALANCE" className="login">next</Link>
      </div>
    </>
  );
}
