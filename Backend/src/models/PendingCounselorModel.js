import mongoose from "mongoose";

const PendingCounselorSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  password: String, // hashed
  qualifications: [String],
  specialization: [String],
  profile_picture_url: String,
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("PendingCounselor", PendingCounselorSchema);
