import React, { useState, useEffect } from "react";
import axios from "axios";
import API from "../services/api";
export default function UrgentRequestForm() {
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
const backendURL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    if (success) {
      // If success message is the special one, redirect after 3 seconds
      if (
        success ===
        "You successfully sent the message. A counselor will call you shortly."
      ) {
        const timer = setTimeout(() => {
          window.location.href = "/";
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        // Clear any other success message after 5 seconds
        const timer = setTimeout(() => setSuccess(""), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [success]);

  const validateMobile = (number) => {
    const trimmed = number.trim();
    const regex = /^\d{10,15}$/;
    return regex.test(trimmed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!message.trim()) {
      setError("You must tell your reason for fast response.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!mobile.trim()) {
      setError("Mobile number is required.");
      return;
    }

    if (!validateMobile(mobile)) {
      setError(
        "Please enter a valid mobile number (10 digits, numbers only)."
      );
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await API.post(
        `${backendURL}/api/request`,
        {
          preferred_method: "call",
          mobile: mobile.trim(),
          message: message.trim(),
          category,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(
        "You successfully sent the message. A counselor will call you shortly."
      );
      setMobile("");
      setMessage("");
      setCategory("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; Back
      </button>

      <h2 className="text-2xl font-bold mb-4">Urgent Counseling Request</h2>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Mobile Number</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Enter your Correct phone number"
            disabled={loading}
            maxLength={15}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-2 rounded"
            disabled={loading}
            required
          >
            <option value="">Select category</option>
            <option value="suicidal_thoughts">Suicidal Thoughts</option>
            <option value="anxiety">Anxiety</option>
            <option value="depression">Depression</option>
            <option value="stress">Stress</option>
            <option value="academic_pressure">Academic Pressure</option>
            <option value="relationship_issues">Relationship Issues</option>
            <option value="self_esteem">Self-Esteem</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Your Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border p-2 rounded"
            rows="4"
            required
            placeholder="Explain your situation..."
            disabled={loading}
          ></textarea>
        </div>

        <button
          type="submit"
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          } text-white px-4 py-2 rounded`}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Send Urgent Request"}
        </button>
      </form>
    </div>
  );
}
