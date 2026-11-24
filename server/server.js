import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";

// database config and seed functions
import {
  connectDB,
  seedCategories,
  seedDefaultAdmin,
  startPostScheduler,
} from "./config/db.js";

// routes
import postRoutes from "./routes/postRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import Post from "./models/Post.js";
import Category from "./models/Category.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const isProduction = process.env.NODE_ENV === "production";

// enable cors
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || true,
    credentials: true,
  })
);

// body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// serve uploaded files
const uploadsPath = path.resolve(process.cwd(), "public/uploads");
app.use("/uploads", express.static(uploadsPath));

// health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "down",
  });
});

// sitemap
app.get("/sitemap.xml", async (req, res) => {
  try {
    const protocol = req.protocol;
    const host = req.get("host") || `localhost:${PORT}`;
    const baseUrl = `${protocol}://${host}`;

    const [blogs, categories] = await Promise.all([
      Post.find({ status: "published" }).select("slug updatedAt createdAt").lean(),
      Category.find().select("slug updatedAt").lean(),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    for (const cat of categories) {
      xml += `  <url>\n    <loc>${baseUrl}/category/${cat.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    for (const blog of blogs) {
      const lastMod = blog.updatedAt || blog.createdAt || new Date();
      xml += `  <url>\n    <loc>${baseUrl}/blog/${blog.slug}</loc>\n    <lastmod>${new Date(lastMod).toISOString().split("T")[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    return res.status(200).send(xml);
  } catch (error) {
    return res.status(500).send("Error generating sitemap");
  }
});

// robots.txt
app.get("/robots.txt", (req, res) => {
  const protocol = req.protocol;
  const host = req.get("host") || `localhost:${PORT}`;
  const sitemapUrl = `${protocol}://${host}/sitemap.xml`;
  const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${sitemapUrl}\n`;
  res.header("Content-Type", "text/plain");
  return res.status(200).send(robots);
});

// mount routes (supports both /api/posts and /api/blogs, /api/auth and /api/users)
app.use("/api/posts", postRoutes);
app.use("/api/blogs", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/admin", adminRoutes);

// fallback 404
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// serve frontend in production
if (isProduction) {
  const clientBuildPath = path.resolve(process.cwd(), "../client/dist");
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// start server
async function startServer() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Please check your .env file.");
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set. Please check your .env file.");
    process.exit(1);
  }

  await connectDB(MONGODB_URI);
  await seedCategories();
  await seedDefaultAdmin();
  startPostScheduler();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

export default app;
