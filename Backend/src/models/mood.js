// const mongoose = require("mongoose");
import mongoose from "mongoose";

const moodSchema = new mongoose.Schema({
  mood: {
    type: String,
    required: true,
    enum: [
      "happy",
      "sad",
      "anxious",
      "calm",
      "angry",
      "excited",
      "tired",
      "stressed",
    ],
  },
  intensity: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  notes: {
    type: String,
    default: "",
    maxlength: 500,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
//   userId: {
//     type: String,
//     default: "default_user", // For now, using default user. Can be extended for multi-user
//   },
  userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User collection
        required: true,
      },
});

// Index for better query performance
moodSchema.index({ timestamp: -1 });
moodSchema.index({ userId: 1, timestamp: -1 });

// module.exports = mongoose.model("Mood", moodSchema);
export default mongoose.model("Mood", moodSchema);