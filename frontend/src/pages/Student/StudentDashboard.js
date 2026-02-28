import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import {
  FaUser,
  FaEnvelopeOpenText,
  FaComments,
  FaBars,
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
} from "react-icons/fa";
import StudentAppointmentsPage from "../StudentAppointmentPage";
import Chat from "../Chat";
import Mood from "../Mood";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
const StudentDashboard = () => {
  const { user, syncUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    department: "",
    year_of_study: "",
    bio: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activePage, setActivePage] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
const backendURL = process.env.REACT_APP_SOCKET_URL;
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      department: user.department || "",
      year_of_study: user.year_of_study || "",
      bio: user.bio || "",
    });

    if (user.profile_picture) {
      setPreviewImage(
        `${backendURL}/uploads/profile_pictures/${user.profile_picture}`
      );
    }
    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B7962] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePictureUpload = async (file) => {
    const form = new FormData();
    form.append("profile_picture", file);
    try {
      const token = localStorage.getItem("token");
      const response = await API.put(
        `${backendURL}/api/auth/updateProfile`,
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
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      handleProfilePictureUpload(file);
    }
  };

  const handleSubmit = async () => {
    const form = new FormData();
    for (let key in formData) {
      form.append(key, formData[key]);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await API.put(
        `${backendURL}/api/auth/updateProfile`,
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
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const navLinks = [
    { label: "My profile", icon: <FaUser />, page: "profile" },
    { label: "Mood Tracking", icon: <FaEnvelopeOpenText />, page: "mood" },
    { label: "Discussions", icon: <FaComments />, page: "discussions" },
    { label: "My appointments", icon: <FaCalendarAlt />, page: "appointments" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#274C3A] text-white p-6 shadow-lg">
        <div className="mb-10">
          <button className="text-xl">
            <FaBars />
          </button>
        </div>
        <ul className="space-y-4 text-lg">
          {navLinks.map((link, idx) => (
            <li
              key={idx}
              className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg transition-all ${
                activePage === link.page
                  ? "bg-[#3B7962] text-white shadow-md"
                  : "hover:bg-[#3B7962] hover:text-white hover:shadow-md"
              }`}
              onClick={() => setActivePage(link.page)}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activePage === "profile" && (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-[#3B7962] text-white px-4 py-2 rounded-lg hover:bg-[#2e5f4e] transition-colors"
                >
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        first_name: user?.first_name || "",
                        last_name: user?.last_name || "",
                        phone_number: user?.phone_number || "",
                        department: user?.department || "",
                        year_of_study: user?.year_of_study || "",
                        bio: user?.bio || "",
                      });
                      setProfilePicture(null);
                      setPreviewImage(
                        user?.profile_picture
                          ? `${backendURL}/uploads/profile_pictures/${user.profile_picture}`
                          : null
                      );
                    }}
                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-[#3B7962] text-white px-4 py-2 rounded-lg hover:bg-[#2e5f4e] transition-colors"
                  >
                    <FaSave /> Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture Section */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative group">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={user.first_name}
                      className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-5xl shadow-lg">
                      {user.first_name?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <label className="absolute bottom-0 right-0 bg-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <FaCamera className="text-[#3B7962] text-xl" />
                  </label>
                </div>

                <div className="mt-6 w-full">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Bio
                  </h3>
                  {isEditing ? (
                    <textarea
                      type="text"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3B7962] focus:border-transparent"
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {formData.bio || "No bio added yet"}
                    </p>
                  )}
                </div>
              </div>

              {/* Profile Details Section */}
              <div className="w-full md:w-2/3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3B7962] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {formData.first_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3B7962] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {formData.last_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3B7962] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {formData.phone_number || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3B7962] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {formData.department || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year of Study
                    </label>
                    {isEditing ? (
                      <select
                        name="year_of_study"
                        value={formData.year_of_study}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3B7962] focus:border-transparent"
                      >
                        <option value="">Select year</option>
                        <option value="1">First Year</option>
                        <option value="2">Second Year</option>
                        <option value="3">Third Year</option>
                        <option value="4">Fourth Year</option>
                        <option value="5+">Fifth Year or Above</option>
                      </select>
                    ) : (
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {formData.year_of_study
                          ? `Year ${formData.year_of_study}`
                          : "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activePage === "discussions" && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <Chat />
          </div>
        )}
        {activePage === "mood" && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <Mood />
          </div>
        )}
        {activePage === "appointments" && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <StudentAppointmentsPage />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
