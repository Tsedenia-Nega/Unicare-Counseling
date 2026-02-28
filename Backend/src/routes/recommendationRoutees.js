import express from "express";

import {
  generateRecommendations,
} from "../controllers/recommendationController.js";
import userAuth from "../middlewares/userAuth.js";
const router = express.Router();
router.use(userAuth);
// POST /api/recommendations - Generate AI recommendations
router.post("/", generateRecommendations);

export default router;
