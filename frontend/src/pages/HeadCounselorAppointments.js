import React, { useEffect, useState } from "react";
import { getAllAppointments } from "../services/api";

const HeadCounselorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await getAllAppointments();
        setAppointments(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-[#3B7962]">
        All Appointments
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border rounded shadow">
            <thead className="bg-[#3B7962] text-white">
              <tr>
                <th className="px-4 py-2">Student Name</th>
                <th className="px-4 py-2">Student Email</th>
                <th className="px-4 py-2">Counselor Name</th>
                <th className="px-4 py-2">Counselor Email</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Start</th>
                <th className="px-4 py-2">End</th>
                <th className="px-4 py-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {appt.student?.first_name || "N/A"}{" "}
                    {appt.student?.last_name || ""}
                  </td>
                  <td className="px-4 py-2">{appt.student?.email || "N/A"}</td>
                  <td className="px-4 py-2">
                    {appt.counselor?.user_id?.first_name || "N/A"}{" "}
                    {appt.counselor?.user_id?.last_name || ""}
                  </td>
                  <td className="px-4 py-2">
                    {appt.counselor?.user_id?.email || "N/A"}
                  </td>
                  <td>
                    {appt.date
                      ? new Date(appt.date).toLocaleDateString("en-CA") // en-CA gives yyyy-mm-dd format
                      : "N/A"}
                  </td>

                  <td className="px-4 py-2">{appt.start_time}</td>
                  <td className="px-4 py-2">{appt.end_time}</td>
                  <td className="px-4 py-2">{appt.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HeadCounselorAppointments;
