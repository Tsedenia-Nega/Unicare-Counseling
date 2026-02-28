import express from "express";
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail,getProfile,updateUserProfile ,getAllUsers,getUserById} from "../controllers/authController.js";
import userAuth from "../middlewares/userAuth.js";
import isHeadCounselor from "../middlewares/isHeadCounselor.js";
import User from "../models/userModel.js";
import upload from "../middlewares/multerConfig.js";



const router = express.Router();
router.get("/me", userAuth, async (req, res) => {
  try {
    // userAuth middleware attaches user info in req.user
    const userId = req.user._id;

    // Fetch fresh user info from DB (optional if you want full data)
    const user = await User.findById(userId).select("-passwordHash"); // exclude password

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Return user info
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});
router.post("/register", upload.single("profile_picture"), register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-verify-otp", userAuth,sendVerifyOtp);
router.post("/verify-account",userAuth,verifyEmail);
router.get("/is-auth", userAuth, isAuthenticated);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password",  resetPassword);
router.post("/resend-verify-otp", userAuth, sendVerifyOtp); // Resend OTP route

router.put(
  "/updateProfile",
  userAuth,
  upload.single("profile_picture"),
  updateUserProfile
);
// router.put("/updateProfile",userAuth, updateUserProfile);
router.get("/profile",userAuth, getProfile);
router.get("/users", isHeadCounselor, getAllUsers);
router.get("/user/:id", isHeadCounselor, getUserById);
export default router;
