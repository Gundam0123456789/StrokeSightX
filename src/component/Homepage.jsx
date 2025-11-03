import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import logo from "./pic/BrainSideLogo.png"; // โลโก้ของคุณ

function HomePage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const handleGenerateRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now().toString().slice(-4);
    const newRoomId = randomId + timestamp;
    setRoomId(newRoomId);
    navigate(`/room/${newRoomId}?type=one-on-one`);
  };

  return (
    <div className="homepage-container">
      <div className="homepage-card">
        <img src={logo} alt="Logo" className="homepage-logo" />
        <h1>Stroke Sight Telemedicine</h1>
        <p>Start a video call by generating a Room ID</p>
        <div className="room-controls">
          <input
            type="text"
            placeholder="Generated Room ID"
            value={roomId}
            readOnly
          />
          <button onClick={handleGenerateRoom}>Generate & Join</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;