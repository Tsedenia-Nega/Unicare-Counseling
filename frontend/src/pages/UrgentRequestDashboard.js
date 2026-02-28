import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../services/api";
const UrgentRequestsDashboard = ({ role: propRole }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState("");
const Backend_URL = process.env.REACT_APP_API_URL ;
  // Use role from prop if passed, else fallback to localStorage
  const role = propRole || JSON.parse(localStorage.getItem("user"))?.role || "";

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        if (role !== "counselor" && role !== "head_counselor") {
          setError(
            "Unauthorized: You do not have permission to view requests."
          );
          setRequests([]);
          return;
        }

        const endpoint =
          role === "head_counselor"
            ? `${Backend_URL}/request/head-counselor`
            : `${Backend_URL}/request/counselor`;

        const res = await API.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequests(res.data);
      } catch (err) {
        setError("Error fetching urgent requests.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [role, token]);

  const handleAccept = async (id) => {
    setError("");
    setAcceptingId(id);
    try {
      const res = await API.patch(`${Backend_URL}/request/accept/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, ...res.data.request } : req
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to accept request");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) return <div>Loading urgent requests...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Urgent Requests</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {requests.length === 0 ? (
        <p>No urgent requests available.</p>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => {
            const {
              student_id: student,
              assigned_counselor_id: assignedCounselor,
              _id,
              category,
              preferred_method,
              mobile,
              message,
              status,
            } = req;

            const acceptedBy = assignedCounselor?.user_id || null;

            return (
              <div
                key={_id}
                className="p-4 rounded-xl shadow bg-white border border-gray-200"
              >
                <p>
                  <strong>Student:</strong> {student.first_name}{" "}
                  {student.last_name} ({student.email})
                </p>
                <p>
                  <strong>Category:</strong> {category}
                </p>
                <p>
                  <strong>Preferred Method:</strong> {preferred_method}
                </p>
                {mobile && (
                  <p>
                    <strong>Mobile:</strong> {mobile}
                  </p>
                )}
                <p>
                  <strong>Message:</strong> {message}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      status === "pending"
                        ? "text-yellow-600"
                        : status === "accepted"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {status}
                  </span>
                </p>

                {role === "counselor" &&
                  status === "pending" &&
                  !assignedCounselor && (
                    <button
                      onClick={() => handleAccept(_id)}
                      disabled={acceptingId === _id}
                      className={`mt-3 px-4 py-2 rounded-lg shadow-md text-white font-semibold transition duration-300 ${
                        acceptingId === _id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {acceptingId === _id ? "Accepting..." : "Accept"}
                    </button>
                  )}

                {role === "head_counselor" &&
                  status === "accepted" &&
                  acceptedBy && (
                    <p>
                      <strong>Accepted By: </strong> Counselor{" "}
                      {acceptedBy.first_name} {acceptedBy.last_name} (
                      {acceptedBy.email})
                    </p>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UrgentRequestsDashboard;
