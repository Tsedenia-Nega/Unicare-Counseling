// import Message from "../models/messageModel.js";
// import User from "../models/userModel.js"; // if needed for manual lookups

// // Get all messages for a specific room
// export const getMessages = async (req, res) => {
//   const { roomId } = req.params;

//   try {
//     const messages = await Message.find({ roomId })
//       .sort({ createdAt: 1 })
//       .populate("senderId", "first_name avatar email role"); // 👈 Add this

//     res.status(200).json(messages);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Failed to load messages", error: error.message });
//   }
// };

// // Send a new message
// // export const sendMessage = async (req, res) => {
// //   try {
// //     const { roomId, content, messageType, receiverId } = req.body;
// //     const senderId = req.user._id; // Changed from req.body.userId to req.user._id

// //     if (!senderId) {
// //       return res.status(400).json({ message: "Sender not authorized" });
// //     }

// //     const newMessage = new Message({
// //       roomId,
// //       senderId,
// //       receiverId,
// //       content,
// //       messageType,
// //     });

// //     const savedMessage = await newMessage.save();
// //     const populatedMessage = await savedMessage.populate(
// //       "senderId",
// //       "first_name avatar email role"
// //     );

// //     req.io.to(roomId).emit("message", populatedMessage);
// //     res.status(201).json(populatedMessage);
// //   } catch (error) {
// //     console.error(error);
// //     res
// //       .status(500)
// //       .json({ message: "Failed to send message", error: error.message });
// //   }
// // };


// export const sendMessage = async (req, res) => {
//   try {
//     const { roomId, content, messageType, receiverId } = req.body;
//     const senderId = req.user._id;

//     if (!senderId) {
//       return res.status(400).json({ message: "Sender not authorized" });
//     }

//     // Fetch the sender user from the database
//     const sender = await User.findById(senderId);

//     if (!sender) {
//       return res.status(404).json({ message: "Sender not found" });
//     }

//     if (sender.isActive!== true) {
//       return res.status(403).json({
//         message: "Your account is deactivated",
//         reason: sender.deactivationReason || "No reason provided",
//       });
//     }

//     const newMessage = new Message({
//       roomId,
//       senderId,
//       receiverId,
//       content,
//       messageType,
//     });

//     const savedMessage = await newMessage.save();

//     const populatedMessage = await savedMessage.populate(
//       "senderId",
//       "first_name avatar email role"
//     );

//     req.io.to(roomId).emit("message", populatedMessage);
//     res.status(201).json(populatedMessage);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Failed to send message", error: error.message });
//   }
// };

// // Delete a message
// export const deleteMessage = async (req, res) => {
//   try {
//     const { messageId } = req.params;

//     const result = await Message.deleteOne({ _id: messageId });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: "Message not found" });
//     }

//     const io = req.io;
//     if (io) {
//       io.emit("messageDeleted", { messageId });
//     }

//     return res.status(200).json({ message: "Message deleted successfully" });
//   } catch (error) {
//     console.error("Delete message error:", error);
//     return res.status(500).json({
//       message: "Failed to delete message",
//       error: error.message,
//     });
//   }
// };

// // Add this to your existing messageController.js
// export const getPrivateMessages = async (req, res) => {
//   const { userId } = req.params;
//   const currentUserId = req.user._id;

//   try {
//     const messages = await Message.find({
//       $or: [
//         { senderId: currentUserId, receiverId: userId },
//         { senderId: userId, receiverId: currentUserId }
//       ]
//     })
//     .sort({ createdAt: 1 })
//     .populate("senderId", "first_name avatar email role")
//     .populate("receiverId", "first_name avatar");

//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to load messages", error: error.message });
//   }
// };
// export const editMessage = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const { content } = req.body;

//     const message = await Message.findById(messageId);
//     if (message.senderId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     message.content = content;
//     message.edited = true;
//     const updatedMessage = await message.save();

//     req.io.to(message.roomId).emit("messageEdited", updatedMessage);
//     res.status(200).json(updatedMessage);
//   } catch (error) {
//     // error handling
//   }
// };
// import Message from "../models/Message.js";
// import User from "../models/User.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads/chat');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Error messages map
const errorMessages = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  MESSAGE_NOT_FOUND: "Message not found",
  INVALID_FILE_TYPE:
    "Invalid file type. Only images, documents and text files are allowed",
  FILE_TOO_LARGE: "File size exceeds 10MB limit",
  DEFAULT: "Something went wrong. Please try again later",
  NO_FILES: "No files uploaded",
  NO_ROOM: "Room ID is required",
};

// Multer configuration
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(errorMessages.INVALID_FILE_TYPE));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).array("files", 5); // Max 5 files

// Helper to populate sender with null checks
const populateSender = (query) => {
  return query.populate({
    path: "senderId",
    select: "first_name profile_picture email role isActive",
    transform: (doc) => {
      if (!doc) {
        return {
          _id: null,
          first_name: "Unknown User",
          avatar: null,
          role: "user",
          isActive: false,
        };
      }
      return {
        ...doc._doc,
        avatar: doc.profile_picture,
      };
    },
  });
};

// Get all messages for a room
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    let query = Message.find({ roomId }).sort({ createdAt: 1 });
    query = populateSender(query);
    const messages = await query.exec();

    res.status(200).json(messages);
  } catch (error) {
    handleErrorResponse(res, error);
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { roomId, content, messageType } = req.body;
    const senderId = req.user._id;

    if (!senderId) {
      return res.status(400).json({ message: "Sender ID is required" });
    }

    const sender = await User.findById(senderId);
    if (!sender || !sender.isActive) {
      return res.status(403).json({
        message: "Cannot send message",
        reason: sender ? "Account deactivated" : "User not found",
      });
    }

    const newMessage = new Message({
      roomId,
      senderId,
      content,
      messageType,
    });

    const savedMessage = await newMessage.save();
    const populatedMessage = await populateSender(
      Message.findById(savedMessage._id)
    ).exec();

    req.io.to(roomId).emit("message", populatedMessage);
    res.status(201).json(populatedMessage);
  } catch (error) {
    handleErrorResponse(res, error);
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: errorMessages.UNAUTHORIZED });
    }

    message.content = content;
    message.edited = true;
    const updatedMessage = await message.save();
    const populatedMessage = await populateSender(
      Message.findById(updatedMessage._id)
    ).exec();

    req.io.to(message.roomId).emit("messageEdited", populatedMessage);
    res.status(200).json(populatedMessage);
  } catch (error) {
    handleErrorResponse(res, error);
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: errorMessages.MESSAGE_NOT_FOUND });
    }

    // Allow deletion by sender or admin
    const isSender =
      message.senderId &&
      message.senderId.toString() === req.user._id.toString();
    if (!isSender && req.user.role !== "admin") {
      return res.status(403).json({ message: errorMessages.UNAUTHORIZED });
    }

    if (message.isFile) {
      const filePath = path.join(uploadDir, message.content);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Message.deleteOne({ _id: messageId });
    req.io.to(message.roomId).emit("messageDeleted", { messageId });
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    handleErrorResponse(res, error);
  }
};

// Upload files
export const uploadFiles = async (req, res) => {
  try {
    const { roomId } = req.body;
    const senderId = req.user._id;

    // Validate room ID
    if (!roomId) {
      return res.status(400).json({ message: errorMessages.NO_ROOM });
    }

    // Validate files
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: errorMessages.NO_FILES });
    }

    // Validate sender
    const sender = await User.findById(senderId);
    if (!sender || !sender.isActive) {
      return res.status(403).json({
        message: "Cannot upload files",
        reason: sender ? "Account deactivated" : "User not found",
      });
    }

    const messages = await Promise.all(
      req.files.map(async (file) => {
        // Create message document
        const newMessage = new Message({
          roomId,
          senderId,
          content: `/uploads/chat/${file.filename}`,
          messageType: "group",
          isFile: true,
          fileType: file.mimetype,
          originalFilename: file.originalname,
          fileSize: file.size
        });

        // Save message
        const savedMessage = await newMessage.save();
        
        // Populate sender details
        return await Message.findById(savedMessage._id)
          .populate({
            path: "senderId",
            select: "first_name profile_picture email role isActive"
          })
          .exec();
      })
    );

    // Emit socket events if socket.io is available
    if (req.io) {
      messages.forEach((message) => {
        req.io.to(roomId).emit("message", message);
      });
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({ 
      message: error.message || errorMessages.DEFAULT,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Error handler
const handleErrorResponse = (res, error) => {
  console.error("Error:", error);
  let message = errorMessages.DEFAULT;
  let status = 500;

  if (error.message.includes("unauthorized")) {
    message = errorMessages.UNAUTHORIZED;
    status = 401;
  } else if (error.message.includes("not found")) {
    message = errorMessages.MESSAGE_NOT_FOUND;
    status = 404;
  } else if (error.message.includes("file type")) {
    message = errorMessages.INVALID_FILE_TYPE;
    status = 400;
  } else if (error.message.includes("file size")) {
    message = errorMessages.FILE_TOO_LARGE;
    status = 400;
  }

  res.status(status).json({ message, error: error.message });
};