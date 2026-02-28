// middlewares/uploadResourceMiddleware.js
import multer from "multer";
import path from "path";

// Separate storage for resources
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resources/"); // Resource-specific folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|pdf|jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only .pdf, .jpeg, .jpg, and .png files are allowed!"));
  }
};

const uploadResource = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter,
});

export default uploadResource;
