import React, { useState } from "react";
import Toast from "../components/Toast";

export default function DACat({ deptId }) {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setToast({message:"", type: ""})
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/category/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, deptId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setToast({message:"Category requested successfully",type:"success"});
      setFormData({ name: "", description: "" });
    } catch (err) {
      setToast({message:err.message,type:"error"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="borderBox flex column gap-12 fit centerb">
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />
      <p className="sectionHeading">Request Event Category</p>

      <form onSubmit={handleSubmit} className="flex column gap-12">
        <div className="vInputBox flex column gap-8">
          <p className="inputLabel">Category Name</p>
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
          {loading ? "Submitting..." : "Request Category"}
        </button>
      </form>
    </div>
  );
}
