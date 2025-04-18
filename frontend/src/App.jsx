import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css"
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import UEvent from "./pages/UEvent";
import SAOrg from "./pages/SAOrg";
import SAType from "./pages/SAType";
import OADepartment from "./pages/OADepartment";
import DepartFormWrapper from "./pages/DepartmentFormWrapper";
import OACategory from "./pages/OACategory";
import DAEvent from "./pages/DAEvent";
import OAEventView from "./pages/OAdminEventView";
import OAEventForm from "./pages/OAEventForm";
import UMevent from "./pages/UMEvent";
import Taxonomy from "./pages/Taxonomy";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/user/" element={<UEvent />} />
        <Route path="/user/event" element={<UEvent />} />
        <Route path="/user/myevents" element={<UMevent />} />
        <Route path="/superadmin/" element={<SAOrg />} />
        <Route path="/superadmin/organization" element={<SAOrg />} />
        <Route path="/superadmin/type" element={<SAType />} />
        <Route path="/superadmin/taxonomy" element={<Taxonomy />} />
        <Route path="/organizationadmin/" element={<OADepartment />} />
        <Route path="/organizationadmin/department" element={<OADepartment />} />
        <Route path="/organizationadmin/category" element={<OACategory />} />
        <Route path="/organizationadmin/event" element={<OAEventView />} />
        <Route path="/organizationadmin/department/edit/:deptId" element={<DepartFormWrapper />} />
        <Route path="/organizationadmin/events/edit/:eventId" element={<OAEventForm />} />
        <Route path="/departmentaladmin/" element={<DAEvent />} />
        <Route path="/departmentadmin/event/edit/:eventId" element={<DAEvent />} />
      </Routes>
    </Router>
  );
}
