import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// public category routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// protected category routes
router.post("/", authMiddleware, createCategory);
router.put("/:id", authMiddleware, updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);

export default router;
