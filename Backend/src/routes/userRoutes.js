import express from "express";
import {
  getAllUsers,
  getUserById,
  searchUsersByName,
  toggleUserStatus,
} from "../controllers/userController.js";
import isHeadCounselor from "../middlewares/isHeadCounselor.js";
import userAuth from "../middlewares/userAuth.js";
const router = express.Router();

// GET /api/users - List all users (head counselor only)
router.get("/", userAuth,isHeadCounselor, getAllUsers);

// GET /api/users/:id - View specific user (head counselor only)
router.get("/:id", userAuth,isHeadCounselor, getUserById);

// PUT /api/users/:id/status - Activate or Deactivate user (head counselor only)
router.put("/:id/status",userAuth, isHeadCounselor, toggleUserStatus);
router.get("/search", userAuth, isHeadCounselor, searchUsersByName);


export default router;
