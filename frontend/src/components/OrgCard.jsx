import React, { useState } from "react";
import "../App.css";
import AssignAdminModal from "./AssignAdminModal";
import Toast from "./Toast";

export default function OrgCard({ org, refreshOrganizations }) {
  const [assignAdmin, setAssignAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleEdit = () => {
    window.location.href = `/superadmin/organization?action=Update&orgId=${org._id}`;
  };

  const handleFetchAdmins = () => {
    if (!org.admins || org.admins.length === 0) {
      setToast({
        message: "No admins assigned to this organization.",
        type: "info",
      });
      return;
    }
    setAssignAdmin(true);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this organization?"))
      return;

    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/org/${org._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete organization");
      }

      setToast({
        message: "Organization deleted successfully!",
        type: "success",
      });
      refreshOrganizations();
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orgCard">
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />

      {assignAdmin && (
        <AssignAdminModal
          type={"Organisation"}
          setModalView={setAssignAdmin}
          admins={org.admins}
          org={org}
          refreshOrganizations={refreshOrganizations}
        />
      )}

      <h3 className="orgCardTitle">{org.name}</h3>
      <div className="orgCardDetails">
        <div className="orgCardRow">
          <span className="orgLabel">Email:</span>
          <span className="orgValue">{org.email}</span>
        </div>
        <div className="orgCardRow">
          <span className="orgLabel">Address:</span>
          <span className="orgValue">{org.address}</span>
        </div>
        <div className="orgCardRow">
          <span className="orgLabel">City:</span>
          <span className="orgValue">{org.city}</span>
        </div>
        <div className="orgCardRow">
          <span className="orgLabel">State:</span>
          <span className="orgValue">{org.state}</span>
        </div>
        <div className="orgCardRow">
          <span className="orgLabel">PoC Name:</span>
          <span className="orgValue">{org.poc}</span>
        </div>
        <div className="orgCardRow">
          <span className="orgLabel">Contact No:</span>
          <span className="orgValue">{org.contact}</span>
        </div>
        <div className="orgCardRow">
          <span className="orgLabel">Admins:</span>
          <span className="orgValue">
            {org.admins?.length > 0
              ? org.admins.map((admin) => admin.email).join(", ")
              : "No admins assigned"}
          </span>
        </div>
      </div>

      <div className="orgCardActions">
        <button className="orgBtn edit" onClick={handleEdit} disabled={loading}>
          {loading ? "Editing..." : "Edit"}
        </button>
        <button
          className="orgBtn assign"
          onClick={handleFetchAdmins}
          disabled={loading}
        >
          {loading ? "Loading..." : "Admins"}
        </button>
        <button
          className="orgBtn delete"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
