import React, { useState, useEffect } from 'react';
import './LoginRegister.css';
import BrainSide from './pic/BrainSideLogo.png';
import {auth} from './auth.js';
import {signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './auth.js';
import { Link , useNavigate} from 'react-router-dom';
import Swal from 'sweetalert2';

import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';

export default function Login() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const langClass = i18n.language === 'th' ? 'font-th' : 'font-en';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
        Swal.fire({
          title: 'ลงชื่อเข้าสำเร็จ',
          icon: 'success',
          confirmButtonText: 'ดำเนินการต่อ',
        });

      navigate("/Inform"); 
  
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error.message);
      Swal.fire({
        title: 'ลงชื่อเข้าล้มเหลว',
        text: 'อีเมล หรือ รหัสผ่าน ไม่ถูกต้อง',
        icon: 'error',
        confirmButtonText: 'ลองอีกครั้ง',
        
      });
    }

  };
  
  return (
    <div className='container'>
      <div className='Name'>
        <div className='Top'>Stroke Sight</div>
        <div className='Top-1' >{t('Name-Project')}
        </div>
      </div>
      <div className='BrainFront-container'>
        <img src={BrainSide} alt='BrainFront' style={{ width: '210px', height: 'auto' }}  >
          <Link to="/Register"> </Link>
        </img>
      </div>
      <div className='header'>
        <div className='text'>{t('login')}</div>
      </div>
      <div className='inputs-container'>
        <div>
          <input className='input-email1'
            type="email"
            placeholder={t('Email')}
            style={{ fontFamily: 'prompt', fontWeight: 500 }}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input className='input-password1'
            type="password"
            placeholder={t('Password')}
            style={{ fontFamily: 'prompt', fontWeight: 500 }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="submit" onClick={handleSubmit}>
        {t('login')}
        </button>
          {/* fordev */}
        <div className='login'>
          {t('noacc')}
        <Link
          to="/Register"
          className="Register"
        >
          {t('signup')}
        </Link>
        </div>
        <div>
          <LanguageSwitch />
        </div>
      </div>
    </div>
  );
}

