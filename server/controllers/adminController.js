import Post from "../models/Post.js";
import Category from "../models/Category.js";
import Author from "../models/Author.js";

// get dashboard stats
export async function getAdminStats(req, res) {
  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      scheduledArticles,
      totalCategories,
      totalAuthors,
      recentCreated,
      recentPublished,
      upcomingScheduled,
    ] = await Promise.all([
      Post.countDocuments({}),
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      Post.countDocuments({ status: "scheduled" }),
      Category.countDocuments({}),
      Author.countDocuments({}),
      Post.find({})
        .populate("author", "username avatar")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Post.find({ status: "published" })
        .populate("author", "username avatar")
        .sort({ publishedAt: -1 })
        .limit(5)
        .lean(),
      Post.find({ status: "scheduled" })
        .populate("author", "username avatar")
        .sort({ scheduledAt: 1 })
        .limit(5)
        .lean(),
    ]);

    return res.status(200).json({
      totalArticles,
      publishedArticles,
      draftArticles,
      scheduledArticles,
      totalCategories,
      totalAuthors,
      recentCreated,
      recentPublished,
      upcomingScheduled,
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not retrieve admin stats" });
  }
}
