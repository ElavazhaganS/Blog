import { useState } from "react";
export default function BlogCoverImage({
  src,
  title,
  category = "Technology",
  aspectRatio = "card",
  className = ""
}) {
  const [imageFailed, setImageFailed] = useState(false);
  if (src && !imageFailed) {
    const aspectStyle = aspectRatio === "banner" ? "aspect-[16/9] sm:aspect-[21/9] w-full rounded-xl" : aspectClass(aspectRatio);
    return <div
      className={`relative overflow-hidden bg-[#F7F8FA] ${aspectStyle} ${className}`}
    >
        <img
      src={src}
      alt={title}
      onError={() => setImageFailed(true)}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      loading="lazy"
    />
      </div>;
  }
  const tagLower = (category || "").toLowerCase();
  const titleLower = title.toLowerCase();
  const theme = getIllustrationTheme(tagLower, titleLower);
  if (aspectRatio === "banner") {
    return <div
      className={`relative w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FAF9F5] p-6 sm:p-8 ${className}`}
    >
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
          {
      /* Left Column: Tech Illustration */
    }
          <div className="flex shrink-0 items-center justify-center">
            <div className="relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-2xl border border-[#EBE8DC] bg-white p-5 shadow-2xs">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1473E6]">
                {theme.icon}
              </div>
              <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF3C7] text-xs font-bold text-[#D97706] shadow-2xs">
                âš¡
              </span>
              <span className="absolute -bottom-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#ECFDF5] text-xs font-bold text-[#059669] shadow-2xs">
                âœ“
              </span>
            </div>
          </div>

          {
      /* Right Column: Topic and Title (Vertically centered) */
    }
          <div className="min-w-0 flex-1 text-center md:text-left">
            <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-[#1473E6] text-[9px] font-bold text-white">
                D
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                DevLog {category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202124] leading-snug">
              {title}
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#6B7280]">
              In-depth architectural design, production performance best practices, and full-stack implementation details.
            </p>
          </div>
        </div>
      </div>;
  }
  return <div
    className={`relative overflow-hidden select-none ${aspectClass(
      aspectRatio
    )} ${theme.bg} ${className}`}
  >
      {
    /* Background soft geometric pattern */
  }
      <svg
    className="absolute inset-0 h-full w-full opacity-30 pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
  >
        <defs>
          <pattern
    id={`grid-${theme.id}-${aspectRatio}`}
    width="24"
    height="24"
    patternUnits="userSpaceOnUse"
  >
            <circle cx="2" cy="2" r="1" fill={theme.dotColor} />
          </pattern>
        </defs>
        <rect
    width="100%"
    height="100%"
    fill={`url(#grid-${theme.id}-${aspectRatio})`}
  />
      </svg>

      {
    /* Center illustration */
  }
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div
    className={`flex items-center justify-center rounded-2xl p-3 sm:p-4 shadow-2xs border ${theme.cardBg} ${theme.borderColor}`}
  >
            {theme.icon}
          </div>

          {aspectRatio === "hero" && <div className="mt-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1473E6]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4B5563]">
                {category}
              </span>
            </div>}
        </div>
      </div>
    </div>;
}
function aspectClass(aspect) {
  switch (aspect) {
    case "hero":
      return "aspect-[16/9] sm:aspect-[16/10] w-full rounded-xl";
    case "banner":
      return "w-full rounded-xl";
    case "horizontal":
      return "aspect-[16/10] sm:aspect-[4/3] w-full";
    case "compact":
      return "h-20 w-28 sm:h-24 sm:w-32 shrink-0 rounded-lg";
    case "card":
    default:
      return "aspect-[16/10] w-full";
  }
}
function getIllustrationTheme(tag, title) {
  if (tag.includes("react") || title.includes("react") || tag.includes("frontend")) {
    return {
      id: "react",
      bg: "bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5]",
      cardBg: "bg-white",
      borderColor: "border-[#D1FAE5]",
      dotColor: "#A7F3D0",
      icon: <svg
        className="h-10 w-10 sm:h-12 sm:w-12 text-[#059669]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
          <circle cx="12" cy="12" r="2.5" fill="#059669" />
          <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4.5"
        transform="rotate(30 12 12)"
      />
          <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4.5"
        transform="rotate(90 12 12)"
      />
          <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4.5"
        transform="rotate(150 12 12)"
      />
        </svg>
    };
  }
  if (tag.includes("node") || tag.includes("express") || tag.includes("api") || title.includes("api")) {
    return {
      id: "api",
      bg: "bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]/40",
      cardBg: "bg-white",
      borderColor: "border-[#BFDBFE]",
      dotColor: "#93C5FD",
      icon: <svg
        className="h-10 w-10 sm:h-12 sm:w-12 text-[#1473E6]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
          <rect x="3" y="4" width="18" height="6" rx="2" />
          <rect x="3" y="14" width="18" height="6" rx="2" />
          <circle cx="7" cy="7" r="1" fill="currentColor" />
          <circle cx="7" cy="17" r="1" fill="currentColor" />
          <path d="M17 7h.01M17 17h.01" />
        </svg>
    };
  }
  if (tag.includes("mongo") || tag.includes("database") || tag.includes("sql") || title.includes("schema")) {
    return {
      id: "database",
      bg: "bg-gradient-to-br from-[#FEF3C7]/40 to-[#FFFBEB]",
      cardBg: "bg-white",
      borderColor: "border-[#FDE68A]",
      dotColor: "#FCD34D",
      icon: <svg
        className="h-10 w-10 sm:h-12 sm:w-12 text-[#D97706]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    };
  }
  if (tag.includes("typescript") || tag.includes("javascript") || title.includes("javascript")) {
    return {
      id: "code",
      bg: "bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]",
      cardBg: "bg-white",
      borderColor: "border-[#DDD6FE]",
      dotColor: "#C4B5FD",
      icon: <svg
        className="h-10 w-10 sm:h-12 sm:w-12 text-[#7C3AED]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" strokeLinecap="round" />
        </svg>
    };
  }
  if (tag.includes("jwt") || tag.includes("auth") || tag.includes("security") || tag.includes("compliance")) {
    return {
      id: "security",
      bg: "bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6]",
      cardBg: "bg-white",
      borderColor: "border-[#FECDD3]",
      dotColor: "#FDA4AF",
      icon: <svg
        className="h-10 w-10 sm:h-12 sm:w-12 text-[#E11D48]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="2" />
          <path d="M12 13v3" />
        </svg>
    };
  }
  return {
    id: "tech-default",
    bg: "bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]",
    cardBg: "bg-white",
    borderColor: "border-[#E2E8F0]",
    dotColor: "#CBD5E1",
    icon: <svg
      className="h-10 w-10 sm:h-12 sm:w-12 text-[#475569]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round" />
        <line x1="6" y1="8" x2="10" y2="8" strokeLinecap="round" />
        <line x1="6" y1="12" x2="14" y2="12" strokeLinecap="round" />
      </svg>
  };
}
