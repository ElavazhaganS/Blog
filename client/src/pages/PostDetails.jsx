import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MarkdownView from "../components/MarkdownView";
import Avatar from "../components/Avatar";
import BlogCoverImage from "../components/BlogCoverImage";
import ShareButtons from "../components/ShareButtons";
import CommentSection from "../components/CommentBox.jsx";
import BlogCard from "../components/PostCard.jsx";
import TableOfContents from "../components/TableOfContents";
import { api } from "../api.js";
import { formatDate } from "../format.js";
import { useAuth } from "../AuthContext.jsx";
export default function BlogDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [adjacent, setAdjacent] = useState({ prevBlog: null, nextBlog: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setRelatedPosts([]);
    api.getBlog(slug).then((result) => {
      if (!cancelled) {
        setBlog(result);
        setLikes(result.likes ?? 0);
      }
    }).catch((err) => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    api.getRelatedBlogs(slug).then((r) => {
      if (!cancelled) setRelatedPosts(r.slice(0, 4));
    }).catch(() => {
    });
    api.getAdjacentBlogs(slug).then((a) => {
      if (!cancelled) setAdjacent(a);
    }).catch(() => {
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  const handleLikeToggle = async () => {
    if (hasLiked || !blog) return;
    setHasLiked(true);
    try {
      const updatedLikes = await api.likeBlog(blog.slug);
      setLikes(updatedLikes);
    } catch {
      setLikes((l) => l + 1);
    }
  };
  const handleDelete = async () => {
    if (!user || !blog) return;
    if (!window.confirm("Are you sure you want to delete this article permanently?")) return;
    setDeleting(true);
    try {
      await api.deleteBlog(blog.slug, user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };
  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
          <p className="text-xs text-[#6B7280]">Loading article...</p>
        </div>
      </div>;
  }
  if (error || !blog) {
    return <div className="mx-auto max-w-[900px] px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#202124]">Article not found</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          {error ?? "This article may have been removed or the link is incorrect."}
        </p>
        <Link
      to="/"
      className="mt-6 inline-block rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0d62c9]"
    >
          Return to Blog Home
        </Link>
      </div>;
  }
  const isAuthor = user?.username === blog.author.username;
  const isAdmin = user?.role === "admin";
  const canEdit = isAuthor || isAdmin;
  const primaryTag = blog.tags[0] || "";
  const displayCategory = blog.category || (primaryTag ? primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1) : "Technology");
  const categorySlug = blog.category ? blog.category.toLowerCase().replace(/\s+/g, "-") : primaryTag || "technology";
  return <div className="bg-white pb-24">
      {
    /* =====================================================================
       MAIN CONTENT CONTAINER: 900px centered
      ===================================================================== */
  }
      <div className="mx-auto w-full max-w-[900px] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {
    /* Breadcrumb */
  }
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#6B7280]">
          <Link to="/" className="hover:text-[#1473E6] transition-colors">Home</Link>
          <span className="text-[#D1D5DB]">/</span>
          <Link
    to={`/category/${categorySlug}`}
    className="font-medium text-[#1473E6] hover:underline"
  >
            {displayCategory}
          </Link>
          <span className="text-[#D1D5DB]">/</span>
          <span className="truncate max-w-[260px] text-[#9CA3AF]">{blog.title}</span>
        </nav>

        {
    /* â”€â”€ Category Badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        <Link
    to={`/category/${categorySlug}`}
    className="mb-4 inline-block rounded-full bg-[#EBF3FD] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1473E6] transition hover:bg-[#1473E6] hover:text-white"
  >
          {displayCategory}
        </Link>

        {
    /* â”€â”€ BLOG TITLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        <h1 className="text-left text-3xl font-bold tracking-tight text-[#202124] sm:text-4xl lg:text-[38px] leading-[1.25] mb-6">
          {blog.title}
        </h1>

        {
    /* â”€â”€ AUTHOR & METADATA BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-5 md:flex-row md:items-center md:justify-between">
          {
    /* LEFT: Author info */
  }
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar name={blog.author.username} src={blog.author.avatar} size="md" />
            <div className="min-w-0">
              <Link
    to={`/profile/${blog.author.username}`}
    className="font-bold text-sm text-[#1473E6] hover:underline block truncate"
  >
                {blog.author.username}
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#6B7280]">
                <span>Published {formatDate(blog.publishedAt || blog.createdAt)}</span>
                {blog.updatedAt && blog.updatedAt !== blog.createdAt && <>
                    <span className="text-[#D1D5DB]" aria-hidden="true">â€¢</span>
                    <span>Updated {formatDate(blog.updatedAt)}</span>
                  </>}
              </div>
            </div>
          </div>

          {
    /* RIGHT: Reading time, like, share, edit/delete */
  }
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#6B7280]">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-[#4B5563]">
              <svg className="h-3.5 w-3.5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {blog.readTime} Min Read
            </span>

            <span className="text-[#E5E7EB] hidden sm:inline">|</span>

            <button
    type="button"
    onClick={handleLikeToggle}
    disabled={hasLiked}
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all ${hasLiked ? "border-rose-200 bg-rose-50 font-semibold text-rose-600 cursor-default" : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-rose-200 hover:text-rose-600"}`}
    aria-label="Like this article"
  >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{likes} Likes</span>
            </button>

            <span className="text-[#E5E7EB] hidden sm:inline">|</span>

            {
    /* Compact share icons inline */
  }
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#9CA3AF]">Share:</span>
              <ShareButtons title={blog.title} compact />
            </div>

            {
    /* Edit & Delete (Author / Admin Only) */
  }
            {canEdit && <>
                <span className="text-[#E5E7EB] hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5">
                  <Link
    to={isAdmin ? `/admin/edit/${blog.slug}` : `/edit/${blog.slug}`}
    className="rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-[#202124] transition hover:bg-[#F7F8FA]"
  >
                    Edit
                  </Link>
                  <button
    type="button"
    onClick={handleDelete}
    disabled={deleting}
    className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>}
          </div>
        </div>

        {
    /* â”€â”€ FEATURED IMAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        {blog.coverImage && <div className="mt-8 w-full overflow-hidden rounded-xl border border-[#E5E7EB]">
            <BlogCoverImage
    src={blog.coverImage}
    title={blog.title}
    category={displayCategory}
    aspectRatio="banner"
  />
          </div>}

        {
    /* â”€â”€ TABLE OF CONTENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        {blog.markdown && <div className="mt-8">
            <TableOfContents markdown={blog.markdown} />
          </div>}

        {
    /* â”€â”€ ARTICLE BODY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        <div className="mt-8 w-full text-left">
          <MarkdownView content={blog.markdown} />
        </div>

        {
    /* â”€â”€ TAGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        {blog.tags.length > 0 && <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[#E5E7EB] pt-6">
            <span className="text-xs font-semibold text-[#6B7280]">Tags:</span>
            {blog.tags.map((tag) => <Link
    key={tag}
    to={`/?tag=${encodeURIComponent(tag)}`}
    className="rounded-full border border-[#A7F3D0] bg-[#F0FDF4] px-3.5 py-1 text-xs font-medium text-[#059669] transition hover:bg-[#DCFCE7]"
  >
                #{tag.toLowerCase()}
              </Link>)}
          </div>}

        {
    /* â”€â”€ SOCIAL SHARING SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        <div className="mt-8">
          <ShareButtons title={blog.title} />
        </div>

        {
    /* â”€â”€ AUTHOR BIO CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        <div className="mt-8 flex flex-col items-start gap-4 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-6 sm:flex-row sm:items-center sm:gap-5">
          <div className="shrink-0">
            <Avatar name={blog.author.username} src={blog.author.avatar} size="lg" className="h-14 w-14 sm:h-16 sm:w-16" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">About the Author</p>
            <h3 className="mt-1 text-base font-bold text-[#202124]">
              <Link to={`/profile/${blog.author.username}`} className="hover:text-[#1473E6] transition-colors">
                {blog.author.username}
              </Link>
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#4B5563]">
              {blog.author.bio || "Full-stack software engineer and writer sharing practical guides and architectural engineering patterns on DevLog."}
            </p>
            <div className="mt-3">
              <Link
    to={`/profile/${blog.author.username}`}
    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1473E6] hover:underline"
  >
                <span>View all articles by {blog.author.username}</span>
                <span aria-hidden="true">â†’</span>
              </Link>
            </div>
          </div>
        </div>

        {
    /* â”€â”€ PREV / NEXT NAVIGATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        {(adjacent.prevBlog || adjacent.nextBlog) && <div className="mt-10 grid grid-cols-1 gap-4 border-t border-[#E5E7EB] pt-8 sm:grid-cols-2">
            {adjacent.prevBlog ? <Link
    to={`/blog/${adjacent.prevBlog.slug}`}
    className="group flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#1473E6] hover:shadow-sm"
  >
                <div className="mt-0.5 flex-shrink-0">
                  <svg className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#1473E6] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Previous Article</p>
                  <p className="mt-1 text-xs font-semibold text-[#202124] leading-snug group-hover:text-[#1473E6] transition-colors line-clamp-2">
                    {adjacent.prevBlog.title}
                  </p>
                  {adjacent.prevBlog.category && <span className="mt-1.5 inline-block text-[11px] text-[#6B7280]">{adjacent.prevBlog.category}</span>}
                </div>
              </Link> : <div />}

            {adjacent.nextBlog ? <Link
    to={`/blog/${adjacent.nextBlog.slug}`}
    className="group flex items-start justify-end gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 text-right transition hover:border-[#1473E6] hover:shadow-sm"
  >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Next Article</p>
                  <p className="mt-1 text-xs font-semibold text-[#202124] leading-snug group-hover:text-[#1473E6] transition-colors line-clamp-2">
                    {adjacent.nextBlog.title}
                  </p>
                  {adjacent.nextBlog.category && <span className="mt-1.5 inline-block text-[11px] text-[#6B7280]">{adjacent.nextBlog.category}</span>}
                </div>
                <div className="mt-0.5 flex-shrink-0">
                  <svg className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#1473E6] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link> : <div />}
          </div>}

        {
    /* â”€â”€ COMMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        <CommentSection postSlug={blog.slug} />

        {
    /* â”€â”€ RELATED POSTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
        {relatedPosts.length > 0 && <section className="mt-16 border-t border-[#E5E7EB] pt-12">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-[#1473E6]" />
                <h3 className="text-base font-bold tracking-tight text-[#202124]">Related Articles</h3>
              </div>
              <Link to="/" className="text-xs font-semibold text-[#1473E6] hover:underline">
                View All â†’
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
              {relatedPosts.slice(0, 4).map((p) => <BlogCard key={p._id} blog={p} variant="compact" />)}
            </div>
          </section>}
      </div>
    </div>;
}
