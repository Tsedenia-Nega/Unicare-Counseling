import API from "../services/api";



export const getUserData = async () => {
  const backendURL = process.env.REACT_APP_API_URL ;
  try {
    const response = await API.get(`${backendURL}/auth/me`, {
      withCredentials: true, // send cookie
    });
    return response.data.user; // your backend sends user info here
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};
