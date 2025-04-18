// File: OAType.jsx
import React, { useState } from "react";

export default function OAType({ orgId }) {
  const [formData, setFormData] = useState({ name: "", description: ""});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
  
    try {
      const response = await fetch(`${BACKEND_URL}/type/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, orgId }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add type");
  
      setSuccess("Type requested successfully and pending approval.");
      setFormData({ name: "", description: "" }); // no orgId needed here
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="borderBox flex column gap-12 fit centerb">
      <p className="sectionHeading">Request Department Type</p>

      {error && <p className="errorMsg">{error}</p>}
      {success && <p className="successMsg">{success}</p>}

      <form onSubmit={handleSubmit} className="flex column gap-12">
        <div className="vInputBox flex column gap-8">
          <p className="inputLabel">Type Name</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Technical, Management"
          />
        </div>

        <div className="vInputBox flex column gap-8">
          <p className="inputLabel">Description</p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Type description"
          />
        </div>

        <button className="btn green" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Request Type"}
        </button>
      </form>
    </div>
  );
}