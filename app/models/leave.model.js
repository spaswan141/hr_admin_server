const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeId: {
      type: mongoose.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    designation: {
      type: String,
    },
    leaveDate: {
      type: Date,
      required: true,
    },
    document: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approve", "Reject"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Leaves", leaveSchema);
