// File: AssignAdminModalDept.jsx
import React, { useState } from "react";

export default function AssignAdminModalDept({ dept, closeModal, refresh }) {
  const [editableInputs, setEditableInputs] = useState({});
  const [emailValues, setEmailValues] = useState(() =>
    dept.admins.reduce((acc, admin) => {
      acc[admin._id] = admin.email || "";
      return acc;
    }, {})
  );
  const [loadingMap, setLoadingMap] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleEditClick = (adminId) => {
    setEditableInputs((prev) => ({ ...prev, [adminId]: true }));
  };

  const handleInputChange = (adminId, value) => {
    setEmailValues((prev) => ({ ...prev, [adminId]: value }));
  };

  const handleUpdateAdmin = async (adminId) => {
    const updatedEmail = emailValues[adminId];
  
    try {
      setLoadingMap((prev) => ({ ...prev, [adminId]: true }));
      setError("");
      setSuccess("");
  
      const response = await fetch(`${BACKEND_URL}/department/${dept._id}/replace-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldAdminId: adminId,
          newEmail: updatedEmail
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to replace admin");
  
      setSuccess("Admin replaced successfully");
      setEditableInputs((prev) => ({ ...prev, [adminId]: false }));
      refresh?.();
  
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [adminId]: false }));
    }
  };
  
  return (
    <div className="borderBox modal flex column fitContent gap-24">
      <div className="flex row spacebetween">
        <p className="sectionHeading">Manage Admins</p>
        <button className="btn whiteBtn rounded" onClick={closeModal}>X</button>
      </div>

      {error && <p className="errorMsg">{error}</p>}
      {success && <p className="successMsg">{success}</p>}

      <div className="vInputBox flexItem flex row gap-12 tvcenter spacebetween">
        <p className="inputLabel">Select Department</p>
        <select value={dept.name} disabled>
          <option value={dept.name}>{dept.name}</option>
        </select>
      </div>

      {dept.admins?.length > 0 ? (
        dept.admins.map((admin) => {
          const isEditable = editableInputs[admin._id] || false;
          const isLoading = loadingMap[admin._id] || false;

          return (
            <div key={admin._id} className="vInputBox flexItem flex column">
              <p className="twrap">Admin ID: {admin._id}</p>
              <div className="flex row spacebetween gap-8">
                <input
                  type="email"
                  value={emailValues[admin._id] || ""}
                  readOnly={!isEditable}
                  onChange={(e) => handleInputChange(admin._id, e.target.value)}
                  placeholder="Enter Admin Email"
                />
                {!isEditable ? (
                  <button
                    className="btn green fb1"
                    onClick={() => handleEditClick(admin._id)}
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    className="btn green fb1"
                    onClick={() => handleUpdateAdmin(admin._id)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p>No admins assigned yet.</p>
      )}

      <button className="btn blue rounded" onClick={closeModal}>
        Close
      </button>
    </div>
  );
}
