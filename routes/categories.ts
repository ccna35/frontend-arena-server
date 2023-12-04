import { Router } from "express";
import { verifyToken } from "../util/token";
import dotenv from "dotenv";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategoryName,
} from "../controllers/categories";
dotenv.config();

const router = Router();

// Middleware
router.use(verifyToken);

//Add new categories
router.post("/", createCategory);

// Get all notes created by a specific user
router.get("/", getAllCategories);

//Update by ID
router.put("/:id", updateCategoryName);

//Delete by ID
router.delete("/:id", deleteCategory);

export default router;
