import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "../App.css";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const interests = ["Technology", "Science", "Art", "Music", "Sports"];
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "" });
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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

  const nationalities = ["India", "USA", "UK", "Australia", "Other"];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    phoneNumber: "",
    state: "",
    nationality: "",
    profession: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "nationality"
        ? value !== "India"
          ? { state: "Other" }
          : { state: "" }
        : {}),
    }));
    setToast({ message: "", type: "" });
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return false;
    }
    if (selectedInterests.length === 0) {
      setToast({
        message: "Please select at least one interest",
        type: "error",
      });
      return false;
    }

    const requiredFields = [
      "name",
      "email",
      "password",
      "confirmPassword",
      "gender",
      "phoneNumber",
      "nationality",
      "profession",
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setToast({ message: "All fields are required", type: "error" });
        return false;
      }
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setToast({ message: "", type: "" });

    try {
      const response = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, interests: selectedInterests }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setToast({ message: "Signup successful!", type: "success" });
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setToast({
        message: error.message || "An error occurred during signup",
        type: "error",
      });
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="container" className="flex column">
      <Navbar type="signup" />
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div id="signup" className="section flex row fb1 spaceAround">
        <div className="borderBox flex column centerb gap-8">
          <div className="sectionHeading">SIGN UP</div>

          {/* Name & Email */}
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
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g abc@info.com"
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Password</p>
              <div className="flex mobileRow align-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  className="flexItem"
                />
              </div>
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Confirm Password</p>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter Password"
              />
            </div>
          </div>

          {/* Gender & Phone */}
          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Gender</p>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Phone No</p>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g 1234567890"
              />
            </div>
          </div>

          {/* Nationality & State */}
          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Nationality</p>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
              >
                <option value="">Select Nationality</option>
                {nationalities.map((nat) => (
                  <option key={nat} value={nat}>
                    {nat}
                  </option>
                ))}
              </select>
            </div>

            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">State</p>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={formData.nationality !== "India"}
              >
                {formData.nationality === "India" ? (
                  <>
                    <option value="">Select State</option>
                    {indiaStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="Other">Other</option>
                )}
              </select>
            </div>
          </div>

          {/* Profession */}
          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Profession</p>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="e.g Software Engineer"
              />
            </div>
          </div>

          {/* Interests */}
          <div className="flexRowSplit">
            <div className="vInputBox flexItem flex column">
              <p className="inputLabel">Interests</p>
              <div className="flex row fxwrap gap-8 fWidth">
                {interests.map((interest, idx) => (
                  <p
                    key={idx}
                    className={`interestCard ${
                      selectedInterests.includes(interest) ? "selected" : ""
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <button
            className="btn transparentBtn"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </div>

        <div
          id="loginLeftSection"
          className="section flex column centerb gap-12 noMobile"
        >
          <p className="largeText">
            Attend Events, <br /> Organize Events, <br /> Improve Events
          </p>
        </div>
      </div>
    </div>
  );
}
