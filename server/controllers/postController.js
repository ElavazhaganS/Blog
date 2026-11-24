import Post, { slugify } from "../models/Post.js";
import User from "../models/User.js";
import Tag from "../models/Tag.js";

// helper to clean tag names
function cleanTags(tagsInput) {
  if (!Array.isArray(tagsInput)) return [];
  const uniqueTags = new Set(
    tagsInput
      .map((tag) => String(tag).trim().toLowerCase().replace(/\s+/g, "-"))
      .filter(Boolean)
  );
  return Array.from(uniqueTags).slice(0, 10);
}

// helper to save tags to database
async function saveTagsToDatabase(tagsList) {
  await Promise.all(
    tagsList.map((tagSlug) =>
      Tag.updateOne(
        { slug: tagSlug },
        { $setOnInsert: { slug: tagSlug, name: tagSlug } },
        { upsert: true }
      )
    )
  );
}

// 1. get all posts with search, filter, pagination
export async function getAllBlogs(req, res) {
  try {
    const pageNumber = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.limit) || 9));

    const filterCriteria = {};

    // status filter
    const statusParam = String(req.query.status || "").trim().toLowerCase();
    if (statusParam === "all") {
      // return all posts
    } else if (statusParam === "draft") {
      filterCriteria.status = "draft";
    } else if (statusParam === "scheduled") {
      filterCriteria.status = "scheduled";
    } else if (statusParam === "published") {
      filterCriteria.status = "published";
    } else {
      // public view: only published
      filterCriteria.$or = [
        { status: "published" },
        { status: { $exists: false } },
        { status: "scheduled", scheduledAt: { $lte: new Date() } },
      ];
    }

    // category filter
    const categoryParam = String(req.query.category || "").trim();
    if (categoryParam) {
      filterCriteria.$and = filterCriteria.$and || [];
      filterCriteria.$and.push({
        $or: [
          { category: new RegExp(`^${categoryParam}$`, "i") },
          { category: slugify(categoryParam) },
        ],
      });
    }

    // tag filter
    const tagParam = String(req.query.tag || "").trim().toLowerCase();
    if (tagParam) {
      filterCriteria.tags = tagParam;
    }

    // author filter
    const authorParam = String(req.query.author || "").trim();
    if (authorParam) {
      if (authorParam.match(/^[0-9a-fA-F]{24}$/)) {
        filterCriteria.author = authorParam;
      } else {
        const foundUser = await User.findOne({ username: authorParam });
        if (foundUser) {
          filterCriteria.author = foundUser._id;
        }
      }
    }

    // featured filter
    if (req.query.featured === "true") {
      filterCriteria.isFeatured = true;
    }

    // search keyword in title, description, tags, category
    const searchParam = String(req.query.search || "").trim();
    if (searchParam) {
      const escapedPattern = new RegExp(
        searchParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      const searchOptions = [
        { title: escapedPattern },
        { description: escapedPattern },
        { tags: escapedPattern },
        { category: escapedPattern },
      ];

      if (filterCriteria.$or) {
        filterCriteria.$and = filterCriteria.$and || [];
        filterCriteria.$and.push({ $or: searchOptions });
      } else {
        filterCriteria.$or = searchOptions;
      }
    }

    // sorting
    let sortOptions = { publishedAt: -1, createdAt: -1 };
    const sortParam = String(req.query.sort || "").trim();
    if (sortParam === "createdAt:desc") sortOptions = { createdAt: -1 };
    else if (sortParam === "createdAt:asc") sortOptions = { createdAt: 1 };
    else if (sortParam === "publishedAt:asc") sortOptions = { publishedAt: 1 };
    else if (sortParam === "title:asc") sortOptions = { title: 1 };
    else if (sortParam === "title:desc") sortOptions = { title: -1 };

    const [blogs, totalArticles] = await Promise.all([
      Post.find(filterCriteria)
        .populate("author", "username avatar bio role")
        .sort(sortOptions)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Post.countDocuments(filterCriteria),
    ]);

    return res.status(200).json({
      blogs,
      total: totalArticles,
      page: pageNumber,
      totalPages: Math.max(1, Math.ceil(totalArticles / pageSize)),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not load articles" });
  }
}

// 2. get single post by slug
export async function getBlogBySlug(req, res) {
  try {
    const blog = await Post.findOne({ slug: req.params.slug })
      .populate("author", "username avatar bio role")
      .lean();

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(200).json(blog);
  } catch (error) {
    return res.status(500).json({ message: "Could not load the article" });
  }
}

// 3. get related posts
export async function getRelatedBlogs(req, res) {
  try {
    const currentBlog = await Post.findOne({ slug: req.params.slug }).lean();
    if (!currentBlog) {
      return res.status(404).json({ message: "Article not found" });
    }

    const publicFilter = {
      _id: { $ne: currentBlog._id },
      $or: [
        { status: "published" },
        { status: { $exists: false } },
        { status: "scheduled", scheduledAt: { $lte: new Date() } },
      ],
      $and: [
        {
          $or: [
            { category: currentBlog.category },
            { tags: { $in: currentBlog.tags || [] } },
          ],
        },
      ],
    };

    let relatedBlogs = await Post.find(publicFilter)
      .populate("author", "username avatar bio")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(4)
      .lean();

    if (relatedBlogs.length < 3) {
      const excludedIds = [currentBlog._id, ...relatedBlogs.map((b) => b._id)];
      const fallbackBlogs = await Post.find({
        _id: { $nin: excludedIds },
        status: "published",
      })
        .populate("author", "username avatar bio")
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(4 - relatedBlogs.length)
        .lean();

      relatedBlogs = [...relatedBlogs, ...fallbackBlogs];
    }

    return res.status(200).json(relatedBlogs);
  } catch (error) {
    return res.status(500).json({ message: "Could not load related articles" });
  }
}

// 4. get previous and next posts
export async function getAdjacentBlogs(req, res) {
  try {
    const currentBlog = await Post.findOne({ slug: req.params.slug }).lean();
    if (!currentBlog) {
      return res.status(404).json({ message: "Article not found" });
    }

    const orderDate = currentBlog.publishedAt || currentBlog.createdAt;

    const publicFilter = {
      $or: [
        { status: "published" },
        { status: { $exists: false } },
        { status: "scheduled", scheduledAt: { $lte: new Date() } },
      ],
    };

    const prevBlog = await Post.findOne({
      ...publicFilter,
      _id: { $ne: currentBlog._id },
      $or: [
        { publishedAt: { $lt: orderDate } },
        { publishedAt: orderDate, _id: { $lt: currentBlog._id } },
      ],
    })
      .sort({ publishedAt: -1, _id: -1 })
      .select("title slug coverImage category publishedAt createdAt")
      .lean();

    const nextBlog = await Post.findOne({
      ...publicFilter,
      _id: { $ne: currentBlog._id },
      $or: [
        { publishedAt: { $gt: orderDate } },
        { publishedAt: orderDate, _id: { $gt: currentBlog._id } },
      ],
    })
      .sort({ publishedAt: 1, _id: 1 })
      .select("title slug coverImage category publishedAt createdAt")
      .lean();

    return res.status(200).json({ prevBlog, nextBlog });
  } catch (error) {
    return res.status(500).json({ message: "Could not load adjacent articles" });
  }
}

// 5. like post
export async function likeBlog(req, res) {
  try {
    const blog = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ message: "Article not found" });
    }
    return res.status(200).json({ likes: blog.likes });
  } catch (error) {
    return res.status(500).json({ message: "Could not register like" });
  }
}

// 6. create post
export async function createBlog(req, res) {
  try {
    const {
      title,
      slug: customSlug,
      description,
      markdown,
      coverImage,
      category,
      status,
      scheduledAt,
      seoTitle,
      metaDescription,
      canonicalUrl,
      ogImage,
      isFeatured,
    } = req.body || {};

    if (!title || !description || !markdown) {
      return res.status(400).json({ message: "Title, description and content are required" });
    }

    const tags = cleanTags(req.body?.tags);

    let finalSlug = undefined;
    if (customSlug && String(customSlug).trim()) {
      finalSlug = slugify(String(customSlug));
      const isExisting = await Post.exists({ slug: finalSlug });
      if (isExisting) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const blog = new Post({
      title: String(title).trim(),
      slug: finalSlug,
      description: String(description).trim(),
      markdown: String(markdown),
      coverImage: coverImage ? String(coverImage) : "",
      category: category ? String(category).trim() : "Software Development",
      tags,
      author: req.user.userId,
      status: ["draft", "published", "scheduled"].includes(status) ? status : "published",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      publishedAt: status === "draft" ? undefined : new Date(),
      seoTitle: seoTitle ? String(seoTitle).trim() : "",
      metaDescription: metaDescription ? String(metaDescription).trim() : "",
      canonicalUrl: canonicalUrl ? String(canonicalUrl).trim() : "",
      ogImage: ogImage ? String(ogImage) : "",
      isFeatured: Boolean(isFeatured),
    });

    await blog.save();

    await Promise.all([
      saveTagsToDatabase(tags),
      User.updateOne({ _id: req.user.userId }, { $push: { blogs: blog._id } }),
    ]);

    await blog.populate("author", "username avatar bio role");

    return res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Could not create the article" });
  }
}

// 7. update post
export async function updateBlog(req, res) {
  try {
    const blog = await Post.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: "Article not found" });
    }

    const isOwner = String(blog.author) === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this article" });
    }

    const {
      title,
      slug: customSlug,
      description,
      markdown,
      coverImage,
      category,
      tags,
      status,
      scheduledAt,
      isFeatured,
      seoTitle,
      metaDescription,
      canonicalUrl,
      ogImage,
      author: authorOverride,
    } = req.body || {};

    if (title !== undefined) blog.title = String(title).trim();
    if (description !== undefined) blog.description = String(description).trim();
    if (markdown !== undefined) blog.markdown = String(markdown);
    if (coverImage !== undefined) blog.coverImage = String(coverImage);
    if (category !== undefined) blog.category = String(category).trim();

    if (isAdmin && authorOverride) {
      blog.author = authorOverride;
    }

    if (customSlug && String(customSlug).trim()) {
      const proposed = slugify(String(customSlug));
      if (proposed !== blog.slug) {
        const collision = await Post.findOne({ slug: proposed });
        if (collision && String(collision._id) !== String(blog._id)) {
          return res.status(400).json({ message: "This URL slug is already taken" });
        }
        blog.slug = proposed;
      }
    }

    if (tags !== undefined) {
      const parsedTags = cleanTags(tags);
      blog.tags = parsedTags;
      await saveTagsToDatabase(parsedTags);
    }

    if (status !== undefined && ["draft", "published", "scheduled"].includes(status)) {
      blog.status = status;
      if (status === "published" && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    if (scheduledAt !== undefined) {
      blog.scheduledAt = scheduledAt ? new Date(scheduledAt) : undefined;
    }
    if (isFeatured !== undefined) blog.isFeatured = Boolean(isFeatured);
    if (seoTitle !== undefined) blog.seoTitle = String(seoTitle).trim();
    if (metaDescription !== undefined) blog.metaDescription = String(metaDescription).trim();
    if (canonicalUrl !== undefined) blog.canonicalUrl = String(canonicalUrl).trim();
    if (ogImage !== undefined) blog.ogImage = String(ogImage);

    await blog.save();
    await blog.populate("author", "username avatar bio role");

    return res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Could not update the article" });
  }
}

// 8. delete post
export async function deleteBlog(req, res) {
  try {
    const blog = await Post.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: "Article not found" });
    }

    const isOwner = String(blog.author) === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this article" });
    }

    await Post.deleteOne({ _id: blog._id });
    await User.updateOne({ _id: blog.author }, { $pull: { blogs: blog._id } });

    return res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete article" });
  }
}
