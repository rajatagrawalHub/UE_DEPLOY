import React, { useEffect, useState } from "react";
import Toast from "../components/Toast";

export default function DAEventSummaryForm({ eventId, onclose }) {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [summary, setSummary] = useState("");
  const [emails, setEmails] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [method, setMethod] = useState("manual");
  const [registered, setRegistered] = useState({ internal: [], external: [] });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/event/${eventId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setRegistered({
          internal: data.event.internalParticipants || [],
          external: data.event.externalParticipants || [],
        });
      } catch (err) {
        setToast({ message: err.message, type: "error" });
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("summary", summary);

      if (method === "excel" && file) {
        formData.append("excel", file);
      } else if (method === "manual" && emails) {
        const emailArray = emails
          .split(/[\n,]+/)
          .map((e) => e.trim())
          .filter(Boolean);
        formData.append("participantEmails", JSON.stringify(emailArray));
      }

      const res = await fetch(`${BACKEND_URL}/event/${eventId}/summary`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setToast({
        message: `${data.markedPresent} marked present.\n${
          (data.invalidEmails?.length || 0) +
          (data.unregisteredEmails?.length || 0)
        } not recognized.`,
        type: "success",
      });

      setSummary("");
      setEmails("");
      setFile(null);

      if (typeof onclose === "function") {
        onclose(null);
      }

      window.location.reload();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="borderBox flex column gap-12 fit">
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />
      <p className="sectionHeading">Submit Event Summary</p>
      <form className="flex column gap-12" onSubmit={handleSubmit}>
        <div className="vInputBox flex column gap-8">
          <label className="inputLabel">Summary</label>
          <textarea
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write your event summary here..."
          />
        </div>

        <div className="vInputBox flex column gap-8">
          <label className="inputLabel">Attendance Mode</label>
          <div className="flex row gap-12">
            <label>
              <input
                type="radio"
                name="method"
                checked={method === "manual"}
                onChange={() => setMethod("manual")}
              />{" "}
              Manual Entry
            </label>
            <label>
              <input
                type="radio"
                name="method"
                checked={method === "excel"}
                onChange={() => setMethod("excel")}
              />{" "}
              Upload
            </label>
          </div>
        </div>

        {method === "excel" && (
          <div className="vInputBox flex column gap-8">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
        )}

        {method === "manual" && (
          <div className="vInputBox flex column gap-8">
            <label className="inputLabel">Mark Participants</label>
            <p>Separated by commas or new line</p>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter participant emails..."
            />
            <div className="flex column gap-6">
              <div>
                <p className="inputLabel">Internal Registered:</p>
                <p>{registered.internal.map((p) => p.email).join(", ")}</p>
              </div>
              <div>
                <p className="inputLabel">External Registered:</p>
                <p>{registered.external.map((p) => p.email).join(", ")}</p>
              </div>
            </div>
          </div>
        )}

        <button className="btn green" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Summary"}
        </button>
        <button className="btn red fwidth" onClick={() => onclose(null)}>
          Cancel
        </button>
      </form>
    </div>
  );
}
