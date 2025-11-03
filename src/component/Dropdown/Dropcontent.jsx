import { forwardRef } from "react";
import "./Dropcontent.css";

const Dropcontent = forwardRef((props, ref) => {
  const { children, open, top } = props;
  return (
    <div
      className={`dropdown-content ${open ? "content-open" : null}`}
      style={{ top: top ? `${top}px` : "100%" }}
      ref={ref}
    >
      {children}
    </div>
  );
});

export default Dropcontent;