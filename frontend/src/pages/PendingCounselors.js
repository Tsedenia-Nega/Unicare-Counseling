import React, { useEffect, useState } from "react";
import API from "../services/api";

const PendingCounselors = () => {
  const [pendingCounselors, setPendingCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
const backendURL = process.env.REACT_APP_API_URL ;
  const token = localStorage.getItem("token"); // or from cookies

  useEffect(() => {
    fetchPendingCounselors();
  }, []);

  // Function to fetch pending counselors using axios
  const fetchPendingCounselors = async () => {
    try {
      const res = await API.get(
        `${backendURL}/head-counselor/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setPendingCounselors(res.data.counselors);
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch counselors.");
    } finally {
      setLoading(false);
    }
  };

  // Handle approve/reject actions for counselors using axios
  const handleAction = async (counselorId, action) => {
    try {
      const res = await API.put(
        `${backendURL}/head-counselor/handle-counselor/${counselorId}`,
        { action },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message);

      if (res.data.success) {
        setPendingCounselors(
          (prev) => prev.filter((counselor) => counselor._id !== counselorId) // Corrected filter logic
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        Pending Counselor Applications
      </h2>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : pendingCounselors.length === 0 ? (
        <p>No pending applications.</p>
      ) : (
        pendingCounselors.map((counselor) => (
          <div
            key={counselor._id}
            className="border p-4 mb-4 rounded-lg shadow-md"
          >
            <p>
              <strong>Name:</strong> {counselor.user_id?.first_name}{" "}
              {counselor.user_id?.last_name}
            </p>
            <p>
              <strong>Email:</strong> {counselor.user_id?.email}
            </p>
            <p>
              <strong>Specializations:</strong>{" "}
              {counselor.specialization.join(", ")}
            </p>
            <p>
              <strong>Qualifications:</strong>{" "}
              {counselor.qualifications.join(", ")}
            </p>
            <p>
              <strong>Status:</strong> {counselor.approval_status}
            </p>

            <div className="mt-2 flex gap-4">
              <button
                onClick={() => handleAction(counselor._id, "approve")}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(counselor._id, "reject")}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PendingCounselors;
