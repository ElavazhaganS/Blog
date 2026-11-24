import { useEffect, useRef, useState } from "react";
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your article here...",
  minHeight = "360px"
}) {
  const editorRef = useRef(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value);
  const isUpdatingRef = useRef(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    setHtmlDraft(value || "");
  }, [value]);
  const handleInput = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const content = editorRef.current.innerHTML;
    setHtmlDraft(content);
    onChange(content);
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };
  const exec = (command, val = void 0) => {
    if (isHtmlMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };
  const handleFormatBlock = (tag) => {
    exec("formatBlock", tag);
  };
  const openLinkModal = () => {
    const selection = window.getSelection();
    setLinkText(selection?.toString() || "");
    setLinkUrl("");
    setLinkModalOpen(true);
  };
  const applyLink = (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    setLinkModalOpen(false);
    editorRef.current?.focus();
    const formattedUrl = linkUrl.startsWith("http://") || linkUrl.startsWith("https://") ? linkUrl.trim() : `https://${linkUrl.trim()}`;
    if (linkText.trim()) {
      const linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="text-[#1473E6] hover:underline font-medium">${linkText.trim()}</a>`;
      exec("insertHTML", linkHtml);
    } else {
      exec("createLink", formattedUrl);
    }
  };
  const applyImage = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setImageModalOpen(false);
    editorRef.current?.focus();
    const imgHtml = `
      <figure class="my-6">
        <img src="${imageUrl.trim()}" alt="${imageAlt.trim() || "Article image"}" class="w-full max-h-[500px] object-cover rounded-xl shadow-xs border border-[#E5E7EB]" />
        ${imageAlt.trim() ? `<figcaption class="mt-2 text-center text-xs text-[#6B7280] italic">${imageAlt.trim()}</figcaption>` : ""}
      </figure>
      <p><br /></p>
    `;
    exec("insertHTML", imgHtml);
    setImageUrl("");
    setImageAlt("");
  };
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(String(reader.result));
      setUploadingImage(false);
    };
    reader.onerror = () => {
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };
  const applyVideo = (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    setVideoModalOpen(false);
    editorRef.current?.focus();
    const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    let embedSrc = videoUrl.trim();
    if (ytMatch) {
      embedSrc = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const videoHtml = `
      <div class="my-6 overflow-hidden rounded-xl border border-[#E5E7EB] bg-black aspect-video shadow-xs">
        <iframe src="${embedSrc}" title="Embedded Video" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      <p><br /></p>
    `;
    exec("insertHTML", videoHtml);
    setVideoUrl("");
  };
  const applyCodeBlock = (e) => {
    e.preventDefault();
    setCodeModalOpen(false);
    editorRef.current?.focus();
    const escapedCode = codeSnippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const codeHtml = `
      <div class="my-6 overflow-hidden rounded-xl border border-[#2D3748] bg-[#1E293B] text-slate-100 shadow-sm">
        <div class="flex items-center justify-between border-b border-[#334155] bg-[#0F172A] px-4 py-2">
          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <span class="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">${codeLanguage}</span>
        </div>
        <pre class="p-4 font-mono text-xs leading-relaxed overflow-x-auto"><code class="language-${codeLanguage}">${escapedCode}</code></pre>
      </div>
      <p><br /></p>
    `;
    exec("insertHTML", codeHtml);
    setCodeSnippet("");
  };
  const insertTable = () => {
    editorRef.current?.focus();
    const tableHtml = `
      <div class="my-6 overflow-x-auto rounded-xl border border-[#E5E7EB]">
        <table class="w-full border-collapse text-left text-xs">
          <thead>
            <tr class="border-b border-[#E5E7EB] bg-[#F7F8FA] font-bold text-[#202124]">
              <th class="p-3 border-r border-[#E5E7EB]">Header 1</th>
              <th class="p-3 border-r border-[#E5E7EB]">Header 2</th>
              <th class="p-3">Header 3</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#E5E7EB] text-[#4B5563]">
            <tr>
              <td class="p-3 border-r border-[#E5E7EB]">Data 1</td>
              <td class="p-3 border-r border-[#E5E7EB]">Data 2</td>
              <td class="p-3">Data 3</td>
            </tr>
            <tr>
              <td class="p-3 border-r border-[#E5E7EB]">Data 4</td>
              <td class="p-3 border-r border-[#E5E7EB]">Data 5</td>
              <td class="p-3">Data 6</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><br /></p>
    `;
    exec("insertHTML", tableHtml);
  };
  const insertQuote = () => {
    editorRef.current?.focus();
    const quoteHtml = `
      <blockquote class="my-6 border-l-4 border-[#1473E6] bg-[#F7F8FA] p-4 italic text-sm text-[#374151] rounded-r-lg">
        Insert insightful quote or key takeaway statement here...
      </blockquote>
      <p><br /></p>
    `;
    exec("insertHTML", quoteHtml);
  };
  const plainText = (htmlDraft || "").replace(/<[^>]*>/g, " ").trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));
  return <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-2xs overflow-hidden">
      {
    /* â”€â”€ RICH TEXT TOOLBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
      <div className="flex flex-wrap items-center gap-1 border-b border-[#E5E7EB] bg-[#F7F8FA] p-2 text-xs">
        {
    /* Headings Selector */
  }
        <select
    onChange={(e) => {
      handleFormatBlock(e.target.value);
      e.target.value = "";
    }}
    defaultValue=""
    className="rounded border border-[#E5E7EB] bg-white px-2 py-1 text-xs font-semibold text-[#202124] outline-none hover:border-[#1473E6]"
    title="Format Text / Heading"
  >
          <option value="" disabled>
            Headings
          </option>
          <option value="<p>">Normal Paragraph</option>
          <option value="<h1>">Heading 1 (H1)</option>
          <option value="<h2>">Heading 2 (H2)</option>
          <option value="<h3>">Heading 3 (H3)</option>
        </select>

        <div className="h-4 w-px bg-[#E5E7EB] mx-1" />

        {
    /* Text Styles */
  }
        <button
    type="button"
    onClick={() => exec("bold")}
    className="rounded px-2 py-1 font-bold text-[#4B5563] hover:bg-white hover:text-[#202124] shadow-2xs"
    title="Bold (Ctrl+B)"
  >
          B
        </button>
        <button
    type="button"
    onClick={() => exec("italic")}
    className="rounded px-2 py-1 italic font-serif text-[#4B5563] hover:bg-white hover:text-[#202124] shadow-2xs"
    title="Italic (Ctrl+I)"
  >
          I
        </button>
        <button
    type="button"
    onClick={() => exec("underline")}
    className="rounded px-2 py-1 underline text-[#4B5563] hover:bg-white hover:text-[#202124] shadow-2xs"
    title="Underline (Ctrl+U)"
  >
          U
        </button>
        <button
    type="button"
    onClick={() => exec("strikeThrough")}
    className="rounded px-2 py-1 line-through text-[#4B5563] hover:bg-white hover:text-[#202124]"
    title="Strikethrough"
  >
          S
        </button>

        <div className="h-4 w-px bg-[#E5E7EB] mx-1" />

        {
    /* Text Alignment */
  }
        <button
    type="button"
    onClick={() => exec("justifyLeft")}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#202124]"
    title="Align Left"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="17" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
        </button>
        <button
    type="button"
    onClick={() => exec("justifyCenter")}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#202124]"
    title="Align Center"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="18" y1="10" x2="6" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="18" y1="18" x2="6" y2="18" />
          </svg>
        </button>
        <button
    type="button"
    onClick={() => exec("justifyRight")}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#202124]"
    title="Align Right"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="21" y1="10" x2="7" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="21" y1="18" x2="7" y2="18" />
          </svg>
        </button>
        <button
    type="button"
    onClick={() => exec("justifyFull")}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#202124]"
    title="Justify Text"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="21" y1="18" x2="3" y2="18" />
          </svg>
        </button>

        <div className="h-4 w-px bg-[#E5E7EB] mx-1" />

        {
    /* Lists */
  }
        <button
    type="button"
    onClick={() => exec("insertUnorderedList")}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#202124]"
    title="Bullet List"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
        <button
    type="button"
    onClick={() => exec("insertOrderedList")}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#202124]"
    title="Numbered List"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
            <path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
          </svg>
        </button>

        <div className="h-4 w-px bg-[#E5E7EB] mx-1" />

        {
    /* Insert Elements */
  }
        <button
    type="button"
    onClick={openLinkModal}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#1473E6]"
    title="Add Hyperlink"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
        <button
    type="button"
    onClick={() => setImageModalOpen(true)}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#1473E6]"
    title="Insert Image"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <button
    type="button"
    onClick={() => setVideoModalOpen(true)}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#1473E6]"
    title="Insert YouTube Video"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>
        <button
    type="button"
    onClick={insertTable}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#1473E6]"
    title="Insert Table"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </button>
        <button
    type="button"
    onClick={() => setCodeModalOpen(true)}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#1473E6]"
    title="Insert Code Block"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
        </button>
        <button
    type="button"
    onClick={insertQuote}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#1473E6]"
    title="Insert Blockquote"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          </svg>
        </button>
        <button
    type="button"
    onClick={() => exec("insertHorizontalRule")}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#202124]"
    title="Horizontal Line"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth={2.5} />
          </svg>
        </button>

        <div className="h-4 w-px bg-[#E5E7EB] mx-1" />

        {
    /* Clear Format, Undo, Redo */
  }
        <button
    type="button"
    onClick={() => exec("removeFormat")}
    className="rounded px-2 py-1 text-[#6B7280] hover:bg-white hover:text-[#202124]"
    title="Clear Formatting"
  >
          Tx
        </button>
        <button
    type="button"
    onClick={() => exec("undo")}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#202124]"
    title="Undo (Ctrl+Z)"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button
    type="button"
    onClick={() => exec("redo")}
    className="rounded p-1 text-[#6B7280] hover:bg-white hover:text-[#202124]"
    title="Redo (Ctrl+Y)"
  >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </button>

        {
    /* Toggle HTML view for power users */
  }
        <div className="ml-auto flex items-center gap-2">
          <button
    type="button"
    onClick={() => {
      if (isHtmlMode) {
        if (editorRef.current) {
          editorRef.current.innerHTML = htmlDraft;
        }
        onChange(htmlDraft);
      }
      setIsHtmlMode(!isHtmlMode);
    }}
    className={`rounded px-2 py-0.5 text-[11px] font-semibold border transition ${isHtmlMode ? "bg-[#1473E6] text-white border-[#1473E6]" : "bg-white text-[#6B7280] border-[#E5E7EB] hover:text-[#202124]"}`}
    title="Toggle between Visual WYSIWYG and HTML code"
  >
            {isHtmlMode ? "Visual Editor" : "HTML Source"}
          </button>
        </div>
      </div>

      {
    /* â”€â”€ EDITOR EDITABLE AREA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
      {isHtmlMode ? <textarea
    value={htmlDraft}
    onChange={(e) => {
      setHtmlDraft(e.target.value);
      onChange(e.target.value);
    }}
    className="w-full bg-[#1E293B] p-5 font-mono text-xs leading-relaxed text-slate-100 outline-none resize-y"
    style={{ minHeight }}
    spellCheck={false}
    placeholder="Raw HTML code..."
  /> : <div
    ref={editorRef}
    contentEditable
    onInput={handleInput}
    onBlur={handleInput}
    className="rich-text-content w-full p-5 sm:p-6 outline-none focus:outline-none overflow-y-auto leading-relaxed text-sm text-[#202124] prose max-w-none"
    style={{ minHeight }}
    data-placeholder={placeholder}
  />}

      {
    /* â”€â”€ FOOTER STATS BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
      <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F7F8FA] px-4 py-2 text-[11px] text-[#6B7280]">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>â€¢</span>
          <span>~{readTimeMin} min read</span>
        </div>
        <span className="font-medium text-[#1473E6]">
          {isHtmlMode ? "HTML Mode" : "Rich Text WYSIWYG"}
        </span>
      </div>

      {
    /* â”€â”€ LINK MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
      {linkModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl border border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#202124] mb-3">Add Hyperlink</h3>
            <form onSubmit={applyLink} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">Link URL</label>
                <input
    type="text"
    required
    autoFocus
    value={linkUrl}
    onChange={(e) => setLinkUrl(e.target.value)}
    placeholder="https://example.com"
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]"
  />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">Display Text (optional)</label>
                <input
    type="text"
    value={linkText}
    onChange={(e) => setLinkText(e.target.value)}
    placeholder="Click here"
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]"
  />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setLinkModalOpen(false)}
    className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#4B5563] hover:bg-[#F7F8FA]"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="rounded-lg bg-[#1473E6] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0d62c9]"
  >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* â”€â”€ IMAGE MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
      {imageModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl border border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#202124] mb-3">Insert Image</h3>
            <form onSubmit={applyImage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">Image URL</label>
                <input
    type="url"
    value={imageUrl}
    onChange={(e) => setImageUrl(e.target.value)}
    placeholder="https://images.unsplash.com/..."
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">Or Upload from Device</label>
                <input
    type="file"
    accept="image/*"
    onChange={handleFileUpload}
    className="w-full text-xs text-[#6B7280] file:mr-3 file:rounded-md file:border-0 file:bg-[#EBF3FD] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#1473E6] hover:file:bg-[#dbeafe]"
  />
                {uploadingImage && <p className="text-[11px] text-[#1473E6] mt-1">Reading image file...</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">Alt Text / Caption (optional)</label>
                <input
    type="text"
    value={imageAlt}
    onChange={(e) => setImageAlt(e.target.value)}
    placeholder="Diagram of distributed architecture"
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]"
  />
              </div>

              {imageUrl && <div className="rounded-lg border border-[#E5E7EB] p-2 bg-[#F7F8FA]">
                  <p className="text-[10px] font-semibold text-[#6B7280] mb-1">Preview:</p>
                  <img src={imageUrl} alt="preview" className="h-28 w-full object-cover rounded-md" />
                </div>}

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setImageModalOpen(false)}
    className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#4B5563] hover:bg-[#F7F8FA]"
  >
                  Cancel
                </button>
                <button
    type="submit"
    disabled={!imageUrl.trim()}
    className="rounded-lg bg-[#1473E6] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0d62c9] disabled:opacity-50"
  >
                  Insert Image
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* â”€â”€ VIDEO MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
      {videoModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl border border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#202124] mb-3">Insert Video</h3>
            <form onSubmit={applyVideo} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">YouTube Video Link</label>
                <input
    type="url"
    required
    autoFocus
    value={videoUrl}
    onChange={(e) => setVideoUrl(e.target.value)}
    placeholder="https://www.youtube.com/watch?v=..."
    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs outline-none focus:border-[#1473E6]"
  />
                <p className="mt-1 text-[11px] text-[#9CA3AF]">
                  Supports standard YouTube URLs, youtu.be links, and embed URLs.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setVideoModalOpen(false)}
    className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#4B5563] hover:bg-[#F7F8FA]"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="rounded-lg bg-[#1473E6] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0d62c9]"
  >
                  Embed Video
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* â”€â”€ CODE BLOCK MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  }
      {codeModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl border border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#202124] mb-3">Insert Formatted Code Block</h3>
            <form onSubmit={applyCodeBlock} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">Programming Language</label>
                <select
    value={codeLanguage}
    onChange={(e) => setCodeLanguage(e.target.value)}
    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs outline-none focus:border-[#1473E6]"
  >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="bash">Bash / Shell</option>
                  <option value="sql">SQL</option>
                  <option value="json">JSON</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">Code Snippet</label>
                <textarea
    required
    rows={8}
    value={codeSnippet}
    onChange={(e) => setCodeSnippet(e.target.value)}
    placeholder="Paste your source code here..."
    className="w-full rounded-lg border border-[#E5E7EB] bg-[#0F172A] p-3 font-mono text-xs text-slate-100 outline-none focus:border-[#1473E6]"
    spellCheck={false}
  />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setCodeModalOpen(false)}
    className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#4B5563] hover:bg-[#F7F8FA]"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="rounded-lg bg-[#1473E6] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0d62c9]"
  >
                  Insert Code
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
}
