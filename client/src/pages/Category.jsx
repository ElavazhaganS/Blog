import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import BlogCard from "../components/PostCard.jsx";
const LIMIT = 12;
export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    Promise.all([
      api.listCategories(),
      api.listBlogs({ category: slug, page, limit: LIMIT })
    ]).then(([cats, blogsResp]) => {
      const found = cats.find((c) => c.slug === slug);
      setCategory(found ?? { _id: "", name: slug, slug, description: "" });
      setBlogs(blogsResp.blogs);
      setTotal(blogsResp.total ?? 0);
    }).catch(() => setError("Failed to load category articles.")).finally(() => setLoading(false));
  }, [slug, page]);
  const totalPages = Math.ceil(total / LIMIT);
  return <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
      {
    /* Breadcrumb */
  }
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[#6B7280]">
        <Link to="/" className="hover:text-[#1473E6] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#202124] font-medium capitalize">
          {category?.name ?? slug}
        </span>
      </nav>

      {
    /* Category Header */
  }
      <div className="mb-8 border-b border-[#E5E7EB] pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-block rounded-full bg-[#EBF3FD] px-3 py-0.5 text-xs font-semibold text-[#1473E6]">
            Category
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#202124] capitalize">
          {category?.name ?? slug}
        </h1>
        {category?.description && <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">
            {category.description}
          </p>}
        {total > 0 && <p className="mt-3 text-xs text-[#9CA3AF]">
            {total} article{total !== 1 ? "s" : ""}
          </p>}
      </div>

      {
    /* Loading */
  }
      {loading && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div
    key={i}
    className="h-64 animate-pulse rounded-xl bg-[#F7F8FA]"
  />)}
        </div>}

      {
    /* Error */
  }
      {!loading && error && <div className="rounded-xl border border-rose-100 bg-rose-50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-rose-600">{error}</p>
          <button
    onClick={() => setPage(1)}
    className="mt-4 rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0d62c9] transition"
  >
            Retry
          </button>
        </div>}

      {
    /* Articles Grid */
  }
      {!loading && !error && blogs.length > 0 && <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
          </div>

          {
    /* Pagination */
  }
          {totalPages > 1 && <div className="mt-10 flex items-center justify-center gap-2">
              <button
    disabled={page <= 1}
    onClick={() => setPage((p) => p - 1)}
    className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-xs font-medium text-[#4B5563] hover:bg-[#F7F8FA] disabled:opacity-40 disabled:cursor-not-allowed transition"
  >
                â† Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.min(totalPages, page + 2)
  ).map((p) => <button
    key={p}
    onClick={() => setPage(p)}
    className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${p === page ? "bg-[#1473E6] text-white" : "border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F7F8FA]"}`}
  >
                    {p}
                  </button>)}
              <button
    disabled={page >= totalPages}
    onClick={() => setPage((p) => p + 1)}
    className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-xs font-medium text-[#4B5563] hover:bg-[#F7F8FA] disabled:opacity-40 disabled:cursor-not-allowed transition"
  >
                Next â†’
              </button>
            </div>}
        </>}

      {
    /* Empty State */
  }
      {!loading && !error && blogs.length === 0 && <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] px-6 py-16 text-center">
          <svg
    className="mx-auto h-10 w-10 text-[#D1D5DB]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
            <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
  />
          </svg>
          <p className="mt-4 text-sm font-medium text-[#6B7280]">
            No articles in this category yet.
          </p>
          <Link
    to="/"
    className="mt-4 inline-block rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0d62c9] transition"
  >
            Browse all articles
          </Link>
        </div>}
    </div>;
}
