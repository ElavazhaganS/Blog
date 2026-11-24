import Author from "../models/Author.js";
import { slugify } from "../models/Category.js";

// get all authors
export async function getAllAuthors(req, res) {
  try {
    const authors = await Author.find().sort({ name: 1 }).lean();
    return res.status(200).json(authors);
  } catch (error) {
    return res.status(500).json({ message: "Could not load authors" });
  }
}

// get author by id or slug
export async function getAuthorByIdOrSlug(req, res) {
  try {
    const { id } = req.params;
    const author = await Author.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
    }).lean();

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    return res.status(200).json(author);
  } catch (error) {
    return res.status(500).json({ message: "Could not load author" });
  }
}

// create author
export async function createAuthor(req, res) {
  try {
    const { name, email, designation, bio, avatar, socialLinks } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Author name is required" });
    }

    const trimmedName = String(name).trim();
    const slug = req.body?.slug
      ? slugify(String(req.body.slug))
      : slugify(trimmedName);

    const existing = await Author.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "An author with this slug already exists" });
    }

    const author = await Author.create({
      name: trimmedName,
      slug,
      email: email ? String(email).trim().toLowerCase() : "",
      designation: designation ? String(designation).trim() : "Technology Writer",
      bio: bio ? String(bio).trim() : "",
      avatar: avatar ? String(avatar) : "",
      socialLinks: socialLinks || {},
    });

    return res.status(201).json({ message: "Author created successfully", author });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Could not create author" });
  }
}

// update author
export async function updateAuthor(req, res) {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const { name, email, designation, bio, avatar, socialLinks } = req.body || {};

    if (name) author.name = String(name).trim();
    if (req.body?.slug) author.slug = slugify(String(req.body.slug));
    if (email !== undefined) author.email = String(email).trim().toLowerCase();
    if (designation !== undefined) author.designation = String(designation).trim();
    if (bio !== undefined) author.bio = String(bio).trim();
    if (avatar !== undefined) author.avatar = String(avatar);
    if (socialLinks) author.socialLinks = { ...author.socialLinks, ...socialLinks };

    await author.save();
    return res.status(200).json({ message: "Author updated successfully", author });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Could not update author" });
  }
}

// delete author
export async function deleteAuthor(req, res) {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    await Author.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: "Author deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete author" });
  }
}
