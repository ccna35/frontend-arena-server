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
dotenv.config();

const router = Router();

// Middleware
router.use(verifyToken);

// Add new note
router.post("/", createChallenge);

// Get all notes
router.get("/", getAllChallenges);

// Get by ID
router.get("/single/:id", getOneChallenge);

// Update by ID
router.put("/:id", updateChallenge);

// Delete by ID
router.delete("/:id", deleteChallenge);

export default router;
