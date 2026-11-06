import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StatusRekomendasi } from "@/types/analisis";

const STATUS_STYLE: Record<
  StatusRekomendasi,
  { label: string; icon: LucideIcon; className: string }
> = {
  DITERIMA: {
    label: "DITERIMA",
    icon: CircleCheck,
    className: "bg-green-100 text-green-800",
  },
  TIDAK_SINKRON: {
    label: "TIDAK SINKRON",
    icon: TriangleAlert,
    className: "bg-amber-100 text-amber-800",
  },
  DITOLAK: {
    label: "DITOLAK",
    icon: CircleX,
    className: "bg-red-100 text-red-800",
  },
};

type StatusBadgeProps = {
  status: StatusRekomendasi;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, icon: Icon, className } = STATUS_STYLE[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}