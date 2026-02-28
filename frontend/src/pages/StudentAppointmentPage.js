
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Box,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { format } from "date-fns";
import { getAppointments, cancelAppointmentById } from "../services/api";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(+hours);
  date.setMinutes(+minutes);
  return format(date, "hh:mm a");
};

export default function StudentAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const navigate = useNavigate();
const Backend_URL = process.env.REACT_APP_API_URL ;
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments();
      setAppointments(response.data.data);
      setFetchError(null);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setFetchError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);
  const canCancelOrReschedule = (appointment) => {
    if (!appointment?.date || !appointment?.start_time) {
      console.error("Missing date or time in appointment:", appointment);
      return false;
    }

    try {
      const appointmentDate = new Date(appointment.date);
      const [hours, minutes] = appointment.start_time.split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const now = new Date();
      const diffInHours = (appointmentDate - now) / (1000 * 60 * 60);

      return diffInHours >= 24;
    } catch (error) {
      console.error("Error in canCancelOrReschedule:", error);
      return false;
    }
  };
  
  const canReschedule = (appointment) => {
    if (!appointment?.date || !appointment?.start_time) {
      console.error("Missing date or time in appointment:", appointment);
      return false;
    }
  
    try {
      // Parse the ISO date string (e.g., "2025-06-14T12:00:00.000Z")
      const appointmentDate = new Date(appointment.date);
      
      // Extract hours and minutes from start_time (e.g., "02:00")
      const [hours, minutes] = appointment.start_time.split(":").map(Number);
      
      // Set the time on the appointment date
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      // Get current time
      const now = new Date();
      
      // Calculate difference in hours
      const diffInHours = (appointmentDate - now) / (1000 * 60 * 60);
  
      console.log("Reschedule Check:", {
        now: now.toString(),
        appointmentTime: appointmentDate.toString(),
        diffInHours,
        isAllowed: diffInHours >= 24,
      });
  
      return diffInHours >= 24;
    } catch (error) {
      console.error("Error in canReschedule:", error);
      return false;
    }
  };
  const canCancel = (appointment) => {
    if (!appointment?.date || !appointment?.start_time) return false;

    try {
      const appointmentDate = new Date(appointment.date);
      const [hours, minutes] = appointment.start_time.split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const now = new Date();
      return appointmentDate > now; // only future appointments
    } catch (error) {
      console.error("Error in canCancel:", error);
      return false;
    }
  };
  
  const handleCancel = async (appointmentId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmCancel) return;
    try {
      const response = await cancelAppointmentById(appointmentId);
      const data = response.data;
      if (data.success) {
        window.alert("Appointment cancelled successfully");
        fetchAppointments();
      } else {
        window.alert(`Cancel failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";
      window.alert(`Cancel failed: ${errorMessage}`);
    }
  };

  const openRescheduleDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDialogOpen(true);
  };

  const closeRescheduleDialog = () => {
    setRescheduleDialogOpen(false);
    setRescheduleReason("");
    setSelectedAppointment(null);
  };

  const handleRescheduleConfirmation = () => {
    if (!rescheduleReason.trim()) {
      window.alert("Please provide a reason for rescheduling");
      return;
    }
    navigate(`/appointments/reschedule/${selectedAppointment._id}`
, {
      state: {
        reason: rescheduleReason,
        currentAppointment: selectedAppointment,
      },
      }
    );
    closeRescheduleDialog();
  };

  const getAppointmentStatus = (appointment) => {
    if (!appointment.date || !appointment.start_time) return "unknown";

    try {
      const [year, month, day] = appointment.date.split("-");
      const [hours, minutes] = appointment.start_time.split(":");
      const appointmentDateTime = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
        0
      );
      const now = new Date();
      const diffInMs = appointmentDateTime.getTime() - now.getTime();

      if (diffInMs < 0) return "completed";
      if (diffInMs < 3600000) return "starting-soon"; // Less than 1 hour
      return "upcoming";
    } catch (error) {
      console.error("Error determining appointment status:", error);
      return "unknown";
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            color: "#3B7962",
            "&:hover": { backgroundColor: "rgba(59, 121, 98, 0.08)" },
          }}
        >
          Back
        </Button>
        <Typography variant="h5" fontWeight={600} color="#3B7962">
          Your Appointments
        </Typography>
        <Box width={64} />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : fetchError ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {fetchError}
        </Alert>
      ) : appointments.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          You have no upcoming appointments.
        </Typography>
      ) : (
        appointments.map((appointment) => {
          const status = getAppointmentStatus(appointment);
          // const canRescheduleAppt = canReschedule(appointment);
          // const canCancelAppt = canCancel(appointment);
          const canCancelAppt = canCancelOrReschedule(appointment);
          const canRescheduleAppt = canCancelOrReschedule(appointment);
          

          return (
            <Paper
              key={appointment._id}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                backgroundColor: "#f9fafb",
                borderLeft:
                  status === "starting-soon" ? "4px solid #3B7962" : "none",
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Appointment with:{" "}
                    {appointment?.counselor?.user_id
                      ? `${appointment.counselor.user_id.first_name} ${appointment.counselor.user_id.last_name}`
                      : "Counselor"}
                  </Typography>

                  {appointment.counselor?.specialization && (
                    <Chip
                      label={appointment.counselor.specialization}
                      variant="outlined"
                      sx={{ mt: 1, color: "#3B7962", borderColor: "#3B7962" }}
                    />
                  )}
                </Box>

                {status === "completed" && (
                  <Chip
                    label="Completed"
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                )}
                {status === "starting-soon" && (
                  <Chip
                    label="Starting Soon"
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                mt={2}
                mb={1}
              >
                <EventAvailableIcon fontSize="small" color="primary" />
                <Typography>
                  {format(new Date(appointment.date), "PPP")}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                <AccessTimeIcon fontSize="small" color="primary" />
                <Typography>
                  {formatTime(appointment.start_time)} –{" "}
                  {formatTime(appointment.end_time)}
                </Typography>
              </Stack>

              <Typography fontSize="0.95rem" color="text.secondary" mb={1}>
                Appointment Type: {appointment.type}
              </Typography>

              {appointment.type === "virtual" &&
                appointment.virtual_meeting_link &&
                (() => {
                  const appointmentDate = new Date(appointment.date);
                  const [hours, minutes] = appointment.start_time
                    .split(":")
                    .map(Number);
                  appointmentDate.setHours(hours, minutes, 0, 0);
                  const now = new Date();
                  const diffInMinutes = (appointmentDate - now) / (1000 * 60);

                  if (status === "completed") {
                    return (
                      <Typography variant="body2" mt={1} color="text.secondary">
                        Virtual meeting link expired
                      </Typography>
                    );
                  }

                  const isLinkVisible =
                    diffInMinutes <= 1440 && diffInMinutes >= -60; // from 12 hr before to 1 hr after

                  return (
                    <Typography variant="body2" mt={1}>
                      <a
                        href={
                          isLinkVisible
                            ? appointment.virtual_meeting_link
                            : undefined
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#3B7962",
                          fontWeight: 600,
                          pointerEvents: isLinkVisible ? "auto" : "none",
                          textDecoration: isLinkVisible ? "underline" : "none",
                          opacity: isLinkVisible ? 1 : 0.6,
                          cursor: isLinkVisible ? "pointer" : "not-allowed",
                        }}
                      >
                        Click to Join Virtual Meeting
                      </a>
                      {!isLinkVisible && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          ml={1}
                        >
                          (Link will be available 12 hours before the
                          appointment)
                        </Typography>
                      )}
                    </Typography>
                  );


                  // return (
                  //   <Typography variant="body2" mt={1}>
                  //     <a
                  //       href={
                  //         status === "starting-soon"
                  //           ? appointment.virtual_meeting_link
                  //           : undefined
                  //       }
                  //       target="_blank"
                  //       rel="noopener noreferrer"
                  //       style={{
                  //         color: "#3B7962",
                  //         fontWeight: 600,
                  //         pointerEvents:
                  //           status === "starting-soon" ? "auto" : "none",
                  //         textDecoration:
                  //           status === "starting-soon" ? "underline" : "none",
                  //         opacity: status === "starting-soon" ? 1 : 0.6,
                  //         cursor:
                  //           status === "starting-soon"
                  //             ? "pointer"
                  //             : "not-allowed",
                  //       }}
                  //     >
                  //       Click to Join Virtual Meeting
                  //     </a>
                  //     {status !== "starting-soon" && (
                  //       <Typography
                  //         variant="caption"
                  //         color="text.secondary"
                  //         ml={1}
                  //       >
                  //         (Available 1 hour before the appointment)
                  //       </Typography>
                  //     )}
                  //   </Typography>
                  // );
                })()}
              {appointment.zoom_password && (
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  <strong>Meeting Password:</strong> {appointment.zoom_password}
                </Typography>
              )}
              {appointment.notes && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notes:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.notes}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" gap={2} flexWrap="wrap">
                {canRescheduleAppt && (
                  <Button onClick={() => openRescheduleDialog(appointment)}>
                    Reschedule
                  </Button>
                )}

                {canCancelAppt && (
                  <Button onClick={() => handleCancel(appointment._id)}>
                    Cancel Appointment
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })
      )}

      {/* Reschedule Reason Dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onClose={closeRescheduleDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            Please provide a reason for rescheduling your appointment with{" "}
            {selectedAppointment?.counselor?.user_id
              ? `${selectedAppointment.counselor.user_id.first_name} ${selectedAppointment.counselor.user_id.last_name}`
              : "your counselor"}
            .
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reschedule-reason"
            label="Reason for rescheduling"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={rescheduleReason}
            onChange={(e) => setRescheduleReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRescheduleDialog} sx={{ color: "#3B7962" }}>
            Cancel
          </Button>
          <Button
            onClick={handleRescheduleConfirmation}
            variant="contained"
            sx={{
              backgroundColor: "#3B7962",
              "&:hover": { backgroundColor: "#2e5b44" },
              color: "#fff",
            }}
          >
            Continue to Reschedule
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
