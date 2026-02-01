// backend/server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dutyRoutes from "./routes/dutyRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js"; 
import withdrawalRoutes from "./routes/withdrawalRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not defined in .env file");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Log environment configuration
console.log("Environment Configuration:");
console.log(`- PORT: ${process.env.PORT || 5000}`);
console.log(`- MONGO_URI: ${process.env.MONGO_URI ? '✓ Set' : '✗ Missing'}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Missing'}`);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(err => console.error(err));

// Create HTTP + WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store connected users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("registerUser", (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// Make io accessible in routes/controllers
app.set("io", io);
app.set("onlineUsers", onlineUsers);

// Routes - IMPORTANT: Ensure leaveRoutes is mounted
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/duties", dutyRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/leaves", leaveRoutes); // This line must exist
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/attendance", attendanceRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});