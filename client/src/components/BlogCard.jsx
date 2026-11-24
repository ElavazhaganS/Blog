import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import BlogCoverImage from "./BlogCoverImage";
import { formatDate } from "../format.js";
export default function BlogCard({
  blog,
  variant = "standard",
  featured = false
}) {
  const activeVariant = featured ? "hero" : variant;
  const primaryTag = blog.tags[0] || "Engineering";
  const displayCategory = primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1);
  if (activeVariant === "compact") {
    return <article className="group flex items-start gap-4 rounded-xl border border-[#E5E7EB] bg-white p-3.5 transition-all duration-200 hover:border-slate-300 hover:shadow-xs">
        <Link
      to={`/blog/${blog.slug}`}
      className="shrink-0 overflow-hidden rounded-lg"
    >
          <BlogCoverImage
      src={blog.coverImage}
      title={blog.title}
      category={displayCategory}
      aspectRatio="compact"
    />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[#00875A]">
              {displayCategory}
            </span>
            <span className="text-[#9CA3AF]">Â·</span>
            <span className="text-[#6B7280]">{blog.readTime} Min Read</span>
          </div>
          <h4 className="text-sm font-semibold leading-snug text-[#202124] transition-colors group-hover:text-[#1473E6]">
            <Link to={`/blog/${blog.slug}`} className="line-clamp-2">
              {blog.title}
            </Link>
          </h4>
          <div className="mt-2 text-[11px] text-[#6B7280]">
            <span>By </span>
            <Link
      to={`/profile/${blog.author.username}`}
      className="font-medium text-[#1473E6] hover:underline"
    >
              {blog.author.username}
            </Link>
            <span className="mx-1 text-[#9CA3AF]">Â·</span>
            <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
          </div>
        </div>
      </article>;
  }
  if (activeVariant === "list-item") {
    return <article className="group py-3.5 border-b border-[#E5E7EB] last:border-b-0">
        <div className="mb-1 flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-[#00875A]">
            {displayCategory}
          </span>
          <span className="text-[#9CA3AF]">Â·</span>
          <span className="text-[#6B7280]">{blog.readTime} Min Read</span>
        </div>
        <h4 className="text-[15px] font-semibold leading-snug text-[#202124] transition-colors group-hover:text-[#1473E6]">
          <Link to={`/blog/${blog.slug}`} className="line-clamp-2">
            {blog.title}
          </Link>
        </h4>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-[#6B7280]">
          <span>By </span>
          <Link
      to={`/profile/${blog.author.username}`}
      className="font-medium text-[#1473E6] hover:underline"
    >
            {blog.author.username}
          </Link>
          <span className="text-[#9CA3AF]">Â·</span>
          <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
        </div>
      </article>;
  }
  if (activeVariant === "horizontal") {
    return <article className="group grid overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-xs md:grid-cols-12">
        <div className="md:col-span-5 overflow-hidden">
          <Link to={`/blog/${blog.slug}`}>
            <BlogCoverImage
      src={blog.coverImage}
      title={blog.title}
      category={displayCategory}
      aspectRatio="horizontal"
      className="h-full w-full"
    />
          </Link>
        </div>
        <div className="flex flex-col justify-center p-5 sm:p-7 md:col-span-7">
          <div className="mb-2 flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[#00875A]">
              {displayCategory}
            </span>
            <span className="text-[#9CA3AF]">Â·</span>
            <span className="text-[#6B7280]">{blog.readTime} Min Read</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-[#202124] sm:text-2xl transition-colors group-hover:text-[#1473E6]">
            <Link to={`/blog/${blog.slug}`} className="line-clamp-2">
              {blog.title}
            </Link>
          </h3>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#6B7280]">
            {blog.description}
          </p>
          <div className="mt-5 flex items-center gap-2.5 text-xs text-[#6B7280]">
            <Avatar
      name={blog.author.username}
      src={blog.author.avatar}
      size="sm"
    />
            <div>
              <span>By </span>
              <Link
      to={`/profile/${blog.author.username}`}
      className="font-semibold text-[#1473E6] hover:underline"
    >
                {blog.author.username}
              </Link>
              <span className="mx-1.5 text-[#9CA3AF]">Â·</span>
              <time dateTime={blog.createdAt}>
                {formatDate(blog.createdAt)}
              </time>
            </div>
          </div>
        </div>
      </article>;
  }
  if (activeVariant === "hero") {
    return <article className="group overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-xs">
        <Link to={`/blog/${blog.slug}`} className="block overflow-hidden">
          <BlogCoverImage
      src={blog.coverImage}
      title={blog.title}
      category={displayCategory}
      aspectRatio="hero"
    />
        </Link>
        <div className="p-5 sm:p-7">
          <div className="mb-2 flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#00875A]">
              {displayCategory}
            </span>
            <span className="text-[#9CA3AF]">Â·</span>
            <span className="text-[#6B7280]">{blog.readTime} Min Read</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#202124] sm:text-3xl transition-colors group-hover:text-[#1473E6]">
            <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
          </h2>
          <p className="mt-3 line-clamp-3 text-sm sm:text-base leading-relaxed text-[#6B7280]">
            {blog.description}
          </p>
          <div className="mt-6 flex items-center gap-3 text-xs text-[#6B7280]">
            <Avatar
      name={blog.author.username}
      src={blog.author.avatar}
      size="sm"
    />
            <div>
              <span>By </span>
              <Link
      to={`/profile/${blog.author.username}`}
      className="font-semibold text-[#1473E6] hover:underline"
    >
                {blog.author.username}
              </Link>
              <span className="mx-1.5 text-[#9CA3AF]">Â·</span>
              <time dateTime={blog.createdAt}>
                {formatDate(blog.createdAt)}
              </time>
            </div>
          </div>
        </div>
      </article>;
  }
  return <article className="group flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xs">
      <Link
    to={`/blog/${blog.slug}`}
    className="block overflow-hidden bg-[#F7F8FA]"
  >
        <BlogCoverImage
    src={blog.coverImage}
    title={blog.title}
    category={displayCategory}
    aspectRatio="card"
  />
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-[#00875A]">
            {displayCategory}
          </span>
          <span className="text-[#9CA3AF]">Â·</span>
          <span className="text-[#6B7280]">{blog.readTime} Min Read</span>
        </div>

        <h3 className="text-base font-semibold leading-snug text-[#202124] transition-colors group-hover:text-[#1473E6]">
          <Link to={`/blog/${blog.slug}`} className="line-clamp-2">
            {blog.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#6B7280]">
          {blog.description}
        </p>

        <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-[#6B7280]">
          <Avatar
    name={blog.author.username}
    src={blog.author.avatar}
    size="sm"
  />
          <div className="min-w-0 truncate">
            <span>By </span>
            <Link
    to={`/profile/${blog.author.username}`}
    className="font-medium text-[#1473E6] hover:underline"
  >
              {blog.author.username}
            </Link>
            <span className="mx-1 text-[#9CA3AF]">Â·</span>
            <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
          </div>
        </div>
      </div>
    </article>;
}
