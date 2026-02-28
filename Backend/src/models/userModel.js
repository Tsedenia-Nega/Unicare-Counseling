import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true }, // First name of the user
  last_name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "counselor", "head_counselor"], // Role of the user
    default: "student", // Default role is student
  },

  department: {
    type: String,
    required: function () {
      return this.role === "student";
    },
  },
  year_of_study: {
    type: String,
    required: function () {
      return this.role === "student";
    },
  },
  student_id: {
    type: String,
    required: function () {
      return this.role === "student";
    },
    unique: true,
    sparse: true,
    // default: "", // ✅ critical to prevent null from being saved
  },

  // student_id: {
  //   type: String,
  //   required: function () {
  //     return this.role === "student";
  //   },
  //   unique: true,
  //   sparse: true,
  //   default: undefined,//  // ✅ THIS fixes the error!
  // },
  deactivationReason: {
    type: String,
    default: "",
  },
  profile_picture: { type: String, default: "" },
  // gender: { type: String, enum: ["Male", "Female"] },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    set: (v) => {
      if (!v) return v;
      // Capitalize first letter, lowercase the rest
      return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
    },
  },

  phone_number: {
    type: String,
    default: "", // Optional phone number
  },
  date_of_birth: { type: Date },
  bio: { type: String, default: "" },
  verifyOtp: { type: String, default: " " },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: " " },
  resetOtpExpireAt: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});
const UserModel = mongoose.models.user|| mongoose.model('User',userSchema);
export default UserModel;