import API from "./api";
import axios from "axios";
  const backendURL = process.env.REACT_APP_API_URL ;
export const getCounselorAvailability = async (counselorId) => {

  try {
    if (!counselorId) throw new Error("No counselorId provided");
    const response = await API.get(`${backendURL}/availability/${counselorId}`);
    return response.data;
  } catch (error) {
    console.error("Error in getCounselorAvailability:", error);
    throw error;
  }
};
export const updateAppointmentById = (id, payload) =>{
  return API.put(`${backendURL}/appointment/${id}/reschedule`, payload);}

export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await API.get(`${backendURL}/appointment/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment by id:", error);
    throw error;
  }
};
// export const rescheduleAppointment = async (appointmentId, payload) => {
//   try {
//     const response = await API.put(
//       `/appointment/${appointmentId}/reschedule`,
//       payload
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error rescheduling appointment:", error);
//     throw error;
//   }
// };



export const rescheduleAppointment = async (appointmentId, data) => {
  try {
    console.log("Making reschedule request:", {
      url: `http://localhost:4000/api/appointment/${appointmentId}/reschedule`,
      data: data,
    });

    const response = await axios.put(
      `http://localhost:4000/api/appointment/${appointmentId}/reschedule`,
      data, // Don't include appointmentId in body since it's in the URL
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Reschedule response:", response.data);
    return response;
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};
// Add this to AppointmentService.js
export const getCounselors = async () => {
  try {
    const response = await API.get("counselors/verified");
    return response.data;
  } catch (error) {
    console.error("Error fetching counselors:", error);
    throw error;
  }
};
export const updateAppointment = async ({
  appointmentId,
  newDate,
  newStartTime,
  newEndTime,
}) => {
  const response = await axios.put(
    `/api/appointment/${appointmentId}/reschedule`,
    {
      newDate,
      newStartTime,
      newEndTime,
    }
  );
  return response.data;
};
export const bookAppointment = async (data) => {
  try {
    // Verify authentication first
    if (!localStorage.getItem("token")) {
      throw new Error("Authentication required");
    }

    // Convert times to 24-hour format (backend expects this)
    const convertTo24Hour = (timeStr) => {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");

      if (period === "PM" && hours !== "12") {
        hours = parseInt(hours, 10) + 12;
      } else if (period === "AM" && hours === "12") {
        hours = "00";
      }

      return `${hours}:${minutes}`;
    };

    const appointmentData = {
      ...data,
      start_time: convertTo24Hour(data.start_time),
      end_time: convertTo24Hour(data.end_time),
    };

    const response = await API.post("/appointment", appointmentData);
    return response.data;
  } catch (error) {
    console.error("Booking error:", error);

    // Enhance error messages
    if (error.response?.status === 401) {
      throw new Error("Your session has expired. Please login again.");
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to book appointment. Please try again."
    );
  }
};
