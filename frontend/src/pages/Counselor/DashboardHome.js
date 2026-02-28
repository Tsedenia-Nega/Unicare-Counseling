import React from "react";

const DashboardHome = () => {
  return (
    <div className="p-6 bg-white shadow rounded-md">
      <h1 className="text-3xl font-bold text-green-900 mb-4">
        Welcome to Your Dashboard
      </h1>
      <p className="text-gray-700 text-lg">
        As a counselor, you can manage your availability, view your upcoming
        appointments, and help students access the support they need. Use the
        sidebar to navigate through your dashboard tools.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-100 p-5 rounded shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold text-green-900 mb-2">
            Availability Manager
          </h2>
          <p className="text-gray-700">
            Set or update your available time slots so students can book
            sessions with you.
          </p>
        </div>

        <div className="bg-green-100 p-5 rounded shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold text-green-900 mb-2">
            Upcoming Appointments
          </h2>
          <p className="text-gray-700">
            View all your upcoming counseling sessions and plan accordingly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
