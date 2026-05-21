import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import venueRoutes from "./routes/venueRoutes.js";

// ── Load environment variables & connect to MongoDB ──────────
dotenv.config();
connectDB();

const app = express();

// ── Global middleware ────────────────────────────────────────
// Parse JSON bodies — increased limit for bulk venue seed payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// HTTP request logging (dev-friendly coloured output)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Serve static uploads
app.use("/uploads", express.static("uploads"));

// ── API Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/venues", venueRoutes);

// ── Health check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
