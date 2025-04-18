import React, { useEffect, useState } from "react";
import Toast from "../components/Toast";
import "../App.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function OAEventView() {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    mode: "",
    approval: "",
    search: "",
    department: "",
    ignoreFilters: false,
  });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [toast, setToast] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/event/oall`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEvents(data.events);
      setFiltered(data.events);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  useEffect(() => {
    if (filters.ignoreFilters) return setFiltered(events);
    const f = events.filter((e) => {
      return (
        (!filters.category || e.category === filters.category) &&
        (!filters.mode || e.mode === filters.mode) &&
        (!filters.approval || e.approvalStatus === filters.approval) &&
        (!filters.department || e.department.name === filters.department) &&
        (!filters.search ||
          `${e.title} ${e.description} ${e.venue}`
            .toLowerCase()
            .includes(filters.search.toLowerCase()))
      );
    });
    setFiltered(f);
  }, [filters, events]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key]?.toString().toLowerCase();
    const bVal = b[sortConfig.key]?.toString().toLowerCase();
    return sortConfig.direction === "asc"
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  const downloadExcel = (data, name) => {
    const rows = data.map((e, idx) => ({
      "S.No": idx + 1,
      Title: e.title,
      Category: e.category,
      Department: e.department?.name,
      "Start Date": new Date(e.startDate).toLocaleDateString(),
      "End Date": new Date(e.endDate).toLocaleDateString(),
      Approval: e.approvalStatus,
      Mode: e.mode,
      Venue: e.venue,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Events");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    saveAs(blob, `${name}.xlsx`);
  };

  const handleApproval = async (eventId, action) => {
    try {
      const res = await fetch(`${BACKEND_URL}/event/${eventId}/${action}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: `Ok` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setToast({ message: `Event ${action}ed successfully`, type: "success" });
      fetchEvents();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };
  return (
    <div id="container" className="flex column">
      <Navbar role="Organization Admin" />
      <div className="section flex column gap-12">
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast({ message: "", type: "" })}
        />
        <label>
          <input
            type="checkbox"
            checked={filters.ignoreFilters}
            onChange={(e) =>
              setFilters({ ...filters, ignoreFilters: e.target.checked })
            }
          />{" "}
          All Events
        </label>
        <div className="flex row gap-12 fb1 spacebetween">
          <select
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="">All Categories</option>
            {[...new Set(events.map((e) => e.category))].map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
          >
            <option value="">All Modes</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
          <select
            onChange={(e) =>
              setFilters({ ...filters, approval: e.target.value })
            }
          >
            <option value="">All Approval</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Freezed">Freezed</option>
          </select>
          <select
            onChange={(e) =>
              setFilters({ ...filters, department: e.target.value })
            }
          >
            <option value="">All Departments</option>
            {[...new Set(events.map((e) => e.department?.name))].map(
              (dept, i) => (
                <option key={i} value={dept}>
                  {dept}
                </option>
              )
            )}
          </select>
          <input
            type="text"
            placeholder="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="flex row end gap-8">
          <button
            className="btn gold"
            onClick={() => downloadExcel(filtered, "filtered_events")}
          >
            Download Filtered
          </button>
          <button
            className="btn whiteBtn"
            onClick={() => downloadExcel(events, "all_events")}
          >
            Download All
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sl. No</th>
              <th onClick={() => handleSort("title")}>Title</th>
              <th onClick={() => handleSort("category")}>Category</th>
              <th onClick={() => handleSort("startDate")}>Start Date</th>
              <th onClick={() => handleSort("endDate")}>End Date</th>
              <th onClick={() => handleSort("mode")}>Mode</th>
              <th onClick={() => handleSort("approvalStatus")}>Status</th>
              <th onClick={() => handleSort("department")}>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e, idx) => (
              <tr key={e._id}>
                <td>{idx + 1}</td>
                <td>{e.title}</td>
                <td>{e.category}</td>
                <td>{e.startDate?.split("T")[0]}</td>
                <td>{e.endDate?.split("T")[0]}</td>
                <td>{e.mode}</td>
                <td>{e.approvalStatus}</td>
                <td>{e.department?.name}</td>
                <td className="flex row gap-8 center">
                  <button
                    className="btn blue"
                    onClick={() =>
                      navigate(`/organizationadmin/events/edit/${e._id}`)
                    }
                  >
                    Edit
                  </button>
                  {e.approvalStatus === "Pending" && (
                    <>
                      <button
                        className="btn green"
                        onClick={() => handleApproval(e._id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn red"
                        onClick={() => handleApproval(e._id, "reject")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
