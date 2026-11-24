import mongoose from "mongoose";

// helper to slugify
export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// category schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [60, "Category name is too long"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [240, "Description is too long"],
    },
    coverImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
