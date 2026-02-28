import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API from "../services/api";
const CounselorForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    qualifications: "",
    specialization: "",
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, submitting, submitted
const backendURL = process.env.REACT_APP_API_URL;
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfilePictureFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (profilePictureFile) {
        data.append("profile_picture", profilePictureFile); // Use "profile_picture" key here
      }

      // Make POST request to backend
      await API.post(`${backendURL}/counselors/register`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Your application has been submitted for verification");
      setStatus("submitted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "submitted") {
    return (
      <div className="min-h-screen bg-gray-200 font-times">
        <div className="flex items-center justify-center ">
          <div className="bg-white p-8 rounded-[30px] border-2 w-[600px] shadow-lg text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              Application Submitted!
            </h2>
            <p className="text-lg mb-6">
              Your counselor application is under review. You'll receive an
              email once your account is verified.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 font-times">
      <div className="flex items-center justify-center ">
        <div className="bg-white p-8 rounded-[30px] border-2 w-[600px] h-[600px] shadow-lg mr-20 overflow-y-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-700">
              Counselor Registration
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">First Name*</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-medium">Password*</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
                minLength="8"
              />
            </div>

            <div>
              <label className="block font-medium">
                Qualifications* (comma separated)
              </label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                placeholder="PhD in Psychology, Certified CBT Therapist"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-medium">Specialization*</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g., Anxiety Disorders, Teen Counseling"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-medium">Profile Picture*</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md"
                accept=".jpg,.jpeg,.png"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload your profile picture (JPG, JPEG, or PNG, max 5MB)
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 rounded-full text-white font-bold mt-4 ${
                isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>

        <div className="ml-7 h-[600px] w-[600px] hidden md:block">
          <img
            src="/images/counseling.jpg"
            alt="Counselor Registration"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default CounselorForm;
