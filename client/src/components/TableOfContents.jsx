import { useEffect, useRef, useState } from "react";
import { headingId, isHtmlContent } from "./MarkdownView";
function extractHeadings(content) {
  if (!content) return [];
  const headings = [];
  if (isHtmlContent(content)) {
    const htmlRegex = /<(h[23])\b([^>]*)>(.*?)<\/\1>/gi;
    let match;
    while ((match = htmlRegex.exec(content)) !== null) {
      const tag = match[1].toLowerCase();
      const attrs = match[2];
      const rawText = match[3].replace(/<[^>]*>/g, "").trim();
      if (rawText) {
        const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
        const id = idMatch ? idMatch[1] : headingId(rawText);
        headings.push({
          id,
          text: rawText,
          level: tag === "h2" ? 2 : 3
        });
      }
    }
  }
  if (headings.length === 0) {
    const lines = content.split("\n");
    for (const line of lines) {
      const h2 = line.match(/^## (.+)/);
      const h3 = line.match(/^### (.+)/);
      if (h2) {
        const text = h2[1].trim();
        const id = headingId(text);
        headings.push({ id, text, level: 2 });
      } else if (h3) {
        const text = h3[1].trim();
        const id = headingId(text);
        headings.push({ id, text, level: 3 });
      }
    }
  }
  return headings;
}
export default function TableOfContents({
  markdown,
  className
}) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const observerRef = useRef(null);
  useEffect(() => {
    const extracted = extractHeadings(markdown);
    setHeadings(extracted);
  }, [markdown]);
  useEffect(() => {
    if (headings.length === 0) return;
    const handleIntersect = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      }
    };
    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-80px 0% -60% 0%",
      threshold: 0
    });
    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observerRef.current.observe(el);
    }
    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);
  if (headings.length < 2) return null;
  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 90;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  };
  return <nav
    className={`rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] ${className ?? ""}`}
    aria-label="Table of Contents"
  >
      {
    /* Header */
  }
      <div
    className="flex cursor-pointer items-center justify-between px-4 py-3 select-none"
    onClick={() => setIsCollapsed((v) => !v)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") setIsCollapsed((v) => !v);
    }}
    aria-expanded={!isCollapsed}
  >
        <div className="flex items-center gap-2">
          <svg
    className="h-3.5 w-3.5 text-[#1473E6]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
  >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#202124]">
            Table of Contents
          </span>
        </div>
        <svg
    className={`h-3.5 w-3.5 text-[#6B7280] transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
  >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {
    /* Links */
  }
      {!isCollapsed && <ul className="border-t border-[#E5E7EB] px-4 py-3 space-y-1">
          {headings.map((heading) => {
    const isActive = activeId === heading.id;
    return <li
      key={heading.id}
      className={heading.level === 3 ? "pl-4" : ""}
    >
                <a
      href={`#${heading.id}`}
      onClick={(e) => handleClick(e, heading.id)}
      className={`block rounded py-1 text-xs leading-relaxed transition-all ${isActive ? "font-semibold text-[#1473E6]" : "text-[#4B5563] hover:text-[#1473E6]"} ${heading.level === 2 ? "font-medium" : ""}`}
    >
                  {isActive && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#1473E6] align-middle" />}
                  {heading.text}
                </a>
              </li>;
  })}
        </ul>}
    </nav>;
}
