import React from "react";
import { Avatar, Card, CardContent, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";

const CounselorCardContainer = styled(Card)(({ theme, selected }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: selected ? "2px solid #4CAF50" : "1px solid #e0e0e0",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transform: "translateY(-2px)",
  },
}));

const CounselorAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  marginRight: theme.spacing(3),
  fontSize: "1.5rem",
  backgroundColor: "#f5f5f5",
}));

const SpecialtyChip = styled("span")(({ theme }) => ({
  display: "inline-block",
  backgroundColor: "#e8f5e9",
  color: "#2e7d32",
  padding: "4px 12px",
  borderRadius: "16px",
  fontSize: "0.8rem",
  fontWeight: "500",
  marginTop: theme.spacing(1),
}));

export const CounselorCard = ({ counselor, selected, onClick }) => {
  return (
    <CounselorCardContainer onClick={onClick} selected={selected} elevation={0}>
      <CounselorAvatar src={counselor.profileImage}>
        {counselor.name.charAt(0)}
      </CounselorAvatar>
      <CardContent style={{ flex: 1, padding: 0 }}>
        <Typography variant="h6" style={{ fontWeight: 600 }}>
          {counselor.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {counselor.qualification}
        </Typography>
        <SpecialtyChip>{counselor.specialization}</SpecialtyChip>
      </CardContent>
      {selected && (
        <span style={{ color: "#4CAF50", fontSize: "1.5rem" }}>✓</span>
      )}
    </CounselorCardContainer>
  );
};
