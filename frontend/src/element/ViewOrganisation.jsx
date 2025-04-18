import React, { useState, useEffect } from "react";
import OrgCard from "../components/OrgCard";
import Toast from "../components/Toast";

export default function ViewOrganisation() {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("http://localhost:5000/org/all", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch organizations");
        }

        setOrganizations(data.organizations);
        setFilteredOrganizations(data.organizations);
      } catch (error) {
        setToast({ message: error.message, type: "error" });
      }
    };

    fetchOrganizations();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = organizations.filter((org) =>
      org.name.toLowerCase().includes(term)
    );
    setFilteredOrganizations(filtered);
  };

  const handleAssignAdmin = async () => {
    if (!selectedOrg || !adminEmail) {
      setToast({
        message: "Please select an organization and provide an admin email",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      setToast({ message: "", type: "" });

      const response = await fetch("http://localhost:5000/org/assign-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: selectedOrg, email: adminEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to assign admin");
      }

      setToast({ message: "Admin assigned successfully!", type: "success" });
      setAdminEmail("");
      setSelectedOrg("");
      window.location.reload();
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="filterbar flex row spacebetween">
        <div className="flex row gap-8">
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            <option value="">Select Organisation</option>
            {organizations.map((org) => (
              <option key={org._id} value={org.name}>
                {org.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Enter Admin Email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <button
            className="btn whiteBtn"
            onClick={handleAssignAdmin}
            disabled={loading}
          >
            {loading ? "Assigning..." : "Assign Admin"}
          </button>
        </div>

        <div className="flex row gap-8">
          <input
            type="text"
            placeholder="Search Organisation"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex row fxwrap gap-8">
        {filteredOrganizations.map((org) => (
          <OrgCard key={org._id} org={org} refreshOrganizations={()=>{window.location.reload()}} />
        ))}
      </div>
    </div>
  );
}
