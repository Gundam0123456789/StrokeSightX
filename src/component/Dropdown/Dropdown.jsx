import React, { useState } from "react";
import DropButton from "./DropButton";

export default function Dropdown({ buttonText, content, type }) {
  const [open, setOpen] = useState(false);

  return (
  <div className={`dropdown-container ${open ? "open" : ""}`}>
    <DropButton
      type={type}
      toggle={() => setOpen(!open)}
      open={open}
    >
    {buttonText}
    </DropButton>
    <div className="dropdown-content">{content}</div>
  </div>

  );
}
