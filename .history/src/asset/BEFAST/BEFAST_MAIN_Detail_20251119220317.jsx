import React, { useState } from "react";
import "../../component/Detail.css";
import { useNavigate } from "react-router-dom";
import { firestore } from "../../component/auth.js";
import { addDoc, collection } from "firebase/firestore";
import Swal from "sweetalert2";

function BEFAST_MAIN_Detail() {
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
    { id: "q-lifestyle", text: "สูบบุหรี่ ดื่มแอลกอฮอล์ หรือใช้สารเสพติดไหม?" },
  ];

  const [answers, setAnswers] = useState(
    Object.fromEntries(questions.map((q) => [q.id, { value: "", none: false }]))
  );

  const handleChange = (id, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: { ...prev[id], value },
    }));
  };
const patientName = localStorage.getItem('patientName');
  const handleToggleNone = (id) => {
    setAnswers((prev) => {
      const nowNone = !prev[id].none;
      return {
        ...prev,
        [id]: {
          value: nowNone ? "" : prev[id].value,
          none: nowNone,
        },
      };
    });
  };

  // ✅ ตรวจว่าตอบครบทุกข้อหรือยัง (ตอบ หรือเลือก "ไม่มี")
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
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const answersData = Object.fromEntries(
      Object.entries(answers).map(([id, v]) => [id, { value: v.value, none: v.none }])
    );

    console.log("Saving for patient:", currentPatientId, answersData);

    try {
      await addDoc(
        collection(firestore, "patients", currentPatientId, "history_detail"),
        {
          answers: answersData,
          savedAt: new Date().toISOString(),
        }
      );

      await Swal.fire({
        title: "บันทึกประวัติสำเร็จ",
        icon: "success",
        confirmButtonText: "ตกลง",
      });

      navigate("/speech");
    } catch (err) {
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: err && err.message ? err.message : JSON.stringify(err),
        icon: "error",
        confirmButtonText: "ปิด",
      });
    }
  };

  return (
    <div className="body-history">
      <div className="Header-text">ซักประวัติ</div>

      <div className="Box">
        {questions.map((q) => {
          const { value, none } = answers[q.id];

          return (
            <div key={q.id} className="question-block">
              <label className="question-text">{q.text}</label>

              <input
                type="text"
                className="answer-input"
                placeholder={none ? "ถูกเลือกเป็น “ไม่มี”" : "พิมพ์คำตอบที่นี่..."}
                value={value}
                onChange={(e) => handleChange(q.id, e.target.value)}
                disabled={none}
              />

              <button
                type="button"
                className={`none-button ${none ? "active" : ""}`}
                onClick={() => handleToggleNone(q.id)}
              >
                ไม่มี
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: "25px" }}>
        <button
          className={`next-button ${allCompleted ? "active" : ""}`}
          disabled={!allCompleted}
          onClick={handleSaveHistory}
        >
          บันทึก
        </button>
      </div>
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

export default BEFAST_MAIN_Detail;
