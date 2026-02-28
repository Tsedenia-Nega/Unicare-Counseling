import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaCertificate,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import  API from "../../services/api";
const CounselorProfile = () => {
  const { user, syncUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    specialization: "",
    qualifications: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});
const backendURL = process.env.REACT_APP_API_URL;
const socketURL = process.env.REACT_APP_SOCKET_URL;
  useEffect(() => {
    if (user) {
      const initialData = {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        specialization: user.specialization || "",
        qualifications: user.qualifications || "",
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setFormData(originalData);
    setProfilePicture(null);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    const form = new FormData();
    for (let key in formData) {
      form.append(key, formData[key]);
    }
    if (profilePicture) form.append("profile_picture", profilePicture);

    try {
      const token = localStorage.getItem("token");
      const response = await API.put(
        `${backendURL}/api/counselors/update-profile`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        syncUser();
        setOriginalData(formData);
        setIsEditing(false);
        alert("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center p-8 max-w-2xl mx-auto bg-white shadow rounded-xl mt-10">
      <div className="flex flex-col items-center mb-6">
        {user.profile_picture ? (
          <img
            src={`${socketURL}/uploads/profile_pictures/${user.profile_picture}`}
            alt="profile"
            className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="w-36 h-36 rounded-full bg-gray-400 flex items-center justify-center text-white text-3xl">
            {user.first_name?.charAt(0).toUpperCase()}
          </div>
        )}
        {isEditing && (
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-4"
            accept="image/*"
          />
        )}
      </div>

      <div className="w-full space-y-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Profile Information</h2>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 bg-[#3B7962] text-white px-4 py-2 rounded-lg hover:bg-[#2e5f4e]"
            >
              <FaEdit /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelClick}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-[#3B7962] text-white px-4 py-2 rounded-lg hover:bg-[#2e5f4e]"
              >
                <FaSave /> Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label className="font-medium flex items-center gap-2">
            <FaUser /> First Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
          ) : (
            <p className="px-3 py-2">{formData.first_name}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="font-medium flex items-center gap-2">
            <FaUser /> Last Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
          ) : (
            <p className="px-3 py-2">{formData.last_name}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="font-medium flex items-center gap-2">
            <FaEnvelope /> Email
          </label>
          <p className="px-3 py-2">{user.email}</p>
        </div>

        <div className="flex flex-col">
          <label className="font-medium flex items-center gap-2">
            <FaPhone /> Phone Number
          </label>
          {isEditing ? (
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
          ) : (
            <p className="px-3 py-2">
              {formData.phone_number || "Not provided"}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="font-medium flex items-center gap-2">
            <FaGraduationCap /> Specialization
          </label>
          {isEditing ? (
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
          ) : (
            <p className="px-3 py-2">
              {formData.specialization || "Not provided"}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="font-medium flex items-center gap-2">
            <FaCertificate /> Qualifications
          </label>
          {isEditing ? (
            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
              rows="3"
            />
          ) : (
            <p className="px-3 py-2 whitespace-pre-line">
              {formData.qualifications || "Not provided"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounselorProfile;
