import React, { useState, useEffect } from "react";
import API from "../services/api";


export default function VerifyCounselors() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
const backendURL = process.env.REACT_APP_API_URL ;
  const baseUrl = `${backendURL}/head-counselor`;

  useEffect(() => {
    const fetchPendingCounselors = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const { data } = await API.get(`${baseUrl}/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCounselors(data.counselors);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCounselors();
  }, []);

  const handleApproval = async (pendingId, action) => {
    try {
      setActionLoading(pendingId);
      const token = localStorage.getItem("token");

      await API.put(
        `${baseUrl}/handle-counselor/${pendingId}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCounselors((prev) => prev.filter((c) => c._id !== pendingId));
      alert(`Counselor ${action}d successfully.`);
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div>Loading pending counselors...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  if (counselors.length === 0)
    return (
      <div className="text-center mt-10 text-gray-600">
        No pending counselors found.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6 text-[#3B7962] text-center md:text-left">
        Pending Counselor Approvals
      </h2>
      <div className="space-y-6">
        {counselors.map((counselor) => (
          <div
            key={counselor._id}
            className="bg-white rounded shadow p-6 flex flex-col md:flex-row md:justify-between md:items-center"
          >
            <div className="mb-6 md:mb-0 md:max-w-[70%]">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {counselor.first_name} {counselor.last_name}
              </h3>
              <p className="text-gray-600 mb-1">{counselor.email}</p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Qualifications:</span>{" "}
                {counselor.qualifications || "N/A"}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Specializations:</span>{" "}
                {counselor.specialization?.join(", ") || "N/A"}
              </p>
              {counselor.certificate_url && (
                <a
                  href={counselor.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B7962] underline"
                >
                  View Certificate
                </a>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 md:min-w-[200px] justify-center md:justify-end">
              <button
                disabled={actionLoading === counselor._id}
                onClick={() => handleApproval(counselor._id, "approve")}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded disabled:opacity-50 transition"
              >
                Approve
              </button>
              <button
                disabled={actionLoading === counselor._id}
                onClick={() => handleApproval(counselor._id, "reject")}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded disabled:opacity-50 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
