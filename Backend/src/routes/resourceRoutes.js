import express from "express";
import userAuth from "../middlewares/userAuth.js";
import isCounselorOrHead from "../middlewares/isCounselorOrHead.js";
import isHeadCounselor from "../middlewares/isHeadCounselor.js";
import {
  addResource,
  getResources,deleteResource,
  updateResource
} from "../controllers/resourceController.js";
import uploadResource from "../middlewares/uploadResourceMiddleware.js";
const router = express.Router();

// Only counselor/head_counselor can add
router.post("/add",userAuth, uploadResource.single("media"),addResource);

// All users can view/search
router.get("/", getResources);
router.delete("/:resourceId",userAuth,isCounselorOrHead, deleteResource);
router.put("/:resourceId", userAuth, uploadResource.single("media"), updateResource);

export default router;
