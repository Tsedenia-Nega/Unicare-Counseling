import React from "react";
import { BrowserRouter as Router, Route,Routes } from "react-router-dom";
import Login from "./pages/LoginPage.js"
import SignUp from "./pages/SignUp.js";
import CounselorForm from "./pages/CounselorForm.js";
import EmailVerify from "./pages/EmailVerify.js";
import ResetPassword from "./pages/ResetPassword.js";
import HeadCounselorForm from "./pages/HeadcounselorForm.js";
import SecretKeyForm from "./pages/SecretKeyForm.js";
import ManageAvailability from "./pages/ManageAvailablity.js";
import AppointmentSummary from "./components/AppointmentSummary.js";
import PendingCounselors from "./pages/PendingCounselors.js";
import ResourceManager from "./pages/ResourceManager.js";
import Chatbot from "./pages/ChatBot.js";
import ProfilePage from "./components/ProfilePage.js";
import Home from "./pages/Home.js";
import AvailabilityManager from "./pages/Counselor/AvailabilityManager.js";
import ProtectedRoute from "./ProtectedRoute.js";
import Header from "./components/Header.js";
import DashboardHome from "./pages/Counselor/DashboardHome.js";
import CounselorDashboardLayout from "./pages/Counselor/Dashboardlayout.js";
import ChatApp from "./pages/Chat.js";
import BookAppointmentPage from "./pages/BookAppointment.js";
import CounselorSelection from "./pages/CounselorSelection.js";
import StudentRegister from "./pages/StudentForm.js";
import Footer from "./components/Footer.js";
import HeadCounselorDashboard from "./pages/HeadCounselorDashboard.js";
import VerifyCounselors from "./pages/VerifyCounselors.js";
import StudentAppointmentsPage from "./pages/StudentAppointmentPage.js";
import CounselorAppointmentsPage from "./pages/Counselor/CounselorAppointmentPage.js";
import CounselingServices from "./pages/CounselingServices.js";
import ContactUs from "./components/ContactUs.js";
import StudentDashboard from "./pages/Student/StudentDashboard.js";
import CounselorProfile from "./pages/Counselor/CounselorProfile.js";
import Mood from "./pages/Mood.js"
import WeeklyReport from "./pages/WeeklyReport.js";
import ManageResources from "./pages/ManageResources.js";
import UrgentRequestForm from "./components/UrgentRequestForm.js";
import UrgentRequestsDashboard from "./pages/UrgentRequestDashboard.js";

import RescheduleAppointment from "./pages/RescheduleAppointment.js";
import SessionNoteForm from "./pages/SessionNoteForm.js";
import PreviousSession from "./pages/PreviousSession.js";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/StudentForm" element={<StudentRegister />} />
          <Route path="/CounselorForm" element={<CounselorForm />} />

          <Route
            path="/appointments/reschedule/:appointmentId"
            element={<RescheduleAppointment />}
          />

          <Route path="/summary" element={<AppointmentSummary />} />
          <Route path="/manage-availability" element={<ManageAvailability />} />
          <Route path="/verify-email" element={<EmailVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<SecretKeyForm />} />
          <Route path="/service" element={<CounselingServices />} />

          <Route
            path="/register-head-counselor"
            element={<HeadCounselorForm />}
          />
          <Route path="/resource" element={<ResourceManager />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route
            path="/select-counselor"
            element={
              <ProtectedRoute>
                <CounselorSelection />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route
            path="/profile"
            element={
              <p>
                <ProfilePage />
              </p>
            }
          />
          <Route
            path="/mood"
            element={
              <ProtectedRoute>
                <Mood />
              </ProtectedRoute>
            }
          />

          <Route
            path="/head-counselor/dashboard"
            element={
              <ProtectedRoute allowedRoles={["head_counselor"]}>
                <HeadCounselorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/head-counselor/pending"
            element={
              <ProtectedRoute allowedRoles={["head-counselor"]}>
                <PendingCounselors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/urgent-request"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <UrgentRequestForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <BookAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute
                allowedRoles={["student", "counselor", "head_counselor"]}
              >
                <ChatApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counselor/dashboard"
            element={
              <ProtectedRoute allowedRoles={["counselor"]}>
                <CounselorDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="availability" element={<AvailabilityManager />} />
            <Route
              path="counselor-appointment"
              element={<CounselorAppointmentsPage />}
            />
            <Route path="urgentRequest" element={<UrgentRequestsDashboard />} />
            <Route path="previous-session" element={<PreviousSession />} />
            <Route path="profile" element={<CounselorProfile />} />
            <Route path="resources" element={<ManageResources />} />
          </Route>
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;
