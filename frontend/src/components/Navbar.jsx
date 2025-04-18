import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";

export default function Navbar({ type = "dashboard", role = "User" }) {
  const navigate = useNavigate();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const slugify = (text = "") =>
    text
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^\w-]/g, "");
  const [selectedRole, setSelectedRole] = useState(slugify(role));
  const [roles, setRoles] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "" });

  // Inside Navbar component

  useEffect(() => {
    if (type !== "login" && type !== "signup") {
      fetchCurrentUser();
    } else {
      setSelectedRole(type);
    }
  }, [type]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/current`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setToast({
          message: data.message || "Failed to fetch current user",
          type: "error",
        });
        return;
      }

      const fetchedRoles = data?.roles || [];
      setRoles(fetchedRoles);

      const defaultSlug = slugify(role);
      if (!selectedRole) {
        setSelectedRole(defaultSlug);
      }
    } catch (error) {
      setToast({ message: "Error fetching current user", type: "error" });
    }
  };

  useEffect(() => {
    if (!selectedRole) return;

    const sadminOptions = JSON.parse(
      import.meta.env.VITE_SADMIN_OPTIONS || "[]"
    );
    const oadminOptions = JSON.parse(
      import.meta.env.VITE_OADMIN_OPTIONS || "[]"
    );
    const dadminOptions = JSON.parse(
      import.meta.env.VITE_DADMIN_OPTIONS || "[]"
    );
    const userOptions = JSON.parse(import.meta.env.VITE_USER_OPTIONS || "[]");

    let items = [];

    switch (selectedRole) {
      case "login":
        items = [{ label: "Signup", path: "/signup" }];
        break;
      case "signup":
        items = [{ label: "Login", path: "/login" }];
        break;
      case "superadmin":
        items = sadminOptions.map((opt) => ({
          label: opt,
          path: `/${selectedRole}/${slugify(opt)}`,
        }));
        break;
      case "organizationadmin":
        items = oadminOptions.map((opt) => ({
          label: opt,
          path: `/${selectedRole}/${slugify(opt)}`,
        }));
        break;
      case "departmentaladmin":
        items = dadminOptions.map((opt) => ({
          label: opt,
          path: `/${selectedRole}/${slugify(opt)}`,
        }));
        break;
      case "user":
        items = userOptions.map((opt) => ({
          label: opt,
          path: `/${selectedRole}/${slugify(opt)}`,
        }));
        break;
      default:
        items = [];
    }

    setMenuItems(items);
  }, [selectedRole]);

  return (
    <div id="navbar" className="flex mobileRow spacebetween">
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />
      <div className="logoTxt">UrEvent</div>

      <div id="navMenu" className="flex mobileRow vcenter gap-12">
        {menuItems.map((item) => (
          <p
            key={item.label}
            className="navMenuItem noMobile"
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </p>
        ))}

        {selectedRole !== "login" && selectedRole !== "signup" && (
          <>
            <p
              className="navMenuItem noMobile"
              onClick={() => navigate("/logout")}
            >
              Logout
            </p>

            {roles.length > 1 && (
              <select
                value={selectedRole}
                onChange={(e) => {
                  const newRole = slugify(e.target.value);
                  setSelectedRole(newRole);
                  navigate(`/${newRole}`);
                }}
                className="roleDropdown navMenuItem"
              >
                <option value="" disabled>
                  Switch Role
                </option>
                {roles.map((role) => (
                  <option key={role} value={slugify(role)}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <p className="navMenuItem Mobile" onClick={() => {}}>
          ☰
        </p>
      </div>
    </div>
  );
}
