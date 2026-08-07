import type { DealStatus } from "@shared/schema";

const STYLES: Record<DealStatus, string> = {
  draft: "bg-ink/5 text-ink-faint",
  sent: "bg-sky-100 text-sky-700",
  viewed: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
};

export default function StatusBadge({ status }: { status: DealStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
