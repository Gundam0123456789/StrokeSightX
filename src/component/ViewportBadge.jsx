import { useEffect, useState } from "react";

export default function ViewportBadge() {
  const [size, setSize] = useState({ w: 0, h: 0, bp: "…" });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      let bp = "desktop";
      if (w <= 768) bp = "mobile";
      else if (w <= 1200) bp = "tablet/laptop";
      setSize({ w, h, bp });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return (
    <div style={{
      position: "fixed", top: 10, right: 10, zIndex: 9999,
      padding: "8px 12px", borderRadius: 8,
      background: "rgba(0,0,0,.7)", color: "#fff",
      fontFamily: "system-ui, sans-serif", fontSize: 12, lineHeight: 1.3
    }}>
      viewport: {size.w} × {size.h} px • {size.bp}
      asda
    </div>

    
  );
}
