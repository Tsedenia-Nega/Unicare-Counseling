import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      required: true,
    },
    date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    type: {
      type: String,
      enum: ["in-person", "virtual"],
      default: "in-person",
    },
    virtual_meeting_link: { type: String },
    zoom_meeting_id: { type: String },
    zoom_password: { type: String },
    zoom_start_url: { type: String },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "confirmed", "pending", "completed"],
      default: "booked",
    },
    session_note: {
      type: String,
      default: "",
    },

    session_discussed: {
      type: String, // or type: String if you prefer free text
      default: "",
    },

    session_rating_by_student: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
