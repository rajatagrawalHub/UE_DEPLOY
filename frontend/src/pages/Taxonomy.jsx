import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "../App.css";
import "../Taxonomy.css";

export default function Taxonomy() {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [data, setData] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [expanded, setExpanded] = useState({});

  const fetchTaxonomy = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/taxonomy`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData(json.taxonomy);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  const toggle = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const Chevron = ({ expanded }) => (
    <span
      className="inline-block transition-transform duration-200 mr-2"
      style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
    >
      ▶
    </span>
  );

  const TreeNode = ({ id, label, children, level = 0 }) => {
    const isExpanded = expanded[id];
    return (
      <div className={`ml-${level * 4} mt-2`}>
        <div
          className="cursor-pointer flex items-center text-sm font-medium"
          onClick={() => toggle(id)}
        >
          <Chevron expanded={isExpanded} />
          {label}
        </div>
        {isExpanded && (
          <div className="ml-4 border-l border-gray-300 pl-4">{children}</div>
        )}
      </div>
    );
  };

  return (
    <div id="container" className="flex column">
      <Navbar role="Super Admin" />
      <Toast
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="section flex column gap-12">
        <p className="sectionHeading">Full Event Taxonomy</p>
        <p className="mutedText">
          Visualize the hierarchy of Organizations, Types, Departments,
          Categories, and Events.
        </p>

        {data.map((org, oidx) => (
          <TreeNode
            key={org._id}
            id={org._id}
            label={
              <span className="text-lg font-bold">
                {org.orgName || org.name || "Unnamed Org"}
              </span>
            }
          >
            {org.types.map((type) => (
              <TreeNode
                key={type._id}
                id={type._id}
                label={
                  <span className="text-base font-semibold">
                    Type: {type.name}
                  </span>
                }
              >
                {type.departments.map((dept, didx) => (
                  <TreeNode
                    key={dept._id}
                    id={dept._id}
                    label={
                      <span className="text-sm font-semibold">
                        Department: {dept.name}
                      </span>
                    }
                  >
                    {dept.categories.map((cat, cidx) => (
                      <TreeNode
                        key={cat._id}
                        id={cat._id}
                        label={
                          <span className="text-sm">Category: {cat.name}</span>
                        }
                      >
                        {cat.events.length > 0 ? (
                          <ul className="flex column gap-4 text-sm mt-2 fit">
                            {cat.events.map((ev, eidx) => (
                              <li
                                key={eidx}
                                className="border p-2 rounded-md bg-gray-50"
                              >
                                <strong>{ev.title}</strong> ({ev.mode})
                                <br />
                                <span className="text-xs text-gray-500">
                                  {new Date(ev.startDate).toLocaleDateString()}{" "}
                                  – {new Date(ev.endDate).toLocaleDateString()}
                                </span>
                                <br />
                                <span>{ev.description}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-400">
                            No events in this category.
                          </p>
                        )}
                      </TreeNode>
                    ))}
                  </TreeNode>
                ))}
              </TreeNode>
            ))}
          </TreeNode>
        ))}
      </div>
    </div>
  );
}
