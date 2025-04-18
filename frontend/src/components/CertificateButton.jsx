import React from "react";

export default function CertificateButton({ eventId }) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const downloadCertificate = async () => {
    const res = await fetch(`${BACKEND_URL}/feedback/certificate/${eventId}`, {
      credentials: "include"
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificate.pdf`;
    link.click();
  };

  return (
    <button className="btn green" onClick={downloadCertificate}>
      Download Certificate
    </button>
  );
}