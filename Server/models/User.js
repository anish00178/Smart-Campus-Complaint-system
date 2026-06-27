const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    rollNo:     { type: String, trim: true, default: null, sparse: true },
    branch:     { type: String, enum: ["CSE", "CE", "ETE", "ME"], default: null },
    semester:   { type: Number, min: 1, max: 8, default: null },
    role:       { type: String, enum: ["student", "admin"], default: "student" },
    isApproved: { type: Boolean, default: false },
    idCard:     { type: String, default: null },  // uploaded filename
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
