import { Router } from "express";
import { quickStats } from "../controllers/dashboard";

const router = Router();

// Get quick stats like number of users, challenges, feedbacks and so on...
router.get("/", quickStats);

export default router;
