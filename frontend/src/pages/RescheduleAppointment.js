"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import { rescheduleAppointment } from "../services/AppointmentService";
import axios from "axios";
import API from "../services/api";
// Parse 'YYYY-MM-DD' as local date (midnight local time)
function parseDateStringAsLocalDate(dateString) {
  if (!dateString) return null;

  const parts = dateString.split("T")[0].split("-");
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-based month
  const day = parseInt(parts[2], 10);

  const localDate = new Date(year, month, day);

  return isValid(localDate) ? localDate : null;
}

export default function RescheduleAppointment() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState(location.state?.reason || "");
  const [submitting, setSubmitting] = useState(false);
const Backend_URL = process.env.REACT_APP_API_URL ;
  // Fetch availability
  const fetchAvailability = async (counselorId) => {
    try {
      const response = await API.get(
        `${Backend_URL}/availability/${counselorId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const availabilityData = response.data.availability || [];
      return availabilityData;
    } catch (error) {
      setAvailabilityError(
        "Could not load available time slots. Please try again later."
      );
      return [];
    }
  };

  useEffect(() => {
    const fetchAppointmentAndAvailability = async () => {
      setLoading(true);
      setFetchError(null);
      setAvailabilityError(null);

      try {
        const res = await API.get(
          `${Backend_URL}/appointment/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const appointmentData = res.data.data || res.data;
        setAppointment(appointmentData);

        if (appointmentData.counselor?._id) {
          const availabilityData = await fetchAvailability(
            appointmentData.counselor._id
          );
          setAvailability(availabilityData);
        } else {
          setAvailabilityError("Counselor information not available");
        }
      } catch (error) {
        setFetchError(
          error?.response?.data?.message ||
            error.message ||
            "Failed to load appointment data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointmentAndAvailability();
    }
  }, [appointmentId]);

  const getCounselorName = () => {
    if (!appointment?.counselor) return "your counselor";
    const user = appointment.counselor.user_id;
    if (user) {
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      }
      if (user.name) {
        return user.name;
      }
    }
    return "your counselor";
  };

  // Extract unique available dates
  const availableDates = [...new Set(availability.map((slot) => slot.date))];

  // Format newDate to 'YYYY-MM-DD'
  const formattedNewDate = newDate ? newDate.toISOString().split("T")[0] : "";

  // Find selected slot by date and time
  const selectedAvailabilitySlot = availability.find(
    (slot) => slot.date === formattedNewDate && slot.start_time === newTime
  );

  // Get available times for selected date
  const availableTimesForSelectedDate = availability
    .filter((slot) => slot.date === formattedNewDate)
    .map((slot) => slot.start_time);

  // Parse appointment date as local date to avoid timezone shift
  const parsedAppointmentDate = parseDateStringAsLocalDate(appointment?.date);

  const handleSubmit = async () => {
    if (!formattedNewDate || !newTime || !reason.trim()) {
      alert("Please select a new date, time, and provide a reason.");
      return;
    }

    if (!selectedAvailabilitySlot || !selectedAvailabilitySlot._id) {
      alert("Selected time slot is invalid. Please select a valid slot.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await rescheduleAppointment(appointmentId, {
        newAvailabilityId: selectedAvailabilitySlot._id,
        reason,
      });

      if (res?.data?.success) {
        alert("Appointment rescheduled successfully!");
        navigate("/my-appointments");
      } else {
        alert(`Failed to reschedule: ${res?.data?.message || "Unknown error"}`);
      }
    } catch (error) {
      alert(
        `Failed to reschedule: ${
          error?.response?.data?.message || error.message
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (fetchError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {fetchError}
          <br />
          <small>Appointment ID: {appointmentId}</small>
        </Alert>
        <Button onClick={() => navigate("/appointments")} sx={{ mt: 2 }}>
          Back to Appointments
        </Button>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Appointment data not found.</Alert>
        <Button onClick={() => navigate("/appointments")} sx={{ mt: 2 }}>
          Back to Appointments
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Reschedule Appointment
      </Typography>

      <Typography mb={2}>Appointment with: {getCounselorName()}</Typography>

      <Typography mb={2}>
        Current Appointment Date:{" "}
        {parsedAppointmentDate ? format(parsedAppointmentDate, "PPP") : "N/A"}{" "}
        at {appointment.start_time}
      </Typography>

      {availabilityError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {availabilityError}
        </Alert>
      )}

      {availability.length === 0 && !availabilityError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No available time slots found for this counselor.
        </Alert>
      )}

      {availability.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Found {availability.length} available slot(s) across{" "}
          {availableDates.length} date(s): {availableDates.join(", ")}
        </Alert>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="New Date"
          value={newDate}
          onChange={(value) => {
            setNewDate(value);
            setNewTime("");
          }}
          disablePast
          shouldDisableDate={(date) => {
            const dateStr = date.toISOString().split("T")[0];
            return !availableDates.includes(dateStr);
          }}
          slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        />
      </LocalizationProvider>

      <TextField
        select
        label=""
        fullWidth
        margin="normal"
        SelectProps={{ native: true }}
        value={newTime}
        onChange={(e) => setNewTime(e.target.value)}
        disabled={
          !formattedNewDate || availableTimesForSelectedDate.length === 0
        }
      >
        <option value="">Select a time</option>
        {availability
          .filter((slot) => slot.date === formattedNewDate)
          .map((slot) => (
            <option key={slot._id} value={slot.start_time}>
              {slot.start_time} - {slot.end_time}
            </option>
          ))}
      </TextField>

      <TextField
        label="Reason for Rescheduling"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
      />

      <Box mt={3} display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            submitting || availabilityError || availability.length === 0
          }
          sx={{
            backgroundColor: "#3B7962",
            "&:hover": { backgroundColor: "#2e5b44" },
            color: "#fff",
          }}
        >
          {submitting ? "Submitting..." : "Confirm Reschedule"}
        </Button>
      </Box>
    </Container>
  );
}
