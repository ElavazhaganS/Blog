import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api.js";
import { formatDate } from "../../format.js";
import { useAuth } from "../../AuthContext.jsx";
import StatusBadge from "../../components/StatusBadge";
export default function AdminArticlesList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingSlug, setUpdatingSlug] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listBlogs({
        status: statusFilter,
        search: search.trim() || void 0,
        category: categoryFilter || void 0,
        sort: sortBy,
        page,
        limit: 15
      });
      setBlogs(res.blogs);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setFeedbackMsg({ type: "error", text: "Failed to load articles." });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, categoryFilter, sortBy, page]);
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);
  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => {
    });
  }, []);
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
      setTotal((t) => Math.max(0, t - 1));
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
  const setStatus = (s) => {
    setPage(1);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (s === "all") p.delete("status");
      else p.set("status", s);
      return p;
    });
  };
  const statusTabs = [
    { key: "all", label: "All Articles" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
    { key: "scheduled", label: "Scheduled" }
  ];
  return <div className="p-6 max-w-7xl mx-auto space-y-5">
      {
    /* Header */
  }
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">All Blog Articles</h1>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            {total} total article{total !== 1 ? "s" : ""} registered in the database.
          </p>
        </div>
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

      {
    /* Feedback Toast */
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
    /* Status Tabs */
  }
      <div className="flex gap-1 border-b border-[#E5E7EB]">
        {statusTabs.map((tab) => <button
    key={tab.key}
    onClick={() => setStatus(tab.key)}
    className={`px-4 py-2 text-xs font-semibold transition border-b-2 -mb-px ${statusFilter === tab.key ? "border-[#1473E6] text-[#1473E6]" : "border-transparent text-[#6B7280] hover:text-[#202124]"}`}
  >
            {tab.label}
          </button>)}
      </div>

      {
    /* Filters Bar */
  }
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
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
    placeholder="Search articles by title, content, or author..."
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
          <option value="createdAt:desc">Newest First</option>
          <option value="createdAt:asc">Oldest First</option>
          <option value="title:asc">Title Aâ€“Z</option>
          <option value="title:desc">Title Zâ€“A</option>
        </select>
      </div>

      {
    /* Table */
  }
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-2xs">
        {loading ? <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
          </div> : blogs.length === 0 ? <div className="flex flex-col items-center gap-3 py-16 text-center">
            <svg
    className="h-10 w-10 text-[#D1D5DB]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm font-medium text-[#6B7280]">No articles found</p>
            <Link to="/admin/create" className="text-xs font-semibold text-[#1473E6] hover:underline">
              Create your first article â†’
            </Link>
          </div> : <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
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
    /* Title */
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
    /* Author */
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
    /* Category */
  }
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="inline-block rounded-md bg-[#F3F4F6] px-2 py-1 text-[11px] font-medium text-[#4B5563]">
                        {blog.category || "Uncategorized"}
                      </span>
                    </td>

                    {
    /* Created Date */
  }
                    <td className="px-5 py-3.5 text-[#6B7280] whitespace-nowrap">
                      {formatDate(blog.createdAt)}
                    </td>

                    {
    /* Publication Status & Quick Toggle */
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
    /* Actions */
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
            </table>
          </div>}
      </div>

      {
    /* Pagination */
  }
      {totalPages > 1 && <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3">
          <p className="text-xs text-[#6B7280]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
    disabled={page <= 1}
    onClick={() => setPage((p) => p - 1)}
    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#202124] transition hover:border-[#1473E6] disabled:opacity-40"
  >
              Previous
            </button>
            <button
    disabled={page >= totalPages}
    onClick={() => setPage((p) => p + 1)}
    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#202124] transition hover:border-[#1473E6] disabled:opacity-40"
  >
              Next
            </button>
          </div>
        </div>}

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
