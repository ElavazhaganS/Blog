// format date to readable string
export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// format time ago
export function timeAgo(value) {
  if (!value) return "";
  const then = new Date(value).getTime();
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));

  const units = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
  ];

  let amount = seconds;
  let unit = "second";

  for (const [size, name] of units) {
    if (amount < size) {
      unit = name;
      break;
    }
    amount = amount / size;
    unit = name;
  }

  const rounded = Math.floor(amount);
  if (unit === "second" && rounded < 45) return "just now";
  return `${rounded} ${unit}${rounded === 1 ? "" : "s"} ago`;
}

// extract user initials
export function initials(name) {
  if (!name) return "?";
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// create slug from text
export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
