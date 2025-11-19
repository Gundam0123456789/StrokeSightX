// src/asset/BEFAST/BEFAST_MAIN_Detail.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../component/LoginRegister.css';
import Doctor from './asset_pic/Doctor-Detail.png';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';


// Firebase
import { firestore, ensureAnonLogin } from '../../component/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function BEFAST_MAIN_Detail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const questions = [
    { id: "q-onset", text: "เริ่มมีอาการครั้งแรกเมื่อไหร่? (Onset time / Last known well)" },
    { id: "q-face-arm-speech", text: "มีหน้าเบี้ยว แขนอ่อนแรง หรือพูดไม่ชัดไหม?" },
    { id: "q-vision", text: "มองไม่ชัด มองเห็นภาพซ้อน หรือมองไม่เห็นข้างเดียวไหม?" },
    { id: "q-balance", text: "เสียการทรงตัว เดินเซ เวียนศีรษะมากไหม?" },
    { id: "q-headache", text: "มีปวดศีรษะรุนแรงเฉียบพลันผิดปกติหรือไม่?" },
    { id: "q-history-stroke-heart", text: "เคยเป็นสโตรกมาก่อนหรือมีโรคหัวใจ (เช่น Atrial Fibrillation) ไหม?" },
    { id: "q-medical-history", text: "มีโรคประจำตัวสำคัญอะไรบ้าง? (ความดัน เบาหวาน ไขมันสูง)" },
    { id: "q-medication", text: "กำลังใช้ยาอะไรอยู่บ้าง? โดยเฉพาะ Warfarin / DOAC / Aspirin / Clopidogrel" },
    { id: "q-allergy-bleeding", text: "มีประวัติแพ้ยาหรือเลือดออกง่ายผิดปกติไหม?" },
    { id: "q-lifestyle", text: "สูบบุหรี่ ดื่มแอลกอฮอล์ หรือใช้สารเสพติดไหม?" }
  ];

  const [answers, setAnswers] = useState(
    Object.fromEntries(questions.map(q => [q.id, { value: "", none: false }]))
  );

  const handleChange = (id, value) => {
    setAnswers(prev => ({
      ...prev,
      [id]: { ...prev[id], value }
    }));
  };

  const handleToggleNone = (id) => {
    setAnswers(prev => {
      const nowNone = !prev[id].none;
      return {
        ...prev,
        [id]: {
          value: nowNone ? "" : prev[id].value,
          none: nowNone
        }
      };
    });
  };

  // ✅ ตรวจว่าตอบครบทุกข้อหรือยัง
  const allCompleted = Object.values(answers).every(
    (q) => q.none === true || q.value.trim() !== ""
  );

  const currentPatientId = localStorage.getItem("currentPatientId");

  const handleSaveHistory = async () => {
    if (!allCompleted) return;
    if (!currentPatientId) {
      await Swal.fire({
        title: "ไม่พบข้อมูลผู้ป่วย",
        text: "กรุณาลงทะเบียนใหม่ หรือกรอกประวัติผู้ป่วยก่อนเข้าสู่หน้านี้",
        icon: "error",
        confirmButtonText: "ตกลง"
      });
      return;
    }
    const answersData = Object.fromEntries(
      Object.entries(answers).map(([id, v]) => [id, { value: v.value, none: v.none }])
    );
    // Debug: log patient id and answers for troubleshooting
    console.log("Saving for patient:", currentPatientId, answersData);
    try {
      await addDoc(collection(db, 'patients', currentPatientId, 'history_detail'), {
        answers: answersData,
        savedAt: new Date().toISOString()
      });
      await Swal.fire({
        title: "บันทึกประวัติสำเร็จ",
        icon: "success",
        confirmButtonText: "ตกลง"
      });
      navigate("/speech");
    } catch (err) {
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err && err.message ? err.message : JSON.stringify(err),
        icon: "error",
        confirmButtonText: "ปิด"
      });
    }
  };


  const container = {
    fontFamily: "'Prompt', sans-serif",
    width: "60%",
    margin: "0 auto",
    padding: "2vw",
    backgroundColor: "#fff",
    borderRadius: 10,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
  };
  const left  = { width: "100%" };

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
                      className="BTN-02"
                      placeholder={none ? "ถูกเลือกเป็น “ไม่มี”" : "พิมพ์คำตอบที่นี่..."}
                      value={a.text}
                      disabled={a.none}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      disabled={none}
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
      </div>
      <button
            type="button"
            className={`next-btn ${allAnswered && !saving ? 'is-enabled' : 'is-disabled'}`}
            onClick={handleSaveAndNext}
            disabled={!allAnswered || saving}
          >
            {saving ? (t('saving') || 'กำลังบันทึก...') : (t('Next') || 'ถัดไป')}
          </button>
    </>
  );
}
