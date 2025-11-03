import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Form Voice Assistant (no backend required)
 * - อ่านโจทย์/ป้ายกำกับของแต่ละข้อด้วย TTS
 * - รับเสียงพูด (STT) แล้วพิมพ์ลงช่องคำตอบให้อัตโนมัติ
 * - ปุ่ม Next/Prev เลื่อนข้อ, Enter เพื่อส่ง, Hotkeys: R=Read, M=Mic, S=Stop
 * - รองรับไทย/อังกฤษ (สลับ lang ได้ที่มุมบน)
 *
 * NOTE: ใช้ Web Speech API (Chrome/Edge แนะนำ)
 */

const defaultFields = [
  { id: "fullName", labelTH: "ชื่อ–นามสกุลของคุณคืออะไร?", labelEN: "What is your full name?", placeholder: "พิมพ์ชื่อ–นามสกุล / Type your full name" },
  { id: "age", labelTH: "อายุของคุณกี่ปี?", labelEN: "How old are you?", placeholder: "เช่น 17" },
  { id: "school", labelTH: "คุณกำลังศึกษาอยู่ที่โรงเรียนใด?", labelEN: "Which school are you studying at?", placeholder: "ชื่อสถานศึกษา" },
  { id: "project", labelTH: "หัวข้อโครงงาน/โปรเจกต์ของคุณคืออะไร?", labelEN: "What is the title of your project?", placeholder: "เช่น StrokeSight" },
  { id: "goal", labelTH: "เป้าหมายหลักของโครงงานนี้คืออะไร?", labelEN: "What is the main goal of your project?", placeholder: "สรุปสั้น ๆ" },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Form Voice Assistant</h1>
        <p className="mb-6 text-sm text-gray-600">
          ผู้ช่วยอ่านคำถามและพิมพ์คำตอบจากเสียงพูด (Web Speech API). แนะนำให้ใช้ Chrome/Edge บนเดสก์ท็อป
        </p>
        <FormWithVoice fields={defaultFields} />
      </div>
    </div>
  );
}

function FormWithVoice({ fields }) {
  const [lang, setLang] = useState("th-TH");
  const [answers, setAnswers] = useState(() => Object.fromEntries(fields.map(f => [f.id, ""])));
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [appendMode, setAppendMode] = useState(true); // true = ต่อท้าย, false = แทนที่

  const synth = useRef(window.speechSynthesis);
  const recRef = useRef(null);
  const inputRefs = useRef({});

  const currentField = fields[index];
  const displayLabel = useMemo(() =>
    lang === "th-TH" ? currentField.labelTH : currentField.labelEN,
  [lang, currentField]);

  useEffect(() => {
    // ยอมให้กด Hotkeys: R=Read, M=Mic, S=Stop, ArrowLeft/Right=Prev/Next
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key.toLowerCase() === "r") readQuestion();
      if (e.key.toLowerCase() === "m") toggleMic();
      if (e.key.toLowerCase() === "s") stopAll();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, lang, answers, listening, speaking]);

  const focusInput = (id) => {
    const el = inputRefs.current[id];
    if (el) el.focus();
  };

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    try {
      synth.current.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      synth.current.speak(u);
    } catch (e) {
      console.warn("TTS error", e);
    }
  };

  const readQuestion = () => {
    stopMic();
    speak(displayLabel);
  };

  const ensureRecognizer = () => {
    if (!("webkitSpeechRecognition" in window)) return null;
    if (recRef.current) return recRef.current;
    const rec = new window.webkitSpeechRecognition();
    rec.lang = lang; // "th-TH" or "en-US"
    rec.interimResults = true;
    rec.continuous = false; // จบที่หนึ่งคำตอบ/ครั้ง
    rec.onstart = () => setListening(true);
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      let finalText = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk;
        else interim += chunk;
      }
      const text = (finalText || interim || "").trim();
      if (!text) return;
      setAnswers(prev => ({
        ...prev,
        [currentField.id]: appendMode && prev[currentField.id]
          ? (prev[currentField.id] + (prev[currentField.id].endsWith(" ") ? "" : " ") + text)
          : text
      }));
    };
    recRef.current = rec;
    return rec;
  };

  const startMic = () => {
    stopTTS();
    const rec = ensureRecognizer();
    if (!rec) {
      alert("เบราว์เซอร์นี้ยังไม่รองรับการแปลงเสียงเป็นข้อความ (ต้องใช้ Chrome/Edge)");
      return;
    }
    try {
      rec.start();
    } catch {}
  };

  const stopMic = () => {
    try { recRef.current && recRef.current.stop(); } catch {}
  };

  const stopTTS = () => {
    try { synth.current && synth.current.cancel(); } catch {}
  };

  const stopAll = () => { stopMic(); stopTTS(); };

  const toggleMic = () => {
    if (listening) stopMic();
    else startMic();
  };

  const prev = () => {
    stopAll();
    setIndex(i => Math.max(0, i - 1));
    setTimeout(() => focusInput(fields[Math.max(0, index - 1)].id), 0);
  };

  const next = () => {
    stopAll();
    setIndex(i => {
      const ni = Math.min(fields.length - 1, i + 1);
      setTimeout(() => focusInput(fields[ni].id), 0);
      return ni;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    stopAll();
    // เดโม: แสดงผลใน console / สามารถส่งไป backend ได้
    console.log("Submitted:", answers);
    alert("ส่งคำตอบแล้ว! ดูใน console ด้วยครับ/ค่ะ");
  };

  // เมื่อเปลี่ยนคำถาม: อ่านอัตโนมัติเล็กน้อย (ถ้าต้องการ)
  useEffect(() => {
    // อ่านอัตโนมัติหลังย้ายข้อ (ปิดได้โดยคอมเมนต์บรรทัดนี้)
    speak(displayLabel);
    focusInput(currentField.id);
  }, [index, lang]);

  // Auto-advance ไปข้อถัดไปเมื่อหยุดฟังและมีคำตอบใหม่
  useEffect(() => {
    if (!autoAdvance) return;
    // ถ้าหยุดฟังแล้ว และช่องนี้มีข้อความให้เลื่อนไปต่อ
    if (!listening && answers[currentField.id]) {
      const t = setTimeout(() => {
        if (index < fields.length - 1) next();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [answers, listening, index]);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-5">
      {/* แถบควบคุมบน */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <LangSelect lang={lang} setLang={setLang} />
        <Toggle label="ต่อท้ายคำตอบ (Append)" checked={appendMode} onChange={setAppendMode} />
        <Toggle label="เลื่อนไปข้อถัดไปอัตโนมัติ" checked={autoAdvance} onChange={setAutoAdvance} />
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={readQuestion} className="px-3 py-2 rounded-lg border">
            🔈 อ่านโจทย์ (R)
          </button>
          <button type="button" onClick={toggleMic} className={`px-3 py-2 rounded-lg border ${listening ? "bg-green-100" : ""}`}>
            {listening ? "🛑 หยุดฟัง (M)" : "🎙️ เริ่มฟัง (M)"}
          </button>
          <button type="button" onClick={stopAll} className="px-3 py-2 rounded-lg border">
            ⏹️ หยุดทั้งหมด (S)
          </button>
        </div>
      </div>

      {/* ตัวพื้นฐานของฟิลด์ */}
      <div className="space-y-5">
        {fields.map((f, i) => (
          <div key={f.id} className={`p-4 rounded-xl border ${i === index ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
            <label htmlFor={f.id} className="block font-medium mb-1">
              {lang === "th-TH" ? f.labelTH : f.labelEN}
            </label>
            <div className="flex gap-2">
              <input
                ref={(el) => (inputRefs.current[f.id] = el)}
                id={f.id}
                value={answers[f.id]}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [f.id]: e.target.value }))}
                placeholder={f.placeholder}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
              />
              {i === index && (
                <div className="flex gap-2">
                  <IconBtn title="อ่านโจทย์" onClick={readQuestion}>🔈</IconBtn>
                  <IconBtn title={listening ? "หยุดฟัง" : "เริ่มฟัง"} onClick={toggleMic}>{listening ? "🛑" : "🎙️"}</IconBtn>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* นำทาง */}
      <div className="flex items-center gap-3 mt-6">
        <button type="button" onClick={prev} disabled={index === 0} className="px-4 py-2 rounded-lg border disabled:opacity-50">⬅️ ก่อนหน้า</button>
        <span className="text-sm text-gray-600">ข้อ {index + 1} / {fields.length}</span>
        <button type="button" onClick={next} disabled={index === fields.length - 1} className="px-4 py-2 rounded-lg border disabled:opacity-50">ถัดไป ➡️</button>
        <div className="ml-auto" />
        <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white">ส่งฟอร์ม (Enter)</button>
      </div>

      {/* ทิปสั้น ๆ */}
      <div className="mt-4 text-xs text-gray-500 leading-relaxed">
        <p>Tips: กด <kbd className="px-1 border rounded">R</kbd> เพื่อให้ระบบอ่านโจทย์, <kbd className="px-1 border rounded">M</kbd> เพื่อเริ่ม/หยุดฟัง, <kbd className="px-1 border rounded">S</kbd> เพื่อหยุดทั้งหมด.</p>
      </div>
    </form>
  );
}

function IconBtn({ onClick, title, children }) {
  return (
    <button type="button" onClick={onClick} title={title} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
      {children}
    </button>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function LangSelect({ lang, setLang }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Language</span>
      <select value={lang} onChange={(e) => setLang(e.target.value)} className="px-2 py-1 border rounded-lg">
        <option value="th-TH">ไทย (th-TH)</option>
        <option value="en-US">English (en-US)</option>
      </select>
    </div>
  );
}
