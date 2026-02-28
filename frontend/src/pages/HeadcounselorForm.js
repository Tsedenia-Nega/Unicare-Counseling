import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
const HeadCounselorForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const navigate = useNavigate();
const Backend_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    // On mount, check if Head Counselor is already registered
    const checkHeadCounselorExists = async () => {
      try {
        const res = await API.get(`${Backend_URL}/head-counselor/check`); 
          
        
        setExists(res.data.exists);
      } catch (err) {
        console.error("Failed to check head counselor existence", err);
        setError("Failed to check registration status. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    checkHeadCounselorExists();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const secretKey = localStorage.getItem("secretKey");
    if (!secretKey) {
      setError("Session expired. Please enter the secret key again.");
      navigate("/secret-key");
      return;
    }

 

    try {
      const res = await API.post(
        `${Backend_URL}/head-counselor/register`,
        {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          secretKey: secretKey,
        }
      );

      // Save info needed for email verification step
      localStorage.setItem("pendingEmail", formData.email);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("userRole", res.data.role);
      localStorage.setItem("token", res.data.token);

      // Navigate to email verification page
      navigate("/verify-email");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to register Head Counselor"
      );
      setSuccess("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (exists) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-center text-red-600 font-semibold text-lg max-w-md">
          Head Counselor is already registered. Registration is now closed.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#3B7962] mb-6">
          Register as Head Counselor
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          encType="multipart/form-data"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B7962]"
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B7962]"
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B7962]"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B7962]"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#3B7962] text-white py-3 font-semibold rounded-lg hover:bg-[#2e5b44] transition duration-200"
          >
            Register
          </button>

          {error && (
            <p className="text-red-600 text-center text-sm sm:text-base">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 text-center text-sm sm:text-base">
              {success}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default HeadCounselorForm;
