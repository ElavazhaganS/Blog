import express from "express";
import authMiddleware, { requireAdmin } from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserProfile,
  updateUserRole,
  deleteUser,
} from "../controllers/authController.js";

const router = express.Router();

// public auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// protected user routes
router.get("/me", authMiddleware, getCurrentUser);
router.get("/", authMiddleware, getAllUsers);

// admin only routes
router.put("/:id/role", requireAdmin, updateUserRole);
router.delete("/:id", requireAdmin, deleteUser);

// public profile
router.get("/:username", getUserProfile);

export default router;
