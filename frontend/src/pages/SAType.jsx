// File: SAType.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "../App.css";

export default function SAType() {
  const [types, setTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/type`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch types");
      }

      setTypes(data.types);
      setFilteredTypes(data.types);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (typeId,orgId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/type/approve/${typeId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgId }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to approve type");
      }

      setToast({ message: "Type approved successfully!", type: "success" });
      fetchTypes();
    } catch (err) {
      console.error("Error approving type:", err);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (typeId) => {
    if (!window.confirm("Are you sure you want to delete this type?")) {
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/type/delete/${typeId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete type");
      }

      setToast({ message: "Type deleted successfully!", type: "success" });
      fetchTypes();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setFilter(selectedFilter);
    if (selectedFilter === "All") {
      setFilteredTypes(types);
    } else {
      setFilteredTypes(
        types.filter((type) => type.status === selectedFilter)
      );
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  return (
    <div id="container" className="flex column">
      <Navbar role="Super Admin" />
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div id="typeDashboard" className="section flex column">
        <div className="flex row spacebetween">
          <p className="sectionHeading">Types</p>
          <select value={filter} onChange={handleFilterChange}>
            <option value="All">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        {loading && <p>Loading...</p>}
        <table>
          <thead>
            <tr>
              <th>Department Type</th>
              <th>Type Description</th>
              <th>Organization Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTypes.map((type) => (
              <tr key={type._id}>
                <td>{type.name}</td>
                <td>{type.description}</td>
                {console.log(type)}
                <td>{type.organization.name || "-"}</td>
                <td className="centertd">
                  {type.status !== "approved" && (
                    <button
                      className="btn green rounded marg-6"
                      onClick={() => handleApprove(type._id,type.organization._id)}
                      disabled={loading}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    className="btn red rounded marg-6"
                    onClick={() => handleDelete(type._id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}