import { initials } from "../format.js";
const sizes = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-14 w-14 text-lg"
};
export default function Avatar({
  name,
  src,
  size = "md",
  className = ""
}) {
  if (src) {
    return <img
      src={src}
      alt={name}
      className={`${sizes[size]} shrink-0 rounded-full object-cover border border-[#E5E7EB] ${className}`}
    />;
  }
  const charCode = name.charCodeAt(0) || 0;
  const palettes = [
    "bg-[#1473E6]/10 text-[#1473E6] border-[#1473E6]/20",
    "bg-[#00875A]/10 text-[#00875A] border-[#00875A]/20",
    "bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20",
    "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20"
  ];
  const palette = palettes[charCode % palettes.length];
  return <span
    aria-hidden="true"
    className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-full font-semibold border ${palette} ${className}`}
  >
      {initials(name)}
    </span>;
}
