import React, { useRef, useState } from "react";

export default function AssignAdminModal({
  type,
  setModalView,
  admins,
  org,
  refreshOrganizations,
}) {
  const [editableInputs, setEditableInputs] = useState({});
  const [emailValues, setEmailValues] = useState(() =>
    admins.reduce((acc, admin) => {
      acc[admin._id] = admin.email || "";
      return acc;
    }, {})
  );
  const [loadingMap, setLoadingMap] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEditClick = (adminId) => {
    setEditableInputs((prev) => ({ ...prev, [adminId]: true }));
  };

  const handleInputChange = (adminId, value) => {
    setEmailValues((prev) => ({ ...prev, [adminId]: value }));
  };

  const handleUpdateAdmin = async (adminId) => {
    const newEmail = emailValues[adminId];

    try {
      setLoadingMap((prev) => ({ ...prev, [adminId]: true }));
      setError("");
      setSuccess("");

      const response = await fetch("http://localhost:5000/org/edit-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orgId: org._id, adminId, newEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update admin");
      }

      setSuccess("Admin email updated successfully!");
      refreshOrganizations();

      setEditableInputs((prev) => ({ ...prev, [adminId]: false }));

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
        <p className="sectionHeading">Manage Admin</p>
        <button className="btn whiteBtn rounded" onClick={() => setModalView(false)}>
          X
        </button>
      </div>

      {error && <p className="errorMsg">{error}</p>}
      {success && <p className="successMsg">{success}</p>}

      <div className="vInputBox flexItem flex row gap-12 tvcenter spacebetween">
        <p className="inputLabel">{"Select " + type}</p>
        <select value={org.name} disabled>
          <option value={org.name}>{org.name}</option>
        </select>
      </div>

      {admins.map((admin) => {
        const isEditable = editableInputs[admin._id] || false;
        const isLoading = loadingMap[admin._id] || false;

        return (
          <div key={admin._id} className="vInputBox flexItem flex column">
            <p className="twrap">Admin ID: {admin._id}</p>
            <div className="flex row spacebetween gap-8">
              <input
                type="text"
                value={emailValues[admin._id] || ""}
                readOnly={!isEditable}
                onChange={(e) => handleInputChange(admin._id, e.target.value)}
                placeholder="Enter Admin Email"
              />
              {!isEditable ? (
                <button className="btn green fb1" onClick={() => handleEditClick(admin._id)}>
                  Edit
                </button>
              ) : (
                <button
                  className="btn green fb1"
                  onClick={() => handleUpdateAdmin(admin._id)}
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Save"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      <button className="btn blue" onClick={() => setModalView(false)}>
        Close
      </button>
    </div>
  );
}
