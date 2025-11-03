// src/asset/BEFAST/BEFAST_MAIN_Detail.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../component/LoginRegister.css';
import Doctor from './asset_pic/Doctor-Detail.png';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from "./LanguageSwitch";
// Firebase
import { firestore, ensureAnonLogin } from '../../component/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function BEFAST_MAIN_Detail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // อัปเดตตามภาษา
  const questions = useMemo(() => ([
    { id: 'question1', text: t('question1') },
    { id: 'question2', text: t('question2') },
    { id: 'question3', text: t('question3') },
    { id: 'question4', text: t('question4') },
    { id: 'question5', text: t('question5') },
    { id: 'question6', text: t('question6') },
  ]), [i18n.language, t]);

  const [answers, setAnswers] = useState(
    () => Array.from({ length: questions.length }, () => ({ text: '', none: false }))
  );
  const [saving, setSaving] = useState(false);

  // sync ความยาว answers เมื่อจำนวนคำถามเปลี่ยน (ป้องกันสลับภาษาแล้ว index เพี้ยน)
  useEffect(() => {
    setAnswers(prev => {
      const next = [...prev];
      next.length = questions.length;
      for (let i = 0; i < questions.length; i++) {
        next[i] = next[i] || { text: '', none: false };
      }
      return next;
    });
  }, [questions.length]);

  const allAnswered = answers.every(a => a.none || a.text.trim() !== '');

  const container = {
    fontFamily: "'Prompt', sans-serif",
    width: "clamp(30rem, 60vw, 90rem)",
    margin: "0 auto",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
  };
  const left  = { width: "clamp(10rem, 30vw, 35rem)" };
  const right = { flex: 1, minWidth: 0, position: "relative", alignSelf: "flex-start" };
  const imgStyle = {
    width: "clamp(5rem, 20vw, 40rem)",
    height: "clamp(5rem, 18vw, 30rem)",
    marginTop: "5vw",
    marginLeft: "clamp(5rem, 2vw, 4rem)",
    position: "fixed",
    display: "block"
  };

  const handleTextChange = (i, value) =>
    setAnswers(prev => prev.map((a, idx) => idx === i ? ({ ...a, text: value }) : a));

  const handleNoneToggle = (i, checked) =>
    setAnswers(prev => prev.map((a, idx) => idx === i ? ({ text: checked ? '' : a.text, none: checked }) : a));

  const handleSaveAndNext = async () => {
    if (!allAnswered) {
      await Swal.fire({
        title: t('validate_title') || 'กรุณาตรวจสอบข้อมูล',
        text: t('validate_detail') || 'กรอกข้อมูลให้ครบถ้วน (ตอบหรือเลือก "ไม่มี" ให้ครบทุกข้อ)',
        icon: 'error'
      });
      return;
    }

    try {
      setSaving(true);

      // ลงชื่อเข้าใช้ anonymous (ถ้าเปิดใน Console และ rules ต้องการ auth)
      let uid = null;
      try {
        const user = await ensureAnonLogin();
        uid = user?.uid ?? null;
      } catch { /* ปล่อยผ่านถ้าไม่จำเป็นต้องใช้ */ }

      // ดึง patientId ที่ตั้งจากหน้า PatientTopForm (ตอนสร้างผู้ป่วย)
      const patientId = localStorage.getItem('patientId');

      const payload = {
        lang: i18n.language || 'th',
        createdAt: serverTimestamp(),
        uid,
        answers: questions.map((q, idx) => ({
          id: q.id,
          question: q.text,
          answerText: answers[idx].text,
          none: answers[idx].none,
        })),
      };

      if (patientId) {
        // ✅ เก็บเป็น subcollection ใต้ผู้ป่วย: patients_topform/{patientId}/befast_histories
        await addDoc(
          collection(firestore, 'patients_topform', patientId, 'befast_histories'),
          payload
        );
      } else {
        // Fallback: กันเคสผู้ใช้ข้ามหน้าแรก (ไม่มี patientId) — บันทึกชั่วคราวไว้ที่ patients_topform ใหม่
        await addDoc(
          collection(firestore, 'patients_topform'),
          { createdAt: serverTimestamp(), befast_histories_first: payload }
        );
      }

      navigate('/BEFAST_MAIN_BALANCE');
    } catch (err) {
      console.error(err);
      await Swal.fire({
        title: t('save_failed_title') || 'บันทึกล้มเหลว',
        text: t('save_failed_detail') || 'เกิดข้อผิดพลาดขณะบันทึกข้อมูล ลองอีกครั้ง',
        icon: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="Detail">{t('history')}</div>
      <div style={container}>
        <LanguageSwitch />
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
          <button
            type="button"
            className={`next-btn ${allAnswered && !saving ? 'is-enabled' : 'is-disabled'}`}
            onClick={handleSaveAndNext}
            disabled={!allAnswered || saving}
          >
            {saving ? (t('saving') || 'กำลังบันทึก...') : (t('Next') || 'ถัดไป')}
          </button>

          <img src={Doctor} alt="Doctor" style={imgStyle} />
        </aside>
      </div>
    </>
  );
}
