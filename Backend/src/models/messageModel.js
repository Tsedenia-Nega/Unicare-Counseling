// src/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ["private", "group"],
    required: true,
  },
  isFile: {
    type: Boolean,
    default: false
  },
  fileType: {
    type: String,
    required: function() {
      return this.isFile;
    }
  },
  originalFilename: {
    type: String,
    required: function() {
      return this.isFile;
    }
  },
  fileSize: {
    type: Number,
    required: function() {
      return this.isFile;
    }
  },
  edited: {
    type: Boolean,
    default: false,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
