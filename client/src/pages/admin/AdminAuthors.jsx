import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { slugify } from "../../format.js";
const EMPTY = {
  name: "",
  slug: "",
  email: "",
  designation: "Technology Writer",
  bio: "",
  avatar: "",
  socialLinks: { twitter: "", linkedin: "", github: "", website: "" }
};
export default function AdminAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const data = await api.listAuthors();
      setAuthors(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAuthors();
  }, []);
  useEffect(() => {
    if (!editingId && form.name && !form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name, editingId]);
  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };
  const handleEdit = (author) => {
    setForm({ name: author.name, slug: author.slug, email: author.email || "", designation: author.designation || "Technology Writer", bio: author.bio || "", avatar: author.avatar || "", socialLinks: { twitter: author.socialLinks?.twitter || "", linkedin: author.socialLinks?.linkedin || "", github: author.socialLinks?.github || "", website: author.socialLinks?.website || "" } });
    setEditingId(author._id);
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        const updated = await api.updateAuthor(editingId, form);
        setAuthors((prev) => prev.map((a) => a._id === editingId ? { ...a, ...updated } : a));
        setSuccess("Author updated!");
      } else {
        const created = await api.createAuthor(form);
        setAuthors((prev) => [created, ...prev]);
        setSuccess("Author created!");
      }
      setTimeout(() => {
        setSuccess(null);
        resetForm();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (author) => {
    if (!window.confirm(`Delete author "${author.name}"?`)) return;
    setDeleting(author._id);
    try {
      await api.deleteAuthor(author._id);
      setAuthors((prev) => prev.filter((a) => a._id !== author._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setSocial = (key, value) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }));
  return <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Authors</h1>
          <p className="mt-0.5 text-xs text-[#6B7280]">{authors.length} authors</p>
        </div>
        {!showForm && <button
    onClick={() => setShowForm(true)}
    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0d62c9] transition"
  >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Author
          </button>}
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] px-4 py-3 text-xs font-medium text-[#059669]">âœ“ {success}</div>}

      {
    /* Author Form */
  }
      {showForm && <div className="mb-6 rounded-xl border border-[#1473E6]/20 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#202124]">{editingId ? "Edit Author" : "New Author"}</h2>
            <button onClick={resetForm} className="text-xs text-[#9CA3AF] hover:text-[#6B7280]">Cancel</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Full Name <span className="text-rose-500">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Arun Kumar" className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Designation</label>
                <input type="text" value={form.designation} onChange={(e) => setField("designation", e.target.value)} placeholder="Technology Writer" className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="author@example.com" className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">URL Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="auto-generated" className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#202124] mb-1">Avatar URL</label>
                <input type="url" value={form.avatar} onChange={(e) => setField("avatar", e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#202124] mb-1">Bio</label>
                <textarea rows={3} value={form.bio} onChange={(e) => setField("bio", e.target.value)} placeholder="Brief author biography..." className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6] resize-none" />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Social Links</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {["twitter", "linkedin", "github", "website"].map((social) => <div key={social} className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 focus-within:border-[#1473E6]">
                    <span className="text-[11px] font-semibold text-[#9CA3AF] w-14 capitalize">{social}</span>
                    <input
    type="url"
    value={form.socialLinks?.[social] || ""}
    onChange={(e) => setSocial(social, e.target.value)}
    placeholder="https://..."
    className="flex-1 text-xs text-[#202124] outline-none bg-transparent"
  />
                  </div>)}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="rounded-lg bg-[#1473E6] px-5 py-2 text-xs font-bold text-white hover:bg-[#0d62c9] disabled:opacity-60 transition">
                {saving ? "Saving\xE2\u20AC\xA6" : editingId ? "Update Author" : "Create Author"}
              </button>
            </div>
          </form>
        </div>}

      {
    /* Author Cards */
  }
      {loading ? <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
        </div> : authors.length === 0 ? <div className="rounded-xl border border-[#E5E7EB] bg-white py-16 text-center">
          <p className="text-sm text-[#9CA3AF]">No authors yet.</p>
        </div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => <div key={author._id} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-start gap-3">
                {author.avatar ? <img src={author.avatar} alt={author.name} className="h-11 w-11 rounded-full object-cover flex-shrink-0 border border-[#E5E7EB]" /> : <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#1473E6] text-sm font-bold text-white">
                    {author.name.charAt(0).toUpperCase()}
                  </div>}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-[#202124] truncate">{author.name}</p>
                  <p className="text-[11px] text-[#6B7280] truncate">{author.designation}</p>
                  {author.email && <p className="text-[11px] text-[#9CA3AF] truncate">{author.email}</p>}
                </div>
              </div>
              {author.bio && <p className="mt-3 text-[11px] text-[#6B7280] leading-relaxed line-clamp-2">{author.bio}</p>}
              <div className="mt-3 flex items-center gap-2">
                {Object.entries(author.socialLinks || {}).filter(([, v]) => v).map(([k]) => <div key={k} className="h-4 w-4 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
                  </div>)}
              </div>
              <div className="mt-3 flex gap-1.5 border-t border-[#F3F4F6] pt-3">
                <button onClick={() => handleEdit(author)} className="flex-1 rounded border border-[#E5E7EB] py-1.5 text-[11px] font-medium text-[#202124] hover:border-[#1473E6] hover:text-[#1473E6] transition">Edit</button>
                <button onClick={() => handleDelete(author)} disabled={deleting === author._id} className="flex-1 rounded border border-rose-200 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40 transition">
                  {deleting === author._id ? "\xE2\u20AC\xA6" : "Delete"}
                </button>
              </div>
            </div>)}
        </div>}
    </div>;
}
