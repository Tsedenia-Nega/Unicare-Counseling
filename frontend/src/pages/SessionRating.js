import { useEffect, useState } from "react";
import { Rating, Button, Typography } from "@mui/material";
import API from "../services/api";

const SessionRating = ({ appointment }) => {
  const [rating, setRating] = useState(0);
  const [canRate, setCanRate] = useState(false);
const Backend_URL = process.env.REACT_APP_API_URL ;
  useEffect(() => {
    const checkIfPast = () => {
      const endDateTime = new Date(
        `${appointment.date}T${appointment.end_time}`
      );
      setCanRate(new Date() > endDateTime);
    };

    checkIfPast();

    const interval = setInterval(checkIfPast, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [appointment]);

  const handleSubmit = async () => {
    try {
      await API.put(`${Backend_URL}/appointment/${appointment._id}/session-rating`, {
        session_rating_by_student: rating,
      });
      alert("Thank you for your feedback!");
    } catch (err) {
      alert("Error submitting rating.");
    }
  };

  if (!canRate) {
    return (
      <Typography variant="body2" color="text.secondary">
        You can rate this session after it has ended.
      </Typography>
    );
  }

  return (
    <div className="p-4">
      <Typography variant="h6">Rate This Session</Typography>
      <Rating
        name="session-rating"
        value={rating}
        onChange={(e, newValue) => setRating(newValue)}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit Rating
      </Button>
    </div>
  );
};

export default SessionRating;
