import multer from "multer";

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 200000; // 200 KB

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export const cpUpload = upload.fields([
  { name: "desktop", maxCount: 1 },
  { name: "featured", maxCount: 1 },
  { name: "tablet", maxCount: 1 },
  { name: "mobile", maxCount: 1 },
]);
