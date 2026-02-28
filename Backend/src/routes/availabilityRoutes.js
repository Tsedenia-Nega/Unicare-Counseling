// routes/availabilityRoutes.js
import express from "express";
import {
  createAvailability,
  getAvailability,
  updateAvailability,
  deleteAvailability,
} from "../controllers/availabilityController.js";
import userAuth from "../middlewares/userAuth.js";

const router = express.Router();

// Route for creating availability (requires authentication)
router.post("/create", userAuth, createAvailability);

// Route for fetching availability (requires authentication)
router.get("/:counselorId", userAuth, getAvailability);

// Route for updating availability (requires authentication)
router.put("/:id", userAuth, updateAvailability);

// Route for deleting availability (requires authentication)
router.delete("/:id", userAuth, deleteAvailability);

export default router;
