import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "devlog.token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

function authHeaders() {
  const token = tokenStore.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function errorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export const api = {
  // Articles / Posts
  async listBlogs(params = {}) {
    try {
      const { data } = await axios.get(`${API_BASE}/api/posts`, { params });
      return data;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not load articles"));
    }
  },

  async getBlog(slug) {
    try {
      const { data } = await axios.get(`${API_BASE}/api/posts/${slug}`);
      return data;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not load article"));
    }
  },

  async createBlog(input) {
    try {
      const { data } = await axios.post(`${API_BASE}/api/posts`, input, {
        headers: authHeaders(),
      });
      return data.blog;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not create article"));
    }
  },

  async updateBlog(slug, input) {
    try {
      const { data } = await axios.put(`${API_BASE}/api/posts/${slug}`, input, {
        headers: authHeaders(),
      });
      return data.blog;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not update article"));
    }
  },

  async deleteBlog(slug) {
    try {
      await axios.delete(`${API_BASE}/api/posts/${slug}`, {
        headers: authHeaders(),
      });
    } catch (error) {
      throw new Error(errorMessage(error, "Could not delete article"));
    }
  },

  async likeBlog(slug) {
    try {
      const { data } = await axios.post(`${API_BASE}/api/posts/${slug}/like`);
      return data.likes;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not like article"));
    }
  },

  async getRelatedBlogs(slug) {
    try {
      const { data } = await axios.get(`${API_BASE}/api/posts/${slug}/related`);
      return data;
    } catch {
      return [];
    }
  },

  async getAdjacentBlogs(slug) {
    try {
      const { data } = await axios.get(`${API_BASE}/api/posts/${slug}/adjacent`);
      return data;
    } catch {
      return { prevBlog: null, nextBlog: null };
    }
  },

  // Categories
  async listCategories() {
    try {
      const { data } = await axios.get(`${API_BASE}/api/categories`);
      return data;
    } catch {
      return [];
    }
  },

  async getCategory(slug, page = 1) {
    try {
      const { data } = await axios.get(`${API_BASE}/api/categories/${slug}`, {
        params: { page },
      });
      return data;
    } catch (error) {
      throw new Error(errorMessage(error, "Category not found"));
    }
  },

  async createCategory(input) {
    try {
      const { data } = await axios.post(`${API_BASE}/api/categories`, input, {
        headers: authHeaders(),
      });
      return data.category;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not create category"));
    }
  },

  async updateCategory(id, input) {
    try {
      const { data } = await axios.put(`${API_BASE}/api/categories/${id}`, input, {
        headers: authHeaders(),
      });
      return data.category;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not update category"));
    }
  },

  async deleteCategory(id) {
    try {
      await axios.delete(`${API_BASE}/api/categories/${id}`, {
        headers: authHeaders(),
      });
    } catch (error) {
      throw new Error(errorMessage(error, "Could not delete category"));
    }
  },

  // Authors
  async listAuthors() {
    try {
      const { data } = await axios.get(`${API_BASE}/api/authors`);
      return data;
    } catch {
      return [];
    }
  },

  async createAuthor(input) {
    try {
      const { data } = await axios.post(`${API_BASE}/api/authors`, input, {
        headers: authHeaders(),
      });
      return data.author;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not create author"));
    }
  },

  async updateAuthor(id, input) {
    try {
      const { data } = await axios.put(`${API_BASE}/api/authors/${id}`, input, {
        headers: authHeaders(),
      });
      return data.author;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not update author"));
    }
  },

  async deleteAuthor(id) {
    try {
      await axios.delete(`${API_BASE}/api/authors/${id}`, {
        headers: authHeaders(),
      });
    } catch (error) {
      throw new Error(errorMessage(error, "Could not delete author"));
    }
  },

  // Media Library
  async listMedia() {
    try {
      const { data } = await axios.get(`${API_BASE}/api/media`);
      return data;
    } catch {
      return [];
    }
  },

  async uploadMedia(data, filename) {
    try {
      const res = await axios.post(
        `${API_BASE}/api/media/upload`,
        { data, filename },
        { headers: authHeaders() }
      );
      return res.data.file;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not upload image"));
    }
  },

  async deleteMedia(filename) {
    try {
      await axios.delete(`${API_BASE}/api/media/${encodeURIComponent(filename)}`, {
        headers: authHeaders(),
      });
    } catch (error) {
      throw new Error(errorMessage(error, "Could not delete image"));
    }
  },

  // Admin Stats
  async getAdminStats() {
    try {
      const { data } = await axios.get(`${API_BASE}/api/admin/stats`, {
        headers: authHeaders(),
      });
      return data;
    } catch {
      return {
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        scheduledArticles: 0,
        totalCategories: 0,
        totalAuthors: 0,
        recentCreated: [],
        recentPublished: [],
        upcomingScheduled: [],
      };
    }
  },

  // Tags
  async listTags() {
    try {
      const { data } = await axios.get(`${API_BASE}/api/tags`);
      return data;
    } catch {
      return [];
    }
  },

  async createTag(name) {
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/tags`,
        { name },
        { headers: authHeaders() }
      );
      return data.tag;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not create tag"));
    }
  },

  async deleteTag(slug) {
    try {
      await axios.delete(`${API_BASE}/api/tags/${slug}`, {
        headers: authHeaders(),
      });
    } catch (error) {
      throw new Error(errorMessage(error, "Could not delete tag"));
    }
  },

  // Auth & Profile
  async login(email, password) {
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });
      return data;
    } catch (error) {
      throw new Error(errorMessage(error, "Invalid email or password"));
    }
  },

  async register(username, email, password) {
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/register`, {
        username,
        email,
        password,
      });
      return data;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not create account"));
    }
  },

  async me() {
    const token = tokenStore.get();
    if (!token) return null;

    try {
      const { data } = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: authHeaders(),
      });
      return data;
    } catch {
      return null;
    }
  },

  async profile(username) {
    try {
      const { data } = await axios.get(`${API_BASE}/api/auth/${username}`);
      return data;
    } catch (error) {
      throw new Error(errorMessage(error, "Profile not found"));
    }
  },

  async listUsers() {
    try {
      const { data } = await axios.get(`${API_BASE}/api/auth`, {
        headers: authHeaders(),
      });
      return data;
    } catch {
      return [];
    }
  },

  async updateUserRole(id, role) {
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/auth/${id}/role`,
        { role },
        { headers: authHeaders() }
      );
      return data.user;
    } catch (error) {
      throw new Error(errorMessage(error, "Could not update user role"));
    }
  },

  async deleteUserAdmin(id) {
    try {
      await axios.delete(`${API_BASE}/api/auth/${id}`, {
        headers: authHeaders(),
      });
    } catch (error) {
      throw new Error(errorMessage(error, "Could not delete user"));
    }
  },
};
