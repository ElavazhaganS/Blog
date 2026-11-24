import Category, { slugify } from "../models/Category.js";
import Post from "../models/Post.js";

// get all categories
export async function getAllCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    const counts = await Post.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    for (const c of counts) {
      if (c._id) {
        countMap.set(String(c._id).toLowerCase(), c.count);
      }
    }

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      articleCount:
        countMap.get(cat.slug.toLowerCase()) ||
        countMap.get(cat.name.toLowerCase()) ||
        0,
    }));

    return res.status(200).json(categoriesWithCount);
  } catch (error) {
    return res.status(500).json({ message: "Could not load categories" });
  }
}

// get category by slug
export async function getCategoryBySlug(req, res) {
  try {
    const slug = req.params.slug.toLowerCase();
    const category = await Category.findOne({ slug }).lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

    const filter = {
      $or: [
        { category: category.name },
        { category: category.slug },
        { category: new RegExp(`^${category.name}$`, "i") },
      ],
      $and: [
        {
          $or: [
            { status: "published" },
            { status: { $exists: false } },
            { status: "scheduled", scheduledAt: { $lte: new Date() } },
          ],
        },
      ],
    };

    const [blogs, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "username avatar bio role")
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      category,
      blogs,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not load category" });
  }
}

// create category (admin)
export async function createCategory(req, res) {
  try {
    const { name, description, coverImage } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const trimmedName = String(name).trim();
    const slug = req.body?.slug ? slugify(String(req.body.slug)) : slugify(trimmedName);

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: trimmedName,
      slug,
      description: description ? String(description).trim() : "",
      coverImage: coverImage ? String(coverImage) : "",
    });

    return res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Could not create category" });
  }
}

// update category (admin)
export async function updateCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name, description, coverImage } = req.body || {};
    if (name) category.name = String(name).trim();
    if (req.body?.slug) category.slug = slugify(String(req.body.slug));
    if (description !== undefined) category.description = String(description).trim();
    if (coverImage !== undefined) category.coverImage = String(coverImage);

    await category.save();
    return res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Could not update category" });
  }
}

// delete category (admin)
export async function deleteCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete category" });
  }
}
