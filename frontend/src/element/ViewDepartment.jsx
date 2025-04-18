// File: ViewDepartment.jsx
import React, { useEffect, useState } from "react";
import DeptCard from "../components/DeptCard";
import Toast from "../components/Toast";

export default function ViewDepartment({ orgId }) {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (orgId) fetchDepartments();
  }, [orgId]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/department?orgId=${orgId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDepartments(data.departments);
      setFilteredDepartments(data.departments);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = departments.filter((dept) =>
      dept.name.toLowerCase().includes(term)
    );
    setFilteredDepartments(filtered);
  };

  const handleAssignAdmin = async () => {
    if (!selectedDept || !adminEmail) {
      setToast({
        message: "Please select a department and provide an admin email",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/department/${selectedDept}/assign-admin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ adminEmail: adminEmail }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setToast({ message: "Admin assigned successfully!", type: "success" });
      setAdminEmail("");
      setSelectedDept("");
      fetchDepartments(); // refresh with updated admin info
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section flex column gap-12">
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="filterbar flex row spacebetween">
        <div className="flex row gap-8">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Enter Admin Email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <button
            className="btn whiteBtn"
            onClick={handleAssignAdmin}
            disabled={loading}
          >
            {loading ? "Assigning..." : "Assign Admin"}
          </button>
        </div>

        <div className="flex row gap-8">
          <input
            type="text"
            placeholder="Search Department"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex row fxwrap gap-12">
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map((dept) => (
            <DeptCard
              key={dept._id}
              dept={dept}
              refreshDepartments={fetchDepartments}
            />
          ))
        ) : (
          <p>No departments found for this organization.</p>
        )}
      </div>
    </div>
  );
}
