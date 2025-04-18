import React, { use, useEffect, useState } from "react";
import Toast from "../components/Toast";
import "../App.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DAEventSummaryForm from "./DAEventSummaryForm";
import AdminFeedbackViewer from "./AdminFeedbackViewer";

export default function DAEventView({ deptId }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filterApproval, setFilterApproval] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCollabMode, setFilterCollabMode] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [toast, setToast] = useState({ message: "", type: "" });
  const [openSummaryFor, setOpenSummaryFor] = useState(null);
  const [viewFeedbackFor, setViewFeedbackFor] = useState(null);
  const [eventTitle, setEventTitle] = useState(null);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (deptId) fetchEvents();
  }, [deptId]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/event/all`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const deptEvents = data.events.filter((e) => e.department._id === deptId);
      setEvents(deptEvents);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortableValue = (value) =>
    typeof value === "string" ? value.toLowerCase() : value;

  const sortedEvents = [...events].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = getSortableValue(a[sortConfig.key]);
    const bVal = getSortableValue(b[sortConfig.key]);
    if (aVal === undefined || bVal === undefined) return 0;
    return sortConfig.direction === "asc"
      ? aVal > bVal
        ? 1
        : -1
      : aVal < bVal
      ? 1
      : -1;
  });

  const filtered = sortedEvents.filter((e) => {
    const matchText = search
      ? `${e.title} ${e.description} ${e.venue}`
          .toLowerCase()
          .includes(search.toLowerCase())
      : true;
    const matchApproval = filterApproval
      ? e.approvalStatus === filterApproval
      : true;
    const matchCategory = filterCategory ? e.category === filterCategory : true;
    const matchCollab = filterCollabMode ? e.mode === filterCollabMode : true;
    const matchDate =
      (!startDateFilter ||
        new Date(e.startDate) >= new Date(startDateFilter)) &&
      (!endDateFilter || new Date(e.endDate) <= new Date(endDateFilter));

    return (
      matchText && matchApproval && matchCategory && matchCollab && matchDate
    );
  });

  const deleteEvent = async (eventId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/event/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setToast({ message: data.message, type: "success" });
      fetchEvents();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const downloadExcel = (data, name) => {
    const rows = data.map((e, idx) => ({
      "S.No": idx + 1,
      Title: e.title,
      Description: e.description,
      Category: e.category,
      "Start Date": new Date(e.startDate).toLocaleDateString(),
      "End Date": new Date(e.endDate).toLocaleDateString(),
      Approval: e.approvalStatus,
      Mode: e.mode,
      Venue: e.venue,
      Budget: e.budget,
      "Certificate Required": e.certificate ? "Yes" : "No",
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Events");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${name}.xlsx`);
  };

  const downloadAttendanceReport = async (
    eventId,
    title = "Attendance_Report"
  ) => {
    try {
      const res = await fetch(`${BACKEND_URL}/event/${eventId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const event = data.event;

      const internal =
        event.internalParticipants?.map((u) => u.email || u) || [];
      const external =
        event.externalParticipants?.map((u) => u.email || u) || [];
      const attended =
        event.attendedParticipants?.map((u) => u.email || u) || [];

      const maxLength = Math.max(
        internal.length,
        external.length,
        attended.length
      );

      const rows = Array.from({ length: maxLength }, (_, i) => ({
        "Internal Registered": internal[i] || "",
        "External Registered": external[i] || "",
        "Attended Participants": attended[i] || "",
      }));

      const sheet = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, "Attendance");

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], { type: "application/octet-stream" });

      saveAs(blob, `${title}_AttendanceReport.xlsx`);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  return (
    <div className="section flex column gap-12">
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />
      <div className="flex column spacebetween gap-8">
        <p className="inputLabel">My Events</p>
        <div className="flex row gap-4">
          <input
            type="text"
            placeholder="Search Events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
          >
            <option value="">Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Freezed</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Category</option>
            {[...new Set(events.map((e) => e.category))].map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterCollabMode}
            onChange={(e) => setFilterCollabMode(e.target.value)}
          >
            <option value="">Mode</option>
            <option>Offline</option>
            <option>Online</option>
          </select>
        </div>
        <p>Filter by Date</p>
        <div className="flexRowSplit">
          <div className="vInputbox flex column">
            <p className="inputLabel">Start Date</p>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
          </div>
          <div className="vInputbox flex column">
            <p className="inputLabel">End Date</p>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex row end gap-8">
        <button
          className="btn gold"
          onClick={() => downloadExcel(filtered, "filtered_events_report")}
        >
          Download Filtered
        </button>
        <button
          className="btn transparentBtn"
          onClick={() => downloadExcel(events, "all_events_report")}
        >
          Download All
        </button>
      </div>

      <table>
        <thead>
          <tr className="highlightedRow">
            <th onClick={() => handleSort("_id")}>
              S.No{" "}
              {sortConfig.key === "_id" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("title")}>
              Title{" "}
              {sortConfig.key === "title" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("category")}>
              Category{" "}
              {sortConfig.key === "category" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Dates</th>
            <th onClick={() => handleSort("approvalStatus")}>
              Status{" "}
              {sortConfig.key === "approvalStatus" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((event, index) => (
            <tr key={event._id}>
              <td>{index + 1}</td>
              <td>{event.title}</td>
              <td>{event.category}</td>
              <td>{`${new Date(
                event.startDate
              ).toLocaleDateString()} - ${new Date(
                event.endDate
              ).toLocaleDateString()}`}</td>
              <td>{event.approvalStatus}</td>
              <td className="flex row centerb tvcenter">
                {event.approvalStatus === "Pending" ? (
                  <div className="flex row gap-4 center">
                    <button
                      className="btn blue"
                      onClick={() =>
                        (window.location.href = `/departmentadmin/event/edit/${event._id}`)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn red"
                      onClick={() => deleteEvent(event._id)}
                    >
                      Delete
                    </button>
                  </div>
                ) : event.approvalStatus === "Approved" &&
                  !event.summary &&
                  new Date(event.endDate) < new Date() ? (
                  <button
                    className="btn gold"
                    onClick={() => setOpenSummaryFor(event._id)}
                  >
                    Submit Summary
                  </button>
                ) : (
                  event.approvalStatus === "Freezed" && (
                    <>
                      <button
                        className="btn blue"
                        onClick={() =>
                          downloadAttendanceReport(event._id, event.title)
                        }
                      >
                        Download Attendance
                      </button>
                      <button
                        className="btn whiteBtn"
                        onClick={() => {
                          setViewFeedbackFor(
                            viewFeedbackFor === event._id ? null : event._id
                          );
                          setEventTitle(
                            eventTitle === event.title ? null : event.title
                          );
                        }}
                      >
                        {viewFeedbackFor === event._id
                          ? "Hide Feedback"
                          : "View Feedback"}
                      </button>
                    </>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {openSummaryFor && (
        <div className="modal">
          <DAEventSummaryForm
            eventId={openSummaryFor}
            onclose={setOpenSummaryFor}
          />
        </div>
      )}

      {viewFeedbackFor && (
        <div className="section">
          <AdminFeedbackViewer
            eventId={viewFeedbackFor}
            eventTitle={eventTitle}
            onClose={setViewFeedbackFor}
          />
        </div>
      )}
    </div>
  );
}
