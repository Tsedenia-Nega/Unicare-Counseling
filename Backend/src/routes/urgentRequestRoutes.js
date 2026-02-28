import express from "express";
import {
  createUrgentRequest,
  getUrgentRequestsForCounselor,
  getAllUrgentRequests,
  acceptUrgentRequest,
} from "../controllers/urgentRequestController.js";
import  userAuth  from "../middlewares/userAuth.js"
import isCounselorOrHead  from "../middlewares/isCounselorOrHead.js"

const router = express.Router();

// Student submits urgent request
router.post(
  "/",
  userAuth,
  
  createUrgentRequest
);

// Counselor sees unassigned urgent requests
router.get(
  "/counselor",
  userAuth,
  isCounselorOrHead,
  getUrgentRequestsForCounselor
);

// Head Counselor sees all urgent requests
router.get(
  "/head-counselor",
  userAuth,isCounselorOrHead,
  getAllUrgentRequests
);

// Counselor accepts urgent request
router.patch(
  "/accept/:id",
 userAuth,isCounselorOrHead,
  acceptUrgentRequest
);

export default router;
