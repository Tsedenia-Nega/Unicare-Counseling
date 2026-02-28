import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  Avatar,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import NotesIcon from "@mui/icons-material/Notes";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CancelIcon from "@mui/icons-material/Cancel";
import HomeIcon from "@mui/icons-material/Home";
import { formatTime } from "../utils/formatTime";

const AppointmentSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const appointment = state?.appointment;

  if (!appointment) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error" sx={{ mb: 2 }}>
          No appointment data found
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          sx={{
            backgroundColor: "#3B7962",
            "&:hover": { backgroundColor: "#2e5b44" },
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
          }}
          onClick={() => navigate("/")}
        >
          Return Home
        </Button>
      </Container>
    );
  }

  // Format date and time for display
  const formattedDate = new Date(appointment.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = `${formatTime(appointment.start_time)} - ${formatTime(
    appointment.end_time
  )}`;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#e8f5e9",
              color: "#3B7962",
              mx: "auto",
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 50 }} />
          </Avatar>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, color: "#2c3e50", mb: 1 }}
          >
            Appointment Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Your session with {appointment.counselorName} has been scheduled
          </Typography>
          <Chip
            label={appointment.status || "Confirmed"}
            sx={{
              backgroundColor: "#e8f5e9",
              color: "#3B7962",
              fontWeight: 500,
              px: 1,
            }}
          />
        </Box>

        <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.08)" }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "#2c3e50",
                mb: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: "#3B7962",
                  borderRadius: "50%",
                  mr: 1.5,
                }}
              />
              Appointment Details
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PersonIcon
                  sx={{ mr: 2, color: "#3B7962", fontSize: "1.2rem" }}
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Counselor
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {appointment.counselorName}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarTodayIcon
                  sx={{ mr: 2, color: "#3B7962", fontSize: "1.2rem" }}
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formattedDate}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccessTimeIcon
                  sx={{ mr: 2, color: "#3B7962", fontSize: "1.2rem" }}
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Time
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formattedTime}
                  </Typography>
                  {appointment.type && (
                    <Chip
                      label={appointment.type}
                      size="small"
                      sx={{
                        mt: 0.5,
                        backgroundColor: "rgba(59, 121, 98, 0.1)",
                        color: "#3B7962",
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "#2c3e50",
                mb: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: "#3B7962",
                  borderRadius: "50%",
                  mr: 1.5,
                }}
              />
              Your Information
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PersonIcon
                  sx={{ mr: 2, color: "#3B7962", fontSize: "1.2rem" }}
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {appointment.studentName}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmailIcon
                  sx={{ mr: 2, color: "#3B7962", fontSize: "1.2rem" }}
                />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {appointment.studentEmail}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {appointment.notes && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "#2c3e50",
                mb: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: "#3B7962",
                  borderRadius: "50%",
                  mr: 1.5,
                }}
              />
              Additional Notes
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f8f9fa",
              }}
            >
              <Typography>{appointment.notes}</Typography>
            </Paper>
          </Box>
        )}

        <Divider sx={{ my: 4, borderColor: "rgba(0,0,0,0.08)" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            startIcon={<EventAvailableIcon />}
            component={Link}
            to={`/appointment/reschedule/${appointment._id}`}
            sx={{
              backgroundColor: "#3B7962",
              "&:hover": { backgroundColor: "#2e5b44" },
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              flex: { xs: 1, sm: "none" },
            }}
          >
            Reschedule
          </Button>

          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            component={Link}
            to={`/appointment/cancel/${appointment._id}`}
            sx={{
              color: "#3B7962",
              borderColor: "#3B7962",
              "&:hover": {
                borderColor: "#2e5b44",
                backgroundColor: "rgba(59, 121, 98, 0.08)",
              },
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              flex: { xs: 1, sm: "none" },
            }}
          >
            Cancel Appointment
          </Button>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 4, textAlign: "center" }}
        >
          A confirmation has been sent to your email address
        </Typography>
      </Paper>
    </Container>
  );
};

export default AppointmentSummary;
