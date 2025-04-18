import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setToastMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage("");

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      navigate("/user/event");
    } catch (error) {
      setToastMessage(error.message || "An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="container" className="flex column">
      <Toast
            message={toastMessage}
            type="error"
            duration={3000}
            onClose={() => setToastMessage("")}
          />
      <Navbar type="login" />
      <div id="login" className="section flex row fb1 spaceAround">
        <div
          id="loginLeftSection"
          className="section flex column centerb gap-12 noMobile"
        >
          <p className="largeText">
            Attend Events, <br /> Organize Events, <br /> Improve Events
          </p>
        </div>
        <div className="borderBox flex column centerb gap-24">
          <div className="sectionHeading">LOGIN</div>

          {/* Toast for errors */}
          

          <div className="vInputBox flex column gap-12">
            <p className="inputLabel">Email</p>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
            />
          </div>
          <div className="vInputBox flex column gap-12">
            <p className="inputLabel">Password</p>
            <div className="flex mobileRow">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
              />
              <button
                type="button"
                className="btn whiteBtn fitContent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            className="btn transparentBtn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
