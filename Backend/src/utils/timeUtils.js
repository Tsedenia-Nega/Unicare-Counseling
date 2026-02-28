// utils/timeUtils.js
export const convertTo24HourFormat = (time12h) => {
  const [time, modifier] = time12h.split(" ");
  if (!time || !modifier) {
    throw new Error('Time must be in format "hh:mm AM/PM"');
  }

  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);

  if (modifier.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  // ⬇️ This line ensures "9:00" becomes "09:00"
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

// export const convertTo24HourFormat = (timeStr) => {
//   if (!timeStr || typeof timeStr !== "string") {
//     throw new Error("Invalid time string");
//   }

//   const [time, modifier] = timeStr.trim().split(" ");
//   if (!time || !modifier) {
//     throw new Error('Time must be in format "hh:mm AM/PM"');
//   }

//   let [hours, minutes] = time.split(":");

//   if (!/^\d{1,2}$/.test(hours) || !/^\d{2}$/.test(minutes)) {
//     throw new Error("Invalid time format. Expected numeric hh:mm.");
//   }

//   hours = hours.padStart(2, "0");
//   minutes = minutes.padStart(2, "0");

//   if (modifier.toLowerCase() === "pm" && hours !== "12") {
//     hours = String(parseInt(hours, 10) + 12);
//   }
//   if (modifier.toLowerCase() === "am" && hours === "12") {
//     hours = "00";
//   }

//   return `${hours}:${minutes}`;
// };

/**
 * Checks if the given date (string format) is in the future (after today)
 * Accepts date strings in 'YYYY-MM-DD' format
 */
export const isFutureDate = (dateStr) => {
  const inputDate = new Date(dateStr);

  // Ensure the input date is valid
  if (isNaN(inputDate)) {
    throw new Error("Invalid date format");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Zero out time to compare just the date

  return inputDate >= today;
};
