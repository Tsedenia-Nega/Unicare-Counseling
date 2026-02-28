import CounselorModel from "../models/counselorModel.js";
import UserModel from "../models/userModel.js";
import { sendEmail } from "../services/emailService.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import PendingCounselorModel from "../models/PendingCounselorModel.js";

dotenv.config();

// Register a new counselor


// export const registerCounselor = async (req, res) => {
//   const {
//     first_name,
//     last_name,
//     email,
//     password,
//     qualifications,
//     specialization,
//   } = req.body;

//   try {
//     const existingUser = await UserModel.findOne({ email });
//     const existingPending = await PendingCounselorModel.findOne({ email });

//     if (existingUser || existingPending) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email already used." });
//     }

//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Certificate required." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const certificateUrl = `/uploads/${req.file.filename}`;

//     const pendingCounselor = new PendingCounselorModel({
//       first_name,
//       last_name,
//       email,
//       password: hashedPassword,
//       qualifications: qualifications.split(",").map((q) => q.trim()),
//       specialization: specialization.split(",").map((s) => s.trim()),
//       certificate_url: certificateUrl,
//     });

//     await pendingCounselor.save();

//     await sendEmail(
//       email,
//       "Application Received",
//       "Thank you for applying. Your counselor application is under review."
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Application submitted and awaiting approval.",
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

export const registerCounselor = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    qualifications,
    specialization,
  } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    const existingPending = await PendingCounselorModel.findOne({ email });

    if (existingUser || existingPending) {
      return res
        .status(400)
        .json({ success: false, message: "Email already used." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Profile picture required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePictureUrl = `/uploads/${req.file.filename}`;

    const pendingCounselor = new PendingCounselorModel({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      qualifications: qualifications.split(",").map((q) => q.trim()),
      specialization: specialization.split(",").map((s) => s.trim()),
      profile_picture_url: profilePictureUrl, // changed here
    });

    await pendingCounselor.save();

    await sendEmail(
      email,
      "Application Received",
      "Thank you for applying. Your counselor application is under review."
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted and awaiting approval.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



export const getLoggedInCounselor = async (req, res) => {
  try {
    const userId = req.user._id; // From userAuth middleware

    const counselor = await CounselorModel.findOne({ user_id: userId });

    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    res.status(200).json({
      counselorId: counselor._id,
      isHeadCounselor: counselor.is_head_counselor,
      fullName: `${req.user.first_name} ${req.user.last_name}`,
      email: req.user.email,
      specialization: req.user.specialization,
      qualifications: req.user.qualifications,
    });
  } catch (error) {
    console.error("Error fetching counselor info:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateCounselorProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Update fields in User model
    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.phone_number = req.body.phone_number || user.phone_number;

    if (req.file) {
      user.profile_picture = req.file.filename;
    }

    // Save updated user
    const updatedUser = await user.save();

    // Update Counselor-specific fields
    const counselor = await CounselorModel.findOne({ user_id: userId });
    if (!counselor)
      return res
        .status(404)
        .json({ success: false, message: "Counselor not found" });

    counselor.specialization =
      req.body.specialization || counselor.specialization;
    counselor.qualifications =
      req.body.qualifications || counselor.qualifications;

    // Save updated counselor
    const updatedCounselor = await counselor.save();

    res.status(200).json({
      success: true,
      message: "Counselor profile updated successfully",
      user: {
        _id: user._id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: user.email,
        role: user.role,
        profile_picture: updatedUser.profile_picture,
        phone_number: updatedUser.phone_number,
        specialization: updatedCounselor.specialization,
        qualifications: updatedCounselor.qualifications,
      },
    });
  } catch (error) {
    console.error("Error updating counselor profile:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all counselors who are verified (approved by Head Counselor)
export const getVerifiedCounselors = async (req, res) => {
  try {
    const verifiedCounselors = await CounselorModel.find({
      approval_status: "approved",
      is_head_counselor: false,
      // is_verified: true, 
      // if you have this field
    }).populate("user_id", "first_name last_name email profile_picture");
    console.log("FOUND COUNSELORS:", verifiedCounselors);
    res.status(200).json({
      success: true,
      counselors: verifiedCounselors,
    });
  } catch (error) {
    console.error("Error fetching verified counselors:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve verified counselors.",
    });
  }
};
// export const getUnverifiedCounselors = async (req, res) => {
//   try {
//     const unverifiedCounselors = await CounselorModel.find({
//       approval_status: "pending", // or another status depending on your logic
//     }).populate({
//       path: "user_id",
//       match: { isAccountVerified: false }, // only populate if user's email is unverified
//       select: "first_name last_name email is_verified",
//     });

//     // Filter out counselors where user_id is null (i.e., user is already verified)
//     const filtered = unverifiedCounselors.filter((c) => c.user_id !== null);

//     res.status(200).json({
//       success: true,
//       counselors: filtered,
//     });
//   } catch (error) {
//     console.error("Error fetching unverified counselors:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve unverified counselors.",
//     });
//   }
// };


export const getUnverifiedCounselors = async (req, res) => {
  try {
    // Find all pending counselor applications
    const unverifiedCounselors = await PendingCounselorModel.find({});
    if (!counselors || counselors.length === 0) {
      return res.status(200).json({
        success: true,
        counselors: [],
        message: "No pending counselor applications found.",
      });
    }
    // If needed, filter or format the data here (e.g., trim fields or exclude sensitive ones)
    const formatted = unverifiedCounselors.map((counselor) => ({
      _id: counselor._id,
      first_name: counselor.first_name,
      last_name: counselor.last_name,
      email: counselor.email,
      qualifications: counselor.qualifications,
      specialization: counselor.specialization,
      certificate_url: counselor.certificate_url,
      created_at: counselor.created_at,
    }));

    res.status(200).json({
      success: true,
      counselors: formatted,
    });
  } catch (error) {
    console.error("Error fetching unverified counselors:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve unverified counselors.",
    });
  }
};
