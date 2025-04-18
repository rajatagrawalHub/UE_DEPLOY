// File: OADepartment.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import DepartmentForm from "../element/DepartmentForm";
import ViewDepartment from "../element/ViewDepartment";
import OAType from "../element/OAType";

export default function OADepartment() {
  const [action, setAction] = useState("Create");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/current`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.organizations?.length > 0) {
          const orgDetails = await Promise.all(
            data.organizations.map(async (orgId) => {
              const res = await fetch(`${BACKEND_URL}/org/${orgId}`, {
                credentials: "include",
              });
              const d = await res.json();
              return d.organization;
            })
          );
          setOrganizations(orgDetails);
        }
      } catch {
        setToast({ message: "Failed to load organizations", type: "error" });
      }
    };
    fetchOrganizations();
  }, []);

  const handleOrgChange = (e) => setSelectedOrg(e.target.value);

  return (
    <div id="container" className="flex column">
      <Navbar role="Organization Admin" />
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="section flex column gap-24">
        <div className="headingBar flex column gap-12">
          <p className="sectionHeading">Department Management</p>
          <div className="flex row spacebetween">
            <div className="flex row gap-12 align-center">
              <select value={selectedOrg} onChange={handleOrgChange}>
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex row gap-12">
              <button
                className="btn whiteBtn rounded"
                onClick={() => setAction("Create")}
              >
                Create Department
              </button>
              <button
                className="btn whiteBtn rounded"
                onClick={() => setAction("View")}
              >
                View Departments
              </button>
              <button
                className="btn whiteBtn rounded"
                onClick={() => setAction("Type")}
              >
                Request Type
              </button>
            </div>
          </div>
        </div>

        {selectedOrg ? (
          <>
            {action === "Create" && <DepartmentForm orgId={selectedOrg} />}
            {action === "View" && <ViewDepartment orgId={selectedOrg} />}
            {action === "Type" && <OAType orgId={selectedOrg} />}
          </>
        ) : (
          <p>Please select an organization to proceed.</p>
        )}
      </div>
    </div>
  );
}
