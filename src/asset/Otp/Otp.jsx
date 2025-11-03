import React, { useState, useEffect } from 'react';
import OtpInput from 'react-otp-input';
import "./Otp.css"
import { Link } from 'react-router-dom';

export default function Otp() {
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');

  // Fetch OTP from the backend
  useEffect(() => {
    fetch("http://localhost:3000/otp")
      .then((res) => res.json())
      .then((data) => {
        if (data.otp) setServerOtp(data.otp);
      })
      .catch((err) => console.error("Error fetching OTP:", err));
  }, []);
  

  const verifyOTP = () => {
    if (otp.length !== 6) {
      alert("❌ Please enter a valid 6-digit OTP!");
      return;
    }
  
    if (otp === serverOtp) {
      alert("✅ OTP Verified!");
    } else {
      alert("❌ Incorrect OTP, Try Again!");
    }
  };
  

  return (
    <div className='OTP_input_field'>
      <div className="InsideText" style={{fontSize:"70px", marginTop:"85px"}}>
                        กรอก OTP
                    </div>
      <OtpInput
        value={otp}
        onChange={setOtp}
        numInputs={6}
        renderInput={(props) => <input {...props} className="otp-input" />}
      />
      <Link to="/RiskForm" className="submit" >OTP</Link>
    </div>
  );
}
