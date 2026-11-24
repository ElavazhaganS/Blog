import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api.js";
import { slugify } from "../../format.js";
import { useAuth } from "../../AuthContext.jsx";
import RichTextEditor from "../../components/RichTextEditor";
const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  markdown: "",
  coverImage: "",
  category: "Software Development",
  tags: "",
  status: "published",
  scheduledAt: "",
  isFeatured: false,
  seoTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  author: ""
};
export default function AdminArticleEditor() {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const field = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };
  useEffect(() => {
    if (!isEdit && form.title) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, isEdit]);
  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => {
    });
    api.listUsers().then(setUsers).catch(() => {
    });
    if (isEdit && slug) {
      setLoading(true);
      api.getBlog(slug).then((blog) => {
        const authorId = blog.author?._id || blog.author?.id || "";
        setForm({
          title: blog.title || "",
          slug: blog.slug || "",
          description: blog.description || "",
          markdown: blog.markdown || "",
          coverImage: blog.coverImage || "",
          category: blog.category || "Software Development",
          tags: (blog.tags || []).join(", "),
          status: blog.status || "published",
          scheduledAt: blog.scheduledAt ? blog.scheduledAt.slice(0, 16) : "",
          isFeatured: Boolean(blog.isFeatured),
          seoTitle: blog.seoTitle || "",
          metaDescription: blog.metaDescription || "",
          canonicalUrl: blog.canonicalUrl || "",
          author: authorId
        });
      }).catch(() => setError("Article not found or could not be loaded.")).finally(() => setLoading(false));
    }
  }, [slug, isEdit]);
  useEffect(() => {
    if (!isEdit && !form.author && (user?.id || user?._id)) {
      setForm((f) => ({ ...f, author: user?.id || user?._id || "" }));
    }
  }, [isEdit, form.author, user]);
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const data = ev.target?.result;
        const result = await api.uploadMedia(data, file.name);
        setForm((f) => ({ ...f, coverImage: result.url }));
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      setError("Failed to upload image. Please try another image or URL.");
    }
  };
  const handleSubmit = async (e, overrideStatus) => {
    if (e) e.preventDefault();
    if (!user) return;
    if (!form.title.trim()) {
      setError("Article title is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Article description / excerpt is required.");
      return;
    }
    if (!form.markdown.trim()) {
      setError("Article content cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    const activeStatus = overrideStatus || form.status;
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || void 0,
        description: form.description.trim(),
        markdown: form.markdown,
        coverImage: form.coverImage.trim(),
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: activeStatus,
        scheduledAt: activeStatus === "scheduled" && form.scheduledAt ? form.scheduledAt : void 0,
        isFeatured: form.isFeatured,
        seoTitle: form.seoTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        canonicalUrl: form.canonicalUrl.trim(),
        author: form.author || void 0
      };
      if (isEdit && slug) {
        const updated = await api.updateBlog(slug, payload, user);
        setForm((f) => ({
          ...f,
          status: updated.status || activeStatus,
          slug: updated.slug
        }));
        setSuccess("Article updated successfully! Changes are live on the public blog.");
        if (updated.slug && updated.slug !== slug) {
          navigate(`/admin/edit/${updated.slug}`, { replace: true });
        }
      } else {
        const created = await api.createBlog(payload, user);
        setSuccess("Article created successfully! Redirecting to editor\xE2\u20AC\xA6");
        setTimeout(() => navigate(`/admin/edit/${created.slug}`), 1200);
      }
    } catch (e2) {
      setError(e2.message || "Could not save article.");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!isEdit || !slug || !user) return;
    setDeleting(true);
    try {
      await api.deleteBlog(slug, user);
      navigate("/admin/articles", { replace: true });
    } catch (e) {
      setError(e.message || "Failed to delete article.");
      setShowDeleteModal(false);
      setDeleting(false);
    }
  };
  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
      </div>;
  }
  return <div className="p-6 max-w-5xl mx-auto space-y-6">
      {
    /* Top Header */
  }
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
    to="/admin/articles"
    className="text-xs font-semibold text-[#1473E6] hover:underline flex items-center gap-1"
  >
              â† Back to Articles
            </Link>
          </div>
          <h1 className="mt-1 text-xl font-bold text-[#202124]">
            {isEdit ? "Edit Article" : "Create New Article"}
          </h1>
          {isEdit && <p className="mt-0.5 text-xs text-[#6B7280]">
              Managing: <code className="bg-[#F3F4F6] px-1.5 py-0.5 rounded text-[11px] font-mono text-[#202124]">/{slug}</code>
            </p>}
        </div>

        <div className="flex items-center gap-2">
          <button
    type="button"
    onClick={() => setPreviewMode((v) => !v)}
    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#6B7280] transition hover:border-[#202124] hover:text-[#202124] shadow-2xs"
  >
            {previewMode ? "Visual Editor" : "Live Reader Preview"}
          </button>
          {isEdit && <a
    href={`/blog/${form.slug || slug}`}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#6B7280] transition hover:border-[#1473E6] hover:text-[#1473E6] shadow-2xs"
  >
              View on Website â†—
            </a>}
        </div>
      </div>

      {
    /* Error & Success Messages */
  }
      {error && <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700 font-medium">
          {error}
        </div>}
      {success && <div className="rounded-lg bg-[#F0FDF4] border border-[#A7F3D0] px-4 py-3 text-xs text-[#059669] font-medium flex items-center justify-between">
          <span>âœ“ {success}</span>
          <button onClick={() => setSuccess(null)} className="text-[#059669] hover:text-[#047857]">âœ•</button>
        </div>}

      {
    /* Main Form */
  }
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {
    /* â”€â”€ Left / Main Column â”€â”€ */
  }
          <div className="lg:col-span-2 space-y-5">
            {
    /* Title */
  }
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                Article Title <span className="text-rose-500">*</span>
              </label>
              <input
    type="text"
    required
    value={form.title}
    onChange={field("title")}
    placeholder="Enter a compelling article title..."
    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#202124] placeholder-[#9CA3AF] outline-none focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6] shadow-2xs"
  />
            </div>

            {
    /* URL Slug */
  }
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#202124]">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <button
    type="button"
    onClick={() => setForm((f) => ({ ...f, slug: slugify(f.title) }))}
    className="text-[11px] font-medium text-[#1473E6] hover:underline"
  >
                  Regenerate from title
                </button>
              </div>
              <div className="flex items-center rounded-lg border border-[#E5E7EB] overflow-hidden focus-within:border-[#1473E6] focus-within:ring-1 focus-within:ring-[#1473E6] shadow-2xs">
                <span className="bg-[#F7F8FA] border-r border-[#E5E7EB] px-3 py-2 text-xs text-[#9CA3AF] whitespace-nowrap font-mono">
                  /blog/
                </span>
                <input
    type="text"
    required
    value={form.slug}
    onChange={field("slug")}
    className="flex-1 px-3 py-2 text-xs text-[#202124] outline-none bg-white font-mono"
    placeholder="article-url-slug"
  />
              </div>
            </div>

            {
    /* Excerpt / Description */
  }
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                Excerpt / Meta Description <span className="text-rose-500">*</span>
              </label>
              <textarea
    required
    rows={3}
    value={form.description}
    onChange={field("description")}
    placeholder="A concise summary of the article displayed on blog cards and search results..."
    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-xs text-[#202124] placeholder-[#9CA3AF] outline-none focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6] resize-y shadow-2xs"
  />
            </div>

            {
    /* Rich Text Editor for Content */
  }
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#202124]">
                  Article Content <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-[#6B7280]">
                  WYSIWYG Rich Text Editor with live formatting & media
                </span>
              </div>

              {previewMode ? <div className="min-h-[460px] max-h-[700px] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-2xs">
                  <div className="mb-4 pb-3 border-b border-[#E5E7EB]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1473E6]">
                      Previewing as Reader
                    </span>
                    <h2 className="text-xl font-bold text-[#202124] mt-1">{form.title || "Untitled Article"}</h2>
                  </div>
                  {form.markdown ? <div
    className="rich-text-article text-sm leading-relaxed text-[#202124] prose max-w-none"
    dangerouslySetInnerHTML={{ __html: form.markdown }}
  /> : <span className="text-xs text-[#9CA3AF]">No content entered yet.</span>}
                </div> : <RichTextEditor
    value={form.markdown}
    onChange={(val) => setForm((prev) => ({ ...prev, markdown: val }))}
    placeholder="Write your article with rich formatting, headings, lists, tables, code blocks, images, and videos..."
    minHeight="460px"
  />}
            </div>
          </div>

          {
    /* â”€â”€ Right Sidebar â”€â”€ */
  }
          <div className="space-y-4">
            {
    /* 1. Publishing & Status Panel */
  }
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Publish Management
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Publication Status
                </label>
                <select
    value={form.status}
    onChange={field("status")}
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1473E6]"
  >
                  <option value="published">Published (Live to public)</option>
                  <option value="draft">Draft (Private, not visible)</option>
                  <option value="scheduled">Scheduled (Publish in future)</option>
                </select>
              </div>

              {form.status === "scheduled" && <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Scheduled Publication Time
                  </label>
                  <input
    type="datetime-local"
    value={form.scheduledAt}
    onChange={field("scheduledAt")}
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1473E6]"
  />
                  <p className="mt-1 text-[10px] text-[#7C3AED]">
                    Post will automatically publish when this time is reached.
                  </p>
                </div>}

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
    type="checkbox"
    checked={form.isFeatured}
    onChange={field("isFeatured")}
    className="rounded border-[#E5E7EB] text-[#1473E6] focus:ring-0"
  />
                <span className="text-xs font-medium text-[#202124]">Mark as Featured Article</span>
              </label>

              {
    /* Action Buttons */
  }
              <div className="pt-2 border-t border-[#F3F4F6] flex flex-col gap-2">
                <button
    type="submit"
    disabled={saving}
    className="w-full rounded-lg bg-[#1473E6] py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#0d62c9] transition disabled:opacity-60 flex items-center justify-center gap-1.5"
  >
                  {saving ? <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Savingâ€¦
                    </> : isEdit ? "Update Article" : "Publish Article"}
                </button>

                {
    /* Quick Publish / Unpublish Actions */
  }
                {isEdit && form.status === "published" && <button
    type="button"
    disabled={saving}
    onClick={() => handleSubmit(void 0, "draft")}
    className="w-full rounded-lg border border-amber-300 bg-amber-50 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition"
  >
                    Unpublish to Draft
                  </button>}

                {isEdit && form.status !== "published" && <button
    type="button"
    disabled={saving}
    onClick={() => handleSubmit(void 0, "published")}
    className="w-full rounded-lg border border-emerald-300 bg-emerald-50 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
  >
                    Publish to Website Now
                  </button>}

                {!isEdit && <button
    type="button"
    disabled={saving}
    onClick={() => handleSubmit(void 0, "draft")}
    className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 text-xs font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#202124] transition"
  >
                    Save as Draft
                  </button>}
              </div>
            </div>

            {
    /* 2. Featured Image */
  }
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Featured Image
              </h3>
              {form.coverImage ? <div className="space-y-2">
                  <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
                    <img src={form.coverImage} alt="Cover Preview" className="h-32 w-full object-cover" />
                  </div>
                  <button
    type="button"
    onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
    className="text-[11px] text-rose-600 hover:underline"
  >
                    Remove Image
                  </button>
                </div> : null}

              <input
    type="text"
    value={form.coverImage}
    onChange={field("coverImage")}
    placeholder="Paste image URL (https://...)"
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#202124] placeholder-[#9CA3AF] outline-none focus:border-[#1473E6]"
  />

              <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#E5E7EB] px-3 py-2 text-xs text-[#6B7280] transition hover:border-[#1473E6] hover:text-[#1473E6]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {uploading ? "Uploading Image\xE2\u20AC\xA6" : "Upload from Computer"}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {
    /* 3. Organization (Author & Category & Tags) */
  }
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Organization & Author
              </h3>

              {
    /* Author Selection */
  }
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Article Author
                </label>
                <select
    value={form.author}
    onChange={field("author")}
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1473E6]"
  >
                  {users.length > 0 ? users.map((u) => {
    const uid = u.id || u._id || "";
    return <option key={uid} value={uid}>
                          {u.username} ({u.role || "user"}) {u.email ? `\xC2\xB7 ${u.email}` : ""}
                        </option>;
  }) : <option value={user?.id || ""}>{user?.username || "Admin"}</option>}
                </select>
              </div>

              {
    /* Category */
  }
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Category
                </label>
                <select
    value={form.category}
    onChange={field("category")}
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1473E6]"
  >
                  {categories.map((c) => <option key={c._id} value={c.name}>
                      {c.name}
                    </option>)}
                </select>
              </div>

              {
    /* Tags */
  }
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Tags (comma-separated)
                </label>
                <input
    type="text"
    value={form.tags}
    onChange={field("tags")}
    placeholder="react, typescript, nodejs"
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#202124] placeholder-[#9CA3AF] outline-none focus:border-[#1473E6]"
  />
              </div>
            </div>

            {
    /* 4. SEO Settings */
  }
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                SEO & Meta Details
              </h3>
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  SEO Title
                </label>
                <input
    type="text"
    value={form.seoTitle}
    onChange={field("seoTitle")}
    placeholder="Defaults to article title"
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1473E6]"
    maxLength={70}
  />
                <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{form.seoTitle.length}/70 characters</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Meta Description
                </label>
                <textarea
    rows={2}
    value={form.metaDescription}
    onChange={field("metaDescription")}
    placeholder="Defaults to article excerpt"
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1473E6] resize-none"
    maxLength={160}
  />
                <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{form.metaDescription.length}/160 characters</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Canonical URL
                </label>
                <input
    type="url"
    value={form.canonicalUrl}
    onChange={field("canonicalUrl")}
    placeholder="https://..."
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1473E6]"
  />
              </div>
            </div>

            {
    /* 5. Danger Zone (Delete Article) */
  }
            {isEdit && <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-2xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Danger Zone
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  Permanently delete this article and remove it from the MongoDB database.
                </p>
                <button
    type="button"
    onClick={() => setShowDeleteModal(true)}
    className="w-full rounded-lg border border-rose-300 bg-white py-2 text-xs font-semibold text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs"
  >
                  Delete This Article
                </button>
              </div>}
          </div>
        </div>
      </form>

      {
    /* Delete Confirmation Modal */
  }
      {showDeleteModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
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
              <strong className="text-[#202124]">"{form.title}"</strong>?
              <br />
              <span className="text-rose-600 font-medium">
                This action cannot be undone and will permanently remove the article from MongoDB and the live website.
              </span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3F4F6]">
              <button
    type="button"
    disabled={deleting}
    onClick={() => setShowDeleteModal(false)}
    className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#202124] transition disabled:opacity-50"
  >
                Cancel
              </button>
              <button
    type="button"
    disabled={deleting}
    onClick={handleDelete}
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
