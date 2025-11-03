import React, { useState } from 'react';
import './LoginRegister.css';
import BrainSide from './pic/BrainSide.png';
import Swal from 'sweetalert2';

import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Link } from "react-router-dom"

import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';

export default function Register() {
  const auth = getAuth();
  const { t, i18n } = useTranslation();
  const langClass = i18n.language === 'th' ? 'font-th' : 'font-en';

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Pass 'auth' as the first argument
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("ลงทะเบียนสำเร็จ!");
      Swal.fire({
        title: 'ลงทะเบียนสำเร็จ',
        icon: 'success',
        confirmButtonText: 'ดำเนินการต่อที่ลงชื่อเข้า',
      });
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error.message);
      Swal.fire({
              title: 'ลงทะเบียนล้มเหลว',
              text: 'อีเมล หรือ รหัสผ่านไม่ถูกต้อง',
              icon: 'error',
              confirmButtonText: 'ลองอีกครั้ง',
            });
    }
  };

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className='container'>
      <div className='Name'>
        <div className='Top'>Stroke Sight</div>
        <div className='Top-1'>{t('Name-Project')}
        </div>
      </div>
      <div className='BrainFront-container'>
        <img src={BrainSide} alt='BrainFront' style={{ width: '210px', height: 'auto' }} />
      </div>
      <div className='header'>
        <div className='text'>{t('signup')}</div>
      </div>
      <div className='inputs-container'>
        <div>
          <input
          className='input-email1'
            type="email"
            placeholder={t('Email')}
            style={{ fontFamily: 'prompt', fontWeight: 500 }}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            className='input-name1'
            type="text"
            placeholder={t('Name')}
            style={{ fontFamily: 'prompt', fontWeight: 500 }}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <input
            className='input-password1'
            type="password"
            placeholder={t('Password')}
            style={{ fontFamily: 'prompt', fontWeight: 500 }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className='Submit-container' >
          <button className="submit" langClass={i18n.language}>
            {t('register')}
          </button>
        </div>
          <Link to="/" className='login'>{t('con')}</Link>
        <div>
          <LanguageSwitch />
        </div>
      </div>
    </div>
  );
}
