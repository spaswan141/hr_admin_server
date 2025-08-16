const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      enum: ["Designer", "Developer", "Human Resource"],
      required: true,
      trim: true,
    },
    employeeType: {
      type: String,
      enum: ["Intern", "Full Time", "Junior", "Senior", "Manager"],
    },
    joiningDate: {
      type: Date,
    },
    status: {
      type: String,
      default: "New",
      enum: ["New", "Schedule", "Ongoing", "Selected", "Rejected"],
    },
    employeeAttendanceStatus: {
      type: String,
      default: "Present",
      enum: ["Present", "Absent", "Medical Leave", "Work From Home"],
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    resume: {
      type: String, // could be file path or URL
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Candidate", candidateSchema);
