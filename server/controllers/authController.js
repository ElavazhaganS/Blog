import User from "../models/User.js";
import Post from "../models/Post.js";
import { signToken } from "../middleware/authMiddleware.js";

// helper to format user object without password
function formatUserResponse(user) {
  return {
    id: String(user._id),
    _id: String(user._id),
    username: user.username,
    email: user.email,
    bio: user.bio || "",
    avatar: user.avatar || "",
    role: user.role || "user",
    adminId: user.adminId || "",
    createdAt: user.createdAt,
  };
}

// 1. register user
export async function registerUser(req, res) {
  try {
    const { username, email, password, role, adminId } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (String(username).trim().length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const assignedRole = role === "admin" ? "admin" : "user";

    // admin id check if registering as admin
    if (assignedRole === "admin") {
      if (!adminId || String(adminId).trim().length < 3) {
        return res
          .status(400)
          .json({ message: "Admin ID is required and must be at least 3 characters." });
      }
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanUsername = String(username).trim();

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "An account with that email or username already exists." });
    }

    const newUser = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: String(password),
      role: assignedRole,
      adminId: assignedRole === "admin" ? String(adminId).trim() : "",
    });

    const token = signToken({
      userId: String(newUser._id),
      username: newUser.username,
      role: newUser.role,
    });

    return res.status(201).json({
      message: `${assignedRole === "admin" ? "Admin" : "User"} registration successful. Please sign in with your credentials.`,
      token,
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "An account with that email or username already exists." });
    }
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

// 2. login user or admin
export async function loginUser(req, res) {
  try {
    const { email, password, role: requestedRole } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user || !(await user.comparePassword(String(password)))) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // role check if logging into admin panel
    if (requestedRole === "admin" && user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. This account does not have administrator privileges.",
      });
    }

    const token = signToken({
      userId: String(user._id),
      username: user.username,
      role: user.role || "user",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

// 3. get current logged in user
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(formatUserResponse(user));
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

// 4. get all users
export async function getAllUsers(req, res) {
  try {
    const users = await User.find({})
      .select("_id username email bio avatar role adminId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(users.map(formatUserResponse));
  } catch (error) {
    return res.status(500).json({ message: "Could not load users" });
  }
}

// 5. get user profile
export async function getUserProfile(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const blogs = await Post.find({ author: user._id, status: "published" })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      user: {
        _id: String(user._id),
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
      },
      blogs,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

// 6. update user role (admin only)
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!["admin", "user", "author"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      message: `User role updated to ${role}`,
      user: formatUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not update user role" });
  }
}

// 7. delete user (admin only)
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (id === req.user?.userId) {
      return res.status(400).json({ message: "You cannot delete your own account while logged in." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ _id: id });
    return res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete user" });
  }
}
