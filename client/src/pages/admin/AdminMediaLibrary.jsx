import { useEffect, useRef, useState } from "react";
import { api } from "../../api.js";
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export default function AdminMediaLibrary() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [preview, setPreview] = useState(null);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await api.listMedia();
      setMedia(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMedia();
  }, []);
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onload = async (ev) => {
            try {
              const data = ev.target?.result;
              const result = await api.uploadMedia(data, file.name);
              setMedia((prev) => [result, ...prev]);
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.filename}"? This cannot be undone.`)) return;
    setDeleting(item.filename);
    try {
      await api.deleteMedia(item.filename);
      setMedia((prev) => prev.filter((m) => m.filename !== item.filename));
      if (preview?.filename === item.filename) setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };
  const handleCopy = (url, filename) => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopied(filename);
    setTimeout(() => setCopied(null), 2e3);
  };
  return <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Media Library</h1>
          <p className="mt-0.5 text-xs text-[#6B7280]">{media.length} file{media.length !== 1 ? "s" : ""}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1473E6] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0d62c9] transition">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          {uploading ? "Uploading\xE2\u20AC\xA6" : "Upload Images"}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>}

      {
    /* Upload Drop Zone */
  }
      <label className="mb-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E5E7EB] bg-white py-10 text-[#9CA3AF] transition hover:border-[#1473E6] hover:text-[#1473E6]">
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
        <p className="text-xs font-medium">Drop images here or click to upload</p>
        <p className="text-[11px]">PNG, JPG, WEBP, GIF, SVG up to 10MB each</p>
        <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
      </label>

      {loading ? <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
        </div> : media.length === 0 ? <div className="rounded-xl border border-[#E5E7EB] bg-white py-16 text-center">
          <p className="text-sm text-[#9CA3AF]">No media uploaded yet.</p>
        </div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {media.map((item) => <div
    key={item.filename}
    className="group relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] cursor-pointer"
    onClick={() => setPreview(item)}
  >
              <div className="aspect-square overflow-hidden">
                <img
    src={item.url}
    alt={item.filename}
    className="h-full w-full object-cover transition group-hover:scale-105"
    loading="lazy"
  />
              </div>
              {
    /* Hover overlay */
  }
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
    onClick={(e) => {
      e.stopPropagation();
      handleCopy(item.url, item.filename);
    }}
    className="rounded bg-white px-2.5 py-1 text-[11px] font-semibold text-[#202124] transition hover:bg-[#1473E6] hover:text-white"
  >
                  {copied === item.filename ? "Copied!" : "Copy URL"}
                </button>
                <button
    onClick={(e) => {
      e.stopPropagation();
      handleDelete(item);
    }}
    disabled={deleting === item.filename}
    className="rounded bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
  >
                  {deleting === item.filename ? "\xE2\u20AC\xA6" : "Delete"}
                </button>
              </div>
              {
    /* File name */
  }
              <div className="border-t border-[#E5E7EB] px-2 py-1.5">
                <p className="truncate text-[11px] font-medium text-[#6B7280]">{item.filename}</p>
                <p className="text-[10px] text-[#9CA3AF]">{formatBytes(item.size)}</p>
              </div>
            </div>)}
        </div>}

      {
    /* Image Preview Modal */
  }
      {preview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-2xl w-full rounded-xl bg-white overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
              <p className="text-xs font-semibold text-[#202124] truncate">{preview.filename}</p>
              <button onClick={() => setPreview(null)} className="text-[#9CA3AF] hover:text-[#202124]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-hidden bg-[#F7F8FA] flex items-center justify-center p-4">
              <img src={preview.url} alt={preview.filename} className="max-h-[55vh] max-w-full object-contain rounded" />
            </div>
            <div className="border-t border-[#E5E7EB] px-4 py-3 flex items-center justify-between gap-3">
              <div className="text-[11px] text-[#6B7280] min-w-0">
                <p className="font-mono truncate">{preview.url}</p>
                <p className="mt-0.5">{formatBytes(preview.size)}</p>
              </div>
              <button
    onClick={() => handleCopy(preview.url, preview.filename)}
    className="flex-shrink-0 rounded-lg bg-[#1473E6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0d62c9] transition"
  >
                {copied === preview.filename ? "Copied!" : "Copy URL"}
              </button>
            </div>
          </div>
        </div>}
    </div>;
}
