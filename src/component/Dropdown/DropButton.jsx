import React, { forwardRef } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import "./DropButton.css";

const DropButton = forwardRef((props, ref) => {
  const { children, toggle, open, type } = props;

  return (
    <div
      onClick={toggle}
      className={`dropdown-btn ${type} ${open ? "button-open" : ""}`}
      ref={ref}
    >
      {children}
      <span className="toggle-icon">
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </span>
    </div>
  );
});

export default DropButton;
