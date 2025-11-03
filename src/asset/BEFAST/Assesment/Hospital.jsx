import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
const HospitalMap = () => {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        Swal.fire({
                title: 'ไม่สามารถเชื่อมต่อแผนที่ได้แผนที่ได้',
                icon: 'error',
                confirmButtonText: 'ตกลง',
                
              });
      }
    );
  }, []);

  return (
    <div style={{ maxWidth: 1500, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", fontFamily: "Prompt" }}>
        โรงพยาบาลในพื้นที่ของคุณ
      </h2>

      {coords ? (
        <iframe
          title="Google Map"
          width="100%"
          height="500"
          style={{ border: 0, borderRadius: "10px" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=โรงพยาบาลใกล้ฉัน&ll=${coords.lat},${coords.lng}&z=15&output=embed`}
        />
      ) : (
        <p style={{ textAlign: "center", fontFamily:"Prompt" }}>กำลังโหลดแผนที่...</p>
      )}
    </div>
  );
};

export default HospitalMap;
