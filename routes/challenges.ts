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
import { cpUpload, upload } from "../util/multer";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
// require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

const router = Router();

// Add new Challenge
// router.post("/", createChallenge);

async function handleUpload(file: string) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
    format: "webp",
  });
  return res;
}

router.post("/", upload.any(), async function (req, res) {
  const files = req.files as Express.Multer.File[];

  const image_URLs: { type: string; url: string }[] = [];

  await Promise.all(
    files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      let dataURI = "data:" + file.mimetype + ";base64," + b64;
      const res = await cloudinary.uploader.upload(dataURI, {
        resource_type: "image",
        format: "webp",
      });
      image_URLs.push({ type: file.fieldname, url: res.secure_url });
    })
  );

  console.log(image_URLs);

  res.send("Done");
});

// Middleware
router.use(verifyToken);

// Get all Challenges
router.get("/", getAllChallenges);

// Get by ID
router.get("/single/:id", getOneChallenge);

// Update by ID
router.put("/:id", updateChallenge);

// Delete by ID
router.delete("/:id", deleteChallenge);

export default router;
