// src/socket/socketHandler.js
import Message from "../models/messageModel.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    // console.log("A user connected:", socket.id);

    // User joins a room
    // socket.on("joinRoom", ({ roomId }) => {
    //   console.log(`User ${socket.id} joined room: ${roomId}`);
    //   socket.join(roomId);
    // });
    socket.on("joinRoom", async ({ roomId }) => {
      try {
        socket.join(roomId);
        console.log(`${socket.id} joined ${roomId}`);

        // Send message history when joining
        const messages = await Message.find({ roomId })
          .sort({ createdAt: 1 })
          .limit(100);
        socket.emit("initialMessages", messages);
      } catch (err) {
        console.error("Join room error:", err);
      }
    });

    // Sending a message
    socket.on("sendMessage", async (data) => {
      // Extract and log each field for debugging
      const roomId = data.roomId;
      const userId = data.userId;
      const content = data.content;
      const messageType = data.messageType;
      const receiverId = data.receiverId;

      console.log("Extracted fields:");
      console.log("roomId:", roomId);
      console.log("userId:", userId);
      console.log("content:", content);
      console.log("messageType:", messageType);
      console.log("receiverId:", receiverId);

      try {
        // Create new message with all required fields
        const msg = new Message({
          roomId: roomId,
          senderId: userId, // Using userId as senderId
          receiverId: receiverId,
          content: content,
          messageType: messageType,
        });

        console.log("Message object before save:", msg);

        // Save to database
        const savedMessage = await msg.save();
        console.log("Message saved successfully:", savedMessage._id);

        // Broadcast to room
        io.to(roomId).emit("message", savedMessage);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("errorMessage", {
          message: "Failed to send message: " + error.message,
        });
      }
    });
    // Add this to your existing socketHandler.js
    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("typingResponse", {
        userId: data.userId,
        first_name: data.first_name,
        roomId: data.roomId,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};

export default socketHandler;
