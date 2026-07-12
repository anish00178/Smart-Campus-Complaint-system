const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config(); // must be before any route requires

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost origin (any port) for development
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/complaints", require("./routes/complaints"));

app.get("/", (req, res) => res.json({ message: "Smart Campus API running" }));

const PORT = process.env.PORT || 5000;

// MongoDB Atlas connection event listeners
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected from MongoDB Atlas");
});

// Graceful shutdown — close DB connection when process ends
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,  // fail fast if Atlas unreachable
    socketTimeoutMS: 45000,          // close sockets after 45s of inactivity
  })
  .then(() => {
    console.log("MongoDB Atlas connected successfully");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB Atlas:", err.message);
    console.error("Check your MONGO_URI in .env and ensure your IP is whitelisted in Atlas.");
    process.exit(1);
  });
