import React, { useState, useRef, useEffect, useMemo } from 'react';
import { firestore } from './auth';
import { doc, getDocs, collection, query, where, getDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Link, useNavigate } from 'react-router-dom';
import './telemed.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';

import balancegreen from '../component/pic/balance-green.png';
import eyegreen from '../component/pic/eyes-green.png';
import facegreen from '../component/pic/face-green.png';
import armgreen from '../component/pic/arms-green.png';
import speechgreen from '../component/pic/speech-green.png';
import balancered from '../component/pic/balance-red.png';
import eyered from '../component/pic/eyes-red.png';
import facered from '../component/pic/face-red.png';
import armred from '../component/pic/arms-red.png';
import speechred from '../component/pic/speech-red.png';

// คีย์สำหรับคำนวณความเสี่ยง
const RESULT_KEYS = [
  'balanceResult',
  'eyeTestResult',
  'faceAsymmetryResult',
  'armResult',
  'speechResult',
];

const StrokeFormOverlay = () => {
  const [idCardInput, setIdCardInput] = useState('');
  const patientName = localStorage.getItem("patientName");
  const patientId = localStorage.getItem("patientId");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        if (!patientId) {
          setLoading(false);
          await Swal.fire({
            icon: 'warning',
            title: 'ไม่พบรหัสผู้ป่วย',
            text: 'ไม่ได้ตั้งค่า patientId ใน localStorage',
          });
          return;
        }
        const snap = await getDoc(doc(firestore, 'patients_topform', patientId));
        if (snap.exists()) {
          setPatientData(snap.data());
        } else {
          await Swal.fire({
            icon: 'info',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่มีผลการประเมินของผู้ป่วยนี้ในระบบ',
          });
        }
      } catch (e) {
        console.error('Error loading patient data:', e);
        await Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  // คำนวณความเสี่ยง
  const riskInfo = useMemo(() => {
    if (!patientData) return { percent: 0, label: '-', color: '#333' };

    const positives = RESULT_KEYS.reduce(
      (n, k) => n + (patientData?.[k] === 'yes' ? 1 : 0),
      0
    );
    const percent = positives * 20; // 1 อาการ = 20%
    let label, color;

    if (percent >= 80) {
      label = t("risk1");
      color = "#b71c1c";
    } else if (percent >= 60) {
      label = t("risk2");
      color = "#e53935";
    } else if (percent >= 40) {
      label = t("risk3");
      color = "#fb8c00"; 
    } else if (percent >= 20) {
      label = t("risk4");
      color = "#fdd835"; 
    } else {
      label = t("risk5");
      color = "#2e7d32";
    }

    return { percent, label, color };
  }, [patientData]);

  const handleSearch = async () => {
    setPatientData(null);

    if (idCardInput.trim() === '' || idCardInput.length !== 13) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'กรุณากรอกบัตรชาชนให้ถูกต้อง (13 หลัก)',
      });
      return;
    }

    try {
      const q = query(
        collection(firestore, 'patients_topform'),
        where('idCard', '==', idCardInput.trim())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบข้อมูล',
          text: 'ไม่มีผู้ป่วยที่ใช้เลขบัตรประชาชนนี้อยู่ในระบบ',
        });
        return;
      }

      const data = querySnapshot.docs[0].data();
      setPatientData(data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถค้นหาข้อมูลได้', 'error');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: "Prompt" }} ref={formRef}>
      {/* หัวข้อชื่อผู้ป่วย */}
      <div
        style={{
          fontSize: "3vw",
          fontWeight: "bold",
          background: "#ffff",
          padding: "8px 16px",
          borderRadius: "8px",
          display: 'inline-block'
        }}
      >
         {patientName ?? '-'}
        </div>
          <div className="search-bar-actions">
          <input
            type="text"
            value={idCardInput}
            onChange={(e) => setIdCardInput(e.target.value)}
            placeholder={t('inputID')}
          />
          <button onClick={handleSearch} className='Search'>
            {t('seach')}
          </button>
        </div>
      {/* กล่องความเสี่ยง */}
      {!loading && patientData && (
        <div className='Box-risk'>
          <button
            className="consult"
            onClick={() => (window.location.href = "https://telemedoa-nihss-apps-projects.vercel.app/")}
          >
            {riskInfo.percent >= 60 ? t("consalt") : t("consalt")}
          </button>
          <div className='risk'>
            {t("riskky")} :
            <div className='risk2' style={{ color: riskInfo.color }}>
              {riskInfo.percent}% <br />
            </div>
            <div className='risk3' style={{ color: riskInfo.color }}>
              ({riskInfo.label})
            </div>
          </div>
        </div>
      )}

      {/* เนื้อหา */}
      {loading ? (
        <div style={{ marginTop: 24 }}>กำลังโหลดข้อมูล…</div>
      ) : !patientData ? (
        <div style={{ marginTop: 24, opacity: .8 }}>ยังไม่มีข้อมูลผู้ป่วยให้แสดง</div>
      ) : (
        <div className='boxofbefast'>
          {/* 1 - BALANCE */}
          <div className="befast-item-balance">
            {patientData.balanceResult === 'yes' ? (
              <div className="balance-yes1">
                <img src={balancered} className="befast-item-balance" alt="Balance red" />
                <div className="symptom-yes">{t("havesym")}</div>
              </div>
            ) : (
              <div className="balance-no1">
                <img src={balancegreen} className="befast-item-balance" alt="Balance green" />
                <div className="symptom-no">{t("nosym")}</div>
              </div>
            )}
          </div>

          {/* 2 - EYES */}
          <div className="befast-item-eye">
            {patientData.eyeTestResult === 'yes' ? (
              <div className="eye-yes1">
                <img src={eyered} className="befast-item-eye" alt="Eyes red" />
                <div className="symptom-yes">{t("havesym")}</div>
              </div>
            ) : (
              <div className="eye-no1">
                <img src={eyegreen} className="befast-item-eye" alt="Eyes green" />
                <div className="symptom-no">{t("nosym")}</div>
              </div>
            )}
          </div>

          {/* 3 - FACE */}
          <div className="befast-item-face">
            {patientData.faceAsymmetryResult === 'yes' ? (
              <div className="face-yes1">
                <img src={facered} className="befast-item-face" alt="Face red" />
                <div className="symptom-yes">{t("havesym")}</div>
              </div>
            ) : (
              <div className="face-no1">
                <img src={facegreen} className="befast-item-face" alt="Face green" />
                <div className="symptom-no">{t("nosym")}</div>
              </div>
            )}
          </div>

          {/* 4 - ARMS */}
          <div className="befast-item-arm">
            {patientData.armResult === 'yes' ? (
              <div className="arm-yes1">
                <img src={armred} className="befast-item-arm" alt="Arms red" />
                <div className="symptom-yes">{t("havesym")}</div>
              </div>
            ) : (
              <div className="arm-no1">
                <img src={armgreen} className="befast-item-arm" alt="Arms green" />
                <div className="symptom-no">{t("nosym")}</div>
              </div>
            )}
          </div>

          {/* 5 - SPEECH */}
          <div className="befast-item-speech">
            {patientData.speechResult === 'yes' ? (
              <div className="speech-yes1">
                <img src={speechred} className="befast-item-speech" alt="Speech red" />
                <div className="symptom-yes">{t("havesym")}</div>
              </div>
            ) : (
              <div className="speech-no1">
                <img src={speechgreen} className="befast-item-speech" alt="Speech green" />
                <div className="symptom-no">{t("nosym")}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrokeFormOverlay;
