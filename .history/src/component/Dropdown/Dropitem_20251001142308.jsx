import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dropitem({ children, to }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);   
    }
  };

  return (
    <button
      type="button"
      className="dropdown-item"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
