import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
const StudentRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [studentIdError, setStudentIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(""); // New state for strength feedback
  const [fileError, setFileError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [profilePreview, setProfilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    student_id: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    bio: "",
    profile_picture: null,
  });
const Backend_URL = process.env.REACT_APP_API_URL ;
  // Email validation
  const validateEmail = (email) => {
    const regex = /^[\w.-]+@aau\.edu\.et$/i;
    return regex.test(email);
  };

  // Student ID validation
  const validateStudentId = (id) => {
    const regex = /^[A-Z]{3}\/\d{4}\/\d{2}$/;
    return regex.test(id);
  };

  // Password strength validation
  const validatePassword = (password) => {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number and one special character
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Password strength feedback
  const getPasswordStrength = (password) => {
    if (!password) return "";

    let strength = 0;
    let feedback = "";

    // Length check
    if (password.length >= 8) strength += 1;

    // Character diversity checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[@$!%*?&]/.test(password)) strength += 1;

    // Determine feedback based on strength score
    if (strength <= 2) {
      feedback = "Weak";
    } else if (strength === 3) {
      feedback = "Medium";
    } else {
      feedback = "Strong";
    }

    return feedback;
  };

  const nextStep = () => {
    let valid = true;

    // Validate first name
    if (!formData.first_name.trim()) {
      setFirstNameError("First name is required.");
      valid = false;
    } else {
      setFirstNameError("");
    }

    // Validate last name
    if (!formData.last_name.trim()) {
      setLastNameError("Last name is required.");
      valid = false;
    } else {
      setLastNameError("");
    }

    // Validate student ID
    if (!formData.student_id) {
      setStudentIdError("Student ID is required.");
      valid = false;
    } else if (!validateStudentId(formData.student_id)) {
      setStudentIdError("Student ID must be in the format UGR/1234/12.");
      valid = false;
    } else {
      setStudentIdError("");
    }

    // Validate email
    if (!validateEmail(formData.email)) {
      setEmailError(
        "Please enter your university email (must end with @aau.edu.et)."
      );
      valid = false;
    } else {
      setEmailError("");
    }

    // Validate passwords
    if (!formData.password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (!validatePassword(formData.password)) {
      setPasswordError(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character."
      );
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (valid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFileError("");
      setProfilePreview(null);
      setFormData((prev) => ({ ...prev, profile_picture: null }));
      return;
    }
    if (!file.type.match("image.*")) {
      setFileError("Please select an image file (JPEG, PNG, etc.)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileError("File size should be less than 2MB");
      return;
    }
    setFileError("");

    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);

    setFormData((prev) => ({ ...prev, profile_picture: file }));
  };

  const handleRemoveImage = () => {
    setProfilePreview(null);
    setFileError("");
    setFormData((prev) => ({ ...prev, profile_picture: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear errors when user types
    if (name === "first_name" && value) setFirstNameError("");
    if (name === "last_name" && value) setLastNameError("");
    if (name === "student_id" && value) setStudentIdError("");
    if (name === "email" && value) setEmailError("");
    if (name === "password" || name === "confirmPassword") setPasswordError("");

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Password strength feedback
    if (name === "password") {
      const strength = getPasswordStrength(value);
      setPasswordStrength(strength);
    }

    if (name === "email") {
      if (!validateEmail(value)) {
        setEmailError(
          "Please enter your university email (must end with @aau.edu.et)."
        );
      } else {
        setEmailError("");
      }
    }
    if (name === "student_id") {
      if (!validateStudentId(value)) {
        setStudentIdError("Student ID must be in the format UGR/1234/12.");
      } else {
        setStudentIdError("");
      }
    }
    if (name === "password" || name === "confirmPassword") {
      if (
        (name === "password" &&
          formData.confirmPassword &&
          value !== formData.confirmPassword) ||
        (name === "confirmPassword" && value !== formData.password)
      ) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError) return;
    if (emailError) return;
    if (studentIdError) return;
    if (fileError) return;

    if (!formData.password || !formData.confirmPassword) {
      setPasswordError("Please enter and confirm your password.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setPasswordError(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          if (key === "profile_picture" && value instanceof File) {
            submitData.append(key, value);
          } else if (key !== "profile_picture") {
            submitData.append(key, value);
          }
        }
      });

      const response = await API.post(`${Backend_URL}/auth/register`, submitData);

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Registration failed");

      if (data.success && data.user) {
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("token", data.token);

        await API.post(`${Backend_URL}/auth/send-verify-otp`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ userId: data.user._id }),
        });

        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        throw new Error(data.message || "User data not received");
      }
    } catch (err) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get color for password strength indicator
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "Weak":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Strong":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-full max-w-lg m-auto p-8 bg-white rounded shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-[#3B7962] mb-6">
                Step 1: Basic Info
              </h2>

              {/* First Name Field */}
              <div>
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name *"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`input input-bordered w-full px-4 py-2 rounded border ${
                    firstNameError ? "border-red-500" : "border-gray-300"
                  } focus:ring-[#3B7962]`}
                />
                {firstNameError && (
                  <p className="text-red-600 text-sm mt-1">{firstNameError}</p>
                )}
              </div>

              {/* Last Name Field */}
              <div>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name *"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`input input-bordered w-full px-4 py-2 rounded border ${
                    lastNameError ? "border-red-500" : "border-gray-300"
                  } focus:ring-[#3B7962]`}
                />
                {lastNameError && (
                  <p className="text-red-600 text-sm mt-1">{lastNameError}</p>
                )}
              </div>

              {/* Student ID Field */}
              <div>
                <input
                  type="text"
                  name="student_id"
                  placeholder="Student ID (e.g., UGR/1234/12) *"
                  required
                  value={formData.student_id}
                  onChange={handleChange}
                  className={`input input-bordered w-full px-4 py-2 rounded border ${
                    studentIdError ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 ${
                    studentIdError
                      ? "focus:ring-red-500"
                      : "focus:ring-[#3B7962]"
                  }`}
                />
                {studentIdError && (
                  <p className="text-red-600 text-sm mt-1">{studentIdError}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="AAU Email Address *"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`input w-full px-4 py-2 rounded border ${
                    emailError ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 ${
                    emailError ? "focus:ring-red-500" : "focus:ring-[#3B7962]"
                  }`}
                />
                {emailError && (
                  <p className="text-red-600 text-sm mt-1">{emailError}</p>
                )}
              </div>

              {/* Password Fields with Strength Indicator */}
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password *"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input input-bordered w-full px-4 py-2 rounded border ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 ${
                    passwordError
                      ? "focus:ring-red-500"
                      : "focus:ring-[#3B7962]"
                  }`}
                />

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getStrengthColor()}`}
                          style={{
                            width:
                              passwordStrength === "Weak"
                                ? "33%"
                                : passwordStrength === "Medium"
                                ? "66%"
                                : passwordStrength === "Strong"
                                ? "100%"
                                : "0%",
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-700">
                        {passwordStrength}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Must contain 8+ characters with uppercase, lowercase,
                      number, and special character
                    </p>
                  </div>
                )}
              </div>

              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password *"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input input-bordered w-full px-4 py-2 rounded border ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 ${
                    passwordError
                      ? "focus:ring-red-500"
                      : "focus:ring-[#3B7962]"
                  }`}
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              {/* Navigation Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#3B7962] text-white px-6 py-2 rounded hover:bg-[#2f6049]"
                >
                  Next →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-[#3B7962] mb-6">
                Step 2: Optional Info
              </h2>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)"
                value={formData.phone}
                onChange={handleChange}
                className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:ring-[#3B7962]"
              />
              <textarea
                name="bio"
                placeholder="Bio (Optional)"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:ring-[#3B7962]"
              />
              <div>
                <label className="block mb-2 font-medium">
                  Profile Picture (Optional)
                </label>
                {profilePreview ? (
                  <div className="mb-2 relative w-32 h-32 rounded overflow-hidden border border-gray-300">
                    <img
                      src={profilePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-700"
                    >
                      &times;
                    </button>
                  </div>
                ) : null}
                <input
                  type="file"
                  name="profile_picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#3B7962] file:text-white hover:file:bg-[#2f6049]"
                />
                {fileError && (
                  <p className="text-red-600 text-sm mt-1">{fileError}</p>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#3B7962] text-white px-6 py-2 rounded hover:bg-[#2f6049]"
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentRegister;
