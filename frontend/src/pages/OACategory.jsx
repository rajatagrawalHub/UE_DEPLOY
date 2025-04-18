import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";

export default function OACategory() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [filter, setFilter] = useState("All");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/category/oget`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCategories(data.categories);
      setFilteredCategories(data.categories);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (categoryId) => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/category/approve/${categoryId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setToast({ message: "Category approved", type: "success" });
      fetchCategories();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setFilter(selectedFilter);
    if (selectedFilter === "All") {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(categories.filter((category) => category.status === selectedFilter));
    }
  };

  
  const handleDelete = async (catId) => {
    if (!window.confirm("Are you sure you want to delete this type?")) {
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/category/delete/${catId}`,
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

      setToast({ message: "Category deleted successfully!", type: "success" });
      fetchCategories();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="container" className="flex column">
      <Navbar role="Organization Admin" />
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="section flex column gap-12">
        <div className="flex row spacebetween">
          <p className="sectionHeading">Event Categories</p>
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
              <th>Name</th>
              <th>Description</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td>{cat.description}</td>
                <td>{cat.department?.name || "-"}</td>
                <td>
                  {cat.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(cat._id)}
                      className="btn green"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    className="btn red rounded marg-6"
                    onClick={() => handleDelete(cat._id)}
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
