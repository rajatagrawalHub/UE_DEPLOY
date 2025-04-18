import React, { useEffect, useState } from "react";
import Toast from "../components/Toast";
import Select from "react-select";

export default function DAEventForm({
  deptId,
  eventData = null,
  mode = "create",
  refresh = () => {},
  closeModal = () => {},
}) {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#ffffff",
      borderColor: state.isFocused ? "#ffffff" : "#2c2c2c",
      color: "#2c2c2c",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#888",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#444"
        : state.isFocused
        ? "#555"
        : "#ffffff",
      color: "#2c2c2c",
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#e0e0e0",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#2c2c2c",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#888",
      ":hover": {
        backgroundColor: "#ff5555",
        color: "#fff",
      },
    }),
    input: (base) => ({
      ...base,
      color: "#2c2c2c",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#2c2c2c",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#ffffff",
      color: "#2c2c2c",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#888",
    }),
  };

  const [suggestedTags, setSuggestedTags] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tag: [],
    startDate: "",
    endDate: "",
    regStartDate: "",
    regEndDate: "",
    startTime: "",
    endTime: "",
    numberOfDays: 1,
    maxParticipants: 0,
    mode: "Offline",
    venue: "",
    collaborationDepartments: [],
    budget: "",
    budgetAmount: 0,
    certificate: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [collaborationMode, setCollaborationMode] = useState("Not Applicable");
  const [suggestedCategory, setSuggestedCategory] = useState("");

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };

  useEffect(() => {
    const { date, time } = getCurrentDateTime();
    if (mode === "create") {
      setFormData((prev) => ({
        ...prev,
        startDate: date,
        endDate: date,
        regStartDate: date,
        regEndDate: date,
        startTime: time,
        endTime: time,
      }));
    }
  }, [mode]);

  useEffect(() => {
    if (deptId) {
      fetchDepartmentCategories();
      fetchCollaborationDepartments();
    }
    if (eventData && mode === "edit") {
      setFormData({ ...eventData });
    }
  }, [deptId, eventData, mode]);

  useEffect(() => {
    if (formData.endDate && formData.startDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      setFormData((prev) => ({ ...prev, numberOfDays: Math.max(days, 1) }));
    }
  }, [formData.startDate, formData.endDate]);
  useEffect(() => {
    if (formData.description && formData.description.trim().length >= 10) {
      const debounceTimer = setTimeout(() => {
        fetchGeminiSuggestions(formData.description);
      }, 3000);
  
      return () => clearTimeout(debounceTimer);
    }
  }, [formData.description]);
  

  const fetchDepartmentCategories = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/category?deptId=${deptId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok)
        setCategoryOptions(
          data.categories.filter((cat) => cat.status !== "pending")
        );
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const fetchCollaborationDepartments = async () => {
    if (collaborationMode === "Not Applicable") {
      setDepartmentOptions([]);
      setFormData((prev) => ({ ...prev, collaborationDepartments: [] }));
      return;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/department/collaboration/${deptId}?mode=${collaborationMode.toLowerCase()}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) setDepartmentOptions(data.departments);
    } catch (err) {
      setMessage("Failed to fetch collaboration Departments " + err.message);
    }
  };

  const fetchGeminiSuggestions = async (text) => {
    if (!text || text.trim().length < 10) return;

    try {
      const res = await fetch(`${BACKEND_URL}/scategory/suggest-category`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: text,
          categoryList: categoryOptions.map((cat) => cat.name),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const {gemini, keyword,keywords} = data;

        setSuggestedTags(keywords || []);
        setSuggestedCategory(gemini || "");
        setFormData((prev) => ({
          ...prev,
          tag: keywords || [],
        }));
      } else {
        console.warn("Gemini Suggestion Failed", data.message);
      }
    } catch (err) {
      console.error("Error getting AI suggestions", err);
    }
  };

  useEffect(() => {
    fetchCollaborationDepartments();
  }, [collaborationMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const today = new Date().toISOString().split("T")[0];
    if (formData.startDate < today) {
      setMessage("Start Date cannot be before today");
      setError(true);
      return false;
    }
    if (formData.endDate < formData.startDate) {
      setMessage("End Date cannot be before Start Date");
      setError(true);
      return false;
    }
    if (
      collaborationMode !== "Not Applicable" &&
      formData.collaborationDepartments.length === 0
    ) {
      setMessage("Please select at least one collaboration department");
      setError(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(true);

    if (!validateForm()) return;

    setLoading(true);
    const method = mode === "edit" ? "PATCH" : "POST";
    const url =
      mode === "edit"
        ? `${BACKEND_URL}/event/${eventData._id}/edit`
        : `${BACKEND_URL}/event/create`;
    const payload = { ...formData, department: deptId, tag: suggestedTags };

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(data.message);
      setError(false);
      refresh();
      closeModal();
    } catch (err) {
      setMessage(err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const selectOptions = departmentOptions.map((dept) => ({
    value: dept._id,
    label: dept.name,
  }));

  return (
    <div id="signup" className="section flex row fb1 spaceAround">
      <Toast
        message={message}
        type={error ? "error" : "success"}
        duration={3000}
        onClose={() => setMessage("")}
      />
      <form
        className="borderBox flex column centerb gap-12"
        onSubmit={handleSubmit}
      >
        <div className="flex row spacebetween">
          <p className="sectionHeading">
            {mode === "edit" ? "Edit Event" : "Create Event"}
          </p>
          <p className="successMsg">
            Tags Generated: {suggestedTags.length > 0 ? suggestedTags.join(", ") : "None"}
          </p>
        </div>

        <div className="flexRowSplit">
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Title</p>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Category</p>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categoryOptions.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
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
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flexRowSplit">
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Start Date</p>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">End Date</p>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Start Time</p>
            <input
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </div>
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">End Time</p>
            <input
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flexRowSplit">
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">No of Days</p>
            <input
              name="numberOfDays"
              type="number"
              value={formData.numberOfDays}
              onChange={handleChange}
              min={1}
              required
            />
          </div>
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Max Participants</p>
            <input
              name="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={handleChange}
              min={1}
              required
            />
          </div>
        </div>

        <div className="flexRowSplit">
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Collaboration Mode</p>
            <select
              value={collaborationMode}
              onChange={(e) => setCollaborationMode(e.target.value)}
            >
              <option value="Not Applicable">Not Applicable</option>
              <option value="Internal">Internal</option>
              <option value="External">External</option>
            </select>
          </div>

          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Collaboration Departments</p>
            <Select
              isMulti
              styles={customStyles}
              isDisabled={collaborationMode === "Not Applicable"}
              options={selectOptions}
              value={selectOptions.filter((opt) =>
                formData.collaborationDepartments.includes(opt.value)
              )}
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  collaborationDepartments: selected.map((s) => s.value),
                }))
              }
              classNamePrefix="select"
            />
          </div>
        </div>

        <div className="flexRowSplit">
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Mode</p>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              required
            >
              <option value="Offline">Offline</option>
              <option value="Online">Online</option>
            </select>
          </div>
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Venue</p>
            <input
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </div>

          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Budget Type</p>
            <input
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
            />
          </div>
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Budget Amount</p>
            <input
              name="budgetAmount"
              type="number"
              value={formData.budgetAmount}
              onChange={handleChange}
              min={0}
              required
            />
          </div>
        </div>
        <div className="flexRowSplit flex row centerb vecenter">
          <div className="vInputBox flexItem flex column">
            <p className="inputLabel">Certificate</p>
            <select
              name="certificate"
              value={formData.certificate ? "true" : "false"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  certificate: e.target.value === "true",
                }))
              }
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="vInputBox flexItem flex column last hfit">
            <p
              className={
                suggestedCategory.toLowerCase() ==
                formData.category.toLowerCase()
                  ? "inputLabel fb1 successMsg"
                  : "fb1 errorMsg"
              }
            >
              Suggested Category:{" "}
              {suggestedCategory.charAt(0).toUpperCase() +
                suggestedCategory.slice(1)}
            </p>
          </div>
        </div>

        <div className="flex row">
          {mode === "edit" && (
            <button
              className="btn red fb1"
              type="button"
              onClick={() => (window.location.href = "/departmentaladmin")}
            >
              Cancel
            </button>
          )}
          <button className="btn green fb1" type="submit" disabled={loading}>
            {loading
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
              ? "Update Event"
              : "Submit Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
