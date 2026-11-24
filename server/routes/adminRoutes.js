import express from "express";
import { requireAdmin } from "../middleware/authMiddleware.js";
import { getAdminStats } from "../controllers/adminController.js";

const router = express.Router();

// admin stats
router.get("/stats", requireAdmin, getAdminStats);

export default router;
