import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
const Backend_URL = process.env.REACT_APP_API_URL ;
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken"); // Get token from localStorage

      if (!token) {
        console.error("No token found, redirecting to login");
        navigate("/login");
        return;
      }

      try {
        const response = await API.get(
          `${Backend_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in headers
            },
          }
        );

        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Handle the case where the token is invalid or expired
        if (error.response?.status === 401) {
          console.error("Unauthorized, token might be invalid or expired");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      {user ? (
        <div>
          <p>
            Name: {user.first_name} {user.last_name}
          </p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>Bio: {user.bio}</p>
          {/* Render other user info here */}
        </div>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  );
};

export default ProfilePage;
