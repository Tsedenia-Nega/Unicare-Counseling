import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
const EmailVerify = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const inputsRef = useRef([]);
const backendURL = process.env.REACT_APP_API_URL ;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("userRole");

    if (storedUserId && storedRole) {
      setUserId(storedUserId);
      setUserRole(storedRole);
    }
  }, []);

  useEffect(() => {
    if (userRole && userId) {
      sendOtp();
    }
  }, [userRole, userId]);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendOtp = async () => {
    if (!userId || !userRole || resendCooldown > 0) return;

    try {
      setLoading(true);
      setMessage("");
      setOtp(["", "", "", "", "", ""]); // Clear input fields

      const response = await API.post(
  
    `${backendURL}/auth/send-verify-otp`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message || "OTP resent successfully!");
      setResendCooldown(30); // Start 30s cooldown
      inputsRef.current[0]?.focus(); // Optional: focus first input
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      alert("Please enter a 6-digit OTP.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");
      const userId = localStorage.getItem("userId");

      if (userRole === "head_counselor") {
       
        const response = await API.post(
          `${backendURL}/head-counselor/verify-email`,
          {
            otp: fullOtp,
            userId,
            
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          alert("Email verified and counselor profile created successfully!");
          // Clear verification-related items
          localStorage.removeItem("userId");
          // localStorage.removeItem("pendingEmail");
          // localStorage.removeItem("qualifications");
          // localStorage.removeItem("specialization");
          // localStorage.removeItem("certificateUrl");

          // Redirect to head counselor dashboard
          navigate("/head-counselor/dashboard");
        } else {
          alert(response.data.message || "Verification failed");
        }
      } else {
        // Regular user verification flow
        const response = await API.post(
          `${backendURL}/auth/verify-account`,
          { otp: fullOtp, userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Email verified successfully!");
        navigate("/");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expired. Please register again.");
        localStorage.clear();
        navigate("/register-head-counselor");
      } else {
        alert(error.response?.data?.message || "Verification failed");
      }
    }
  };

    

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, ""); // Only digits
    if (value) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5 && inputsRef.current[index + 1]) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      if (index > 0 && !otp[index]) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F0F4F8] px-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md border-t-[5px] border-[#213555]">
        <h1 className="text-3xl font-bold mb-2 text-center text-black">
          Email Verification
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Please enter the 6-digit OTP sent to your email.
        </p>

        {message && (
          <p className="text-green-600 font-medium mb-4 text-center">
            {message}
          </p>
        )}

        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-12 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3B7962] shadow-sm"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B7962]  text-white py-2 rounded-md hover:bg-[#2e5b44] transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={sendOtp}
          disabled={loading || resendCooldown > 0}
          className="w-full mt-4 text-[#213555] text-sm underline hover:text-[#1a2e47] text-center disabled:opacity-50"
        >
          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : "Resend OTP"}
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
