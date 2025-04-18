import React, { useState } from "react";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "../App.css";

const defaultQuestions = [
  "How satisfied were you with the overall event?",
  "Was the event content relevant to your interests?",
  "How effectively did the crux of the evnt was realised?",
  "Was the event organized and timely?",
  "How would you rate the venue or online setup?",
  "What did you find most valuable in this event?",
  "What could be improved for future events?",
  "Would you recommend this event to others?",
  "Did the event meet your expectations?",
  "Any additional comments or feedback?",
];

export default function UserFeedbackForm({ eventId, onClose }) {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [answers, setAnswers] = useState(
    Array(defaultQuestions.length).fill("")
  );
  const [toast, setToast] = useState({ message: "", type: "" });
  const nav = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        answers: defaultQuestions.map((q, i) => ({
          question: q,
          answer: answers[i],
        })),
      };
      const res = await fetch(`${BACKEND_URL}/feedback/submit/${eventId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setToast({ message: data.message, type: "success" });
      onClose(null);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const handleChange = (i, val) => {
    const copy = [...answers];
    copy[i] = val;
    setAnswers(copy);
  };

  return (
    <div id="container" className="flex column">
      <Navbar role="User" />
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />
      <div className="section flex column fit centerb">
        <div
          className="borderBox flex column gap-12 fit vcenters"
          id="feedbackForm"
        >
          <p className="sectionHeading">Submit Feedback</p>
          <form className="flex column gap-12" onSubmit={handleSubmit}>
            {defaultQuestions.map((q, i) => {
              if (i % 2 !== 0) return null;
              return (
                <div className="flexRowSplit" key={`row-${i}`}>
                  <div
                    className="vInputBox flexItem flex column gap-8"
                    key={`q-${i}`}
                  >
                    <label className="inputLabel noTextWrap">{defaultQuestions[i]}</label>
                    <input
                      type="text"
                      className=""
                      style={{ height: "20px" }}
                      required
                      value={answers[i]}
                      onChange={(e) => handleChange(i, e.target.value)}
                    />
                  </div>
                  {defaultQuestions[i + 1] && (
                    <div
                      className="vInputBox flexItem flex column gap-8"
                      key={`q-${i + 1}`}
                    >
                      <label className="inputLabel noTextWrap">
                        {defaultQuestions[i + 1]}
                      </label>
                      <input
                        type="text"
                        className=""
                        style={{ height: "20px" }}
                        required
                        value={answers[i + 1]}
                        onChange={(e) => handleChange(i + 1, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <button className="btn green" type="submit">
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
