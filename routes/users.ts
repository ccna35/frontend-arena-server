import { Router } from "express";
import {
  getAllUsers,
  getOneUser,
  login,
  logout,
  signup,
  updateUser,
} from "../controllers/users";
import { verifyToken } from "../util/token";
import {
  userLoginValidation,
  userSignUpValidation,
  userUpdateValidation,
} from "../middlewares/validation/users";

const router = Router();

// Signup
router.post("/signup", userSignUpValidation, signup);

// Login
router.post("/login", userLoginValidation, login);

// Logout
router.get("/logout", logout);

// Get a single user
router.get("/:id", getOneUser);

// Get all users
router.get("/", getAllUsers);

// Middleware
router.use(verifyToken);

// Update user route
router.put("/", userUpdateValidation, updateUser);

export default router;
