import { Router } from "express";
import {
  createNote,
  deleteNote,
  getAllNotes,
  getAllNotesByUser,
  getNotesByCategory,
  getOneNote,
  updateNote,
} from "../controllers/notes";
import { verifyToken } from "../util/token";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

// Middleware
router.use(verifyToken);

// Add new note
router.post("/", createNote);

// Get all notes
router.get("/", getAllNotes);

// Get all notes added by a specific user
router.get("/:id", getAllNotesByUser);

// Get all notes that are connected to a specific category
router.get("/category/:id", getNotesByCategory);

// Get by ID
router.get("/single/:id", getOneNote);

// Update by ID
router.put("/:id", updateNote);

// Delete by ID
router.delete("/:id", deleteNote);

export default router;
