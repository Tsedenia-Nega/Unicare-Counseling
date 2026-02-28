import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "../services/api";
const AdminVerificationPanel = () => {
  const [pendingCounselors, setPendingCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
const Backend_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchPendingCounselors = async () => {
      try {
        const response = await API.get(`${Backend_URL}/counselors/pending`);
        console.log("Fetched counselors:", response.data); // Log the response
        setPendingCounselors(response.data.data);
     
      } catch (error) {
        toast.error("Failed to load pending counselors");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCounselors();
  }, []);

  const handleVerification = async (userId, approved) => {
    try {
      await axios.patch(`/api/counselors/${userId}/verify`, {
        approved,
        notes: notes[userId] || "",
      });
      toast.success(`Counselor ${approved ? "approved" : "rejected"}`);
      setPendingCounselors(pendingCounselors.filter((c) => c._id !== userId));
    } catch (error) {
      toast.error("Verification failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Pending Counselor Verifications
      </h1>

      {pendingCounselors.length === 0 ? (
        <p>No pending verifications</p>
      ) : (
        <div className="space-y-4">
          {pendingCounselors.map((counselor) => (
            <div key={counselor._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">
                    {counselor.first_name} {counselor.last_name}
                  </h3>
                  <p className="text-gray-600">{counselor.email}</p>
                  <p className="mt-2">
                    <span className="font-semibold">Qualifications:</span>{" "}
                    {counselor.profile.qualifications.join(", ")}
                  </p>
                  <p>
                    <span className="font-semibold">Specialization:</span>{" "}
                    {counselor.profile.specialization}
                  </p>
                  <a
                    href={counselor.profile.certification.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View Certification
                  </a>
                </div>
                <div className="flex flex-col space-y-2">
                  <textarea
                    placeholder="Verification notes (optional)"
                    className="border p-2 rounded text-sm"
                    value={notes[counselor._id] || ""}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [counselor._id]: e.target.value,
                      }))
                    }
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVerification(counselor._id, true)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerification(counselor._id, false)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVerificationPanel;
