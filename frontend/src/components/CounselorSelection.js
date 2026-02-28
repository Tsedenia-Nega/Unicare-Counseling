import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
export default function CounselorSelection({ onSelect }) {
  const [counselors, setCounselors] = useState([]);
  const backendURL = process.env.REACT_APP_API_URL ;
  const socketURL = process.env.REACT_APP_SOCKET_URL;
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCounselors = async () => {
      const res = await API.get(`${backendURL}/counselors/verified`);
      setCounselors(res.data.counselors);
    };
    fetchCounselors();
  }, []);
  const handleUrgentRequestClick = () => {
    navigate("/urgent-request");
  };
  return (
    <div>
      {/* Urgent Request Button */}
      <div className="mb-6 text-center">
        <button
          onClick={handleUrgentRequestClick}
          className="bg-red-600 text-white py-2 px-4 rounded mb-4 hover:bg-red-700"
        >
          Urgent Request
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {counselors.map((c) => (
          <div
            key={c._id}
            onClick={() => onSelect(c)}
            className="text-center cursor-pointer p-4 border rounded-xl hover:shadow-lg"
          >
            <img
              src={
                `${socketURL}/uploads/profile_pictures${c.user_id.profile_picture}` ||
                "/default.jpg"
              }
              alt="profile"
              className="w-20 h-20 rounded-full mx-auto object-cover"
            />
            <h3 className="mt-2 font-bold">
              {c.user_id.first_name} {c.user_id.last_name}
            </h3>
            <p className="text-sm text-gray-600">
              Specialized in :{c.specialization.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
