import React, { useState, useEffect, useRef } from 'react';
import { firestore } from './auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './LoginRegister.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';
import IDenter from './pic/IDenter.png';
import leftlogo from './pic/BrainSideLogo.png';

// sound
import personalinformation from "./soundasset/personalinfo.MP3";

const PatientTopForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const audioRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const recRef = useRef(null);           // speech recognition
  const streamAbortRef = useRef(null);   // cancel SSE

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

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    age: '',
    idCard: Array(13).fill(''),
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [listeningField, setListeningField] = useState(null); // 'name' | 'surname' | 'age' | null
  const [streamingField, setStreamingField] = useState(null); // field name while SSE streaming

  useEffect(() => {
    if (firestore) setFirebaseInitialized(true);
    else console.error('Firestore instance is not available');
  }, []);

  // ---------- TTS ----------
  const speak = (text, langHint = 'th-TH') => {
    if (!('speechSynthesis' in window)) return;
    try {
      synthRef.current.cancel();
      const u = new SpeechSynthesisUtterance(text);
      // เดา lang จาก i18n ปัจจุบัน
      const lang = i18n.language?.startsWith('en') ? 'en-US' : langHint;
      u.lang = lang;
      u.rate = 1;
      synthRef.current.speak(u);
    } catch (e) {
      console.warn('TTS error', e);
    }
  };

  // ---------- STT (ต่อช่อง) ----------
  const ensureRecognizer = () => {
    if (!('webkitSpeechRecognition' in window)) return null;
    if (recRef.current) return recRef.current;
    const rec = new window.webkitSpeechRecognition();
    rec.lang = i18n.language?.startsWith('en') ? 'en-US' : 'th-TH';
    rec.continuous = false;
    rec.interimResults = false;
    recRef.current = rec;
    return rec;
  };

  const startMicFor = (fieldName) => {
    if (fieldName === 'idCard') {
      Swal.fire('แจ้งเตือน', 'ช่องเลขบัตรประชาชนไม่รองรับการพูดกรอก', 'info');
      return;
    }
    const rec = ensureRecognizer();
    if (!rec) {
      Swal.fire('ไม่รองรับ', 'เบราว์เซอร์นี้ยังไม่รองรับการแปลงเสียงเป็นข้อความ', 'error');
      return;
    }
    try {
      setListeningField(fieldName);
      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setFormData((prev) => {
          let val = text;
          if (fieldName === 'age') {
            // keep only digits
            val = (text.match(/\d+/)?.[0] || '').slice(0, 3);
          }
          return { ...prev, [fieldName]: prev[fieldName] ? prev[fieldName] + ' ' + val : val };
        });
      };
      rec.onend = () => setListeningField(null);
      rec.onerror = () => setListeningField(null);
      rec.start();
    } catch {}
  };

  const stopMic = () => {
    try { recRef.current && recRef.current.stop(); } catch {}
    setListeningField(null);
  };

  // ---------- SSE (ไหลเป็นตัวอักษร) ----------
  // ต้องมี backend: POST http://localhost:3001/api/ai/stream
  const streamAIToField = async (fieldName, questionText) => {
    // ยกเลิกสตรีมก่อนหน้า (ถ้ามี)
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    const controller = new AbortController();
    streamAbortRef.current = controller;
    setStreamingField(fieldName);

    const system = i18n.language?.startsWith('en')
      ? 'You are a concise assistant helping fill a form. Answer in 1–2 lines, plain text only.'
      : 'คุณคือผู้ช่วยกรอกฟอร์ม ตอบสั้น กระชับ 1–2 บรรทัด เป็นข้อความล้วน';

    try {
      const resp = await fetch('http://localhost:3001/api/ai/stream', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ prompt: questionText, system, temperature: 0.5 }),
        signal: controller.signal,
      });
      if (!resp.body) throw new Error('No stream body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // เคลียร์ช่องก่อน (เริ่มพิมพ์สด)
      setFormData((prev) => ({ ...prev, [fieldName]: '' }));

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE แยกบล็อกด้วย \n\n
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const lines = part.split('\n');
          const evt = (lines[0] || '').startsWith('event:') ? lines[0].replace('event: ', '') : 'message';
          const dataLine = lines.find(l => l.startsWith('data:')) || '';
          const data = dataLine.replace('data: ', '');
          if (evt === 'token') {
            try {
              const { delta } = JSON.parse(data);
              if (delta) {
                setFormData((prev) => ({ ...prev, [fieldName]: (prev[fieldName] || '') + delta }));
              }
            } catch {}
          } else if (evt === 'done') {
            // จบแล้ว: อ่านออกเสียงทั้งคำตอบ
            try {
              const { text } = JSON.parse(data);
              if (text) speak(text);
            } catch {}
            setStreamingField(null);
          } else if (evt === 'error') {
            setStreamingField(null);
          }
        }
      }
    } catch (e) {
      if (controller.signal.aborted) {
        console.log('SSE aborted');
      } else {
        console.error('SSE error', e);
        Swal.fire('ผิดพลาด', 'การสตรีมข้อความจาก AI ล้มเหลว', 'error');
      }
      setStreamingField(null);
    }
  };

  const stopStream = () => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    setStreamingField(null);
  };

  // ---------- helpers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'age') {
        // จำกัดให้เป็นตัวเลข ไม่ติดลบ
        const v = value.replace(/\D/g, '').slice(0, 3);
        return { ...prev, age: v };
      }
      return ({ ...prev, [name]: value });
    });
  };

  const handleIdChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ''); // รับเฉพาะตัวเลข
    if (value.length > 1) return;

    const newId = [...formData.idCard];
    newId[index] = value;
    setFormData({ ...formData, idCard: newId });

    if (value && index < 12) {
      const nextInput = document.getElementById(`idcard-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const validateForm = () => {
    const idCardStr = formData.idCard.join('').trim();
    const errors = [];
    if (!formData.name.trim()) errors.push('กรุณากรอกชื่อ');
    if (!formData.surname.trim()) errors.push('กรุณากรอกสกุล');
    if (!formData.age.trim() || isNaN(formData.age) || +formData.age <= 0) errors.push('กรุณากรอกอายุให้ถูกต้อง');
    if (!/^\d{13}$/.test(idCardStr)) errors.push('เลขบัตรประชาชนต้องมี 13 หลัก');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firebaseInitialized) {
      Swal.fire('ระบบผิดปกติ', 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
      return;
    }

    setIsSubmitting(true);
    const validationErrors = validateForm();
    const idCardStr = formData.idCard.join('').trim();

    if (validationErrors.length > 0) {
      Swal.fire({
        title: 'กรุณาตรวจสอบข้อมูล',
        html: validationErrors.map(err => `• ${err}`).join('<br>'),
        icon: 'error'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // ✅ แก้ให้ where ใช้ string 13 หลัก (ไม่ใช่อาร์เรย์)
      const q = query(collection(firestore, 'patients_topform'), where('idCard', '==', idCardStr));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Swal.fire({
          title: t('alreadyID'),
          text: t('alreadyIDtext'),
          icon: 'error',
          confirmButtonText: t('confirm')
        });
        setIsSubmitting(false);
        return;
      }

      const now = new Date();
      const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
      const day = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear() + 543;
      const hour = now.getHours().toString().padStart(2, '0');
      const minute = now.getMinutes().toString().padStart(2, '0');
      const formattedDate = `${monthName} ${day} พ.ศ. ${year}`;
      const formattedTime = `เวลา ${hour}:${minute} น.`;

      const docRef = await addDoc(collection(firestore, 'patients_topform'), {
        ...formData,
        idCard: idCardStr, // 🔸 แปลงให้เป็น string
        fullName: `${formData.name} ${formData.surname}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        formDate: formattedDate,
        formTime: formattedTime
      });

      localStorage.setItem('patientName', `${formData.name} ${formData.surname}`);
      localStorage.setItem('patientId', docRef.id);

      await Swal.fire({
        title: t('successsave'),
        text: t('datasave'),
        icon: 'success',
        confirmButtonText: t('confirm')
      }).then(() => {
        navigate('/BEFAST_MAIN_Detail');
      });

      setIsSaved(true);
    } catch (error) {
      console.error('Firestore error:', error);
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: `ไม่สามารถบันทึกข้อมูลได้: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'เข้าใจแล้ว'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- UI ----------
  return (
    <>
      <div className="form-title-header">
        <div className='form-title-header'>{t('header')}</div>
        <img src={leftlogo} className='lefttoplogo' alt="" />
      </div>

      <div className="patient-form-container">
        <div className="form-title">{t('form')}</div>

        <form onSubmit={handleSubmit} className="patient-form">
          {/* ชื่อ */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems:'center', gap:8 }}>
              <div>{t('fullname')} ({t('name')})</div>
              <button type="button" onClick={() => speak(t('fullname'))} className="mini-btn">🔈</button>
              <button type="button" onClick={() => startMicFor('name')} className={`mini-btn ${listeningField==='name'?'is-on':''}`}>{listeningField==='name'?'🛑':'🎙️'}</button>
              <button type="button" onClick={() => streamAIToField('name', t('fullname'))} className={`mini-btn ${streamingField==='name'?'is-on':''}`}>🟢</button>
              { (listeningField || streamingField) && <button type="button" onClick={() => { stopMic(); stopStream(); }} className="mini-btn">⏹️</button> }
            </div>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          {/* นามสกุล */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems:'center', gap:8 }}>
              <div>{t('surname')}</div>
              <button type="button" onClick={() => speak(t('surname'))} className="mini-btn">🔈</button>
              <button type="button" onClick={() => startMicFor('surname')} className={`mini-btn ${listeningField==='surname'?'is-on':''}`}>{listeningField==='surname'?'🛑':'🎙️'}</button>
              <button type="button" onClick={() => streamAIToField('surname', t('surname'))} className={`mini-btn ${streamingField==='surname'?'is-on':''}`}>🟢</button>
              { (listeningField || streamingField) && <button type="button" onClick={() => { stopMic(); stopStream(); }} className="mini-btn">⏹️</button> }
            </div>
            <input name="surname" value={formData.surname} onChange={handleChange} required />
          </div>

          {/* บัตรประชาชน */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems:'center', gap:8 }}>
              <div>{t('ID')}</div>
              <button type="button" onClick={() => speak(t('ID'))} className="mini-btn">🔈</button>
            </div>
            <div className="idcard-inputs">
              {Array.from({ length: 13 }).map((_, i) => (
                <input
                  key={i}
                  id={`idcard-${i}`}
                  type="text"
                  maxLength="1"
                  className="idcard-box"
                  value={formData.idCard[i] || ""}
                  onChange={(e) => handleIdChange(e, i)}
                  inputMode="numeric"
                  required
                />
              ))}
            </div>
          </div>

          {/* อายุ */}
          <div className="form-group-short">
            <div style={{ display: 'flex', alignItems:'center', gap:8 }}>
              <div>{t('age')}</div>
              <button type="button" onClick={() => speak(t('age'))} className="mini-btn">🔈</button>
              <button type="button" onClick={() => startMicFor('age')} className={`mini-btn ${listeningField==='age'?'is-on':''}`}>{listeningField==='age'?'🛑':'🎙️'}</button>
              <button type="button" onClick={() => streamAIToField('age', t('age'))} className={`mini-btn ${streamingField==='age'?'is-on':''}`}>🟢</button>
              { (listeningField || streamingField) && <button type="button" onClick={() => { stopMic(); stopStream(); }} className="mini-btn">⏹️</button> }
            </div>
            <input
              name="age"
              type="number"
              min="1"
              value={formData.age}
              onChange={handleChange}
              className="idcard-box-age"
              required
            />
          </div>

          <div className="button-detail-container">
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? t('load') : t('save')}
            </button>

            <div className='midd'>
              <div className='line-top'></div>
              <div className='Text-between-text'>{t('or')}</div>
              <div className='line-bottom'></div>
            </div>

            <div className='ID-enter-container'>
              {/* แก้ tag ให้ถูกต้อง */}
              <button type="button" className='ID-enter'>
                <img src={IDenter} className='PIC-ID-enter' alt="" />
                {t("IDenter")}
              </button>
            </div>
          </div>
        </form>

        {isSaved && (
          <div className="next-page-container">
            <Link to="/BEFAST_MAIN_Detail" className="next-page-btn">ไปหน้าถัดไป</Link>
          </div>
        )}
        <Link to="/BEFAST_MAIN_Detail" className='login'>next</Link>
        <audio ref={audioRef} src={personalinformation} />
      </div>
    </>
  );
};

export default PatientTopForm;
