import mongoose from "mongoose";
import Category from "../models/Category.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// default categories to seed
const DEFAULT_CATEGORIES = [
  {
    name: "Software Development",
    slug: "software-development",
    description: "Practical guides, clean architecture patterns, code craft, and software engineering deep dives.",
  },
  {
    name: "Artificial Intelligence & Machine Learning",
    slug: "artificial-intelligence-machine-learning",
    description: "Exploring LLMs, neural networks, computer vision, AI agents, and enterprise machine learning.",
  },
  {
    name: "Web and Mobile App Development",
    slug: "web-and-mobile-app-development",
    description: "Modern full-stack web platforms, mobile frameworks, React, Node.js, and performant user experiences.",
  },
  {
    name: "Technology & Innovation",
    slug: "technology-innovation",
    description: "Breakthrough developments, emerging paradigms, open-source revolutions, and technology strategy.",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "Application security, network defense, zero-trust infrastructure, and vulnerability remediation.",
  },
  {
    name: "Cloud Computing",
    slug: "cloud-computing",
    description: "Cloud-native architectures, Kubernetes, microservices, DevOps pipelines, and serverless computing.",
  },
  {
    name: "Industry Insights",
    slug: "industry-insights",
    description: "Strategic analyses, digital transformation case studies, developer culture, and engineering leadership.",
  },
];

// connect to mongodb
export async function connectDB(mongoUri) {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

// seed categories if database is empty
export async function seedCategories() {
  try {
    for (const category of DEFAULT_CATEGORIES) {
      await Category.updateOne(
        { slug: category.slug },
        { $setOnInsert: category },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error("Warning: Could not seed categories:", error);
  }
}

// seed default admin account
export async function seedDefaultAdmin() {
  try {
    const adminEmail = (
      process.env.DEFAULT_ADMIN_EMAIL || "admin@gmail.com"
    ).toLowerCase().trim();
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin@1234";

    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { username: "admin" }],
    }).select("+password");

    if (!existingAdmin) {
      await User.create({
        username: "admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        bio: "System Administrator & Lead Editorial Director",
      });
      console.log(`[Seed] Initialized pre-configured admin account (${adminEmail})`);
    } else {
      let isUpdated = false;

      if (existingAdmin.email !== adminEmail) {
        existingAdmin.email = adminEmail;
        isUpdated = true;
      }

      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        isUpdated = true;
      }

      const isPasswordMatch = await existingAdmin.comparePassword(adminPassword);
      if (!isPasswordMatch) {
        existingAdmin.password = adminPassword;
        isUpdated = true;
      }

      if (isUpdated) {
        await existingAdmin.save();
        console.log(`[Seed] Synchronized pre-configured admin account (${adminEmail})`);
      }
    }
  } catch (error) {
    console.error("Warning: Could not seed admin account:", error);
  }
}

// scheduler to publish scheduled posts
export function startPostScheduler() {
  setInterval(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        const currentTime = new Date();
        const updateResult = await Post.updateMany(
          {
            status: "scheduled",
            scheduledAt: { $lte: currentTime },
          },
          {
            $set: {
              status: "published",
              publishedAt: currentTime,
            },
          }
        );

        if (updateResult.modifiedCount > 0) {
          console.log(`[Scheduler] Published ${updateResult.modifiedCount} scheduled post(s).`);
        }
      }
    } catch (error) {
      console.error("[Scheduler] Error publishing scheduled posts:", error);
    }
  }, 60000);
}
