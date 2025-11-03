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


// ===============================
//  เวอร์ชัน “AI จริง” (มี Backend เรียก LLM)
// ===============================
// โครงสร้างโปรเจกต์ (ตัวอย่าง)
// ai-form/
// ├─ server/           ← Node.js (Express) เรียกผู้ให้บริการ LLM อย่างปลอดภัย
// │  ├─ .env           ← เก็บ API_KEY
// │  └─ server.js
// └─ web/              ← React Frontend (Vite)
//    ├─ index.html
//    └─ src/
//       ├─ main.jsx
//       ├─ App.jsx
//       └─ api.js

// ขั้นตอนติดตั้งสั้นๆ
// 1) สร้างโฟลเดอร์ ai-form แล้วแยก server/ กับ web/
// 2) ฝั่ง server: npm init -y && npm i express cors node-fetch dotenv
// 3) ฝั่ง web: npm create vite@latest web -- --template react && cd web && npm i
// 4) รัน server: node server.js  (หรือใช้ nodemon)
// 5) รัน web: npm run dev
// 6) เปิด http://localhost:5173 (หรือพอร์ตที่ Vite แจ้ง)

// -------------------------------
// server/.env (ตัวอย่าง)
// -------------------------------
// LLM_API_KEY=ใส่คีย์ของผู้ให้บริการ
// LLM_MODEL=gpt-4o-mini   // หรือรุ่นอื่นตามที่คุณใช้
// PORT=3001
//
// หมายเหตุ: อย่าฝังคีย์ในฝั่งเว็บเด็ดขาด เก็บไว้ที่ .env ฝั่ง server

// -------------------------------
// server/server.js
// -------------------------------
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

// ตัวอย่าง: endpoint เรียก LLM แบบ Non-Streaming (ง่ายสำหรับเริ่มต้น)
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt, system, temperature = 0.7 } = req.body;

    // ปรับตามผู้ให้บริการที่คุณใช้ (ตัวอย่างรูปแบบ Chat Completions ที่พบบ่อย)
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature,
        messages: [
          system ? { role: 'system', content: system } : undefined,
          { role: 'user', content: prompt }
        ].filter(Boolean)
      })
    });

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || '';
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// (ถ้าต้องการ Streaming: ทำ endpoint แยกแบบ SSE/WebSocket ได้)

app.listen(PORT, () => console.log(`AI server on http://localhost:${PORT}`));


// -------------------------------
// web/src/api.js
// -------------------------------
export async function askAI({ prompt, system, temperature }) {
  const resp = await fetch('http://localhost:3001/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, system, temperature })
  });
  if (!resp.ok) throw new Error('AI server error');
  return resp.json();
}


// -------------------------------
// web/src/App.jsx  (เชื่อม “AI ช่วยกรอกฟอร์มจริงๆ” ลงเวอร์ชันเดิม)
// -------------------------------
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { askAI } from './api';

const fields = [
  { id: 'fullName', labelTH: 'ชื่อ–นามสกุลของคุณคืออะไร?', labelEN: 'What is your full name?', placeholder: 'พิมพ์ชื่อ–นามสกุล' },
  { id: 'age', labelTH: 'อายุของคุณกี่ปี?', labelEN: 'How old are you?', placeholder: 'เช่น 17' },
  { id: 'school', labelTH: 'คุณกำลังศึกษาอยู่ที่โรงเรียนใด?', labelEN: 'Which school are you studying at?', placeholder: 'ชื่อสถานศึกษา' },
  { id: 'project', labelTH: 'หัวข้อโครงงาน/โปรเจกต์ของคุณคืออะไร?', labelEN: 'What is the title of your project?', placeholder: 'เช่น StrokeSight' },
  { id: 'goal', labelTH: 'เป้าหมายหลักของโครงงานนี้คืออะไร?', labelEN: 'What is the main goal of your project?', placeholder: 'สรุปสั้น ๆ' }
];

export default function App() {
  const [lang, setLang] = useState('th-TH');
  const [answers, setAnswers] = useState(() => Object.fromEntries(fields.map(f => [f.id, ''])));
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const synth = useRef(window.speechSynthesis);
  const recRef = useRef(null);

  const current = fields[index];
  const label = useMemo(() => lang === 'th-TH' ? current.labelTH : current.labelEN, [lang, current]);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    synth.current.cancel();
    synth.current.speak(u);
  };

  const readQuestion = () => speak(label);

  const ensureRec = () => {
    if (!('webkitSpeechRecognition' in window)) return null;
    if (recRef.current) return recRef.current;
    const rec = new window.webkitSpeechRecognition();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setAnswers((p) => ({ ...p, [current.id]: (p[current.id] ? p[current.id] + ' ' : '') + text }));
    };
    recRef.current = rec;
    return rec;
  };

  const startMic = () => {
    const rec = ensureRec();
    if (!rec) return alert('เบราว์เซอร์นี้ยังไม่รองรับ STT');
    try { rec.start(); } catch {}
  };

  const aiDraftOne = async (field) => {
    setLoading(true);
    try {
      // รวมบริบทจากคำตอบก่อนหน้า ให้ AI เขียนคำตอบข้อถัดไปให้เหมาะสม/สอดคล้อง
      const context = Object.entries(answers)
        .filter(([id, v]) => !!v)
        .map(([id, v]) => `- ${id}: ${v}`)
       .join('
');

      const question = (lang === 'th-TH' ? field.labelTH : field.labelEN);

      const systemPrompt = lang === 'th-TH'
        ? 'คุณคือผู้ช่วยกรอกฟอร์มภาษาไทย ตอบเป็นประโยคสั้น อ่านง่าย ไม่เกิน 1–2 บรรทัด หากเป็นตัวเลขให้ตอบเฉพาะตัวเลข'
        : 'You are a helpful form-filling assistant. Answer concisely in 1–2 lines. Return plain text only.';

      const userPrompt = `${lang === 'th-TH' ? 'บริบทคำตอบที่มีอยู่แล้ว' : 'Current answers so far'}:
${context || '- (none)'}

${lang === 'th-TH' ? 'คำถาม' : 'Question'}: ${question}
${lang === 'th-TH' ? 'โปรดเขียนคำตอบที่เหมาะสม' : 'Please draft a suitable answer.'}`;

      const { text } = await askAI({ prompt: userPrompt, system: systemPrompt, temperature: 0.5 });

      setAnswers((p) => ({ ...p, [field.id]: (p[field.id] ? p[field.id] + ' ' : '') + (text || '').trim() }));
      speak((text || '').trim());
    } catch (e) {
      alert('AI เขียนคำตอบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const aiDraftAll = async () => {
    setLoading(true);
    try {
      const formSpec = fields.map((f) => `- id: ${f.id}
  label: ${lang === 'th-TH' ? f.labelTH : f.labelEN}`).join('
');
      const context = Object.entries(answers).map(([id, v]) => `- ${id}: ${v || ''}`).join('
');
      const systemPrompt = lang === 'th-TH'
        ? 'คุณคือผู้ช่วยกรอกฟอร์มภาษาไทย ให้คำตอบกระชับและตรงประเด็น แต่สมจริง เหมาะกับนักเรียนมัธยม ปล่อยเป็น plain text JSON ที่อ่านง่าย'
        : 'You are a helpful assistant that fills forms. Keep answers concise and realistic for a high-school student. Output easy-to-read JSON only.';

      const userPrompt = `${lang === 'th-TH' ? 'สคีมาฟอร์ม' : 'Form schema'}:
${formSpec}

${lang === 'th-TH' ? 'คำตอบที่มีอยู่' : 'Current answers'}:
${context}

${lang === 'th-TH' ? 'โปรดสร้างคำตอบให้ครบทุกช่อง โดยคงค่าเดิมถ้ามี และเติมช่องว่างที่เหลือ' : 'Please fill all fields, keep existing values, and complete missing ones.'}
${lang === 'th-TH' ? 'รูปแบบเอาต์พุต' : 'Output format'}: {"fullName":"...","age":"...", ... }`;

      const { text } = await askAI({ prompt: userPrompt, system: systemPrompt, temperature: 0.4 });

      // พยายาม parse JSON ที่ AI ส่งกลับ (จะยืดหยุ่นกับ ,/ช่องว่าง)
      try {
        const cleaned = text.trim().replace(/```json|```/g, '');
        const obj = JSON.parse(cleaned);
        setAnswers((p) => ({ ...p, ...obj }));
      } catch {
        // ถ้า parse ไม่ได้ ก็ใส่เป็นคำตอบช่องสุดท้ายเป็นโน้ต
        setAnswers((p) => ({ ...p, goal: (p.goal ? p.goal + ' ' : '') + text }));
      }
    } catch (e) {
      alert('AI เติมฟอร์มไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16, fontFamily: 'system-ui' }}>
      <h2>AI Form Assistant</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <label>Language: </label>
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value='th-TH'>ไทย (th-TH)</option>
          <option value='en-US'>English (en-US)</option>
        </select>
        <button onClick={readQuestion}>🔈 อ่านข้อปัจจุบัน</button>
        <button onClick={startMic}>{listening ? '🛑 หยุดฟัง' : '🎙️ พูดคำตอบ'}</button>
        <button onClick={() => aiDraftOne(current)} disabled={loading}>✨ ร่างคำตอบข้อนี้</button>
        <button onClick={aiDraftAll} disabled={loading}>⚡ เติมทั้งฟอร์มอัตโนมัติ</button>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
        {fields.map((f, i) => (
          <div key={f.id} style={{ marginBottom: 12, padding: 10, border: '1px solid #eee', borderRadius: 10, background: i === index ? '#f0f7ff' : '#fff' }}>
            <div style={{ fontSize: 12, color: '#666' }}>{i + 1}. {lang === 'th-TH' ? f.labelTH : f.labelEN}</div>
            <input
              value={answers[f.id]}
              placeholder={f.placeholder}
              onChange={(e) => setAnswers((p) => ({ ...p, [f.id]: e.target.value }))}
              onFocus={() => setIndex(i)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 6 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => setIndex(i)}>🎯 โฟกัส</button>
              <button onClick={() => speak(lang === 'th-TH' ? f.labelTH : f.labelEN)}>🔈 อ่านโจทย์</button>
              <button onClick={() => aiDraftOne(f)} disabled={loading}>✨ ร่างคำตอบข้อนี้</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={() => setIndex(Math.max(0, index - 1))}>⬅️ ก่อนหน้า</button>
        <div style={{ alignSelf: 'center' }}>ข้อ {index + 1} / {fields.length}</div>
        <button onClick={() => setIndex(Math.min(fields.length - 1, index + 1))}>ถัดไป ➡️</button>
      </div>

      <pre style={{ marginTop: 16, background: '#111', color: '#0f0', padding: 12, borderRadius: 8, maxHeight: 200, overflow: 'auto' }}>
        {JSON.stringify(answers, null, 2)}
      </pre>

      {loading && <div style={{ marginTop: 8, color: '#555' }}>กำลังให้ AI คิดคำตอบ…</div>}
    </div>
  );
}

// หมายเหตุสำคัญด้านความปลอดภัย/คุณภาพ
// - อย่าโชว์/ฝังคีย์บนฝั่งเว็บ ใช้ server เป็น proxy เสมอ
// - ควบคุม System Prompt เพื่อกัน AI ตอบนอกเรื่อง (เช่น บังคับความยาว/รูปแบบ)
// - บันทึกคำตอบลงฐานข้อมูลที่ฝั่ง server ได้ตามต้องการ (เช่น /api/submit)
// - หากต้องการ Streaming ตัวอักษร: ใช้ SSE หรือ WebSocket ที่ฝั่ง server แล้วอัปเดต UI แบบทีละ token


// =============================================
//   Realtime Streaming — SSE & WebSocket
// =============================================
// ด้านล่างเป็นตัวอย่าง “สองแบบ” ให้เลือกใช้ได้ทันที
// - แบบ A: SSE (Server-Sent Events) — ง่าย เสถียร เปิดพอร์ตเดียวกับ HTTP
// - แบบ B: WebSocket — สองทาง, latency ต่ำ เหมาะโต้ตอบ/หยุด/ข้าม ได้ยืดหยุ่น

// -------------------------------------------------
// A) SSE: server/server-sse.js
// -------------------------------------------------
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

// SSE endpoint
app.post('/api/ai/stream', async (req, res) => {
  try {
    const { prompt, system = 'You are a helpful assistant.', temperature = 0.7 } = req.body;

    // ตั้ง header สำหรับ SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // เชื่อมผู้ให้บริการ LLM แบบสตรีม (ตัวอย่าง OpenAI Chat Completions)
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature,
        stream: true,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!r.ok || !r.body) {
      res.write(`event: error
`);
      res.write(`data: ${JSON.stringify({ message: 'Upstream error' })}

`);
      return res.end();
    }

    const decoder = new TextDecoder('utf-8');
    const reader = r.body.getReader();

    let full = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // โปรโตคอลของ OpenAI จะส่งบรรทัดขึ้นต้นด้วย "data: ..."
      for (const line of chunk.split('
')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.replace('data: ', '');
        if (payload === '[DONE]') {
          res.write(`event: done
`);
          res.write(`data: ${JSON.stringify({ text: full })}

`);
          return res.end();
        }
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            full += delta;
            // ส่ง token ทีละส่วนให้ client
            res.write(`event: token
`);
            res.write(`data: ${JSON.stringify({ delta })}

`);
          }
        } catch {}
      }
    }
  } catch (err) {
    res.write(`event: error
`);
    res.write(`data: ${JSON.stringify({ message: 'Server error' })}

`);
    res.end();
  }
});

app.listen(PORT, () => console.log(`SSE server on http://localhost:${PORT}`));


// -------------------------------------------------
// A) SSE: web/src/streamSSE.js (ฝั่งเว็บ)
// -------------------------------------------------
export function streamAI_SSE({ prompt, system, temperature = 0.7, onToken, onDone, onError }) {
  const controller = new AbortController();

  fetch('http://localhost:3001/api/ai/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, system, temperature }),
    signal: controller.signal,
  }).then(async (resp) => {
    if (!resp.body) throw new Error('No body');
    // EventSource ใช้ไม่ได้กับ POST ทั่วไป จึงอ่านสตรีมเองแล้วแตก event แบบง่าย ๆ
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      // แยกตามบล็อกของ SSE (

)
      const parts = buf.split('

');
      buf = parts.pop() || '';
      for (const part of parts) {
        const lines = part.split('
');
        const first = lines[0] || '';
        const evt = first.startsWith('event:') ? first.replace('event: ', '') : 'message';
        const dataLine = lines.find(l => l.startsWith('data:')) || '';
        const data = dataLine.replace('data: ', '');
        if (evt === 'token') {
          try { const { delta } = JSON.parse(data); onToken?.(delta); } catch {}
        } else if (evt === 'done') {
          try { const { text } = JSON.parse(data); onDone?.(text); } catch { onDone?.(''); }
        } else if (evt === 'error') {
          try { const { message } = JSON.parse(data); onError?.(new Error(message)); } catch { onError?.(new Error('SSE error')); }
        }
      }
    }
  }).catch((e) => onError?.(e));

  return () => controller.abort(); // ฟังก์ชันยกเลิกสตรีม
}


// -------------------------------------------------
// A) SSE: web/src/App.jsx (เชื่อมเข้ากับปุ่ม “พิมพ์สด”) 
// -------------------------------------------------
// เพิ่มฟังก์ชันใช้สตรีมเพื่อเติมคำตอบของช่องปัจจุบันแบบไหลเป็นตัวอักษร
import { streamAI_SSE } from './streamSSE';

function useStreamingField({ lang, currentField, answers, setAnswers, speak }) {
  const stopRef = useRef(null);

  const startStream = () => {
    const question = lang === 'th-TH' ? currentField.labelTH : currentField.labelEN;
    const system = lang === 'th-TH'
      ? 'คุณคือผู้ช่วยกรอกฟอร์มภาษาไทย ตอบเป็นประโยคสั้น ไม่เกิน 1–2 บรรทัด'
      : 'You are a concise assistant for filling forms.';

    let spokenBuf = '';
    stopRef.current = streamAI_SSE({
      prompt: question,
      system,
      onToken: (delta) => {
        setAnswers((p) => ({ ...p, [currentField.id]: (p[currentField.id] || '') + delta }));
        // ตัวเลือก: อ่านออกเสียงแบบ buffer ทีละประโยค
        spokenBuf += delta;
        if (/[.!?
]$/.test(spokenBuf)) { speak(spokenBuf); spokenBuf = ''; }
      },
      onDone: () => { if (spokenBuf.trim()) speak(spokenBuf); },
      onError: (e) => console.error('SSE error', e)
    });
  };

  const stopStream = () => {
    if (stopRef.current) { stopRef.current(); stopRef.current = null; }
  };

  return { startStream, stopStream };
}

// ภายในคอมโพเนนต์หลัก ให้เพิ่มปุ่ม:
// <button onClick={startStream}>🟢 พิมพ์สด (SSE)</button>
// <button onClick={stopStream}>⏹️ หยุด</button>


// -------------------------------------------------
// B) WebSocket: server/server-ws.js
// -------------------------------------------------
import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';

const appWS = express();
appWS.use(cors());
appWS.use(express.json());

const server = http.createServer(appWS);
const wss = new WebSocketServer({ server, path: '/ws/ai' });

const LLM_API_KEY2 = process.env.LLM_API_KEY;
const LLM_MODEL2 = process.env.LLM_MODEL || 'gpt-4o-mini';

wss.on('connection', (ws) => {
  ws.on('message', async (raw) => {
    try {
      const { prompt, system = 'You are a helpful assistant.', temperature = 0.7 } = JSON.parse(raw.toString());

      // เรียก upstream แบบ stream
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LLM_API_KEY2}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: LLM_MODEL2,
          temperature,
          stream: true,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!r.ok || !r.body) {
        ws.send(JSON.stringify({ type: 'error', message: 'Upstream error' }));
        return ws.close();
      }

      const decoder = new TextDecoder();
      const reader = r.body.getReader();

      ws.send(JSON.stringify({ type: 'start' }));
      let full = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('
')) {
          const t = line.trim();
          if (!t.startsWith('data:')) continue;
          const payload = t.replace('data: ', '');
          if (payload === '[DONE]') { ws.send(JSON.stringify({ type: 'done', text: full })); ws.close(); return; }
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (delta) { full += delta; ws.send(JSON.stringify({ type: 'delta', delta })); }
          } catch {}
        }
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', message: 'ws error' }));
      ws.close();
    }
  });
});

const PORT_WS = process.env.PORT || 3001;
server.listen(PORT_WS, () => console.log(`WS server on ws://localhost:${PORT_WS}/ws/ai`));


// -------------------------------------------------
// B) WebSocket: web/src/streamWS.js (ฝั่งเว็บ)
// -------------------------------------------------
export function streamAI_WS({ prompt, system, temperature = 0.7, onDelta, onDone, onError }) {
  const ws = new WebSocket('ws://localhost:3001/ws/ai');

  ws.onopen = () => {
    ws.send(JSON.stringify({ prompt, system, temperature }));
  };

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'delta') onDelta?.(msg.delta);
      else if (msg.type === 'done') onDone?.(msg.text);
      else if (msg.type === 'error') onError?.(new Error(msg.message));
    } catch (err) {
      onError?.(err);
    }
  };

  ws.onerror = () => onError?.(new Error('ws error'));

  // ฟังก์ชันปิดการเชื่อมต่อภายนอก
  return () => { try { ws.close(); } catch {} };
}


// -------------------------------------------------
// B) WebSocket: web/src/App.jsx (ผูกกับ UI)
// -------------------------------------------------
import { streamAI_WS } from './streamWS';

function useWSField({ lang, currentField, answers, setAnswers, speak }) {
  const stopRef = useRef(null);

  const startWS = () => {
    const question = lang === 'th-TH' ? currentField.labelTH : currentField.labelEN;
    const system = lang === 'th-TH' ? 'คุณคือผู้ช่วยกรอกฟอร์ม' : 'You are a helpful assistant.';
    let spoken = '';

    stopRef.current = streamAI_WS({
      prompt: question,
      system,
      onDelta: (d) => {
        setAnswers((p) => ({ ...p, [currentField.id]: (p[currentField.id] || '') + d }));
        spoken += d;
        if (/[.!?
]$/.test(spoken)) { speak(spoken); spoken = ''; }
      },
      onDone: (full) => { if (spoken.trim()) speak(spoken); },
      onError: (e) => console.error('WS error', e)
    });
  };

  const stopWS = () => { if (stopRef.current) { stopRef.current(); stopRef.current = null; } };
  return { startWS, stopWS };
}

// ใน UI เพิ่มปุ่ม
// <button onClick={startWS}>🟣 พิมพ์สด (WS)</button>
// <button onClick={stopWS}>⏹️ หยุด</button>


// ------------------ หมายเหตุสำคัญ ------------------
// 1) ถ้า deploy จริง ให้ตั้งค่า CORS/HTTPS และใช้ WSS เบื้องต้นซ่อนพอร์ตหลัง reverse proxy (เช่น Nginx)
// 2) รองรับ “ยกเลิกสตรีม” โดยเก็บ AbortController (SSE) หรือเรียก ws.close() (WebSocket) เมื่อผู้ใช้กดหยุด/เปลี่ยนข้อ
// 3) เพิ่ม guard กัน prompt injection และบันทึก log ฝั่ง server เท่าที่จำเป็นตาม PDPA/GDPR
// 4) สำหรับโมเดล/ผู้ให้บริการอื่น ให้ปรับส่วนอ่านสตรีมตามโปรโตคอล (แต่ pattern token/done คล้ายกัน)

// =============================================================
//      LLM Provider–Agnostic Backend (Streaming + Multi‑Model)
// =============================================================
// จุดประสงค์: สลับใช้โมเดล LLM ได้หลายเจ้า (OpenAI‑compatible, Groq, Together, Fireworks,
// OpenRouter, และ Local Ollama) โดยไม่ต้องแก้โค้ดฝั่งเว็บ
// -------------------------------------------------------------
// โครงไฟล์ (server/)
//   .env
//   server-unified.js   ← เลือก provider ผ่าน ENV
// -------------------------------------------------------------
// .env ตัวอย่าง
// PROVIDER=openai          # openai | openrouter | groq | together | fireworks | ollama | custom
// MODEL=gpt-4o-mini        # ใส่ชื่อโมเดลของผู้ให้บริการ
// API_KEY=xxxxxxxxxxxxxxxx
// API_BASE=                # กรอกเมื่อใช้ custom/endpoint ที่ compatible (เช่น vLLM/self-hosted)
// PORT=3001
//
// หมายเหตุ:
// - ผู้ให้บริการหลายเจ้ารองรับ "OpenAI-compatible Chat Completions" แล้ว
//   เปิด stream:true ได้และรูปแบบ SSE เป็น data: {choices:[{delta:{content}}]} … [DONE]
// - Ollama ใช้โปรโตคอลของตัวเอง (แต่ก็ส่งบรรทัด data: … ได้)

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const PROVIDER = (process.env.PROVIDER || 'openai').toLowerCase();
const MODEL = process.env.MODEL || 'gpt-4o-mini';
const API_KEY = process.env.API_KEY || '';
const API_BASE = process.env.API_BASE || '';

// --------------------------
// Utils: write SSE frame
// --------------------------
function sseWrite(res, event, dataObj) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(dataObj)}\n\n`);
}

// --------------------------
// Route: /api/ai/stream  (unified)
// --------------------------
app.post('/api/ai/stream', async (req, res) => {
  const { prompt, system = 'You are a helpful assistant.', temperature = 0.7, messages } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // สร้าง messages (ถ้าไม่ได้ส่งมาจาก client)
  const chatMessages = messages && Array.isArray(messages) ? messages : [
    { role: 'system', content: system },
    { role: 'user', content: prompt }
  ];

  try {
    if (PROVIDER === 'ollama') {
      // ------------------ OLLAMA (Local) ------------------
      const base = API_BASE || 'http://localhost:11434';
      const r = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: chatMessages,
          stream: true,
          options: { temperature }
        })
      });
      if (!r.ok || !r.body) {
        sseWrite(res, 'error', { message: 'Ollama upstream error' });
        return res.end();
      }
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          const t = line.trim();
          if (!t.startsWith('{')) continue; // Ollama ส่ง JSON ทีละบรรทัด (ไม่มี "data:")
          try {
            const json = JSON.parse(t);
            const delta = json.message?.content || '';
            if (delta) {
              full += delta;
              sseWrite(res, 'token', { delta });
            }
            if (json.done) {
              sseWrite(res, 'done', { text: full });
              return res.end();
            }
          } catch {}
        }
      }
      return;
    }

    // -------- OpenAI‑compatible providers (OpenAI, OpenRouter, Groq, Together, Fireworks, custom) --------
    const base = API_BASE || (
      PROVIDER === 'openai' ? 'https://api.openai.com' :
      PROVIDER === 'openrouter' ? 'https://openrouter.ai' :
      PROVIDER === 'groq' ? 'https://api.groq.com' :
      PROVIDER === 'together' ? 'https://api.together.xyz' :
      PROVIDER === 'fireworks' ? 'https://api.fireworks.ai' :
      API_BASE // custom/self-hosted (เช่น vLLM)
    );

    const path = (PROVIDER === 'openrouter') ? '/api/v1/chat/completions' : '/v1/chat/completions';
    const url = `${base}${path}`;

    const headers = { 'Content-Type': 'application/json' };
    if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;
    if (PROVIDER === 'openrouter') headers['HTTP-Referer'] = 'http://localhost';

    const r = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODEL,
        temperature,
        stream: true,
        messages: chatMessages
      })
    });

    if (!r.ok || !r.body) {
      sseWrite(res, 'error', { message: `Upstream error (${PROVIDER})` });
      return res.end();
    }

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        const t = line.trim();
        if (!t.startsWith('data:')) continue;
        const payload = t.replace('data: ', '');
        if (payload === '[DONE]') {
          sseWrite(res, 'done', { text: full });
          return res.end();
        }
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content ?? '';
          if (delta) { full += delta; sseWrite(res, 'token', { delta }); }
        } catch {}
      }
    }
  } catch (err) {
    console.error(err);
    sseWrite(res, 'error', { message: 'Server error' });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Unified AI server on http://localhost:${PORT}`);
  console.log(`Provider=${PROVIDER} Model=${MODEL} Base=${API_BASE || '(default)'}\n`);
});

// -------------------------------------------------------------
// การใช้งานฝั่งเว็บเหมือนเดิม: เรียก POST /api/ai/stream
// เพียงเปลี่ยนค่าใน .env เพื่อสลับโมเดล/ผู้ให้บริการได้ทันที
// -------------------------------------------------------------

// -------------------------------------------
// (ตัวเลือก) Field‑level Guard / JSON Schema
// -------------------------------------------
// คุณอาจเพิ่ม validation ด้วย schema ต่อฟิลด์ก่อนส่ง prompt เช่น:
//  - fullName: string (ห้ามมีอักษรพิเศษเกินสมเหตุสมผล)
//  - age: number (1–120) → ถ้าโมเดลตอบไม่ใช่เลข ให้ post‑process แปลง/เตือน
//  - idCard: ไม่ให้โมเดลร่างแทนผู้ใช้ เป็นต้น
// หรือส่ง instruction ต่อ field ไปยัง system เพื่อกำกับรูปแบบผลลัพธ์:
//    "ตอบเฉพาะตัวเลขอายุเท่านั้น ไม่เกิน 3 หลัก"

