import React, { useEffect, useState } from "react";
import Toast from "../components/Toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminFeedbackViewer({ eventId, eventTitle, onClose }) {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [feedbacks, setFeedbacks] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "" });

  const downloadFeedbackPDF = async (eventId, title) => {
    try {
      const res = await fetch(`${BACKEND_URL}/feedback/view/${eventId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const grouped = {};
      data.feedbacks.forEach((fb) => {
        fb.answers.forEach(({ question, answer }) => {
          if (!grouped[question]) grouped[question] = [];
          grouped[question].push(answer);
        });
      });

      const summaryRes = await fetch(
        `${BACKEND_URL}/feedback/summary/ai/${eventId}`,
        {
          credentials: "include",
        }
      );
      const summaryData = await summaryRes.json();
      let aiSummary = summaryData.summary || "No AI summary available.";
      aiSummary = aiSummary
        .replace(/^.*based on the provided feedback[:\s]*/i, "")
        .replace("*", "")
        .trim();
      const doc = new jsPDF();
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`Feedback Summary Report`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Event: ${title}`, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);
      doc.text(`Total Feedbacks Submitted: ${data.feedbacks.length}`, 14, 42);

      // === Add AI Summary ===
      doc.setFontSize(11);
      const summaryLines = doc.splitTextToSize(aiSummary, 180);
      doc.text(summaryLines, 14, 52);

      let y = 52 + summaryLines.length * 6;

      Object.entries(grouped).forEach(([question, answers], idx) => {
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont("Helvetica", "bold");
        doc.text(`${idx + 1}. ${question}`, 14, y);
        autoTable(doc, {
          startY: y + 4,
          head: [["Responses"]],
          body: answers.map((a) => [a]),
          margin: { left: 14 },
          styles: { fontSize: 10 },
          theme: "grid",
        });
        y = doc.lastAutoTable.finalY + 10;
      });

      doc.save(`${title}_Feedback_Report.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      setToast({ message: err.message, type: "error" });
    }
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/feedback/view/${eventId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setFeedbacks(data.feedbacks);
      } catch (err) {
        setToast({ message: err.message, type: "error" });
      }
    };
    fetchFeedback();
  }, [eventId]);

  const groupedByQuestion = {};
  feedbacks.forEach((fb) => {
    fb.answers.forEach(({ question, answer }) => {
      if (!groupedByQuestion[question]) groupedByQuestion[question] = [];
      groupedByQuestion[question].push(answer);
    });
  });

  return (
    <div className="modal">
      <div className="borderBox flex column gap-12 fit">
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast({ message: "", type: "" })}
        />
        <div className="flex row spacebetween">
          <p className="subHeading">Feedback Summary</p>
          <button className="btn transparentBtn" onClick={() => onClose(null)}>
            X
          </button>
        </div>
        {Object.entries(groupedByQuestion).map(([question, answers], idx) => (
          <div key={idx} className="flex column gap-4">
            <p className="inputLabel">{question}</p>
            <ul className="orgCardColumn">
              {answers.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        ))}
        <button
          className="btn green"
          onClick={() => downloadFeedbackPDF(eventId, eventTitle)}
        >
          Feedback Report
        </button>
      </div>
    </div>
  );
}
