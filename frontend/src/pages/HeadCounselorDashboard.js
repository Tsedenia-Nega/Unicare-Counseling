import React, { useState } from "react";
import {
  UserCheck,
  Users,
  FileText,
  CalendarCheck,
  BarChart2,
  MessageCircle,
  Menu,
} from "lucide-react";

// Import all internal page components
import CounselorProfile from "./Counselor/CounselorProfile";
import VerifyCounselors from "../pages/VerifyCounselors";
import UserManagement from "./UserManagement";
import ManageResources from "./ManageResources";
import HeadCounselorAppointments from "./HeadCounselorAppointments";
import VerifiedStudentCSVUpload from "./VerifiedStudentCsv";
import Report from "./WeeklyReport";
import UrgentRequest from "./UrgentRequestDashboard"
// import Reports from "./Reports";
import ChatApp from "./Chat";

const navLinks = [
  { title: "My Profile", icon: UserCheck },
  { title: "Verify Counselors", icon: UserCheck },
  { title: "Urgent Requests", icon: UserCheck },
  { title: "Upload Verified Student", icon: UserCheck },
  { title: "User Management", icon: Users },
  { title: "Manage Resources", icon: FileText },
  { title: "Appointments", icon: CalendarCheck },
  { title: "Reports", icon: BarChart2 },
  { title: "Communication Forum", icon: MessageCircle },
];

const HeadCounselorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Verify Counselors");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderPageContent = () => {
    switch (activePage) {
      case "My Profile":
        return <CounselorProfile />;
      case "Urgent Requests":
        return <UrgentRequest />;
      case "Verify Counselors":
        return <VerifyCounselors />;

      case "User Management":
        return <UserManagement />;
      case "Manage Resources":
        return <ManageResources />;
      case "Appointments":
        return <HeadCounselorAppointments />;
      case "Reports":
        return <Report />;
      case "Communication Forum":
        return <ChatApp />;
      case "Upload Verified Student":
        return <VerifiedStudentCSVUpload />;
      default:
        return <VerifyCounselors />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-200 text-[#3B7962] w-64 p-5 space-y-6 fixed top-0 left-0 h-full transition-transform duration-300 z-50 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:h-screen lg:z-auto`}
        style={{ overflowY: "auto" }}
      >
        <h2 className="text-xl font-bold  mb-6">
          Head Counselor Portal
        </h2>

        <nav className="space-y-2">
          {navLinks.map((item) => (
            <button
              key={item.title}
              onClick={() => setActivePage(item.title)}
              className={`w-full text-left flex items-center gap-3 px-4 py-4 rounded-lg transition-colors text-green hover:text-white hover:bg-[#2e5b44] ${
                activePage === item.title ? "bg-[#2e5b44] text-white font-medium" : ""
              }`}
            >
              <item.icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm">{item.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-[#3B7962] text-white flex items-center justify-between px-4 py-3 shadow-md lg:hidden fixed top-0 left-0 right-0 z-40">
          <button
            onClick={toggleSidebar}
            className="text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md p-1"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto p-6">{renderPageContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default HeadCounselorDashboard;
