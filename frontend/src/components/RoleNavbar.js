// src/components/RoleNavbar.jsx
import { Link } from "react-router-dom";

const RoleNavbar = ({ user }) => {
  if (!user) return null;

  return (
    <nav className="p-4 bg-gray-200 shadow flex gap-4">
      {user.role === "student" && (
        <>
          <Link to="/student/dashboard">Dashboard</Link>
          <Link to="/student/appointments">My Appointments</Link>
        </>
      )}
      {user.role === "counselor" && (
        <>
          <Link to="/counselor/dashboard">Dashboard</Link>
          <Link to="/counselor/availability">Set Availability</Link>
        </>
      )}
      {user.role === "head-counselor" && (
        <>
          <Link to="/head/dashboard">Dashboard</Link>
          <Link to="/head/manage-counselors">Manage Counselors</Link>
        </>
      )}
      <Link to="/logout">Logout</Link>
    </nav>
  );
};

export default RoleNavbar;
