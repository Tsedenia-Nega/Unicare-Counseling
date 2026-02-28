import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Card,
  Stack,
} from "@mui/material";
import { getCounselors } from "../services/AppointmentService";
import API from "../services/api";
export default function CounselorSelection() {
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const backendURL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const data = await getCounselors();
        const counselorList = Array.isArray(data)
          ? data
          : Array.isArray(data?.counselors)
          ? data.counselors
          : [];

        const formatted = counselorList.map((counselor) => ({
          ...counselor,
          displayName: `${counselor.user_id?.first_name || ""} ${
            counselor.user_id?.last_name || ""
          }`.trim(),
          specialization:
            counselor.specialization?.join(", ") || "General Counseling",
        }));

        setCounselors(formatted);
      } catch (err) {
        console.error(err);
        setError("Failed to load counselors.");
      } finally {
        setLoading(false);
      }
    };

    fetchCounselors();
  }, []);

  const handleContinue = () => {
    if (selectedCounselor) {
      navigate("/book-appointment", {
        state: { counselor: selectedCounselor },
      });
    }
  };

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}
      >
        Book An Appointment
      </Typography>

      <Box
        sx={{
          backgroundColor: "#f8f8f8",
          borderRadius: 4,
          p: 4,
          boxShadow: "0 2px 15px rgba(0,0,0,0.06)",
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 3, textAlign: "center" }}>
          Select Counselor to book the Appointment
        </Typography>

        <Stack spacing={2}>
          {counselors.map((counselor) => {
            const isSelected = selectedCounselor?._id === counselor._id;

            return (
              <Card
                key={counselor._id}
                onClick={() => setSelectedCounselor(counselor)}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  cursor: "pointer",
                  border: isSelected ? "2px solid #3B7962" : "1px solid #ddd",
                  borderRadius: 3,
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(59,121,98,0.25)"
                    : "0 2px 6px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <Avatar
                  src={counselor.user_id?.profile_picture ? 
                    `${backendURL}/uploads/profile_pictures/${counselor.user_id.profile_picture}` : 
                    ""}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: isSelected ? "#3B7962" : "#e0e0e0",
                    border: isSelected ? "3px solid #3B7962" : "none",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  {!counselor.user_id?.profile_picture &&
                    counselor.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                </Avatar>
                <Box>
                  <Typography 
                    fontWeight={600} 
                    fontSize="1.1rem"
                    color={isSelected ? "#3B7962" : "inherit"}
                    sx={{ mb: 0.5 }}
                  >
                    {counselor.displayName}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{
                      display: "inline-block",
                      backgroundColor: isSelected ? "#e8f5e9" : "#f5f5f5",
                      color: isSelected ? "#2e7d32" : "#666",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {counselor.specialization}
                  </Typography>
                </Box>
              </Card>
            );
          })}
        </Stack>

        {/* Buttons */}
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          mt={4}
        >
          <Button
            onClick={handleBack}
            variant="contained"
            sx={{
              flex: 1,
              backgroundColor: "#ccc",
              color: "#000",
              borderRadius: "8px",
              fontWeight: 500,
              py: 1.3,
              "&:hover": {
                backgroundColor: "#bbb",
              },
            }}
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedCounselor}
            variant="contained"
            sx={{
              flex: 1,
              backgroundColor: "#3B7962",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: 600,
              py: 1.3,
              boxShadow: "0 4px #2e5b44",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#2e5b44",
              },
              "&:disabled": {
                backgroundColor: "#d0d0d0",
                color: "#888",
              },
            }}
          >
            Continue
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
