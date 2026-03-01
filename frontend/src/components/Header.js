import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
const socketURL = process.env.REACT_APP_SOCKET_URL;
  const getInitials = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setShowProfileDropdown(false);
      setIsMobileMenuOpen(false);
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#dad5cd] shadow-md font-times">
      {/* Main Container */}
      <div className="flex items-center justify-between px-6 py-4 md:px-12">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => handleNavigation("/")}
        >
          <img src="/Images/logo.png" alt="logo" className="h-10 md:h-12" />
          <span className="text-green-900 font-bold text-2xl md:text-3xl">
            Unicare
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10 text-black font-medium text-lg">
          <span
            className="cursor-pointer hover:text-green-800"
            onClick={() => handleNavigation("/")}
          >
            Home
          </span>
          <span
            className="cursor-pointer hover:text-green-800"
            onClick={() => handleNavigation("/service")}
          >
            Services
          </span>
          <span
            className="cursor-pointer hover:text-green-800"
            onClick={() => handleNavigation("/resource")}
          >
            Resources
          </span>
          <span
            className="cursor-pointer hover:text-green-800"
            onClick={() => handleNavigation("/contact")}
          >
            Contact Us
          </span>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center focus:outline-none"
              >
                {user.profile_picture ? (
                  <img
                    src={`${socketURL}/uploads/profile_pictures/${user.profile_picture}`}
                    className="w-10 h-10 rounded-full border-2 border-green-900 object-cover"
                    alt="user"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-900 text-white flex items-center justify-center font-bold">
                    {getInitials(user.first_name)}
                  </div>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavigation("/login")}
              className="bg-green-900 text-white px-8 py-2 rounded-full hover:bg-green-700"
            >
              Login
            </button>
          )}
        </nav>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-green-900 text-2xl focus:outline-none"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Dropdown (Only shows when clicked) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#dad5cd] border-t border-black/10 px-6 py-6 space-y-4 flex flex-col items-center animate-in slide-in-from-top duration-300">
          <span
            className="text-xl font-medium w-full text-center py-2"
            onClick={() => handleNavigation("/")}
          >
            Home
          </span>
          <span
            className="text-xl font-medium w-full text-center py-2"
            onClick={() => handleNavigation("/service")}
          >
            Services
          </span>
          <span
            className="text-xl font-medium w-full text-center py-2"
            onClick={() => handleNavigation("/resource")}
          >
            Resources
          </span>
          <span
            className="text-xl font-medium w-full text-center py-2"
            onClick={() => handleNavigation("/contact")}
          >
            Contact Us
          </span>

          <hr className="w-full border-black/10" />

          {user ? (
            <>
              <span
                className="text-xl font-bold text-green-900"
                onClick={() =>
                  handleNavigation(
                    user.role === "student"
                      ? "/student/dashboard"
                      : "/counselor/dashboard",
                  )
                }
              >
                Dashboard
              </span>
              <button
                onClick={handleLogout}
                className="text-xl font-bold text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNavigation("/login")}
              className="w-full bg-green-900 text-white py-3 rounded-full text-xl font-bold"
            >
              Login
            </button>
          )}
        </div>
      )}

      {/* Desktop Profile Dropdown Overlay */}
      {user && showProfileDropdown && (
        <div className="hidden md:block absolute right-12 top-20 bg-white border rounded shadow-lg min-w-[200px] z-50 py-2">
          <div className="px-4 py-1 text-xs text-gray-400">{user.email}</div>
          <button
            onClick={() =>
              handleNavigation(
                user.role === "student"
                  ? "/student/dashboard"
                  : "/counselor/dashboard",
              )
            }
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
