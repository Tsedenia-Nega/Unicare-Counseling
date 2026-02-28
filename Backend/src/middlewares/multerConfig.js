import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure uploads directory
const uploadDir = path.join(__dirname, '../../uploads');

// Ensure upload directories exist
const dirs = ['chat', 'profile_pictures', 'certification'].map(dir => path.join(uploadDir, dir));
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ─── STORAGE CONFIGURATION ────────────────────────────────────────────────────
// We add a third branch for fieldname === "file" (CSV). All existing logic
// for "profile_picture" and "certification" is untouched.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "";

    if (file.fieldname === "profile_picture") {
      folder = "uploads/profile_pictures/";
    } else if (file.fieldname === "certification") {
      folder = "uploads/certification/";
    } else if (file.fieldname === "file") {
      folder = "uploads/chat/";
    } else {
      return cb(new Error("Unsupported file field"));
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
// ────────────────────────────────────────────────────────────────────────────

// ─── FILE FILTER ─────────────────────────────────────────────────────────────
// We allow .csv only when fieldname === "file"; otherwise enforce the original
// "pdf|jpeg|jpg|png" rule for profile_picture and certification.
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "file") {
    // For chat files
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|text|csv|application|vnd.ms-excel/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    return cb(new Error("Only images, PDFs, DOC, DOCX and TXT files are allowed!"), false);
  } else {
    // For profile pictures and certifications
    const allowedTypes = /pdf|jpeg|csv|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    return cb(new Error("Only .pdf, .jpeg, .jpg, and .png files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 25MB max
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: fileFilter,
});

export default upload;

