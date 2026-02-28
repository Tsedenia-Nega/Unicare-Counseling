import express from "express";
import userAuth from "../middlewares/userAuth.js";
import {
  getAllMoods,
  getMoodById,
  createMood,
  updateMood,
  deleteMood,
  getMoodStats,
} from "../controllers/moodController.js";
const router = express.Router();
router.use(userAuth);
// GET /api/moods - Get all mood entries with pagination
router.get("/", getAllMoods);

// GET /api/moods/stats - Get mood statistics
router.get("/stats", getMoodStats);

// GET /api/moods/:id - Get specific mood entry
router.get("/:id", getMoodById);

// POST /api/moods - Create new mood entry
router.post("/", createMood);

// PUT /api/moods/:id - Update mood entry
router.put("/:id", updateMood);

// DELETE /api/moods/:id - Delete mood entry
router.delete("/:id", deleteMood);

export default router;
