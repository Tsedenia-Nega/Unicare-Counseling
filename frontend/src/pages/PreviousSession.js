import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import API from "../services/api";
const PreviousSession = () => {
  const { id } = useParams(); // appointment ID from URL
  const [noteData, setNoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const Backend_URL = process.env.REACT_APP_API_URL ;
  useEffect(() => {
    const fetchSessionNote = async () => {
      try {
        const response = await API.get(
          `${Backend_URL}/appointment/${id}/session`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // adapt as needed
            },
          }
        );
        setNoteData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch session note");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionNote();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h6">
          Session Notes for {noteData.student}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Appointment Date:{" "}
          {new Date(noteData.appointmentDate).toLocaleString()}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
          What was discussed:
        </Typography>
        <Typography variant="body1">
          {noteData.session_discussed || "N/A"}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
          Session Notes:
        </Typography>
        <Typography variant="body1">
          {noteData.session_note || "N/A"}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PreviousSession;
