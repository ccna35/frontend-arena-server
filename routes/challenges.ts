import { Router } from "express";
import {
  createChallenge,
  deleteChallenge,
  getAllChallenges,
  getOneChallenge,
  updateChallenge,
} from "../controllers/challenges";
import { verifyToken } from "../util/token";
import { upload } from "../util/multer";
import { challengeValidation } from "../middlewares/validation/challenges";

const router = Router();

// Add new Challenge
router.post("/", upload.any(), challengeValidation, createChallenge);

// Update by ID
router.put("/:id", upload.any(), challengeValidation, updateChallenge);

// Get all Challenges
router.get("/", getAllChallenges);

// Get by ID
router.get("/:id", getOneChallenge);

// Delete by ID
router.delete("/:id", deleteChallenge);

export default router;
