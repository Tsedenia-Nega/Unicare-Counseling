// SessionNoteForm.jsx
import React, { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import API from "../services/api";

const SessionNoteForm = ({ appointment, onSubmitSuccess }) => {
  const [note, setNote] = useState(appointment.session_note || "");
  const [discussed, setDiscussed] = useState(
    appointment.session_discussed || ""
  );
  const [submitted, setSubmitted] = useState(Boolean(appointment.session_note));
  const [viewing, setViewing] = useState(false);
const Backend_URL = process.env.REACT_APP_API_URL ;
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      await API.put(`${Backend_URL}/appointment/${appointment._id}/session-note`,
        {
          session_note: note,
          session_discussed: discussed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },}
      );
      setSubmitted(true);
      onSubmitSuccess(appointment._id, note, discussed);
      alert("Session note submitted!");
    } catch (err) {
      alert("Error submitting note.");
    }
  };

  if (submitted && !viewing) {
    return (
      <Box mt={2}>
        <Button variant="outlined" onClick={() => setViewing(true)}>
          View Session Note
        </Button>
      </Box>
    );
  }

  if (viewing) {
    return (
      <Box mt={2} p={2} border="1px solid #ccc" borderRadius={1}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Session Discussed
        </Typography>
        <Typography mb={2}>{discussed || "No details"}</Typography>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Session Note
        </Typography>
        <Typography>{note || "No notes"}</Typography>

        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => setViewing(false)}
        >
          Close
        </Button>
      </Box>
    );
  }

  return (
    <Box mt={2}>
      <Typography variant="h6">Add Session Note</Typography>
      <TextField
        label="Session Discussed"
        fullWidth
        multiline
        value={discussed}
        onChange={(e) => setDiscussed(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Session Note"
        fullWidth
        multiline
        value={note}
        onChange={(e) => setNote(e.target.value)}
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit Note
      </Button>
    </Box>
  );
};

export default SessionNoteForm;
