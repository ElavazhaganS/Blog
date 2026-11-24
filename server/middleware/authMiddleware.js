import jwt from "jsonwebtoken";

// generate jwt token
export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// verify user token
export default function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      userId: String(decoded.userId),
      username: String(decoded.username || ""),
      role: decoded.role || "user",
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// verify admin role
export function requireAdmin(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user?.role !== "admin" && req.user?.role !== "author") {
      return res
        .status(403)
        .json({ message: "Forbidden: Administrator authorization required" });
    }
    next();
  });
}
