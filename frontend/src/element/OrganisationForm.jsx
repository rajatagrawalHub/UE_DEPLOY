import React, { useState } from "react";
import "../App.css";

export default function OrganisationForm({ type, orgData }) {
  const [formData, setFormData] = useState({
    name: orgData?.name || "",
    email: orgData?.email || "",
    type: orgData?.type || "",
    address: orgData?.address || "",
    city: orgData?.city || "",
    state: orgData?.state || "",
    poc: orgData?.poc || "",
    contact: orgData?.contact || "",
    memberDomain: orgData?.memberDomain || "",
  });

  const indiaStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Other",
  ];

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        type === "Create"
          ? "http://localhost:5000/org/create"
          : `http://localhost:5000/org/${orgData._id}/edit`;

      const method = type === "Create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process organization");
      }

      alert(
        type === "Create"
          ? "Organization created successfully!"
          : "Organization updated successfully!"
      );

      setFormData({
        name: "",
        email: "",
        address: "",
        city: "",
        state: "",
        poc: "",
        contact: "",
        memberDomain: "",
      });
    } catch (error) {
      setError(
        error.message || "An error occurred during organization processing"
      );
      console.error("Error processing organization:", error);
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  return (
    <div id="organisation" className="section flex row fb1 centerb">
      <div className="borderBox flex column centerb gap-12">
        <p className="sectionHeading">{type} Organisation</p>

        {error && <div className="error-message">{error}</div>}

        <form className="flex column gap-12" onSubmit={handleSubmit}>
          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Name</p>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g John Doe"
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Email</p>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g abc@info.com"
              />
            </div>
          </div>
          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Address</p>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g Luxemborg Street"
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">City</p>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g Alexandara"
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <div className="vInputBox flexItem flex column">
                <p className="inputLabel">State</p>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option value="">Select State</option>
                  {indiaStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">PoC Name</p>
              <input
                type="text"
                name="poc"
                value={formData.poc}
                onChange={handleChange}
                placeholder="e.g John Doe"
              />
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Contact No</p>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="e.g 9876543210"
              />
            </div>
          </div>
          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Domain for Members</p>
              <input
                type="text"
                name="memberDomain"
                value={formData.memberDomain}
                onChange={handleChange}
                placeholder="e.g @orgname.ac.in"
              />
            </div>
          </div>
          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <button
                type="submit"
                className="btn transparentBtn"
                disabled={loading}
              >
                {loading
                  ? "Submitting..."
                  : type === "Create"
                  ? "Submit"
                  : "Update"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
