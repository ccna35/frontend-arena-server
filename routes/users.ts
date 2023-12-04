import { Request, Response, Router } from "express";
import {
  getAllUsers,
  getOneUser,
  login,
  logout,
  signup,
  updateUser,
} from "../controllers/users";
import { verifyToken } from "../util/token";

const router = Router();

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

// Logout
router.get("/logout", logout);

// Middleware
router.use(verifyToken);

// Get a single user
router.get("/:id", verifyToken, getOneUser);

// Get all users
router.get("/", verifyToken, getAllUsers);

// Update user route
router.put("/:id", verifyToken, updateUser);

export default router;
