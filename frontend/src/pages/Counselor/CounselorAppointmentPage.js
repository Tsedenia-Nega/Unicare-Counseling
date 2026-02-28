import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";

import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { format } from "date-fns";
import { getAppointmentsForCounselor } from "../../services/api";
import SessionNoteForm from "../SessionNoteForm"; // adjust the relative path here

const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(+hours);
  date.setMinutes(+minutes);
  return format(date, "hh:mm a");
};
function ZoomPasswordToggle({ password }) {
  const [show, setShow] = useState(false);
  return (
    <FormControl variant="outlined" size="small" sx={{ mt: 1, width: 180 }}>
      <InputLabel htmlFor="zoom-password">Password</InputLabel>
      <OutlinedInput
        id="zoom-password"
        type={show ? "text" : "password"}
        value={password}
        readOnly
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((prev) => !prev)}
              edge="end"
              size="small"
            >
              {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
      />
    </FormControl>
  );
}
export default function CounselorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await getAppointmentsForCounselor();
        setAppointments(response.data.data);
      } catch (error) {
        setFetchError("Failed to fetch appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const now = new Date();
  const filteredAppointments =
    tabIndex === 0
      ? appointments.filter((a) => new Date(a.date) >= now)
      : appointments.filter((a) => new Date(a.date) < now);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={600} color="#3B7962">
          My Counseling Appointments
        </Typography>
      </Box>

      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Upcoming" />
        <Tab label="Past" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : fetchError ? (
        <Alert severity="error">{fetchError}</Alert>
      ) : filteredAppointments.length === 0 ? (
        <Typography color="text.secondary">No appointments found.</Typography>
      ) : (
        filteredAppointments.map((appointment) => (
          <Paper
            key={appointment._id}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Appointment with:{" "}
              <strong>
                {appointment.student?.first_name || "Student"}{" "}
                {appointment.student?.last_name || ""}
              </strong>
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <PersonIcon fontSize="small" color="primary" />
              <Typography>{appointment.student?.email}</Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
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
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <Typography>Type: {appointment.type}</Typography>
            </Stack>
            {appointment.notes && (
              <Typography variant="body2" mt={1} mb={1}>
                <strong>Student Notes:</strong> {appointment.notes}
              </Typography>
            )}
            {tabIndex === 0 &&
              appointment.type === "virtual" &&
              appointment.zoom_start_url && (
                <Button
                  variant="outlined"
                  color="primary"
                  href={appointment.zoom_start_url}
                  target="_blank"
                  sx={{ mt: 1 }}
                >
                  Start the Meeting
                </Button>
              )}

            
            {tabIndex === 0 && appointment.zoom_password && (
               <ZoomPasswordToggle password={appointment.zoom_password} />
            )}

            <Divider sx={{ my: 2 }} />
            {tabIndex === 1 && (
              <SessionNoteForm
                appointment={appointment}
                onSubmitSuccess={(id, note, discussed) => {
                  setAppointments((prev) =>
                    prev.map((appt) =>
                      appt._id === id
                        ? {
                            ...appt,
                            session_note: note,
                            session_discussed: discussed,
                          }
                        : appt
                    )
                  );
                }}
              />
            )}
          </Paper>
        ))
      )}
    </Container>
  );
}
