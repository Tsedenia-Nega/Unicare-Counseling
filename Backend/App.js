import express from "express";
import { Server } from "socket.io";
import http from "http"; // import http to create server
import connectDB from "./src/config/db.js";
import socketHandler from "./src/socket/socketHandler.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js"
import counselorRoutes from "./src/routes/counselorRoutes.js";
import headCounselorRoutes from "./src/routes/headCounselorRoutes.js";
import availabilityRoutes from "./src/routes/availabilityRoutes.js";
import appointmentRoutes from "./src/routes/appointmentRoutes.js"
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import moodRoutes from "./src/routes/moodRoutes.js";
import recommendationRoutes from "./src/routes/recommendationRoutees.js";
import reports from "./src/routes/reports.js"
import resourceRoutes from "./src/routes/resourceRoutes.js";
import "./src/services/updateAppointment.js";
import urgentRequestRoutes from "./src/routes/urgentRequestRoutes.js"
 
dotenv.config();
const frontendUrl = process.env.FRONTEND_URL ;
const app= express();
const server = http.createServer(app);
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: frontendUrl, // Your frontend URL
    methods: ["GET", "POST", "PUT", "PATCH","DELETE"],
    credentials: true,
  })
); 
const io = new Server(server, {
  cors: {
    origin: frontendUrl, // <-- your frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("io", io);
// Middleware to attach io to requests
socketHandler(io);
app.use(express.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// app.use("/uploads", express.static("uploads"));
// app.use(
//   "/uploads/resources",
//   express.static(path.join(__dirname, "uploads/resources"))
// );
const path = require("path");

// 1. Root uploads folder
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.set(
        "Access-Control-Allow-Origin",
        frontendUrl,
      );
    },
  }),
);

// 2. Resources sub-folder
app.use(
  "/uploads/resources",
  express.static(path.join(__dirname, "uploads/resources"), {
    setHeaders: (res) => {
      res.set(
        "Access-Control-Allow-Origin",
        frontendUrl,
      );
    },
  }),
);
app.use("/api/moods", moodRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/reports", reports);
// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Mood Tracker API is running" });
});
app.use('/api/auth',authRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/request", urgentRequestRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/head-counselor", headCounselorRoutes);
app.use(
  "/api/messages",
  (req, res, next) => {
    req.io = io; // attach io to request
    next();
  },
  messageRoutes
);
app.use("/api/resources", resourceRoutes);
app.use("/api/users", userRoutes);

app.post("/dialogflow-webhook", async (req, res) => {
  try {
    const response = await axios.post(
      "https://dialogflow.cloud.google.com/v1/integrations/messenger/webhook/projects/unicarefaqbot-wcke/agent/sessions/dfMessenger-48440529",
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error processing request" });
  }
});
app.get("/", (req, res) => {
  res.send("we are building Unicare");
});
connectDB();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running in port ${PORT}`)); // <-- now server.listen, not app.listen