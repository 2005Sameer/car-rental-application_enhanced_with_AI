// Disk storage for car photos. Files land in <server>/uploads/cars and are
// served back out via express.static in index.js at /uploads/cars/<file>.
// Swapping this for S3/Cloudinary later means changing this file and the
// two controllers that call it — nothing else references the filesystem.
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CARS_UPLOAD_DIR = path.join(__dirname, "../../uploads/cars");
fs.mkdirSync(CARS_UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CARS_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${nanoid(14)}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    const err = new Error("Only JPEG, PNG, or WebP images are allowed");
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
}

export const carImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export function deleteCarImageFile(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/cars/")) return;
  const filename = path.basename(imageUrl);
  fs.unlink(path.join(CARS_UPLOAD_DIR, filename), () => {
    // Best-effort cleanup — a missing file here isn't worth failing the request over.
  });
}
