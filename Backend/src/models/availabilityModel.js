// models/Availability.js
import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    counselor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      required: true,
    },
    date: { type: String, required: true }, // Date as string (e.g., "2025-04-20")
    start_time: { type: String, required: true }, // Time in 24-hour format (e.g., "09:00")
    end_time: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "booked"],
      default: "available",
    }, // Time in 24-hour format (e.g., "17:00")
    type: {
      type: String,
      enum: ["in-person", "virtual"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
