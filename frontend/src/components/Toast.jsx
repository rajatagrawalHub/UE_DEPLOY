import React, { useEffect, useState } from "react";

export default function Toast({ message = "", type = "error", duration = 2000, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!visible || !message) return null;

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
}
