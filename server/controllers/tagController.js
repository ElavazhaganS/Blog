import Tag from "../models/Tag.js";
import Post from "../models/Post.js";

// get all tags
export async function getAllTags(req, res) {
  try {
    const tags = await Tag.find().sort({ name: 1 }).lean();
    return res.status(200).json(
      tags.map((tag) => ({ name: tag.name, slug: tag.slug }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Could not load tags" });
  }
}

// get single tag with posts
export async function getTagWithBlogs(req, res) {
  try {
    const tagSlug = req.params.slug.toLowerCase();

    const [tag, blogs] = await Promise.all([
      Tag.findOne({ slug: tagSlug }).lean(),
      Post.find({ tags: tagSlug })
        .populate("author", "username avatar bio")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!tag && blogs.length === 0) {
      return res.status(404).json({ message: "Tag not found" });
    }

    return res.status(200).json({ tag, blogs });
  } catch (error) {
    return res.status(500).json({ message: "Could not load the tag" });
  }
}

// create tag
export async function createTag(req, res) {
  try {
    const { name } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const slug = String(name).trim().toLowerCase().replace(/\s+/g, "-");
    const existing = await Tag.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    const tag = await Tag.create({ name: slug, slug });
    return res.status(201).json({
      message: "Tag created successfully",
      tag: { name: tag.name, slug: tag.slug },
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not create tag" });
  }
}

// delete tag
export async function deleteTag(req, res) {
  try {
    const slug = req.params.slug.toLowerCase();
    const tag = await Tag.findOne({ slug });
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    await Tag.deleteOne({ _id: tag._id });
    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete tag" });
  }
}
