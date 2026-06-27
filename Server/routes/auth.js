const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");
require("dotenv").config();

const router = express.Router();

// Multer setup for ID card uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `idcard-${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const uploadIdCard = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = /jpeg|jpg|png|pdf/.test(file.mimetype);
    cb(ext && mime ? null : new Error("Only images and PDF allowed"), ext && mime);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register  — student registers as pending (isApproved: false)
router.post("/register", uploadIdCard.single("idCard"), async (req, res) => {
  const { name, email, password, rollNo, branch, semester } = req.body;
  if (!name || !email || !password || !rollNo || !branch || !semester)
    return res.status(400).json({ message: "All fields are required" });
  if (!req.file)
    return res.status(400).json({ message: "College ID card is required" });
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    if (rollNo) {
      const rollExists = await User.findOne({ rollNo });
      if (rollExists) return res.status(400).json({ message: "Roll number already registered" });
    }
    await User.create({
      name, email, password,
      rollNo: rollNo || null,
      branch,
      semester: Number(semester),
      isApproved: false,
      idCard: req.file.filename,
    });
    res.status(201).json({ message: "Registration successful! Please wait for admin approval before logging in." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/auth/admin/register  — requires ADMIN_SECRET, auto-approved
router.post("/admin/register", async (req, res) => {
  const { name, email, password, adminSecret } = req.body;
  if (!name || !email || !password || !adminSecret)
    return res.status(400).json({ message: "All fields are required" });
  const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin@campus2024";
  if (adminSecret.trim() !== ADMIN_SECRET.trim())
    return res.status(403).json({ message: "Invalid admin secret key" });
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password, role: "admin", rollNo: null, isApproved: true });
    res.status(201).json({
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Admin register error:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/auth/admin/login
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await user.matchPassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    if (user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Admin accounts only." });
    res.json({
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/auth/login  — blocks unapproved students
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await user.matchPassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    if (user.role === "student" && !user.isApproved)
      return res.status(403).json({ message: "Your account is pending admin approval. Please wait." });
    res.json({
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, rollNo: user.rollNo, branch: user.branch, semester: user.semester },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/auth/profile
router.get("/profile", protect, async (req, res) => {
  const u = req.user;
  res.json({ _id: u._id, name: u.name, email: u.email, role: u.role, rollNo: u.rollNo, branch: u.branch, semester: u.semester, createdAt: u.createdAt });
});

// PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  const { name, email, rollNo, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: "Current password is required to set a new one" });
      const match = await user.matchPassword(currentPassword);
      if (!match)
        return res.status(400).json({ message: "Current password is incorrect" });
      user.password = newPassword;
    }
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }
    if (name) user.name = name;
    if (rollNo !== undefined) user.rollNo = rollNo;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, rollNo: user.rollNo });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/auth/admin/students/pending  — admin only
router.get("/admin/students/pending", protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: "student", isApproved: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/auth/admin/students/all  — admin only
router.get("/admin/students/all", protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/auth/admin/students/:id/approve  — admin only
router.put("/admin/students/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Student not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/auth/admin/students/:id/reject  — admin only (delete account)
router.delete("/admin/students/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student registration rejected and removed." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;