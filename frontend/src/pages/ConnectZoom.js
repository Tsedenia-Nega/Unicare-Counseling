import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
const ZoomConnectButton = () => {
  const navigate = useNavigate();
const backendURL = process.env.REACT_APP_API_URL;
  const handleConnect = async () => {
    try {
      // Method 1: Using localStorage token (if not HTTP-only)
      const token = localStorage.getItem("token");

      const response = await API.get(`${backendURL}/zoom/connect`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in header
        },
          withCredentials: true, // Still send cookies if using them
        }
      );

      // If backend returns a redirect URL (alternative approach)
      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token"); // Clear stale token
        navigate("/login"); // Redirect to login
      }
      console.error(
        "Connection failed:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <button onClick={handleConnect} className="zoom-connect-btn">
      Connect Zoom
    </button>
  );
};
export default ZoomConnectButton;
