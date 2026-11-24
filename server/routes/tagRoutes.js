import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllTags,
  getTagWithBlogs,
  createTag,
  deleteTag,
} from "../controllers/tagController.js";

const router = express.Router();

// public tag routes
router.get("/", getAllTags);
router.get("/:slug/blogs", getTagWithBlogs);

// protected tag routes
router.post("/", authMiddleware, createTag);
router.delete("/:slug", authMiddleware, deleteTag);

export default router;
