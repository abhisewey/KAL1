import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    turrfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turf",
      required: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    turfType: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    perPersonPrice: {
      type: Number,
      required: true,
    },
    playerLimit: {
      type: Number,
      required: true,
    },
    reservedByHost: {
      type: Number,
      default: 0,
    },
    confirmedPlayer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    advancePaid: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["OPEN", "FULL", "CANCELLED", "COMPLETED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);

export default Match;
