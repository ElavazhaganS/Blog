import fs from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIRECTORY = path.resolve(process.cwd(), "public/uploads");

async function ensureUploadsFolderExists() {
  try {
    await fs.mkdir(UPLOAD_DIRECTORY, { recursive: true });
  } catch {}
}

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

// upload media file
export async function uploadMediaFile(req, res) {
  try {
    await ensureUploadsFolderExists();
    const { data, filename: originalName } = req.body || {};

    if (!data || typeof data !== "string") {
      return res.status(400).json({ message: "Image data is required" });
    }

    let fileBuffer;
    let fileExtension = ".png";

    const dataUrlMatch = data.match(/^data:([a-zA-Z0-9\/+-]+);base64,(.+)$/);
    if (dataUrlMatch) {
      const mimeType = dataUrlMatch[1].toLowerCase();
      if (!ALLOWED_IMAGE_TYPES[mimeType]) {
        return res.status(400).json({
          message: "Unsupported image format. Allowed: PNG, JPG, WEBP, GIF, SVG",
        });
      }
      fileExtension = ALLOWED_IMAGE_TYPES[mimeType];
      fileBuffer = Buffer.from(dataUrlMatch[2], "base64");
    } else {
      fileBuffer = Buffer.from(data, "base64");
      if (originalName) {
        const ext = path.extname(originalName).toLowerCase();
        if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
          fileExtension = ext;
        }
      }
    }

    if (fileBuffer.length > 10 * 1024 * 1024) {
      return res
        .status(400)
        .json({ message: "Image exceeds 10MB limit. Please compress the image." });
    }

    const safeName = originalName
      ? path
          .basename(originalName, path.extname(originalName))
          .replace(/[^\w-]/g, "")
          .slice(0, 40)
      : "image";

    const uniqueFilename = `${Date.now()}-${safeName}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIRECTORY, uniqueFilename);

    await fs.writeFile(filePath, fileBuffer);

    return res.status(201).json({
      message: "Image uploaded successfully",
      file: {
        filename: uniqueFilename,
        url: `/uploads/${uniqueFilename}`,
        size: fileBuffer.length,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to upload image" });
  }
}

// list media files
export async function getAllMediaFiles(req, res) {
  try {
    await ensureUploadsFolderExists();
    const files = await fs.readdir(UPLOAD_DIRECTORY);

    const mediaList = await Promise.all(
      files
        .filter((file) => !file.startsWith("."))
        .map(async (filename) => {
          const filePath = path.join(UPLOAD_DIRECTORY, filename);
          const stats = await fs.stat(filePath);
          return {
            filename,
            url: `/uploads/${filename}`,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
          };
        })
    );

    mediaList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json(mediaList);
  } catch (error) {
    return res.status(500).json({ message: "Could not load media files" });
  }
}

// delete media file
export async function deleteMediaFile(req, res) {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIRECTORY, filename);

    await fs.unlink(filePath);
    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete image" });
  }
}
