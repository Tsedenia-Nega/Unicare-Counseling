import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";


const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ NEW
  const from = location.state?.from?.pathname || "/"; // ✅ NEW

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const backendUrl = process.env.REACT_APP_API_URL ;

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    if (!email && !password) {
      newErrors.general = "Please enter your email and password";
    } else if (!email) {
      newErrors.general = "Please enter your email address";
    } else if (!password) {
      newErrors.general = "Enter the password";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.general = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return !newErrors.general;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({ email: "", password: "", general: "" });

    try {
      const response = await API.post(
        `${backendUrl}/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);

        login(user);
        toast.success("Welcome back! Login successful");

        // ✅ Redirect back to intended page
        navigate(from, { replace: true });
      } else {
        setErrors({
          email: "Invalid email or password",
          password: "Invalid email or password",
          general:
            "The email or password you entered is incorrect. Please try again.",
        });
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again.";

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Invalid email or password";
            setErrors({
              email: "",
              password: "",
              general: errorMessage,
            });
            break;
          case 403:
            errorMessage = "Your account is pending approval";
            setErrors({
              general: errorMessage,
            });
            break;
          case 404:
            errorMessage = "No account found with this email";
            setErrors({
              email: "",
              general: errorMessage,
            });
            break;
          default:
            setErrors({
              general: errorMessage,
            });
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative font-times"
      style={{
        backgroundImage: "url('/images/login.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white/90 bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-3xl shadow-xl text-center w-[90%] max-w-[480px] transition-transform duration-300 hover:shadow-2xl">
          <h2 className="text-[35px] font-bold text-[#3B7962] mb-2">
            Welcome Back
          </h2>
          <p className="text-[#3B7962] text-[18px] mb-6">Sign in to continue</p>

          <form className="mt-2 space-y-4" onSubmit={handleLogin}>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    general: "",
                  }));
                }}
                placeholder="Email Address"
                className="w-full p-3 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#3B7962]/50 text-center text-[#3B7962] border transition-all duration-300 border-gray-200 hover:border-[#3B7962]"
              />
            </div>

            <div className="relative mt-4">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    general: "",
                  }));
                }}
                placeholder="Password"
                className="w-full p-3 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#3B7962]/50 text-center text-[#3B7962] border transition-all duration-300 border-gray-200 hover:border-[#3B7962]"
              />
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4 mt-4">
                <p>{errors.general}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B7962] text-white p-3 rounded-full font-semibold hover:bg-[#31634E] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p
              onClick={() => navigate("/reset-password")}
              className="text-[#3B7962] font-bold text-[18px] cursor-pointer hover:text-[#31634E] transition-colors duration-300"
            >
              Forgot Password?
            </p>
            <p className="text-[#3B7962] text-[18px]">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="font-bold text-[20px] hover:underline transition-all duration-300"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
