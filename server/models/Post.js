import mongoose from "mongoose";

// helper to create slug from title
export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// helper to calculate reading time
export function readTimeOf(content) {
  const plainText = String(content || "").replace(/<[^>]*>/g, " ");
  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// post schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    markdown: { type: String, required: [true, "Content is required"] },
    coverImage: { type: String, default: "" },
    category: {
      type: String,
      required: [true, "Category is required"],
      default: "Software Development",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        Array.isArray(tags)
          ? tags.map((t) => String(t).trim().toLowerCase())
          : [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "published",
    },
    scheduledAt: { type: Date },
    publishedAt: { type: Date, default: Date.now },
    readTime: { type: Number, default: 1 },
    seoTitle: { type: String, trim: true, default: "" },
    metaDescription: { type: String, trim: true, default: "" },
    canonicalUrl: { type: String, trim: true, default: "" },
    ogImage: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    likes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// auto-generate slug and reading time
postSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  if (this.markdown) {
    this.readTime = readTimeOf(this.markdown);
  }
});

// search indexes
postSchema.index({ slug: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ category: 1 });
postSchema.index({ status: 1 });
postSchema.index({ author: 1 });
postSchema.index({ publishedAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
