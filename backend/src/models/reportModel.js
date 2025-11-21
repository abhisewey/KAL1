import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },
    turfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turf",
      default: null,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_REVIEW", "RESOLVED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Reports", reportSchema);

export default Report;
