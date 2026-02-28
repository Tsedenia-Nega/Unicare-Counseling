import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = reset password
  const [message, setMessage] = useState("");
 const  navigate= useNavigate();
 const Backend_URL = process.env.REACT_APP_API_URL ;
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(
        `${Backend_URL}/auth/send-reset-otp`,
        { email }
      );
      setMessage(res.data.message);
      if (res.data.success) {
        setStep(2); // Move to next step
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(
        `${Backend_URL}/auth/reset-password`,
        {
          email,
          otp,
          newPassword,
        }
      );
     if (res.data.success) {
       setMessage(
         "You have successfully reset your password. Redirecting to login..."
       );

       // Redirect after a short delay (e.g. 3 seconds)
       setTimeout(() => {
         navigate("/login");
       }, 3000);
       
     }
    
    } catch (err) {
      setMessage(err.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">
        Reset Your Password
      </h2>

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Send OTP
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Reset Password
          </button>
        </form>
      )}

      {message && (
        <p className="text-center mt-4 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default ResetPassword;
