import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BlogCard from "../components/PostCard.jsx";
import Avatar from "../components/Avatar";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
export default function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setLoading(true);
    api.profile(username).then((result) => {
      if (!cancelled) setProfile(result);
    }).catch((err) => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [username]);
  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
          <p className="text-xs text-[#6B7280]">Loading profile...</p>
        </div>
      </div>;
  }
  if (error || !profile) {
    return <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#202124]">
          Author not found
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          {error ?? "This author profile does not exist or has been removed."}
        </p>
        <Link
      to="/"
      className="mt-6 inline-block rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0d62c9]"
    >
          Return to Blog Home
        </Link>
      </div>;
  }
  const isOwner = user?.username === profile.user.username;
  const blogs = profile.blogs;
  const totalRead = blogs.reduce((sum, blog) => sum + blog.readTime, 0);
  return <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
      {
    /* Author Header Card */
  }
      <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
        <div className="h-20 bg-gradient-to-r from-[#1473E6]/10 via-[#F7F8FA] to-[#00875A]/10 border-b border-[#E5E7EB]" />
        <div className="flex flex-col gap-6 px-6 pt-0 pb-6 sm:flex-row sm:items-end sm:px-8">
          <div className="-mt-10 rounded-full ring-4 ring-white shadow-xs">
            <Avatar
    name={profile.user.username}
    src={profile.user.avatar}
    size="lg"
  />
          </div>

          <div className="flex-1 sm:pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#202124] sm:text-2xl">
                {profile.user.username}
              </h1>
              {isOwner && <span className="rounded-md border border-[#E5E7EB] bg-[#F7F8FA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1473E6]">
                  You
                </span>}
            </div>
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-[#6B7280]">
              {profile.user.bio || "Full-stack software engineer and writer sharing practical guides and engineering patterns."}
            </p>
          </div>

          <div className="flex items-center gap-6 sm:pb-1 border-t border-[#E5E7EB] pt-4 sm:border-t-0 sm:pt-0">
            <div>
              <p className="text-lg font-bold text-[#202124]">
                {blogs.length}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Articles
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#202124]">
                {totalRead}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Min Read
              </p>
            </div>
            {isOwner && <Link
    to="/write"
    className="rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0d62c9]"
  >
                Write Post
              </Link>}
          </div>
        </div>
      </section>

      {
    /* Author's Articles List */
  }
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#202124]">
            {isOwner ? "Your Articles" : `Articles by ${profile.user.username}`}
            <span className="ml-2 text-xs font-normal text-[#9CA3AF]">
              ({blogs.length})
            </span>
          </h2>

          <Link
    to="/"
    className="text-xs font-semibold text-[#1473E6] hover:underline"
  >
            &larr; Back to all articles
          </Link>
        </div>

        {blogs.length === 0 ? <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-6 py-16 text-center">
            <h3 className="text-base font-bold text-[#202124]">
              No articles published yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[#6B7280]">
              {isOwner ? "You haven't written any articles yet. Share your engineering knowledge with the community!" : "This author hasn't published any articles yet."}
            </p>
            {isOwner && <Link
    to="/write"
    className="mt-5 inline-block rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0d62c9]"
  >
                Write Your First Article
              </Link>}
          </div> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
          </div>}
      </div>
    </div>;
}
