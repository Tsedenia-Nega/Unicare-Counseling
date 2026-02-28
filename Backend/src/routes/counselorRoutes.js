import express from "express";
import upload from "../middlewares/multerConfig.js";
import {
  getLoggedInCounselor,
  getUnverifiedCounselors,
  getVerifiedCounselors,
  registerCounselor,
  updateCounselorProfile
} from "../controllers/counselorController.js";
import userAuth from "../middlewares/userAuth.js";

const router = express.Router();

// Register a new counselor with file upload
router.post("/register", upload.single("profile_picture"), registerCounselor);
router.put("/update-profile", userAuth,upload.single("profile_picture"), updateCounselorProfile);
router.get("/me", userAuth, getLoggedInCounselor);
router.get("/verified", userAuth, getVerifiedCounselors);
router.get("/verifiedd", getVerifiedCounselors);
router.get("/unverified", userAuth,getUnverifiedCounselors);

export default router;
