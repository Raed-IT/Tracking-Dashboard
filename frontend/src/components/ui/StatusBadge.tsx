import { cn } from "@/lib/utils";

export function StatusBadge({ status, pulse = false }: { status: string; pulse?: boolean }) {
  const tone = /online|active|operational|resolved|live/i.test(status) ? "success" : /critical|offline|error/i.test(status) ? "danger" : /degraded|warning|acknowledged|high/i.test(status) ? "warning" : "neutral";
  return <span className={cn("status-badge", `status-badge--${tone}`)}><i className={pulse ? "pulse" : undefined} />{status.replaceAll("_", " ")}</span>;
}
