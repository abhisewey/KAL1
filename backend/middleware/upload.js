import multer from "multer";
import path from "path";

// Setup storage config
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/"); // <-- folder where file will be saved
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});

export const upload = multer({ storage });
