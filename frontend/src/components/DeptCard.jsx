// File: DeptCard.jsx
import React, { useState } from "react";
import AssignAdminModalDept from "../components/AssignAdminModalDept";

import DepartmentForm from "../element/DepartmentForm";
import { useNavigate } from "react-router-dom";

export default function DeptCard({ dept, refreshDepartments }) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;
    try {
      const res = await fetch(`${BACKEND_URL}/${dept._id}/department`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      refreshDepartments();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  return (
    <div className="orgCard">
      <h3 className="orgCardTitle">{dept.name}</h3>
      <div className="orgCardDetails">
        <div className="orgCardRow">
          <span className="orgLabel">Type:</span>
          <span className="orgValue">{dept.type}</span>
        </div>
        <div className="orgCardColumn gap-8">
          <span className="orgLabel">Description:</span>
          <span className="orgValue left">{dept.description}</span>
        </div>
        <div className="orgCardRow">
          <span className="orgLabel">Admins:</span>
          <span className="orgValue">
            {dept.admins?.length > 0
              ? dept.admins.map((admin) => admin.email).join(", ")
              : "No admins assigned"}
          </span>
        </div>
        <div className="flex row gap-8 margintop-12 centerb">
          <button
            className="orgBtn edit"
            onClick={() =>
              navigate(`/organizationadmin/department/edit/${dept._id}`)
            }
          >
            Edit
          </button>
          <button
            className="orgBtn assign"
            onClick={() => setShowAdminModal(true)}
          >
            Admins
          </button>
          <button className="orgBtn delete" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
      {showAdminModal && (
        <AssignAdminModalDept
          dept={dept}
          closeModal={() => setShowAdminModal(false)}
          refresh={refreshDepartments}
        />
      )}
    </div>
  );
}
