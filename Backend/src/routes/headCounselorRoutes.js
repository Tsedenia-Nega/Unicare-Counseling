import express from "express";
import upload from "../middlewares/multerConfig.js";
import { checkSecretKey } from "../middlewares/checkSecretKey.js"; // Import the secret key middleware
import { activateUser, deactivateUser, handleCounselorApproval, headVerifyEmail, registerHeadCounselor, uploadVerifiedStudents } from "../controllers/headCounselorController.js"; // Import the controller
import userAuth from "../middlewares/userAuth.js";
import isHeadCounselor from "../middlewares/isHeadCounselor.js";
import CounselorModel from "../models/counselorModel.js";
import User from "../models/userModel.js";
import PendingCounselorModel from "../models/PendingCounselorModel.js";
const router = express.Router();
router.post("/verify-key", checkSecretKey);
// Route for Head Counselor registration
router.post(
  "/register",
  registerHeadCounselor
); 
// router.post("/send-otp",headSendVerifyOtp);
// Node/Express example
router.get("/check", async (req, res) => {
  try {
    // Find if any user has role 'head_counselor' (adjust your role string if different)
    const headCounselorExists = await User.exists({ role: "head_counselor" });
    res.json({ exists: Boolean(headCounselorExists) });
  } catch (err) {
    console.error("Error checking head counselor existence:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Verify OTP and activate account
router.post("/verify-email", headVerifyEmail);
router.put(
  "/handle-counselor/:pendingId",
  userAuth,
  isHeadCounselor,
  handleCounselorApproval
);
router.get("/pending", userAuth, isHeadCounselor, async (req, res) => {
  try {
    const counselors = await PendingCounselorModel.find();

    if (counselors.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending counselors found.",
        counselors: [],
      });
    }

    res.status(200).json({ success: true, counselors });
  } catch (err) {
    console.error("Error fetching pending counselors:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending counselors.",
    });
  }
});
router.post(
  "/upload-verified-students",
  userAuth,
  isHeadCounselor,
  upload.single("file"),
  uploadVerifiedStudents
);
// router.get("/pending", userAuth, isHeadCounselor, async (req, res) => {
//   try {
//     // Find all counselors with pending approval status and populate user_id with verification status
//     const counselors = await CounselorModel.find({
//       approval_status: "pending",
//     }).populate("user_id", "first_name last_name email isAccountVerified");

//     // Filter counselors whose user account exists AND is NOT verified
//     const unverifiedCounselors = counselors.filter(
//       (counselor) =>
//         counselor.user_id && counselor.user_id.isAccountVerified === false
//     );

//     if (unverifiedCounselors.length === 0) {
//       return res
//         .status(200)
//         .json({
//           success: true,
//           message: "No unverified pending counselors found.",
//           counselors: [],
//         });
//     }

//     res.status(200).json({ success: true, counselors: unverifiedCounselors });
//   } catch (err) {
//     console.error("Error fetching pending counselors:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch counselors." });
//   }
// });



// Route to deactivate a user
router.put("/deactivate/:userId", isHeadCounselor, deactivateUser);

// Route to activate a user
router.put("/activate/:userId", isHeadCounselor, activateUser);
export default router;
