import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BlogCard from "../components/PostCard.jsx";
import BlogCoverImage from "../components/BlogCoverImage";
import Avatar from "../components/Avatar";
import { formatDate } from "../format.js";
import { api } from "../api.js";
export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag") ?? "";
  const query = searchParams.get("q") ?? "";
  const viewAllParam = searchParams.get("view") === "all";
  const [searchInput, setSearchInput] = useState(query);
  const [sortBy, setSortBy] = useState("newest");
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(false);
  useEffect(() => {
    setSearchInput(query);
  }, [query]);
  useEffect(() => {
    if (searchInput === query) return;
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (searchInput.trim()) next.set("q", searchInput.trim());
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, query, searchParams, setSearchParams]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.listBlogs({
      tag: activeTag || void 0,
      search: query || void 0,
      limit: 50
    }).then((result) => {
      if (cancelled) return;
      setBlogs(result.blogs);
      setError(null);
    }).catch((err) => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeTag, query]);
  useEffect(() => {
    api.listTags().then(setTags).catch(() => setTags([]));
  }, [blogs.length]);
  const selectTag = (tag) => {
    const next = new URLSearchParams(searchParams);
    next.delete("view");
    if (tag) next.set("tag", tag);
    else next.delete("tag");
    setSearchParams(next);
  };
  const handleClearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };
  const isFiltered = Boolean(activeTag || query || viewAllParam);
  const sortedBlogs = useMemo(() => {
    const list = [...blogs];
    if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "readtime") {
      list.sort((a, b) => a.readTime - b.readTime);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [blogs, sortBy]);
  const featuredHero = blogs[0];
  const featuredRow = blogs.slice(1, 5);
  const latestStoryHighlighted = blogs[5] || blogs[0];
  const latestStoriesGrid = blogs.slice(6, 12).length === 6 ? blogs.slice(6, 12) : blogs.slice(1, 7);
  const trendsGrid = blogs.slice(12, 18).length >= 6 ? blogs.slice(12, 18) : [...blogs.slice(2, 8), ...blogs.slice(0, 4)].slice(0, 6);
  const generalPosts = blogs.filter(
    (b) => b.tags.some(
      (t) => ["general", "architecture", "productivity", "nodejs", "javascript"].includes(t.toLowerCase())
    )
  ).slice(0, 6);
  const productPosts = blogs.filter(
    (b) => b.tags.some(
      (t) => ["product-updates", "devops", "cloud", "security", "react", "typescript"].includes(
        t.toLowerCase()
      )
    )
  ).slice(0, 6);
  const categoryList = [
    "COMMUNICATION (MTD)",
    "DEVELOPER PLATFORMS",
    "EMAIL MANAGEMENT & ARCHITECTURE",
    "FINANCE",
    "HUMAN RESOURCES",
    "LEGAL",
    "MARKETING",
    "PROJECT MANAGEMENT",
    "SALES",
    "SECURITY & COMPLIANCE",
    "SERVERS",
    "IOT",
    "AI AND CHATBOTS",
    "API",
    "TYPESCRIPT",
    "REACT",
    "NODE.JS",
    "MONGODB"
  ];
  return <div className="min-h-screen bg-white">
      {
    /* =========================================================================
       VIEW A: BLOG LISTING / SEARCH RESULTS PAGE (When Filtered or "View All")
       ========================================================================= */
  }
      {isFiltered ? <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
          {
    /* Breadcrumb & Header */
  }
          <div className="mb-8 border-b border-[#E5E7EB] pb-6">
            <div className="mb-3 flex items-center gap-2 text-xs text-[#6B7280]">
              <Link to="/" className="hover:text-[#1473E6]">
                Home
              </Link>
              <span>/</span>
              <span className="font-medium text-[#202124]">
                {activeTag ? `Category: ${activeTag.charAt(0).toUpperCase() + activeTag.slice(1)}` : query ? `Search: "${query}"` : "All Articles"}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#202124] sm:text-3xl">
                  {activeTag ? `${activeTag.charAt(0).toUpperCase() + activeTag.slice(1)} Articles` : query ? `Results for "${query}"` : "All Articles & Insights"}
                </h1>
                <p className="mt-1.5 text-sm text-[#6B7280]">
                  {loading ? "Searching articles..." : `Showing ${sortedBlogs.length} ${sortedBlogs.length === 1 ? "article" : "articles"}`}
                </p>
              </div>

              {
    /* Sorting and Search Toolbar */
  }
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#202124] outline-none transition focus:border-[#1473E6]"
  >
                    <option value="newest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="readtime">Shortest Read</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <svg
    className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                  </svg>
                  <input
    type="search"
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    placeholder="Search in results..."
    className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] py-2 pr-3 pl-8 text-xs text-[#202124] outline-none transition placeholder-[#9CA3AF] focus:border-[#1473E6] focus:bg-white"
  />
                </div>
              </div>
            </div>

            {
    /* Category Filter Pills Bar */
  }
            {tags.length > 0 && <div className="mt-6 flex flex-wrap items-center gap-2">
                <button
    type="button"
    onClick={() => selectTag("")}
    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${activeTag === "" ? "bg-[#1473E6] text-white" : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-slate-300 hover:text-[#202124]"}`}
  >
                  All Categories
                </button>
                {tags.map((tag) => <button
    key={tag.slug}
    type="button"
    onClick={() => selectTag(tag.slug)}
    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${activeTag === tag.slug ? "bg-[#1473E6] text-white" : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-slate-300 hover:text-[#202124]"}`}
  >
                    #{tag.name}
                  </button>)}

                {(activeTag || query) && <button
    type="button"
    onClick={handleClearFilters}
    className="ml-2 text-xs font-semibold text-[#1473E6] hover:underline"
  >
                    Clear filters
                  </button>}
              </div>}
          </div>

          {
    /* Results Grid */
  }
          {loading ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => <div
    key={n}
    className="h-72 animate-pulse rounded-xl border border-[#E5E7EB] bg-[#F7F8FA]"
  />)}
            </div> : error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
              {error}
            </div> : sortedBlogs.length === 0 ? <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-6 py-20 text-center">
              <h3 className="text-base font-bold text-[#202124]">
                No articles found
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-[#6B7280]">
                We couldn't find any articles matching your search criteria. Try another keyword or browse all categories.
              </p>
              <button
    type="button"
    onClick={handleClearFilters}
    className="mt-5 rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0d62c9]"
  >
                Clear Filters & Show All
              </button>
            </div> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {sortedBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>}
        </div> : (
    /* =========================================================================
        VIEW B: MAIN HOMEPAGE (Exact match to Zoho Blog Reference Screenshots)
        ========================================================================= */
    <div className="pb-20">
          {
      /* SECTION 1: FEATURED POSTS (With Left Hero + Right Promo Sidebar) */
    }
          <section className="mx-auto max-w-[1200px] px-4 pt-8 sm:px-6 lg:px-8">
            {
      /* Red Eyebrow Indicator */
    }
            <div className="mb-4 flex items-center gap-1.5">
              <span className="h-3 w-1 rounded-full bg-[#E11D48]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#E11D48]">
                Featured Posts
              </h2>
            </div>

            {loading ? <div className="h-96 animate-pulse rounded-xl border border-[#E5E7EB] bg-[#F7F8FA]" /> : featuredHero ? <div className="space-y-8">
                {
      /* Top Split: Left Hero (70%) + Right Promo Sidebar (30%) */
    }
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  {
      /* Left Column: Hero Article */
    }
                  <article className="group lg:col-span-8">
                    <Link
      to={`/blog/${featuredHero.slug}`}
      className="block overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F7F8FA]"
    >
                      <BlogCoverImage
      src={featuredHero.coverImage}
      title={featuredHero.title}
      category={featuredHero.tags[0] || "General"}
      aspectRatio="hero"
    />
                    </Link>

                    {
      /* Meta & Title below hero image */
    }
                    <div className="mt-4">
                      <div className="mb-2 flex items-center gap-2 text-xs">
                        <span className="font-semibold text-[#00875A]">
                          {featuredHero.tags[0] ? featuredHero.tags[0].toUpperCase() : "GENERAL"}
                        </span>
                        <span className="text-[#9CA3AF]">Â·</span>
                        <span className="text-[#6B7280]">
                          {featuredHero.readTime} Min Read
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold tracking-tight text-[#202124] sm:text-3xl transition-colors group-hover:text-[#1473E6]">
                        <Link to={`/blog/${featuredHero.slug}`}>
                          {featuredHero.title}
                        </Link>
                      </h2>

                      <div className="mt-3 flex items-center gap-2 text-xs text-[#6B7280]">
                        <Avatar
      name={featuredHero.author.username}
      src={featuredHero.author.avatar}
      size="sm"
    />
                        <span>By </span>
                        <Link
      to={`/profile/${featuredHero.author.username}`}
      className="font-semibold text-[#1473E6] hover:underline"
    >
                          {featuredHero.author.username}
                        </Link>
                        <span className="text-[#9CA3AF]">Â·</span>
                        <time dateTime={featuredHero.createdAt}>
                          {formatDate(featuredHero.createdAt)}
                        </time>
                      </div>
                    </div>
                  </article>

                  {
      /* Right Column: Promotional Callout Cards (Matches Reference Screenshot) */
    }
                  <aside className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] p-6 lg:col-span-4">
                    {
      /* Promo Card 1 */
    }
                    <div className="space-y-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669]">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-[#202124] leading-snug">
                        They are here: our building high-scale platforms, from the ground up series
                      </h3>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        Practical architectural blueprints and lessons learned from veteran engineers.
                      </p>
                      <div>
                        <Link
      to="/blog/beyond-mtd-helping-engineering-practices-scale"
      className="inline-flex items-center gap-1.5 rounded border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#1473E6] transition hover:border-[#1473E6] hover:bg-[#F7F8FA]"
    >
                          READ STORY &gt;
                        </Link>
                      </div>
                    </div>

                    <hr className="my-6 border-dashed border-[#E5E7EB]" />

                    {
      /* Promo Card 2 */
    }
                    <div className="space-y-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1473E6]">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-[#202124] leading-snug">
                        DevLog Academy: Online engineering training for developers
                      </h3>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        Master TypeScript, React 19, distributed MongoDB, and high-throughput Node.js.
                      </p>
                      <div>
                        <Link
      to="/?tag=typescript"
      className="inline-flex items-center gap-1.5 rounded border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#1473E6] transition hover:border-[#1473E6] hover:bg-[#F7F8FA]"
    >
                          START LEARNING &gt;
                        </Link>
                      </div>
                    </div>
                  </aside>
                </div>

                {
      /* 4 Cards Row in a balanced grid */
    }
                {featuredRow.length > 0 && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-2">
                    {featuredRow.map((blog) => <BlogCard key={blog._id} blog={blog} variant="standard" />)}
                  </div>}
              </div> : null}
          </section>

          {
      /* SECTION 2: EXPLORE CATEGORIES (Soft Grey Section with Bordered Pill Buttons) */
    }
          <section className="my-16 border-y border-[#E5E7EB] bg-[#F7F8FA] py-16">
            <div className="mx-auto max-w-[1200px] px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold tracking-tight text-[#202124] sm:text-3xl">
                Explore categories
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#6B7280]">
                Explore in-depth technical articles, tutorials, and architectural best practices.
              </p>

              {
      /* Multiple Rows of Bordered Tags */
    }
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
                {(expandedCategories ? categoryList : categoryList.slice(0, 12)).map(
      (cat) => {
        const tagSlug = cat.toLowerCase().replace(/[^\w]+/g, "-");
        return <button
          key={cat}
          type="button"
          onClick={() => selectTag(tagSlug)}
          className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#202124] shadow-2xs transition-all duration-150 hover:border-[#1473E6] hover:text-[#1473E6] hover:shadow-xs"
        >
                        {cat}
                      </button>;
      }
    )}
              </div>

              {
      /* SEE MORE TOPICS Button */
    }
              <div className="mt-8">
                <button
      type="button"
      onClick={() => setExpandedCategories(!expandedCategories)}
      className="rounded-lg border border-[#E5E7EB] bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#1473E6] shadow-2xs transition hover:border-[#1473E6] hover:bg-[#F7F8FA]"
    >
                  {expandedCategories ? "Show Less Topics" : "See More Topics"} &gt;
                </button>
              </div>
            </div>
          </section>

          {
      /* SECTION 3: LATEST STORIES (1 Horizontal Highlight + 6 Card Grid + VIEW ALL Button) */
    }
          <section className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-1.5">
              <span className="h-3 w-1 rounded-full bg-[#E11D48]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                Latest Stories
              </h2>
            </div>

            <div className="space-y-6">
              {
      /* Highlighted Story (Horizontal Split Card) */
    }
              {latestStoryHighlighted && <BlogCard blog={latestStoryHighlighted} variant="horizontal" />}

              {
      /* 6 Cards in a Responsive 2-Row x 3-Column Grid */
    }
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latestStoriesGrid.map((blog) => <BlogCard key={blog._id} blog={blog} variant="standard" />)}
              </div>

              {
      /* "VIEW ALL STORIES >" Centered Button */
    }
              <div className="pt-8 text-center">
                <button
      type="button"
      onClick={() => {
        const next = new URLSearchParams();
        next.set("view", "all");
        setSearchParams(next);
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-7 py-2.5 text-xs font-bold tracking-wider uppercase text-[#1473E6] shadow-2xs transition hover:border-[#1473E6] hover:bg-[#F7F8FA]"
    >
                  View All Stories &gt;
                </button>
              </div>
            </div>
          </section>

          {
      /* SECTION 4: TRENDS & INSIGHTS (Exactly 6 Cards in a 2x3 Grid) */
    }
          <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#202124]">
                Trends & Insights
              </h2>
              <p className="mt-1 text-xs text-[#6B7280]">
                Curated technical perspectives on scalability, reliability, and security.
              </p>
            </div>

            {
      /* Exactly 6 Cards Grid (3 Columns x 2 Rows) */
    }
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trendsGrid.map((blog) => <BlogCard key={blog._id} blog={blog} variant="standard" />)}
            </div>
          </section>

          {
      /* SECTION 5: ADDITIONAL CATEGORY FEEDS (Dual Columns: 6 Items Each) */
    }
          <section className="mx-auto max-w-[1200px] border-t border-[#E5E7EB] px-4 pt-14 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {
      /* Column 1: | GENERAL */
    }
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-1 rounded-full bg-[#E11D48]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                      General
                    </h3>
                  </div>
                  <button
      type="button"
      onClick={() => selectTag("general")}
      className="text-[11px] font-semibold text-[#1473E6] hover:underline"
    >
                    View All &gt;
                  </button>
                </div>

                <div className="divide-y divide-[#E5E7EB]">
                  {generalPosts.map((blog) => <BlogCard key={blog._id} blog={blog} variant="list-item" />)}
                </div>
              </div>

              {
      /* Column 2: | PRODUCT UPDATES */
    }
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-1 rounded-full bg-[#E11D48]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                      Product Updates
                    </h3>
                  </div>
                  <button
      type="button"
      onClick={() => selectTag("product-updates")}
      className="text-[11px] font-semibold text-[#1473E6] hover:underline"
    >
                    View All &gt;
                  </button>
                </div>

                <div className="divide-y divide-[#E5E7EB]">
                  {productPosts.map((blog) => <BlogCard key={blog._id} blog={blog} variant="list-item" />)}
                </div>
              </div>
            </div>
          </section>
        </div>
  )}
    </div>;
}
