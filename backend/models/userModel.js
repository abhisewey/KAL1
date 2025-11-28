import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim:true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim:true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "PARTNER"],
      default: "USER",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
