import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <span className="mb-2 inline-flex text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">{eyebrow}</span>}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
    <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[.04] text-slate-500">⌁</div>
    <h3 className="font-medium text-slate-800 dark:text-slate-200">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>;
}
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
    <AlertTriangle className="mb-3 text-amber-500 dark:text-amber-300" size={22}/><strong className="text-slate-800 dark:text-slate-200">Unable to load this workspace.</strong>
    <p className="mt-1 text-sm text-slate-500">Please check the API connection and try again.</p>
    {onRetry && <Button className="mt-4" onClick={onRetry}><RefreshCw size={15}/>Retry</Button>}
  </div>;
}
