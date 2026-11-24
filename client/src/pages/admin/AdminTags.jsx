import { useEffect, useState } from "react";
import { api } from "../../api.js";
export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await api.listTags();
      setTags(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTags();
  }, []);
  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmedName = newTag.trim();
    if (!trimmedName) return;
    const tagSlug = trimmedName.toLowerCase().replace(/\s+/g, "-");
    if (tags.some((t) => t.slug === tagSlug)) {
      setError("This tag already exists.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await api.createTag(trimmedName);
      setTags((prev) => [created, ...prev]);
      setSuccess(`Tag "${created.slug}" added.`);
      setNewTag("");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (slug) => {
    if (!window.confirm(`Remove tag "${slug}"? Articles using it will not be affected.`)) return;
    try {
      await api.deleteTag(slug);
      setTags((prev) => prev.filter((t) => t.slug !== slug));
    } catch (err) {
      setError(err.message);
    }
  };
  return <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#202124]">Tags</h1>
        <p className="mt-0.5 text-xs text-[#6B7280]">
          Tags are auto-created when you publish articles. You can also add or remove them here.
        </p>
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] px-4 py-3 text-xs font-medium text-[#059669]">âœ“ {success}</div>}

      {
    /* Add Tag */
  }
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
    type="text"
    value={newTag}
    onChange={(e) => setNewTag(e.target.value)}
    placeholder="Enter a new tag name..."
    className="flex-1 rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-xs outline-none focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
  />
        <button
    type="submit"
    disabled={saving || !newTag.trim()}
    className="rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0d62c9] disabled:opacity-60 transition"
  >
          Add Tag
        </button>
      </form>

      {
    /* Tags Cloud */
  }
      {loading ? <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
        </div> : tags.length === 0 ? <div className="rounded-xl border border-[#E5E7EB] bg-white py-16 text-center">
          <p className="text-sm text-[#9CA3AF]">No tags yet. Publish an article with tags to get started.</p>
        </div> : <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
            {tags.length} Tag{tags.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => <div
    key={tag.slug}
    className="group flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-1.5"
  >
                <span className="text-xs font-medium text-[#374151]">#{tag.slug}</span>
                <button
    onClick={() => handleDelete(tag.slug)}
    className="hidden group-hover:flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-rose-100 hover:text-rose-600"
    title="Remove tag"
  >
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>)}
          </div>
        </div>}
    </div>;
}
