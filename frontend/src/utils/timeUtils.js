// src/utils/timeUtils.js
export const convertToTimeString = (time) => {
  const [hours, minutes] = time.split(":");
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  return `${h}:${m}`;
};

export const formatDateForInput = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
};
