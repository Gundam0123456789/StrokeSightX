import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../component/LoginRegister.css';
import Doctor from './asset_pic/Doctor-Detail.png';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '/.../../component/LanguageSwitch';

// ⬇️ เพิ่ม import Firestore
import { firestore, ensureAnonLogin } from "../../component/auth";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export function BEFAST_MAIN_Detail() {
  const { t, i18n } = useTranslation(); // ใช้ i18n เพื่อเก็บภาษา
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
  const [saving, setSaving] = useState(false);

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
  const imgStyle = { display: 'block', width: "clamp(5rem, 20vw, 40rem)", height: "clamp(5rem, 18vw, 30rem)", marginTop:"5vw", marginLeft: "clamp(5rem, 2vw, 4rem)", position: "fixed", display:"flex" };

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

  // ⬇️ ฟังก์ชันบันทึก Firestore แล้วค่อยไปหน้าใหม่
  const handleSaveAndNext = async () => {
    if (!allAnswered) {
      Swal.fire({
        title: 'กรุณาตรวจสอบข้อมูล',
        text: 'กรอกข้อมูลให้ครบถ้วน (ตอบหรือเลือก "ไม่มี" ให้ครบทุกข้อ)',
        icon: 'error'
      });
      return;
    }
    try {
      setSaving(true);

      // (ทางเลือก) ลงชื่อเข้าใช้แบบ anonymous เพื่อได้ uid
      let uid = null;
      try {
        const user = await ensureAnonLogin();
        uid = user?.uid ?? null;
      } catch {
        // หาก anonymous ล้มเหลว ก็ยังบันทึกแบบไม่ใส่ uid ได้
      }

      // รูปแบบข้อมูลที่จะบันทึก
      const payload = {
        lang: i18n.language || 'th',
        createdAt: serverTimestamp(),
        uid, // อาจเป็น null ถ้าไม่ได้ล็อกอิน
        answers: questions.map((q, idx) => ({
          id: q.id,
          question: q.text,
          answerText: answers[idx].text,
          none: answers[idx].none,
        })),
      };

      await addDoc(collection(firestore, 'befast_histories'), payload);

      navigate('/BEFAST_MAIN_BALANCE');
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'บันทึกล้มเหลว',
        text: 'เกิดข้อผิดพลาดขณะบันทึกข้อมูล ลองอีกครั้ง',
        icon: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="Detail">{t("history")} </div>
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
          {/* ใช้ปุ่มควบคุม flow แทน Link ตรงๆ */}
          <button
            type="button"
            className={`next-btn ${allAnswered && !saving ? 'is-enabled' : 'is-disabled'}`}
            onClick={handleSaveAndNext}
            disabled={!allAnswered || saving}
          >
            {saving ? t("Saving") ?? "กำลังบันทึก..." : t("Next")}
          </button>

          <img src={Doctor} alt="Doctor" style={imgStyle} />
        </aside>

        {/* ปุ่มลัดเดิม (ทางเลือก) - แนะนำเอาออกเพื่อไม่ให้ข้ามบันทึก */}
        {/* <Link to="/BEFAST_MAIN_BALANCE" className="login">next</Link> */}
      </div>
    </>
  );
}
