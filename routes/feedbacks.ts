import { Router } from "express";
import { verifyToken } from "../util/token";
import {
  feedbackUpdateValidation,
  feedbackValidation,
} from "../middlewares/validation/feedbacks";
import {
  createFeedback,
  deleteFeedback,
  getAllFeedbacks,
  getAllFeedbacksBySubmission,
  getOneFeedback,
  updateFeedback,
} from "../controllers/feedbacks";

const router = Router();

// Get all Feedbacks By Submission
router.get("/", getAllFeedbacksBySubmission);

// Get all Feedbacks
router.get("/all", getAllFeedbacks);

// Get by ID
router.get("/:id", getOneFeedback);

// Middleware
router.use(verifyToken);

// Add new Feedback
router.post("/", feedbackValidation, createFeedback);

// Update by ID
router.put("/:id", feedbackUpdateValidation, updateFeedback);

// Delete by ID
router.delete("/:id", deleteFeedback);

export default router;
