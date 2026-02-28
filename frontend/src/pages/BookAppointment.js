import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Chip,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  getCounselorAvailability,
  bookAppointment,
} from "../services/AppointmentService";
import { formatTime } from "../utils/formatTime";

export default function BookAppointmentPage() {
  const { counselorId: paramId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const counselor = state?.counselor;
  const counselorId = paramId || counselor?._id;

  const [selectedDate, setSelectedDate] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [datePickerKey, setDatePickerKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [formData, setFormData] = useState({
    // name: "",
    // email: "",
    notes: "",
  });

  useEffect(() => {
    if (!counselorId) {
      navigate("/select-counselor", { replace: true });
    }
  }, [counselorId, navigate]);

  useEffect(() => {
    if (!counselorId) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const data = await getCounselorAvailability(counselorId);
        setAvailability(data?.availability || []);
        setDatePickerKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [counselorId]);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const slotsForDate = availability.filter(
        (slot) => slot.date === formattedDate && !slot.expired
      );
      setFilteredSlots(slotsForDate);
      setSelectedSlot(null);
    } else {
      setFilteredSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate, availability]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleUrgentRequestClick = () => {
    navigate("/urgent-request");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBookingError(null);

    if (!selectedSlot) {
      setError("Please select a time slot");
      return;
    }

    try {
      setConfirming(true);
      const appointmentData = {
        counselorId,
        date: selectedDate.toISOString().split("T")[0],
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        type: selectedSlot.type || "in-person",
        notes: formData.notes,
      };
      

      const response = await bookAppointment(appointmentData);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/my-appointments", { state: { appointment: response.data } });
      }, 1000);
    } catch (error) {
      setConfirming(false);
      if (
        error.message.includes("session") ||
        error.message.includes("login")
      ) {
        navigate("/login", {
          state: {
            from: window.location.pathname,
            message: error.message,
          },
          replace: true,
        });
      } else {
        setBookingError(error.message);
        try {
          const data = await getCounselorAvailability(counselorId);
          setAvailability(data?.availability || []);
        } catch (e) {
          console.error("Error refetching availability:", e);
        }
      }
    }
  };

  if (!counselorId || !counselor) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            mb: 2,
            color: "#3B7962",
            "&:hover": {
              backgroundColor: "rgba(59, 121, 98, 0.08)",
            },
          }}
        >
          Back to Counselors
        </Button>
        
        <button
          onClick={handleUrgentRequestClick}
          className="bg-red-600 text-white py-2 px-4 rounded mb-4 hover:bg-red-700"
        >
          Urgent Request
        </button>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
            }}
          >
            Book an Appointment with{" "}
            {counselor?.user?.first_name ||
              counselor?.first_name ||
              counselor?.name ||
              "Counselor"}
          </Typography>
          <Chip
            label={`${availability.length} available dates`}
            sx={{
              backgroundColor: "#e8f5e9",
              color: "#3B7962",
              fontWeight: 500,
            }}
          />
        </Box>
      </Box>

      {bookingError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {bookingError}
        </Alert>
      )}

      <Snackbar
        open={showSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={1000}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ 
            width: '100%',
            bgcolor: '#3B7962',
            '& .MuiAlert-icon': { color: '#fff' }
          }}
        >
          Appointment booked successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={confirming && !showSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="info"
          icon={<CircularProgress size={20} color="inherit" />}
          sx={{ 
            width: '100%',
            bgcolor: '#fff',
            color: '#3B7962',
            '& .MuiAlert-icon': { color: '#3B7962' }
          }}
        >
          Confirming your appointment...
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#2c3e50",
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
              Select Availability
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                key={datePickerKey}
                label="Choose date"
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                }}
                disablePast
                shouldDisableDate={(date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  return !availability.some((slot) => slot.date === dateStr);
                }}
                sx={{
                  width: "100%",
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                  },
                }}
              />
            </LocalizationProvider>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="body1"
              sx={{
                mb: 2,
                fontWeight: 500,
              }}
            >
              {selectedDate
                ? "Available Time Slots"
                : "Select a date to view available time slots"}
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress size={24} sx={{ color: "#3B7962" }} />
              </Box>
            ) : filteredSlots.length > 0 ? (
              <Grid container spacing={1} justifyContent="flex-start">
                {filteredSlots.map((slot) => (
                  <Grid
                    item
                    xs={6}
                    sm={4}
                    key={`${slot.date}-${slot.start_time}`}
                  >
                    <Button
                      fullWidth
                      variant={
                        selectedSlot?._id === slot._id
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => {
                        setSelectedSlot(slot);
                      }}
                      sx={{
                        py: 1,
                        borderRadius: 1,
                        fontSize: "0.875rem",
                        backgroundColor:
                          selectedSlot?._id === slot._id
                            ? "#3B7962"
                            : "transparent",
                        color:
                          selectedSlot?._id === slot._id ? "#fff" : "#3B7962",
                        borderColor: "#3B7962",
                        "&:hover": {
                          backgroundColor:
                            selectedSlot?._id === slot._id
                              ? "#2e5b44"
                              : "rgba(59, 121, 98, 0.08)",
                          borderColor: "#2e5b44",
                        },
                      }}
                    >
                      {`${formatTime(slot.start_time)} - ${formatTime(
                        slot.end_time
                      )}`}
                      {slot.type && (
                        <Chip
                          label={slot.type}
                          size="small"
                          sx={{
                            ml: 0.5,
                            fontSize: "0.6rem",
                            height: 20,
                            backgroundColor:
                              selectedSlot?._id === slot._id
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(59, 121, 98, 0.1)",
                            color:
                              selectedSlot?._id === slot._id
                                ? "#fff"
                                : "#3B7962",
                          }}
                        />
                      )}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  backgroundColor: "#f8f9fa",
                  p: 2,
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {selectedDate
                    ? "No available slots for this date"
                    : "Please select a date to see available time slots"}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#2c3e50",
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

            {/* <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
              size="small"
              InputProps={{
                sx: {
                  borderRadius: 1,
                },
              }}
            /> */}

            {/* <TextField
              fullWidth
              type="email"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
              size="small"
              InputProps={{
                sx: {
                  borderRadius: 1,
                },
              }}
            /> */}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes (optional)"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              size="small"
              InputProps={{
                sx: {
                  borderRadius: 1,
                },
              }}
              placeholder="Any specific concerns or preferences..."
            />

            {error && (
              <Alert
                severity="warning"
                sx={{
                  mb: 2,
                  borderRadius: 1,
                }}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={confirming}
                sx={{
                  bgcolor: "#3B7962",
                  "&:hover": { bgcolor: "#2e5b44" },
                  minWidth: 200,
                }}
              >
                {confirming ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                    Confirming...
                  </Box>
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}