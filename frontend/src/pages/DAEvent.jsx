import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import DAEventForm from "../element/DAdminEventForm";
import DAEventView from "../element/DAdminEventView";
import DACat from "../element/DACat";
import { useParams, useNavigate } from "react-router-dom";

export default function DAEvent() {
  const [action, setAction] = useState("CreateEvent");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [editEventData, setEditEventData] = useState(null);
  const { eventId } = useParams();
  const navigate = useNavigate();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/department/admin/departments`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setDepartments(data.departments);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setToast({ message: "Failed to load departments", type: "error" });
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchEventForEdit = async () => {
      if (eventId) {
        try {
          const res = await fetch(`${BACKEND_URL}/event/all`, {
            credentials: "include",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          const eventToEdit = data.events.find((e) => e._id === eventId);
          if (eventToEdit) {
            setSelectedDepartment(eventToEdit.department._id);
            setEditEventData(eventToEdit);
            setAction("EditEvent");
          } else {
            setToast({ message: "Event not found", type: "error" });
            navigate("/departmentadmin/event");
          }
        } catch (err) {
          console.error("Error loading event for editing:", err);
          setToast({ message: "Failed to load event", type: "error" });
        }
      }
    };

    fetchEventForEdit();
  }, [eventId]);

  const handleDeptChange = (e) => setSelectedDepartment(e.target.value);

  return (
    <div id="container" className="flex column">
      <Navbar role="Departmental Admin" />
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="section flex column gap-24">
        <div className="headingBar flex column gap-12">
          <p className="sectionHeading">Event Management</p>
          <div className="flex row spacebetween">
            <div className="flex row gap-12 align-center">
              <select value={selectedDepartment} onChange={handleDeptChange}>
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex row gap-12">
              <button
                className="btn whiteBtn rounded"
                onClick={() => {
                  window.location.href = "/departmentaladmin";
                  setAction("CreateEvent");
                  setEditEventData(null);
                }}
              >
                Create Event
              </button>
              <button
                className="btn whiteBtn rounded"
                onClick={() => {
                  setAction("MyEvent");
                  setEditEventData(null);
                }}
              >
                My Events
              </button>
              <button
                className="btn whiteBtn rounded"
                onClick={() => {
                  setAction("Category");
                  setEditEventData(null);
                }}
              >
                Request Category
              </button>
            </div>
          </div>
        </div>

        {selectedDepartment ? (
          <>
            {action === "EditEvent" && editEventData && (
              <DAEventForm
                deptId={selectedDepartment}
                eventData={editEventData}
                mode="edit"
              />
            )}
            {action === "CreateEvent" && (
              <DAEventForm deptId={selectedDepartment} />
            )}
            {action === "MyEvent" && (
              <DAEventView deptId={selectedDepartment} />
            )}
            {action === "Category" && <DACat deptId={selectedDepartment} />}
          </>
        ) : (
          <p>Please select a Department to proceed.</p>
        )}
      </div>
    </div>
  );
}
