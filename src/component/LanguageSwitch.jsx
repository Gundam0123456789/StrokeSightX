import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitch.css';

export default function LanguageSwitch() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || 'th');

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  return (
    <div className={`lang-toggle ${lang === 'th' ? 'right' : 'left'}`} onClick={toggleLang}>
      <span className={`lang-option ${lang === 'en' ? 'english-langauge' : ''}`}>EN</span>
      <span className={`lang-option ${lang === 'th' ? 'Thai-langauge' : ''}`}>TH</span>
    </div>
  );
}
