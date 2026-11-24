import express from "express";
import { requireAdmin } from "../middleware/authMiddleware.js";
import {
  uploadMediaFile,
  getAllMediaFiles,
  deleteMediaFile,
} from "../controllers/mediaController.js";

const router = express.Router();

// media routes (admin)
router.get("/", getAllMediaFiles);
router.post("/upload", requireAdmin, uploadMediaFile);
router.delete("/:filename", requireAdmin, deleteMediaFile);

export default router;
