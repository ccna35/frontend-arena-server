import { Router } from "express";
import { verifyToken } from "../util/token";
import {
  createSubmission,
  deleteSubmission,
  getAllSubmissions,
  getOneSubmission,
  updateSubmission,
} from "../controllers/submissions";
import { submissionValidation } from "../middlewares/validation/submissions";

const router = Router();

// Get all Submissions
router.get("/", getAllSubmissions);

// Get by ID
router.get("/:id", getOneSubmission);

// Middleware
router.use(verifyToken);

// Add new Submission
router.post("/", submissionValidation, createSubmission);

// Update by ID
router.put("/:id", submissionValidation, updateSubmission);

// Delete by ID
router.delete("/:id", deleteSubmission);

export default router;
