export default function BrandLogo({
  size = "md",
  inverted = false,
  showText = true,
  subText = "Blog"
}) {
  const tileSize = size === "sm" ? "h-4 w-4 text-[9px]" : size === "lg" ? "h-7 w-7 text-sm" : "h-5 w-5 text-[11px]";
  const textClass = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return <div className="inline-flex items-center gap-2 select-none">
      {
    /* 4-Color Zoho-style Tiles (Red, Green, Blue, Yellow) */
  }
      <div className="flex items-center gap-1">
        <span
    className={`${tileSize} flex items-center justify-center rounded-[4px] font-bold text-white shadow-2xs`}
    style={{ backgroundColor: "#E53935" }}
  >
          D
        </span>
        <span
    className={`${tileSize} flex items-center justify-center rounded-[4px] font-bold text-white shadow-2xs`}
    style={{ backgroundColor: "#43A047" }}
  >
          E
        </span>
        <span
    className={`${tileSize} flex items-center justify-center rounded-[4px] font-bold text-white shadow-2xs`}
    style={{ backgroundColor: "#1E88E5" }}
  >
          V
        </span>
        <span
    className={`${tileSize} flex items-center justify-center rounded-[4px] font-bold text-white shadow-2xs`}
    style={{ backgroundColor: "#FB8C00" }}
  >
          L
        </span>
      </div>

      {showText && <div className="flex items-baseline gap-1.5">
          <span
    className={`font-bold tracking-tight ${inverted ? "text-white" : "text-[#202124]"} ${textClass}`}
  >
            {subText}
          </span>
        </div>}
    </div>;
}
