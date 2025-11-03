import { useState, useEffect, useRef } from "react";
import "./Timer.css";

export function Timer() {
  const [timeLeft, setTimeLeft] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [message, setMessage] = useState("");

  const timerRef = useRef(null);

  // Function to reset the timer without starting it
  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(3);
    setIsRunning(false);
    setIsFinished(false);
    setMessage("");
  };

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    setMessage("เริ่ม");

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          setIsFinished(true);
          setMessage("เสร็จสิ้น");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="timer">
      {message && <div className="timer-message">{message}</div>}

      <span className="timer__part timer__part--second">{timeLeft}</span>

      {isFinished ? (
        <button className="StartButton" onClick={resetTimer}>
          เริ่มใหม่
        </button>
      ) : (
        <button className="StartButton" onClick={startTimer} disabled={isRunning}>
          เริ่ม
        </button>
      )}
    </div>
  );
}
