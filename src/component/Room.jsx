
import React, { useRef, useState, useEffect } from "react";
import "./Room.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { APP_ID, SECRET } from "./Config.js";

function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const zpRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [callType, setCallType] = useState("");
  const [linkSent, setLinkSent] = useState(false); // เช็คว่าส่ง LINE OA แล้วหรือยัง
  const [currentLink, setCurrentLink] = useState(""); // เก็บ link ปัจจุบัน

  // ส่งข้อความไป Python backend
  const sendToLineOA = async (message) => {
  try {
    const response = await fetch("/send-line", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    console.log("Python backend response:", data);

    if (data.status === "success") {
      alert("ส่งข้อความไป LINE OA เรียบร้อยแล้ว ✅");
      setLinkSent(true);
    } else {
      alert("❌ ส่งข้อความไป LINE OA ล้มเหลว: " + data.message);
    }
  } catch (error) {
    console.error("Error sending to LINE OA:", error);
    alert("ส่งข้อความไป LINE OA เรียบร้อยแล้ว ✅");
  }
};

  // Generate link ใหม่
  const generateNewLink = () => {
    const randomId = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now().toString().slice(-4);
    const newRoomId = randomId + timestamp;
    const newLink =
      window.location.protocol +
      "//" +
      window.location.host +
      "/room/" +
      newRoomId +
      "?type=one-on-one"; // หรือ group-call ตามต้องการ

    setCurrentLink(newLink);
    setLinkSent(false); // รีเซ็ตสถานะการส่ง
    navigate(`/room/${newRoomId}?type=one-on-one`);
  };

  // เริ่ม video call
  const myMeeting = (type) => {
    if (!currentLink) return;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      APP_ID,
      SECRET,
      roomId,
      Date.now().toString(),
      "Your Name"
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zpRef.current = zp;

    zp.joinRoom({
      container: videoContainerRef.current,
      sharedLinks: [{ name: "Video Call Link", url: currentLink }],
      scenario: {
        mode:
          type === "one-on-one"
            ? ZegoUIKitPrebuilt.OneONoneCall
            : ZegoUIKitPrebuilt.GroupCall,
      },
      maxUsers: type === "one-on-one" ? 2 : 10,
      onJoinRoom: () => {
        // ส่ง link ไป LINE OA **ถ้ายังไม่ส่ง**
        if (!linkSent) {
          sendToLineOA(`🚨 ด่วนมีคนไข้อาการคล้ายโรคหลอดเลือดสมอง ต้องการคำปรึกษาด่วน: ${currentLink}`);
        }
      },
      onLeaveRoom: () => {
        navigate("/");
      },
    });
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const type = query.get("type");
    setCallType(type);

    // ตั้ง currentLink จาก URL
    const fullLink =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?type=" +
      encodeURIComponent(type);
    setCurrentLink(fullLink);
    setLinkSent(false); // รีเซ็ตสถานะเมื่อเปลี่ยน link
  }, [location.search]);

  useEffect(() => {
    if (callType) {
      myMeeting(callType);
    }

    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [callType, roomId, navigate, currentLink]);

}

export default Room;