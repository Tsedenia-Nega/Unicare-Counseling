// CounselorDashboardLayout.jsx
import { Outlet, NavLink } from "react-router-dom";

const CounselorDashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-100 p-6 space-y-6 shadow-md border-r border-gray-200">
        <h2 className="text-2xl font-bold text-[#2e5b44] tracking-tight">
          Counselor Panel
        </h2>

        <nav className="space-y-2">
          <NavLink
            to="/counselor/dashboard/profile"
            end
            className={({ isActive }) =>
              `block rounded-lg px-4 py-4 text-l font-large transition-colors duration-200 ${
                isActive
                  ? "bg-[#3B7962] text-white shadow"
                  : "text-[#2e5b44] hover:bg-[#d1fae5]"
              }`
            }
          >
            My Profile
          </NavLink>
          <NavLink
            to="/counselor/dashboard/urgentRequest"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-4 text-m font-large transition-colors duration-200 ${
                isActive
                  ? "bg-[#3B7962] text-white shadow"
                  : "text-[#2e5b44] hover:bg-[#d1fae5]"
              }`
            }
          >
            Urgent Request
          </NavLink>
          <NavLink
            to="/counselor/dashboard/availability"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-4 text-m font-large transition-colors duration-200 ${
                isActive
                  ? "bg-[#3B7962] text-white shadow"
                  : "text-[#2e5b44] hover:bg-[#d1fae5]"
              }`
            }
          >
            Availability Manager
          </NavLink>
          <NavLink
            to="/counselor/dashboard/counselor-appointment"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-4 text-l font-large transition-colors duration-200 ${
                isActive
                  ? "bg-[#3B7962] text-white shadow"
                  : "text-[#2e5b44] hover:bg-[#d1fae5]"
              }`
            }
          >
            My Appointment
          </NavLink>
         
          <NavLink
            to="/counselor/dashboard/resources"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-4 text-m font-large transition-colors duration-200 ${
                isActive
                  ? "bg-[#3B7962] text-white shadow"
                  : "text-[#2e5b44] hover:bg-[#d1fae5]"
              }`
            }
          >
            Manage Resources
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-4 text-l font-large transition-colors duration-200 ${
                isActive
                  ? "bg-[#3B7962] text-white shadow"
                  : "text-[#2e5b44] hover:bg-[#d1fae5]"
              }`
            }
          >
            Communication Forum
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default CounselorDashboardLayout;
