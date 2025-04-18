import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "../App.css";
import OrganisationForm from "../element/OrganisationForm";
import ViewOrganisation from "../element/ViewOrganisation";

export default function SAOrg() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const actionFromParams = searchParams.get("action") || "Create";
  const orgId = searchParams.get("orgId");

  const [action, setAction] = useState(actionFromParams);
  const [orgData, setOrgData] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (action === "Update" && orgId) {
      const fetchOrgData = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/org/${orgId}`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (!response.ok) {
            setToast({
              message: data.message || "Failed to fetch organization data",
              type: "error",
            });
          }

          setOrgData(data.organization);
          navigate("/superadmin/organization", { replace: true });
        } catch (error) {
          setToast({
            message: "Error fetching organization data:" + error,
            type: "error",
          });
        }
      };

      fetchOrgData();
    }
  }, [action, orgId, navigate]);

  return (
    <div id="container" className="flex column">
      <Navbar role = "Super Admin" />
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />
      <div className="section flex column">
        <div className="headingBar flex row spacebetween">
          <p className="sectionHeading">Organisations</p>
          <div className="flex row">
            <button
              className="btn whiteBtn rounded"
              onClick={() => setAction("Create")}
            >
              Create Organisation
            </button>
            <button
              className="btn whiteBtn rounded"
              onClick={() => setAction("View")}
            >
              Organisation Management
            </button>
          </div>
        </div>
        {action === "Create" && <OrganisationForm type="Create" />}
        {action === "Update" && orgData && (
          <OrganisationForm type="Update" orgData={orgData} />
        )}
        {action === "View" && <ViewOrganisation />}
      </div>
    </div>
  );
}
