import { cn } from "@/lib/utils";

export function StatusBadge({ status, pulse = false }: { status: string; pulse?: boolean }) {
  const tone = /online|active|operational|resolved|live/i.test(status)
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
    : /critical|offline|error/i.test(status)
      ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
      : /degraded|warning|acknowledged|high/i.test(status)
        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
        : "border-slate-400/15 bg-slate-400/10 text-slate-300";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.14em]", tone)}>
      <i className={cn("h-1.5 w-1.5 rounded-full bg-current", pulse && "animate-pulse")} />
      {status.replaceAll("_", " ")}
    </span>
  );
}
