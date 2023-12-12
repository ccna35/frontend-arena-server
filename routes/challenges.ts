import { Router } from "express";
import {
  createChallenge,
  deleteChallenge,
  getAllChallenges,
  getOneChallenge,
  updateChallenge,
} from "../controllers/challenges";
import { verifyToken } from "../util/token";
import dotenv from "dotenv";
import { upload } from "../util/multer";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

const router = Router();

// Add new Challenge
// router.post("/", createChallenge);

// async function handleUpload(file: string) {
//   const res = await cloud.uploader.upload(file, {
//     resource_type: "auto",
//     format: "webp",
//   });
//   return res;
// }

// Add new Challenge
router.post("/", upload.any(), createChallenge);

// Update by ID
router.put("/:id", upload.any(), updateChallenge);

// Get all Challenges
router.get("/", getAllChallenges);

// Get by ID
router.get("/:id", getOneChallenge);

// Delete by ID
router.delete("/:id", deleteChallenge);

// Middleware
router.use(verifyToken);

export default router;
