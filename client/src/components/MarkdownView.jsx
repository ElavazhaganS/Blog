import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
const codeTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "transparent",
    margin: 0,
    padding: 0,
    fontSize: "inherit",
    lineHeight: 1.6
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
    fontSize: "inherit",
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
  }
};
export function headingId(text) {
  return String(text).toLowerCase().replace(/<[^>]*>/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
}
function extractText(children) {
  if (!children) return "";
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (React.isValidElement(children) && children.props?.children) {
    return extractText(children.props.children);
  }
  return "";
}
function youtubeEmbedUrl(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([\w-]+)/,
    /youtu\.be\/([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}
function isYouTubeUrl(url) {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}
export function isHtmlContent(str) {
  if (!str) return false;
  return /<\/?(p|div|h[1-6]|ul|ol|li|table|blockquote|pre|figure|img|iframe|strong|em|u|a|span|hr)[\s>/]/i.test(
    str
  );
}
export function sanitizeAndEnhanceHtml(rawHtml) {
  if (!rawHtml) return "";
  let clean = rawHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  clean = clean.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  clean = clean.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  clean = clean.replace(/<(h[1-3])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
    if (attrs.includes("id=")) {
      return `<${tag}${attrs} class="scroll-mt-24 ${tag === "h1" ? "text-2xl font-bold mt-8 mb-4" : tag === "h2" ? "text-xl font-bold mt-8 mb-3" : "text-lg font-semibold mt-6 mb-2"} text-[#202124]">${content}</${tag}>`;
    }
    const cleanText = content.replace(/<[^>]*>/g, "").trim();
    const id = headingId(cleanText);
    const tagClass = tag === "h1" ? "text-2xl font-bold mt-8 mb-4" : tag === "h2" ? "text-xl font-bold mt-8 mb-3" : "text-lg font-semibold mt-6 mb-2";
    return `<${tag} id="${id}" class="scroll-mt-24 ${tagClass} text-[#202124]"${attrs}>${content}</${tag}>`;
  });
  return clean;
}
export default function MarkdownView({ content, className }) {
  const isHtml = isHtmlContent(content);
  const enhancedHtml = useMemo(() => {
    if (!isHtml) return "";
    return sanitizeAndEnhanceHtml(content);
  }, [content, isHtml]);
  if (isHtml) {
    return <div
      className={`rich-text-article prose max-w-none text-[#202124] text-base leading-relaxed ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: enhancedHtml }}
    />;
  }
  return <div className={`markdown-body ${className ?? ""}`}>
      <ReactMarkdown
    components={{
      // Headings with anchor IDs for TOC
      h1({ children }) {
        const id = headingId(extractText(children));
        return <h1
          id={id}
          className="mt-8 mb-4 text-2xl font-bold tracking-tight text-[#202124] scroll-mt-24"
        >
                {children}
              </h1>;
      },
      h2({ children }) {
        const id = headingId(extractText(children));
        return <h2
          id={id}
          className="mt-8 mb-3 text-xl font-bold tracking-tight text-[#202124] scroll-mt-24"
        >
                {children}
              </h2>;
      },
      h3({ children }) {
        const id = headingId(extractText(children));
        return <h3
          id={id}
          className="mt-6 mb-2 text-lg font-semibold text-[#202124] scroll-mt-24"
        >
                {children}
              </h3>;
      },
      h4({ children }) {
        const id = headingId(extractText(children));
        return <h4
          id={id}
          className="mt-5 mb-2 text-base font-semibold text-[#202124] scroll-mt-24"
        >
                {children}
              </h4>;
      },
      // Paragraph â€“ detect YouTube links
      p({ children }) {
        const childArray = React.Children.toArray(children);
        if (childArray.length === 1 && React.isValidElement(childArray[0])) {
          const child = childArray[0];
          if (child.type === "a" && child.props.href && isYouTubeUrl(child.props.href)) {
            const embedUrl = youtubeEmbedUrl(child.props.href);
            if (embedUrl) {
              return <div
                className="my-6 overflow-hidden rounded-xl border border-[#E5E7EB]"
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0
                }}
              >
                      <iframe
                src={embedUrl}
                title="Embedded YouTube Video"
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
                    </div>;
            }
          }
        }
        return <p className="my-4 text-base leading-relaxed text-[#374151]">
                {children}
              </p>;
      },
      // Blockquote
      blockquote({ children }) {
        return <blockquote className="my-6 border-l-4 border-[#1473E6] bg-[#F7F8FA] px-5 py-4 text-base italic text-[#4B5563] rounded-r-lg">
                {children}
              </blockquote>;
      },
      // Code blocks
      code(props) {
        const { className: codeClassName, children, ...rest } = props;
        const match = /language-(\w+)/.exec(codeClassName || "");
        const language = match ? match[1] : "";
        const isInline = !match && !String(children).includes("\n");
        if (isInline) {
          return <code
            className="rounded bg-[#F3F4F6] px-1.5 py-0.5 font-mono text-[13px] font-semibold text-[#1473E6]"
            {...rest}
          >
                  {children}
                </code>;
        }
        return <div className="my-6 overflow-hidden rounded-xl border border-[#2D3748] bg-[#1E293B] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#334155] bg-[#0F172A] px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    {language || "code"}
                  </span>
                </div>
                <div className="overflow-x-auto p-4 text-xs font-mono">
                  <SyntaxHighlighter
          style={codeTheme}
          language={language || "text"}
          PreTag="div"
        >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              </div>;
      },
      // Lists
      ul({ children }) {
        return <ul className="my-4 list-disc space-y-1.5 pl-6 text-base text-[#374151]">
                {children}
              </ul>;
      },
      ol({ children }) {
        return <ol className="my-4 list-decimal space-y-1.5 pl-6 text-base text-[#374151]">
                {children}
              </ol>;
      },
      li({ children }) {
        return <li className="leading-relaxed">{children}</li>;
      },
      // Tables
      table({ children }) {
        return <div className="my-6 overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full border-collapse text-left text-xs">
                  {children}
                </table>
              </div>;
      },
      thead({ children }) {
        return <thead className="border-b border-[#E5E7EB] bg-[#F7F8FA] font-bold text-[#202124]">
                {children}
              </thead>;
      },
      th({ children }) {
        return <th className="p-3 border-r border-[#E5E7EB] last:border-r-0">
                {children}
              </th>;
      },
      td({ children }) {
        return <td className="p-3 border-b border-r border-[#E5E7EB] last:border-r-0 text-[#4B5563]">
                {children}
              </td>;
      },
      // Links
      a({ href, children }) {
        return <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#1473E6] underline hover:text-[#0d62c9]"
        >
                {children}
              </a>;
      },
      // Images
      img({ src, alt }) {
        return <figure className="my-6">
                <img
          src={src}
          alt={alt || "Article illustration"}
          className="w-full rounded-xl border border-[#E5E7EB] object-cover shadow-xs"
        />
                {alt && <figcaption className="mt-2 text-center text-xs italic text-[#6B7280]">
                    {alt}
                  </figcaption>}
              </figure>;
      },
      // Horizontal rule
      hr() {
        return <hr className="my-8 border-t border-[#E5E7EB]" />;
      }
    }}
  >
        {content}
      </ReactMarkdown>
    </div>;
}
