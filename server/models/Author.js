import mongoose from "mongoose";

// author schema
const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    designation: {
      type: String,
      default: "Technology Writer",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    socialLinks: {
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const Author = mongoose.model("Author", authorSchema);

export default Author;
