import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { slugify } from "../../format.js";
const EMPTY_FORM = { name: "", slug: "", description: "", coverImage: "" };
export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.listCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    if (!editingId && form.name && !form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name, editingId]);
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };
  const handleEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", coverImage: cat.coverImage || "" });
    setEditingId(cat._id);
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
        const updated = await api.updateCategory(editingId, form);
        setCategories((prev) => prev.map((c) => c._id === editingId ? { ...c, ...updated } : c));
        setSuccess("Category updated successfully!");
      } else {
        const created = await api.createCategory(form);
        setCategories((prev) => [created, ...prev]);
        setSuccess("Category created successfully!");
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
  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    setDeleting(cat._id);
    setError(null);
    try {
      await api.deleteCategory(cat._id);
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };
  return <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Categories</h1>
          <p className="mt-0.5 text-xs text-[#6B7280]">{categories.length} categories</p>
        </div>
        {!showForm && <button
    onClick={() => setShowForm(true)}
    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0d62c9]"
  >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Category
          </button>}
      </div>

      {
    /* Alerts */
  }
      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] px-4 py-3 text-xs font-medium text-[#059669]">âœ“ {success}</div>}

      {
    /* Form */
  }
      {showForm && <div className="mb-6 rounded-xl border border-[#1473E6]/20 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#202124]">
              {editingId ? "Edit Category" : "Create New Category"}
            </h2>
            <button onClick={resetForm} className="text-xs text-[#9CA3AF] hover:text-[#6B7280]">Cancel</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">Category Name <span className="text-rose-500">*</span></label>
              <input
    type="text"
    required
    value={form.name}
    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
    placeholder="e.g. Software Development"
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">URL Slug</label>
              <input
    type="text"
    value={form.slug}
    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
    placeholder="auto-generated"
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]"
  />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#202124] mb-1">Description</label>
              <textarea
    rows={2}
    value={form.description}
    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
    placeholder="Brief description of this category..."
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6] resize-none"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">Cover Image URL</label>
              <input
    type="url"
    value={form.coverImage}
    onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
    placeholder="https://..."
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]"
  />
            </div>
            <div className="flex items-end">
              <button
    type="submit"
    disabled={saving}
    className="w-full rounded-lg bg-[#1473E6] py-2 text-xs font-bold text-white transition hover:bg-[#0d62c9] disabled:opacity-60"
  >
                {saving ? "Saving\xE2\u20AC\xA6" : editingId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>}

      {
    /* Categories Table */
  }
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        {loading ? <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
          </div> : categories.length === 0 ? <div className="py-16 text-center">
            <p className="text-sm text-[#9CA3AF]">No categories yet. Create your first one above.</p>
          </div> : <table className="w-full text-xs">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-[#6B7280] uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-left font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Slug</th>
                <th className="px-5 py-3 text-left font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="px-5 py-3 text-center font-semibold text-[#6B7280] uppercase tracking-wider">Articles</th>
                <th className="px-5 py-3 text-right font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {categories.map((cat) => <tr key={cat._id} className="hover:bg-[#F9FAFB] transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {cat.coverImage && <img src={cat.coverImage} alt="" className="h-8 w-10 rounded flex-shrink-0 object-cover border border-[#E5E7EB]" />}
                      <span className="font-semibold text-[#202124]">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#6B7280] font-mono hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-5 py-3 text-[#9CA3AF] hidden md:table-cell max-w-[200px] truncate">
                    {cat.description || "\xE2\u20AC\u201D"}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="rounded-full bg-[#EBF3FD] px-2 py-0.5 text-[11px] font-semibold text-[#1473E6]">
                      {cat.articleCount ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
    onClick={() => handleEdit(cat)}
    className="rounded border border-[#E5E7EB] px-2.5 py-1 font-medium text-[#202124] hover:border-[#1473E6] hover:text-[#1473E6] transition"
  >Edit</button>
                      <button
    onClick={() => handleDelete(cat)}
    disabled={deleting === cat._id}
    className="rounded border border-rose-200 px-2.5 py-1 font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40 transition"
  >{deleting === cat._id ? "\xE2\u20AC\xA6" : "Delete"}</button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>}
      </div>
    </div>;
}
