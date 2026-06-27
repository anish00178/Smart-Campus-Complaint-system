const express = require("express");
const multer = require("multer");
const path = require("path");
const Complaint = require("../models/Complaint");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(ext && mime ? null : new Error("Images only"), ext && mime);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// GET /api/complaints
router.get("/", protect, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    const complaints = await Complaint.find(filter)
      .populate("user", "name email rollNo")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/complaints
router.post("/", protect, upload.single("image"), async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description)
    return res.status(400).json({ message: "Title and description are required" });
  try {
    const complaint = await Complaint.create({
      title,
      description,
      image: req.file ? req.file.filename : null,
      user: req.user._id,
    });
    await complaint.populate("user", "name email rollNo");
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/complaints/admin/stats  (admin only)
router.get("/admin/stats", protect, adminOnly, async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate("user", "name email rollNo");

    // unique students from complaints
    const studentMap = {};
    complaints.forEach((c) => {
      if (!c.user) return;
      const id = c.user._id.toString();
      if (!studentMap[id]) {
        studentMap[id] = {
          _id: id,
          name: c.user.name,
          email: c.user.email,
          rollNo: c.user.rollNo,
          total: 0, pending: 0, resolved: 0, rejected: 0,
        };
      }
      studentMap[id].total++;
      studentMap[id][c.status] = (studentMap[id][c.status] || 0) + 1;
    });

    res.json({
      totalComplaints: complaints.length,
      totalStudents: Object.keys(studentMap).length,
      pending:  complaints.filter((c) => c.status === "pending").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
      rejected: complaints.filter((c) => c.status === "rejected").length,
      perStudent: Object.values(studentMap),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/complaints/:id  (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!["pending", "resolved", "rejected"].includes(status))
    return res.status(400).json({ message: "Invalid status value" });
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email rollNo");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
