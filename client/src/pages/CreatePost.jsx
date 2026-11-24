import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MarkdownView from "../components/MarkdownView";
import RichTextEditor from "../components/RichTextEditor";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
const STARTER = `<h2>Overview</h2>
<p>Explain what you are building, the engineering trade-offs, and why this solution matters.</p>
<h2>Key Takeaways</h2>
<ul>
  <li>Architecture and design patterns</li>
  <li>Concrete implementation steps</li>
  <li>Real-world production considerations</li>
</ul>`;
export default function WritePage() {
  const { slug } = useParams();
  const isEditing = Boolean(slug);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [markdown, setMarkdown] = useState(STARTER);
  const [tags, setTags] = useState([]);
  const [tagDraft, setTagDraft] = useState("");
  const [tab, setTab] = useState("write");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    api.getBlog(slug).then((blog) => {
      if (cancelled) return;
      setTitle(blog.title);
      setDescription(blog.description);
      setCoverImage(blog.coverImage || "");
      setMarkdown(blog.markdown);
      setTags(blog.tags);
    }).catch((err) => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  const addTag = (raw) => {
    const value = raw.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");
    if (!value) return;
    setTags(
      (current) => current.includes(value) || current.length >= 5 ? current : [...current, value]
    );
    setTagDraft("");
  };
  const stats = useMemo(() => {
    const words = markdown.split(/\s+/).filter(Boolean).length;
    return {
      words,
      minutes: Math.max(1, Math.ceil(words / 200))
    };
  }, [markdown]);
  const canPublish = title.trim().length > 0 && description.trim().length > 0 && markdown.trim().length > 0 && tags.length > 0;
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;
    setError(null);
    if (!canPublish) {
      setError("Please add a title, a short description, at least one tag, and article content.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        coverImage: coverImage.trim(),
        markdown,
        tags
      };
      const blog = isEditing ? await api.updateBlog(slug, payload, user) : await api.createBlog(payload, user);
      navigate(`/blog/${blog.slug}`, { replace: true });
    } catch (err) {
      setError(err.message || "Could not publish the article");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
          <p className="text-xs text-[#6B7280]">Loading article draft...</p>
        </div>
      </div>;
  }
  return <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6 lg:px-8">
      {
    /* Top Header */
  }
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-[#6B7280]">
            <Link to="/" className="hover:text-[#1473E6]">
              Home
            </Link>
            <span>/</span>
            <span>{isEditing ? "Edit Article" : "Write Article"}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-[#202124]">
            {isEditing ? "Edit Article" : "Draft New Article"}
          </h1>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
          <span>{stats.words} words</span>
          <span>Â·</span>
          <span>{stats.minutes} min read</span>
        </div>
      </div>

      {error && <div
    role="alert"
    className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
  >
          {error}
        </div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {
    /* Metadata Card */
  }
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-2xs space-y-4">
          <div>
            <label
    htmlFor="title"
    className="block text-xs font-semibold text-[#202124]"
  >
              Article Title <span className="text-rose-500">*</span>
            </label>
            <input
    id="title"
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Understanding Event-Driven Microservices in Node.js"
    maxLength={100}
    className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-base font-semibold text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
  />
          </div>

          <div>
            <label
    htmlFor="description"
    className="block text-xs font-semibold text-[#202124]"
  >
              Short Summary <span className="text-rose-500">*</span>
            </label>
            <input
    id="description"
    type="text"
    required
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="A brief 1-2 sentence overview shown in feeds and cards."
    className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-xs text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
  />
          </div>

          <div>
            <label
    htmlFor="coverImage"
    className="block text-xs font-semibold text-[#202124]"
  >
              Cover Image URL <span className="text-[#9CA3AF] font-normal">(Optional)</span>
            </label>
            <input
    id="coverImage"
    type="url"
    value={coverImage}
    onChange={(e) => setCoverImage(e.target.value)}
    placeholder="https://example.com/image.jpg (If left blank, an elegant Zoho-style tech illustration will be generated)"
    className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-xs text-[#202124] placeholder-[#9CA3AF] outline-none transition focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
  />
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#202124]">
              Technology Tags <span className="text-rose-500">*</span>{" "}
              <span className="font-normal text-[#9CA3AF]">(Up to 5)</span>
            </span>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-[#E5E7EB] p-2 focus-within:border-[#1473E6] focus-within:ring-1 focus-within:ring-[#1473E6]">
              {tags.map((tag) => <span
    key={tag}
    className="inline-flex items-center gap-1 rounded-md bg-[#1473E6]/10 px-2 py-0.5 text-xs font-medium text-[#1473E6]"
  >
                  #{tag}
                  <button
    type="button"
    onClick={() => setTags((current) => current.filter((item) => item !== tag))}
    className="ml-1 text-[#1473E6] hover:text-[#0d62c9]"
    aria-label={`Remove tag ${tag}`}
  >
                    Ã—
                  </button>
                </span>)}

              <input
    type="text"
    value={tagDraft}
    onChange={(e) => setTagDraft(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(tagDraft);
      }
      if (e.key === "Backspace" && !tagDraft && tags.length) {
        setTags((current) => current.slice(0, -1));
      }
    }}
    onBlur={() => addTag(tagDraft)}
    placeholder={tags.length ? "Add more..." : "e.g. javascript, react, nodejs"}
    className="min-w-[12rem] flex-1 bg-transparent px-1 text-xs text-[#202124] outline-none placeholder-[#9CA3AF]"
  />
            </div>
            <p className="mt-1 text-[11px] text-[#9CA3AF]">
              Press Enter or comma to add a tag.
            </p>
          </div>
        </div>

        {
    /* Rich Text Editor */
  }
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-[#202124]">
              Article Content <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              <button
    type="button"
    onClick={() => setTab("write")}
    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${tab === "write" ? "bg-[#EBF3FD] text-[#1473E6]" : "text-[#6B7280] hover:text-[#202124]"}`}
  >
                Visual Editor
              </button>
              <button
    type="button"
    onClick={() => setTab("preview")}
    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${tab === "preview" ? "bg-[#EBF3FD] text-[#1473E6]" : "text-[#6B7280] hover:text-[#202124]"}`}
  >
                Reader Preview
              </button>
            </div>
          </div>

          {tab === "write" ? <RichTextEditor
    value={markdown}
    onChange={setMarkdown}
    placeholder="Write your article with rich formatting, headings, lists, tables, code, and media..."
    minHeight="380px"
  /> : <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-2xs min-h-[22rem] max-h-[38rem] overflow-y-auto">
              {markdown.trim() ? <MarkdownView content={markdown} /> : <p className="text-xs text-[#9CA3AF]">Nothing to preview yet.</p>}
            </div>}
        </div>

        {
    /* Actions Bar */
  }
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
    type="button"
    onClick={() => navigate(-1)}
    className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#4B5563] transition hover:bg-[#F7F8FA]"
  >
            Cancel
          </button>
          <button
    type="submit"
    disabled={saving}
    className="rounded-lg bg-[#1473E6] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0d62c9] disabled:opacity-50"
  >
            {saving ? "Publishing..." : isEditing ? "Save Changes" : "Publish Article"}
          </button>
        </div>
      </form>
    </div>;
}
