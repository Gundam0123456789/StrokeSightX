import React, { useState, useEffect } from 'react';
import { firestore } from './auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './LoginRegister.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';
import IDenter from './pic/IDenter.png';
import leftlogo from './pic/BrainSideLogo.png';
import  {  useRef } from 'react';

// sound
import personalinformation from "./soundasset/personalinfo.MP3";

const PatientTopForm = () => {
  
    const { t } = useTranslation();
    const navigate = useNavigate();

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

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    age: '',
    idCard: Array(13).fill(''), 
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    if (firestore) {
      setFirebaseInitialized(true);
    } else {
      console.error('Firestore instance is not available');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const q = query(collection(firestore, 'patients_topform'), where('idCard', '==', formData.idCard));
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
      const validateForm = () => {
        const errors = [];
        const idCardStr = formData.idCard.join('').trim();

      if (!formData.name.trim()) errors.push('กรุณากรอกชื่อ');
      if (!formData.surname.trim()) errors.push('กรุณากรอกสกุล');
      if (!formData.age.trim() || isNaN(formData.age) || +formData.age <= 0) errors.push('กรุณากรอกอายุให้ถูกต้อง');
      if (!/^\d{13}$/.test(idCardStr)) errors.push('เลขบัตรประชาชนต้องมี 13 หลัก');
      if (!formData.gender) errors.push('กรุณาเลือกเพศ');
      if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.trim())) errors.push('เบอร์โทรศัพท์ต้องมี 10 หลัก');

        return errors;
      };
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

  return (
    <>
      <div className="form-title-header">
        <div className='form-title-header'>{t('header')}</div>
        <img src={leftlogo} className='lefttoplogo'></img>
      </div>  
      <div className="patient-form-container">
        <div className="form-title">{t('form')}</div>
        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-group">
            <div>{t('fullname')}</div>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <div>{t('surname')}</div>
            <input name="surname" value={formData.surname} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <div>{t('ID')}</div>
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

          <div className="form-group-short">
            <div>{t('age')}</div>
            <input name="age" value={formData.age} onChange={handleChange} className="idcard-box-age" required min="1"/>
          </div>

          <div className="button-detail-container">
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? t('load') : t('save')}
            </button>
            <Link to="/inform" style={{textDecoration: "underline double", opacity: "0."}}>กลับ</Link>
          </div>     
        </form>

        {isSaved && (
          <div className="next-page-container">
            <Link to="/BEFAST_MAIN_Detail" className="next-page-btn">ไปหน้าถัดไป</Link>
          </div>
        )}
        <audio ref={audioRef} src={personalinformation} />
      </div>
    </>
  );
};

export default PatientTopForm;
