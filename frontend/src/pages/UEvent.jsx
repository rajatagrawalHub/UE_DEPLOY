// === CLEANED DEvent.jsx with Certificate and Feedback ===
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "../App.css";
import CertificateButton from "../components/CertificateButton";
import UserFeedbackForm from "../element/FeedbackForm";

export default function DEvent() {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [toast, setToast] = useState({ message: "", type: "" });
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("");
  const [certificate, setCertificate] = useState("");
  const [registration, setRegistration] = useState("");
  const [timeline, setTimeline] = useState("Upcoming");

  const [internalEvents, setInternalEvents] = useState([]);
  const [externalEvents, setExternalEvents] = useState([]);
  const [showfeedbackform, setShowfeedbackform] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const userRes = await fetch(`${BACKEND_URL}/auth/current`, {
        credentials: "include",
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(userData.message);
      const deptIds = userData.departments.map((d) => d.toString());

      const res = await fetch(`${BACKEND_URL}/event/all`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const internal = [];
      const external = [];

      data.events
        .filter(
          (event) =>
            event.approvalStatus === "Approved" ||
            event.approvalStatus === "Freezed"
        )
        .forEach((event) => {
          const isInternal = deptIds.includes(event.department._id.toString());
          const isRegistered =
            event.internalParticipants?.some((p) => p === userData._id) ||
            event.externalParticipants?.some((p) => p === userData._id);

          const extendedEvent = { ...event, isInternal, isRegistered };

          if (isInternal) internal.push(extendedEvent);
          else external.push(extendedEvent);
        });

      setInternalEvents(internal);
      setExternalEvents(external);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const handleRegister = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/event/${id}/register`, {
        method: "POST",
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

  const handleDeregister = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/event/${id}/deregister`, {
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

  const matchesFilter = (event) => {
    const keyword = search.toLowerCase();
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    const timelineMatch =
      !timeline ||
      (timeline === "past" && end < now) ||
      (timeline === "present" && start <= now && end >= now) ||
      (timeline === "future" && start > now);

    return (
      (!search ||
        event.title.toLowerCase().includes(keyword) ||
        event.description.toLowerCase().includes(keyword) ||
        (event.tag || []).join(" ").toLowerCase().includes(keyword) ||
        event.venue.toLowerCase().includes(keyword)) &&
      (!mode || event.mode === mode) &&
      (!certificate ||
        (certificate === "true" ? event.certificate : !event.certificate)) &&
      (!registration ||
        (registration === "yes" && event.isRegistered) ||
        (registration === "no" && !event.isRegistered)) &&
      timelineMatch
    );
  };

  const renderCard = (event) => {
    const now = new Date();
    const regStart = new Date(event.regStartDate);
    const regEnd = new Date(event.regEndDate);
    const regClosed = now > regEnd;
    const regNotOpen = now < regStart;

    let regStatus = "";
    if (regNotOpen) regStatus = "Registration Not Open Yet";
    else if (regClosed) regStatus = "Registration Closed";

    return (
      <div className="orgCard" key={event._id}>
        <h3 className="Title">{event.title}</h3>
        <div className="orgCardDetails">
          <div className="pg-top4">
            <span>{event.department?.name}</span>
          </div>
          <div className="orgCardRow">
            <span className="btn whiteBtn">{event.category}</span>
            <span className="orgValue">{event.mode}</span>
          </div>
          <div className="orgCardRow">
            <span className="orgLabel">Start Time:</span>
            <span className="orgValue">
              {new Date(event.startDate).toLocaleDateString()} {event.startTime}
            </span>
          </div>
          <div className="orgCardRow">
            <span className="orgLabel">End Time:</span>
            <span className="orgValue">
              {new Date(event.endDate).toLocaleDateString()} {event.endTime}
            </span>
          </div>
          <div className="orgCardRow">
            <span className="orgLabel">Venue:</span>
            <span className="orgValue">{event.venue}</span>
          </div>

          <div className="orgCardColumn gap-8">
            <span className="orgLabel">Description:</span>
            <span className="orgValue left">{event.description}</span>
          </div>

          {regStatus && (
            <div className="orgCardRow">
              <span className="orgLabel">Status:</span>
              <span className="orgValue grayText">{regStatus}</span>
            </div>
          )}

          {!regStatus && (
            <div className="flex row gap-8 margintop-12 centerb">
              {event.isRegistered ? (
                <button
                  className="orgBtn delete"
                  onClick={() => handleDeregister(event._id)}
                >
                  Deregister
                </button>
              ) : (
                <button
                  className="orgBtn assign"
                  onClick={() => handleRegister(event._id)}
                >
                  Register
                </button>
              )}
            </div>
          )}
        </div>
        {event.isRegistered && new Date(event.endDate) < new Date() && (
          <div className="flex column gap-6 marg-6">
            <button
              className="btn whiteBtn"
              onClick={() => setShowfeedbackform(event?._id)}
            >
              Give Feedback
            </button>
            {event.certificate && <CertificateButton eventId={event._id} />}
          </div>
        )}
      </div>
    );
  };

  const filteredInternal = internalEvents.filter(matchesFilter);
  const filteredExternal = externalEvents.filter(matchesFilter);

  return showfeedbackform ? (
    <UserFeedbackForm eventId={showfeedbackform} onClose={setShowfeedbackform} />
  ) : (
    <div id="container" className="flex column">
      <Navbar role="User" />
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="section flex column gap-12">
        <p className="sectionHeading">ExploreEvents</p>
        <div className="flex row wrap gap-12 marg-12">
          <input
            className="fb1"
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">All Modes</option>
            <option>Online</option>
            <option>Offline</option>
            <option>Hybrid</option>
          </select>
          <select
            value={certificate}
            onChange={(e) => setCertificate(e.target.value)}
          >
            <option value="">Certificate</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <select
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
          >
            <option value="">Registered</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <select
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
          >
            <option value="">All</option>
            <option value="past">Past</option>
            <option value="present">Ongoing</option>
            <option value="future">Upcoming</option>
          </select>
        </div>

        <div className="subHeading">Internal Events</div>
        <div className="flex row wrap start">
          {filteredInternal.length === 0 ? (
            <p className="mutedText marg-12">No internal events.</p>
          ) : (
            filteredInternal.map(renderCard)
          )}
        </div>

        <div className="sectionHeading">External Events</div>
        <div className="flex row wrap start">
          {filteredExternal.length === 0 ? (
            <p className="mutedText marg-12">No external events.</p>
          ) : (
            filteredExternal.map(renderCard)
          )}
        </div>
      </div>
    </div>
  );
}
