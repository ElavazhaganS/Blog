import express from "express";
import { requireAdmin } from "../middleware/authMiddleware.js";
import {
  getAllAuthors,
  getAuthorByIdOrSlug,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../controllers/authorController.js";

const router = express.Router();

// public author routes
router.get("/", getAllAuthors);
router.get("/:id", getAuthorByIdOrSlug);

// admin only author routes
router.post("/", requireAdmin, createAuthor);
router.put("/:id", requireAdmin, updateAuthor);
router.delete("/:id", requireAdmin, deleteAuthor);

export default router;
