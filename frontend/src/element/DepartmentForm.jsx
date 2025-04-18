// File: DepartmentForm.jsx
import React, { useEffect, useState } from "react";

export default function DepartmentForm({
  orgId,
  deptData = null,
  mode = "create",
  refresh,
  closeModal,
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
  });
  const [typeOptions, setTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (orgId) {
      fetchOrgTypes().then(() => {
        if (deptData && mode === "edit") {
          setFormData({
            name: deptData.name || "",
            type: deptData.type || "",
            description: deptData.description || "",
          });
        }
      });
    }
  }, [orgId, deptData, mode]);

  const fetchOrgTypes = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/org/${orgId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTypeOptions(data.organization?.types || []);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Failed to fetch types", err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url =
        mode === "edit"
          ? `${BACKEND_URL}/department/${deptData._id}/edit`
          : `${BACKEND_URL}/department/create`;

      const method = mode === "edit" ? "PATCH" : "POST";
      const body = mode === "edit" ? formData : { ...formData, orgId };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(data.message);
      if (mode === "create") {
        setFormData({ name: "", type: "", description: "" });
      }
      if (refresh) refresh();
      if (closeModal) closeModal();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="borderBox flex column gap-12" onSubmit={handleSubmit}>
      <p className="sectionHeading">
        {mode === "edit" ? "Edit Department" : "Create Department"}
      </p>
      {message && <p>{message}</p>}

      <input
        name="name"
        placeholder="Department Name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        required
      >
        <option value="">Select Type</option>
        {typeOptions.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
        {!typeOptions.includes(formData.type) && formData.type && (
          <option value={formData.type}>{formData.type} (unlisted)</option>
        )}
      </select>

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
      />

      <button className="btn green" type="submit" disabled={loading}>
        {loading
          ? mode === "edit"
            ? "Updating..."
            : "Submitting..."
          : mode === "edit"
          ? "Update"
          : "Create"}
      </button>
    </form>
  );
}
