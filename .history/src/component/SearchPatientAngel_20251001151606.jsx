import React, { useState, useRef } from 'react';
import { firestore } from './auth'; // Firebase config
import { collection, query, where, getDocs } from 'firebase/firestore';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Link, useNavigate } from 'react-router-dom';
import './SearchPatientAngel.css';
import './user-training.css';
import StrokeAwareButton from '../component/pic/StrokeAwareButton.png';
import Back from '../component/pic/Back.png';
import Angel from './pic/StrokeAwareResultFormAngel.png'
import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';
import Dropdown from "./Dropdown/Dropdown";
import Dropitem from "./Dropdown/Dropitem";

const StrokeFormOverlay = () => {
  const [idCardInput, setIdCardInput] = useState('');
  const [patientData, setPatientData] = useState(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false); // For hamburger menu
  const assessment = ["NIHSS", "Assessment"];

 const assessmentbtn = [
    { label: t("about"), path: "/About" },
    { label: t("assessment"), path: "/PatientDetail" }
  ];

  const handleSearch = async () => {
    setPatientData(null);
  
  
    if (idCardInput.trim() === '' || idCardInput.length !== 13) {
      Swal.fire({
        icon: 'error',
        title: t('wrong1'),
        text: t("wrong2"),
      });
      return;
    }

    try {
      const q = query(
        collection(firestore , 'patients_topform'),
        where('idCard', '==', idCardInput.trim())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Swal.fire({
          icon: 'error',
          title: t("wrong3"),
          text: t("wrong4"),
        });
        return;
      }

      const data = querySnapshot.docs[0].data();
      setPatientData(data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      Swal.fire(t('wrong1'), t('wrong5'), 'error');
    } 
  };

  const handleDownload = async () => {
    if (!formRef.current) return;
    const canvas = await html2canvas(formRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'px', [canvas.width, canvas.height]);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('stroke_form_filled.pdf');
  };

  return (
  <div className="main-overlay-container" >
     <div className="header-container">
        <div className="logo-section">
          <div className="StrokeAwareCenter">
            <img src={StrokeAwareButton} />
          </div>
        </div>

        {/* Hamburger Icon */}
        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

        {/* NAV MENU */}
        <div className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <div className="btn-drop" onClick={() => navigate("/inform")}>
              {t("main")}
          </div>

         <Dropdown
            buttonText={t("Features")}
            type="assessment"
            content={assessmentbtn.map((item, id) => (
            <Dropitem key={id} to={item.path}>
              {item.label}
            </Dropitem>
            ))}
          />

          <div className="btn-drop" onClick={() => navigate("/DoctorDashboard")}>
              {t("dashboard")}
          </div>
          <div className="btn-drop1" onClick={() => navigate("/SearchByIdCardAngel")}>
              {t("seacher")}
          </div>

          <div className="btn-drop" onClick={() => navigate("/Training")}>
              {t("train")}
          </div>

          <LanguageSwitch />
        </div>
      </div>

    <div className="top-controls">
      <div>
        <h2 style={{ margin: 0 }}>🔍 {t('reseach')}</h2>
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
        {patientData && (
          <button onClick={handleDownload} className='Downloadbtn'>
            📥 {t('download')}
          </button>
        )}
      </div>
    </div>

    {/* Centered content */}
    <div className="center-content">
      {patientData && (
        <div ref={formRef} className="form-container">
          <img src={Angel} alt="Stroke Form" className="form-background" />

          {/* Overlaying normal fields */}
          <div className="overlay name">{patientData.name}</div>
          <div className="overlay surname">{patientData.surname}</div>
          <div className="overlay age">{patientData.age}</div>
          <div className="overlay gender">{patientData.gender}</div>
          <div className="overlay disease">{patientData.disease}</div>
          <div className="overlay phone">{patientData.phone}</div>
          <div className="overlay formDate">{patientData.formDate}</div>
          <div className="overlay formTime">{patientData.formTime}</div>
          <div className="overlay TimeFactor">{patientData.TimeFactor}</div>

          {/* Overlaying ID card split into 13 digits */}
          {patientData.idCard && patientData.idCard.split('').map((digit, index) => (
            <div key={index} className={`overlay idcard-digit idcard-${index}`}>
              {digit}
            </div>
          ))}

          {/* BEFAST results: show ✓ in correct column */}
          {patientData.balanceResult === 'yes' && <div className="overlay checkbox angel-balance-yes">✓</div>}
          {patientData.balanceResult === 'no' && <div className="overlay checkbox angel-balance-no">✓</div>}

          {patientData.eyeTestResult === 'yes' && <div className="overlay checkbox angel-eye-yes">✓</div>}
          {patientData.eyeTestResult === 'no' && <div className="overlay checkbox angel-eye-no">✓</div>}

          {patientData.faceAsymmetryResult === 'yes' && <div className="overlay checkbox angel-face-yes">✓</div>}
          {patientData.faceAsymmetryResult === 'no' && <div className="overlay checkbox angel-face-no">✓</div>}

          {patientData.armResult === 'yes' && <div className="overlay checkbox angel-arm-yes">✓</div>}
          {patientData.armResult === 'no' && <div className="overlay checkbox angel-arm-no">✓</div>}

          {patientData.speechResult === 'yes' && <div className="overlay checkbox angel-speech-yes">✓</div>}
          {patientData.speechResult === 'no' && <div className="overlay checkbox angel-speech-no">✓</div>}

          {/* Result overlay */}
          {(() => {
            const yesCount = [
              patientData.balanceResult,
              patientData.eyeTestResult,
              patientData.faceAsymmetryResult,
              patientData.armResult,
              patientData.speechResult,
            ].filter(val => val === 'yes').length;

            let resultText = '';
            if (yesCount === 0) resultText = "ปกติไม่มีอาการใดๆ";
            else if (yesCount === 1) resultText = "มีอาการผิดปกติ";
            else resultText = "มีอาการรุนแรง ควรพบแพทย์โดยด่วน";

            return <div className="overlay result-text">{resultText}</div>;
          })()}
        </div>
      )}
    </div>
  </div>
);

};

export default StrokeFormOverlay;
