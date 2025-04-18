// File: DepartmentFormWrapper.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DepartmentForm from "../element/DepartmentForm";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";

export default function DepartmentFormWrapper() {
  const { deptId } = useParams();
  const navigate = useNavigate();

  const [deptData, setDeptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/department/${deptId}`, {
          credentials: "include",
        });
        if (res.status === 403) {
          setToast({ message: "Access denied", type: "error" });
          navigate("/organizationadmin/department");
          return;
        }
        const data = await res.json();
        if (res.ok) {
          setDeptData(data.department);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        console.error("Error loading department:", err);
        setToast({ message: "Failed to load department", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deptId]);

  if (loading) return <p>Loading...</p>;
  if (!deptData) return <p>Department not found.</p>;

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
        <p className="sectionHeading">Edit Department</p>
        <DepartmentForm
          orgId={deptData.organization._id}
          deptData={deptData}
          mode="edit"
        />
      </div>
    </div>
  );
}
