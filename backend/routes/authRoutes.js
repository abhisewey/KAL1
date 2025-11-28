import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/signup", upload.single("profilePic"), registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getProfile);

export default router;
