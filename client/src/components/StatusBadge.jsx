import { formatDate } from "../format.js";
export default function StatusBadge({ status, scheduledAt }) {
  const map = {
    published: {
      label: "Published",
      cls: "bg-[#F0FDF4] text-[#059669] border-[#A7F3D0]",
      dot: "bg-[#10B981]"
    },
    draft: {
      label: "Draft",
      cls: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
      dot: "bg-[#F59E0B]"
    },
    scheduled: {
      label: "Scheduled",
      cls: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]",
      dot: "bg-[#8B5CF6]"
    }
  };
  const currentStatus = status || "published";
  const conf = map[currentStatus] || map.published;
  return <div className="flex flex-col gap-0.5">
      <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${conf.cls}`}
  >
        <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
        {conf.label}
      </span>
      {currentStatus === "scheduled" && scheduledAt && <span className="text-[10px] text-[#7C3AED] font-medium pl-1">
          {formatDate(scheduledAt)}
        </span>}
    </div>;
}
