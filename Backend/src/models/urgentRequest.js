import mongoose from "mongoose";

const UrgentRequestSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    preferred_method: {
      type: String,
      enum: ["call"],
      default: "call",
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: [true, "Reason message is required for urgent response."],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed"],
      default: "pending",
    },
    assigned_counselor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UrgentRequest", UrgentRequestSchema);
