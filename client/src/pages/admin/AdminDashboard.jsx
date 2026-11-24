import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api.js";
import { formatDate } from "../../format.js";
import { useAuth } from "../../AuthContext.jsx";
import StatusBadge from "../../components/StatusBadge";
export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingSlug, setUpdatingSlug] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch {
    }
  }, []);
  const fetchBlogs = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = await api.listBlogs({
        status: statusFilter,
        category: categoryFilter || void 0,
        search: search.trim() || void 0,
        sort: sortBy,
        page,
        limit: 10
      });
      setBlogs(res.blogs);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch {
      setFeedbackMsg({ type: "error", text: "Could not load articles." });
    } finally {
      setTableLoading(false);
    }
  }, [statusFilter, categoryFilter, search, sortBy, page]);
  useEffect(() => {
    Promise.all([fetchStats(), api.listCategories().catch(() => [])]).then(([_, cats]) => {
      setCategories(cats || []);
      setLoading(false);
    });
  }, [fetchStats]);
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);
  useEffect(() => {
    if (!feedbackMsg) return;
    const t = setTimeout(() => setFeedbackMsg(null), 4e3);
    return () => clearTimeout(t);
  }, [feedbackMsg]);
  const handleToggleStatus = async (blog) => {
    if (!user) return;
    setUpdatingSlug(blog.slug);
    const newStatus = blog.status === "published" ? "draft" : "published";
    try {
      const updated = await api.updateBlog(blog.slug, { status: newStatus }, user);
      setBlogs(
        (prev) => prev.map((b) => b.slug === blog.slug ? { ...b, status: updated.status, publishedAt: updated.publishedAt } : b)
      );
      fetchStats();
      setFeedbackMsg({
        type: "success",
        text: `Article "${blog.title}" is now ${newStatus === "published" ? "Published (Live)" : "Drafted"}.`
      });
    } catch (e) {
      setFeedbackMsg({
        type: "error",
        text: e.message || "Failed to update article status."
      });
    } finally {
      setUpdatingSlug(null);
    }
  };
  const handleConfirmDelete = async () => {
    if (!articleToDelete || !user) return;
    setDeleting(true);
    try {
      await api.deleteBlog(articleToDelete.slug, user);
      setBlogs((prev) => prev.filter((b) => b.slug !== articleToDelete.slug));
      setTotalCount((c) => Math.max(0, c - 1));
      fetchStats();
      setFeedbackMsg({
        type: "success",
        text: `Article "${articleToDelete.title}" was permanently deleted from the database.`
      });
      setArticleToDelete(null);
    } catch (e) {
      setFeedbackMsg({
        type: "error",
        text: e.message || "Failed to delete article."
      });
    } finally {
      setDeleting(false);
    }
  };
  const statCards = [
    {
      label: "Total Articles",
      value: stats?.totalArticles ?? totalCount,
      color: "#1473E6",
      bg: "#EBF3FD",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
    },
    {
      label: "Published Articles",
      value: stats?.publishedArticles ?? "0",
      color: "#059669",
      bg: "#F0FDF4",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    },
    {
      label: "Draft Articles",
      value: stats?.draftArticles ?? "0",
      color: "#D97706",
      bg: "#FFFBEB",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    },
    {
      label: "Scheduled Articles",
      value: stats?.scheduledArticles ?? "0",
      color: "#7C3AED",
      bg: "#F5F3FF",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    },
    {
      label: "Categories",
      value: stats?.totalCategories ?? categories.length,
      color: "#DB2777",
      bg: "#FDF2F8",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
    }
  ];
  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
      </div>;
  }
  return <div className="p-6 max-w-7xl mx-auto space-y-6">
      {
    /* Page Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Blog Content Management</h1>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Complete CMS dashboard to create, edit, publish, schedule, and manage all blog posts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
    onClick={() => {
      fetchStats();
      fetchBlogs();
    }}
    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#6B7280] shadow-2xs hover:bg-[#F9FAFB] hover:text-[#202124] transition"
    title="Refresh dashboard data"
  >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
          <Link
    to="/admin/create"
    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0d62c9]"
  >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Article
          </Link>
        </div>
      </div>

      {
    /* Notification Toast */
  }
      {feedbackMsg && <div
    className={`rounded-lg border px-4 py-3 text-xs font-medium flex items-center justify-between ${feedbackMsg.type === "success" ? "bg-[#F0FDF4] border-[#A7F3D0] text-[#059669]" : "bg-rose-50 border-rose-200 text-rose-700"}`}
  >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-[#6B7280] hover:text-[#202124] ml-2">
            âœ•
          </button>
        </div>}

      {
    /* Metrics Cards */
  }
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => <div
    key={card.label}
    className="rounded-xl border border-[#E5E7EB] bg-white p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition"
  >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B7280]">{card.label}</span>
              <div
    className="flex h-8 w-8 items-center justify-center rounded-lg"
    style={{ backgroundColor: card.bg, color: card.color }}
  >
                {card.icon}
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-[#202124]">{card.value}</span>
            </div>
          </div>)}
      </div>

      {
    /* Content Management Section */
  }
      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-2xs overflow-hidden">
        {
    /* Table Header & Controls */
  }
        <div className="p-4 border-b border-[#E5E7EB] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#202124]">All Blog Posts</h2>
              <p className="text-[11px] text-[#6B7280]">
                Manage, publish, unpublish, edit, or delete articles stored in MongoDB.
              </p>
            </div>

            {
    /* Publication Status Tabs */
  }
            <div className="flex items-center rounded-lg bg-[#F3F4F6] p-1 text-xs">
              {[
    { key: "all", label: "All Posts", count: stats?.totalArticles },
    { key: "published", label: "Published", count: stats?.publishedArticles },
    { key: "draft", label: "Drafts", count: stats?.draftArticles },
    { key: "scheduled", label: "Scheduled", count: stats?.scheduledArticles }
  ].map((tab) => <button
    key={tab.key}
    onClick={() => {
      setStatusFilter(tab.key);
      setPage(1);
    }}
    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${statusFilter === tab.key ? "bg-white text-[#1473E6] font-semibold shadow-2xs" : "text-[#6B7280] hover:text-[#202124]"}`}
  >
                  <span>{tab.label}</span>
                  {tab.count !== void 0 && <span
    className={`rounded-full px-1.5 py-0.2 text-[10px] ${statusFilter === tab.key ? "bg-[#EBF3FD] text-[#1473E6]" : "bg-[#E5E7EB] text-[#6B7280]"}`}
  >
                      {tab.count}
                    </span>}
                </button>)}
            </div>
          </div>

          {
    /* Search, Filter, Sort Row */
  }
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <svg
    className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
    type="text"
    placeholder="Search by title, description, category, tags..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setPage(1);
    }}
    className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-4 text-xs text-[#202124] placeholder-[#9CA3AF] outline-none focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
  />
            </div>

            <select
    value={categoryFilter}
    onChange={(e) => {
      setCategoryFilter(e.target.value);
      setPage(1);
    }}
    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1473E6]"
  >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c.name}>
                  {c.name}
                </option>)}
            </select>

            <select
    value={sortBy}
    onChange={(e) => {
      setSortBy(e.target.value);
      setPage(1);
    }}
    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1473E6]"
  >
              <option value="createdAt:desc">Newest Created</option>
              <option value="createdAt:asc">Oldest Created</option>
              <option value="publishedAt:asc">Publication Date</option>
              <option value="title:asc">Title (A â†’ Z)</option>
              <option value="title:desc">Title (Z â†’ A)</option>
            </select>
          </div>
        </div>

        {
    /* Articles Table */
  }
        <div className="overflow-x-auto">
          {tableLoading ? <div className="flex items-center justify-center py-20">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
            </div> : blogs.length === 0 ? <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-[#202124]">No blog posts found</p>
              <p className="text-xs text-[#6B7280]">
                {search || categoryFilter || statusFilter !== "all" ? "Try adjusting your search query or filters." : "Start by writing and publishing your first blog post."}
              </p>
              <Link
    to="/admin/create"
    className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#0d62c9] transition"
  >
                Create Article
              </Link>
            </div> : <table className="w-full text-xs text-left">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-3 font-semibold text-[#6B7280] uppercase tracking-wider min-w-[260px]">
                    Article Title
                  </th>
                  <th className="px-5 py-3 font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                    Author
                  </th>
                  <th className="px-5 py-3 font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="px-5 py-3 font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">
                    Created Date
                  </th>
                  <th className="px-5 py-3 font-semibold text-[#6B7280] uppercase tracking-wider">
                    Publication Status
                  </th>
                  <th className="px-5 py-3 font-semibold text-[#6B7280] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {blogs.map((blog) => <tr key={blog._id} className="hover:bg-[#F9FAFB] transition">
                    {
    /* 1. Article Title */
  }
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        {blog.coverImage ? <img
    src={blog.coverImage}
    alt=""
    className="h-10 w-16 rounded object-cover flex-shrink-0 border border-[#E5E7EB]"
  /> : <div className="flex h-10 w-16 items-center justify-center rounded bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB] flex-shrink-0">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="M21 15l-5-5L5 21" />
                            </svg>
                          </div>}
                        <div className="min-w-0">
                          <Link
    to={`/admin/edit/${blog.slug}`}
    className="font-semibold text-[#202124] hover:text-[#1473E6] line-clamp-1 leading-snug transition text-xs"
    title={blog.title}
  >
                            {blog.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                            <span className="font-mono text-[10px]">/{blog.slug}</span>
                            {blog.isFeatured && <span className="rounded bg-[#FFFBEB] border border-[#FDE68A] px-1.5 py-0.2 text-[10px] font-semibold text-[#D97706]">
                                â˜… Featured
                              </span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {
    /* 2. Author */
  }
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {blog.author?.avatar ? <img
    src={blog.author.avatar}
    alt=""
    className="h-6 w-6 rounded-full object-cover"
  /> : <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EBF3FD] text-[10px] font-bold text-[#1473E6]">
                            {blog.author?.username?.charAt(0).toUpperCase() || "A"}
                          </div>}
                        <span className="font-medium text-[#202124]">{blog.author?.username || "Admin"}</span>
                      </div>
                    </td>

                    {
    /* 3. Category */
  }
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="inline-block rounded-md bg-[#F3F4F6] px-2 py-1 text-[11px] font-medium text-[#4B5563]">
                        {blog.category || "Uncategorized"}
                      </span>
                    </td>

                    {
    /* 4. Created Date */
  }
                    <td className="px-5 py-3.5 text-[#6B7280] whitespace-nowrap">
                      {formatDate(blog.createdAt)}
                    </td>

                    {
    /* 5. Publication Status & Quick Toggle */
  }
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={blog.status} scheduledAt={blog.scheduledAt} />
                        <button
    onClick={() => handleToggleStatus(blog)}
    disabled={updatingSlug === blog.slug}
    className={`rounded px-2 py-0.5 text-[10px] font-semibold transition border ${blog.status === "published" ? "border-[#E5E7EB] text-[#6B7280] hover:bg-[#FFFBEB] hover:text-[#D97706] hover:border-[#FDE68A]" : "border-[#A7F3D0] bg-[#F0FDF4] text-[#059669] hover:bg-[#DCFCE7]"} disabled:opacity-50`}
    title={blog.status === "published" ? "Unpublish to Draft" : "Publish to Live Blog"}
  >
                          {updatingSlug === blog.slug ? "\xE2\u20AC\xA6" : blog.status === "published" ? "Unpublish" : "Publish Now"}
                        </button>
                      </div>
                    </td>

                    {
    /* 6. Actions (View, Edit, Delete) */
  }
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
    to={`/blog/${blog.slug}`}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-1 rounded border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-medium text-[#6B7280] hover:border-[#202124] hover:text-[#202124] transition shadow-2xs"
    title="View live post on public blog"
  >
                          View
                        </Link>
                        <Link
    to={`/admin/edit/${blog.slug}`}
    className="inline-flex items-center gap-1 rounded border border-[#1473E6]/30 bg-[#EBF3FD] px-2.5 py-1 text-[11px] font-semibold text-[#1473E6] hover:bg-[#1473E6] hover:text-white transition shadow-2xs"
    title="Edit article details and content"
  >
                          Edit
                        </Link>
                        <button
    onClick={() => setArticleToDelete(blog)}
    className="inline-flex items-center gap-1 rounded border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition shadow-2xs"
    title="Permanently delete article from database"
  >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>}
        </div>

        {
    /* Pagination */
  }
        {totalPages > 1 && <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-3">
            <p className="text-xs text-[#6B7280]">
              Showing page <span className="font-semibold text-[#202124]">{page}</span> of{" "}
              <span className="font-semibold text-[#202124]">{totalPages}</span> ({totalCount} total)
            </p>
            <div className="flex items-center gap-2">
              <button
    disabled={page <= 1}
    onClick={() => setPage((p) => p - 1)}
    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#202124] hover:border-[#1473E6] disabled:opacity-40 transition"
  >
                Previous
              </button>
              <button
    disabled={page >= totalPages}
    onClick={() => setPage((p) => p + 1)}
    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#202124] hover:border-[#1473E6] disabled:opacity-40 transition"
  >
                Next
              </button>
            </div>
          </div>}
      </div>

      {
    /* Delete Confirmation Modal */
  }
      {articleToDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E5E7EB] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202124]">Delete Article</h3>
                <p className="text-xs text-[#6B7280]">Permanent database deletion</p>
              </div>
            </div>

            <p className="text-xs text-[#4B5563] leading-relaxed mb-4">
              Are you sure you want to permanently delete{" "}
              <strong className="text-[#202124]">"{articleToDelete.title}"</strong>?
              <br />
              <span className="text-rose-600 font-medium">
                This action cannot be undone and will permanently remove the article from MongoDB and the live website.
              </span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3F4F6]">
              <button
    type="button"
    disabled={deleting}
    onClick={() => setArticleToDelete(null)}
    className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#202124] transition disabled:opacity-50"
  >
                Cancel
              </button>
              <button
    type="button"
    disabled={deleting}
    onClick={handleConfirmDelete}
    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 transition disabled:opacity-60"
  >
                {deleting ? <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deletingâ€¦
                  </> : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>}
    </div>;
}
