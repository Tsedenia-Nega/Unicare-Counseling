import mongoose from "mongoose";
import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getStudentAppointments,
  getCounselorAppointments,
  getAllAppointments,
  
  getSessionNote,
} from "../controllers/appointmentController.js";
import {
  addSessionNote,
  rateSession,
} from "../controllers/appointmentController.js";
import userAuth from "../middlewares/userAuth.js";
import isHeadCounselor from "../middlewares/isHeadCounselor.js";
import Appointment from "../models/appointmentModel.js";
const router = express.Router();

// Apply userAuth to all routes
router.use(userAuth);

// Student-only routes
router.post("/", checkStudentRole, bookAppointment);
router.put("/:id/cancel", checkStudentRole, cancelAppointment);
router.put("/:appointmentId/reschedule", checkStudentRole, rescheduleAppointment);
router.get(
  "/my-appointments",
  // checkStudentRole,
  getStudentAppointments
);

// Counselor-only routes
router.get("/counselor/schedule", getCounselorAppointments);
router.get(
  "/allappointments",
  userAuth,isHeadCounselor,
  getAllAppointments
);

 // ← Don't forget this!


router.get("/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    console.log("Looking for appointment:", appointmentId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "counselor",
        populate: {
          path: "user_id",
          model: "User",
          select: "first_name last_name email name",
        },
      })
      .populate({
        path: "student",
        model: "User",
        select: "first_name last_name email name",
      });

    if (!appointment) {
      console.log("Appointment not found");
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    console.log("Appointment found successfully");
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
      error: error.message,
    });
  }
});

router.put("/:id/session-note", addSessionNote);
router.get("/:id/session", getSessionNote);
router.put("/:id/session-rating", checkStudentRole, rateSession);


// Controller



// Role-checking middleware
function checkStudentRole(req, res, next) {
  if (req.user.role === "student") return next();
  res.status(403).json({ success: false, message: "Student access required" });
}

function checkCounselorRole(req, res, next) {
  if (req.user && req.user.role === "counselor") return next();
  return res
    .status(403)
    .json({ success: false, message: "Counselor access required" });
}


export default router;
