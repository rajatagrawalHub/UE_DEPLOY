import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";

export default function OAEventForm() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [eventData, setEventData] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/event/${eventId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEventData(data.event);
      fetchCategories(data.event.department._id);
    } catch (err) {
      setError(true);
      setMessage(err.message);
    }
  };

  const fetchCategories = async (deptId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/category?deptId=${deptId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok)
        setCategories(data.categories.filter((c) => c.status !== "pending"));
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setEventData((prev) => ({
        ...prev,
        tag: [...(prev.tag || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const validate = () => {
    const { regStartDate, regEndDate, startDate } = eventData;
    if (new Date(regStartDate) > new Date(startDate)) {
      setMessage("Registration start date cannot be after event start date");
      setError(true);
      return false;
    }
    if (new Date(regEndDate) > new Date(startDate)) {
      setMessage("Registration end date cannot be after event start date");
      setError(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await fetch(`${BACKEND_URL}/event/${eventId}/edit`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("Event updated successfully.");
      setError(false);
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      setError(true);
      setMessage(err.message);
    }
  };

  if (!eventData) return <div>Loading...</div>;

  return (
    <div id="container" className="flex column">
      <Navbar role="Organization Admin" />
      <Toast
        message={message}
        type={error ? "error" : "success"}
        duration={3000}
        onClose={() => setMessage("")}
      />
      <div id="signup" className="section flex row fb1 spaceAround">
        <form
          className="borderBox flex column centerb gap-12"
          onSubmit={handleSubmit}
        >
          <div className="sectionHeading">Edit Event</div>

          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Department</p>
              <input type="text" value={eventData.department.name} disabled />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Title</p>
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Category</p>
              <select
                name="category"
                value={eventData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Description</p>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Start Date</p>
              <input
                type="date"
                name="startDate"
                value={eventData.startDate?.split("T")[0]}
                onChange={handleChange}
                required
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">End Date</p>
              <input
                type="date"
                name="endDate"
                value={eventData.endDate?.split("T")[0]}
                onChange={handleChange}
                required
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Start Time</p>
              <input
                type="time"
                name="startTime"
                value={eventData.startTime}
                onChange={handleChange}
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">End Time</p>
              <input
                type="time"
                name="endTime"
                value={eventData.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Reg Start Date</p>
              <input
                type="date"
                name="regStartDate"
                value={eventData.regStartDate?.split("T")[0]}
                onChange={handleChange}
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Reg End Date</p>
              <input
                type="date"
                name="regEndDate"
                value={eventData.regEndDate?.split("T")[0]}
                onChange={handleChange}
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Max Participants</p>
              <input
                type="number"
                name="maxParticipants"
                value={eventData.maxParticipants}
                onChange={handleChange}
                min={1}
              />
            </div>
          </div>

          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Venue</p>
              <input
                name="venue"
                value={eventData.venue}
                onChange={handleChange}
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Mode</p>
              <select
                name="mode"
                value={eventData.mode}
                onChange={handleChange}
              >
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Budget</p>
              <input
                name="budget"
                value={eventData.budget}
                onChange={handleChange}
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Budget Amount</p>
              <input
                type="number"
                name="budgetAmount"
                value={eventData.budgetAmount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Certificate Required</p>
              <select
                name="certificate"
                value={eventData.certificate ? "true" : "false"}
                onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    certificate: e.target.value === "true",
                  }))
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Approval Status</p>
              <select
                name="approvalStatus"
                value={eventData.approvalStatus}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Remarks</p>
              <input
                name="remarks"
                value={eventData.remarks || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="vInputBox flexItem flex row spacebetween">
            <div className="vInputbox flex column">
              <p className="inputLabel">Tags</p>
              <div className="flex row wrap gap-6">
                {eventData.tag?.map((t, i) => (
                  <div key={i} className="interestCard">
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex row gap-8 hfit">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag"
              />
              <button type="button" className="btn transparentBtn" onClick={handleAddTag}>
                Add Tag
              </button>
            </div>
          </div>

          <div className="flex row">
            <button
              className="btn red fb1"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button className="btn green fb1" type="submit">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
