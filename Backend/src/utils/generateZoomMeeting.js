import axios from "axios";
import Counselor from "../models/counselorModel.js";

// Function to refresh Zoom token if expired
const refreshZoomToken = async (counselorId, refreshToken) => {
  try {
    const response = await axios.post("https://zoom.us/oauth/token", null, {
      params: {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    });

    const { access_token, refresh_token, expires_in } = response.data;

    // Update counselor with new tokens
    await Counselor.findByIdAndUpdate(counselorId, {
      zoomAccessToken: access_token,
      zoomRefreshToken: refresh_token,
      zoomTokenExpiry: new Date(Date.now() + expires_in * 1000),
    });

    return access_token;
  } catch (error) {
    console.error("Error refreshing Zoom token:", error);
    throw new Error("Failed to refresh Zoom token");
  }
};

// Function to generate Zoom meeting link
export const generateZoomMeetingLink = async (startTime, counselorId) => {
  try {
    // Find counselor and check if token needs refresh
    const counselor = await Counselor.findById(counselorId);

    if (!counselor || !counselor.zoomConnected) {
      throw new Error("Counselor has not connected their Zoom account");
    }

    let accessToken = counselor.zoomAccessToken;

    // Check if token is expired and refresh if needed
    if (new Date() >= new Date(counselor.zoomTokenExpiry)) {
      accessToken = await refreshZoomToken(
        counselorId,
        counselor.zoomRefreshToken
      );
    }

    // Parse the start time
    const meetingDate = new Date(startTime);

    // Create Zoom meeting
    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: "Counseling Session",
        type: 2, // Scheduled meeting
        start_time: meetingDate.toISOString(),
        duration: 60, // 60 minutes by default
        timezone: "UTC",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          meeting_authentication: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      meeting_id: response.data.id,
      join_url: response.data.join_url,
      start_url: response.data.start_url,
      password: response.data.password,
    };
  } catch (error) {
    console.error("Error generating Zoom meeting:", error);
    throw new Error("Failed to generate Zoom meeting");
  }
};
