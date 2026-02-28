// src/routes/messageRoutes.js
import express from "express";
import { getMessages, sendMessage, uploadFiles, deleteMessage, editMessage } from "../controllers/messageController.js";
import userAuth from "../middlewares/userAuth.js";
import upload from "../middlewares/multerConfig.js";

const router = express.Router();

// Get messages of a room
router.get("/:roomId", userAuth, getMessages);
// router.get("/general", getMessages);
// router.post("/messages", userAuth, sendMessage);
router.post("/send", userAuth, sendMessage);
// Send a message
router.put("/:messageId", userAuth, editMessage);
// router.post("/", userAuth, sendMessage);
router.delete("/:messageId", userAuth, deleteMessage);
// Upload files
router.post("/upload", userAuth, upload.array("file", 5), uploadFiles);
// Add this to your existing messageRoutes.js
// router.get("/private/:userId", userAuth, getPrivateMessages);

export default router;
