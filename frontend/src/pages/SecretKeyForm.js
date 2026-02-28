import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const SecretKeyForm = () => {
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post(
        `${process.env.REACT_APP_API_URL}/head-counselor/verify-key`,
        { secretKey }
      );

      if (response.data.success) {
        localStorage.setItem("secretKey", secretKey);
        navigate("/register-head-counselor");
      } else {
        setError(response.data.message || "Invalid secret key");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during validation"
      );
      localStorage.removeItem("secretKey");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-2xl transition-all duration-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#3B7962] mb-6">
          Enter Secret Key
        </h2>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            placeholder="Secret Key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B7962] text-base"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-[#3B7962] text-white font-semibold rounded-lg hover:bg-[#2e5b44] transition duration-200 text-base"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm sm:text-base">
          Only authorized personnel can access the Head Counselor registration.
        </p>
      </div>
    </div>
  );
};

export default SecretKeyForm;
