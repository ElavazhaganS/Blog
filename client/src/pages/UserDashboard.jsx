import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import Avatar from "../components/Avatar";
import BlogCard from "../components/PostCard.jsx";
import { api } from "../api.js";
export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.listBlogs({ limit: 6, status: "published" }),
      api.listCategories()
    ]).then(([blogsResp, cats]) => {
      if (cancelled) return;
      setRecentBlogs(blogsResp.blogs);
      setCategories(cats);
    }).catch(() => {
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
      {
    /* Welcome Hero Card */
  }
      <div className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-r from-[#F7F8FA] to-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
    name={user?.username ?? "User"}
    src={user?.avatar}
    size="lg"
  />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-[#202124] sm:text-2xl">
                  Welcome back, {user?.username}!
                </h1>
                <span className="rounded-full bg-[#EBF3FD] px-2.5 py-0.5 text-[11px] font-semibold text-[#1473E6]">
                  User Account
                </span>
              </div>
              <p className="mt-1 text-xs text-[#6B7280]">
                {user?.email} â€¢ Member of the DevLog Technology Community
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
    to="/write"
    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0d62c9]"
  >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Write an Article
            </Link>
            <Link
    to="/"
    className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#4B5563] transition hover:bg-[#F7F8FA]"
  >
              Browse Feed
            </Link>
          </div>
        </div>
      </div>

      {
    /* Role Notice & Info Bar */
  }
      <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 h-4 w-4 text-[#1473E6] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div className="text-xs text-[#1E3A8A]">
            <span className="font-semibold">User Dashboard:</span> You are signed in with standard reader and author privileges.
            {user?.role === "admin" && <span className="ml-2 font-bold text-[#1473E6]">
                You also have administrator permissions.{" "}
                <Link to="/admin" className="underline hover:text-[#0d62c9]">
                  Go to Admin Panel â†’
                </Link>
              </span>}
          </div>
        </div>
      </div>

      {
    /* Quick Category Chips */
  }
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#202124]">
            Explore Tech Domains
          </h2>
          <Link to="/?view=all" className="text-xs font-medium text-[#1473E6] hover:underline">
            View all
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 7).map((cat) => <Link
    key={cat._id || cat.slug}
    to={`/category/${cat.slug}`}
    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#4B5563] transition hover:border-[#1473E6] hover:text-[#1473E6]"
  >
              {cat.name}
            </Link>)}
        </div>
      </div>

      {
    /* Recommended & Recent Articles */
  }
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#202124]">Latest Recommended Articles</h2>
            <p className="text-xs text-[#6B7280]">
              Hand-picked software architecture tutorials, AI breakdowns, and engineering guides.
            </p>
          </div>
          <Link to="/" className="text-xs font-semibold text-[#1473E6] hover:underline">
            See all posts â†’
          </Link>
        </div>

        {loading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-[#F7F8FA]" />)}
          </div> : recentBlogs.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentBlogs.slice(0, 6).map((blog) => <BlogCard key={blog._id} blog={blog} />)}
          </div> : <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-8 text-center text-xs text-[#6B7280]">
            No articles available at this moment.
          </div>}
      </div>

      {
    /* Account Settings / Actions */
  }
      <div className="mt-12 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h3 className="text-sm font-bold text-[#202124] mb-3">Account Options</h3>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <Link
    to={`/profile/${user?.username}`}
    className="font-medium text-[#1473E6] hover:underline"
  >
            View Public Author Profile
          </Link>
          <span className="text-[#D1D5DB]">â€¢</span>
          <button
    type="button"
    onClick={() => {
      logout();
      navigate("/");
    }}
    className="font-medium text-rose-600 hover:underline"
  >
            Sign Out
          </button>
        </div>
      </div>
    </div>;
}
