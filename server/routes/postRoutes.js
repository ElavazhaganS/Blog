import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllBlogs,
  getBlogBySlug,
  getRelatedBlogs,
  getAdjacentBlogs,
  likeBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/postController.js";

const router = express.Router();

// public post routes
router.get("/", getAllBlogs);
router.get("/:slug/related", getRelatedBlogs);
router.get("/:slug/adjacent", getAdjacentBlogs);
router.post("/:slug/like", likeBlog);
router.get("/:slug", getBlogBySlug);

// protected post routes
router.post("/", authMiddleware, createBlog);
router.put("/:slug", authMiddleware, updateBlog);
router.delete("/:slug", authMiddleware, deleteBlog);

export default router;
