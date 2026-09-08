"use client";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const listener = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [open, onClose]);
}
export function Dialog({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  useEscape(open, onClose); if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-md" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50" role="dialog" aria-modal="true">
      <header className="flex items-start justify-between border-b border-white/5 px-5 py-4"><div><h2 className="text-base font-semibold text-white">{title}</h2>{description&&<p className="mt-1 text-xs text-slate-500">{description}</p>}</div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X size={18}/></Button></header>
      <div className="p-5">{children}</div>
    </section>
  </div>;
}
export function DetailDrawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEscape(open, onClose); if (!open) return null;
  return <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-slate-950 shadow-2xl shadow-black/50" role="dialog" aria-modal="true">
      <header className="flex items-center justify-between border-b border-white/5 px-5 py-4"><h2 className="font-semibold text-white">{title}</h2><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X size={18}/></Button></header>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </aside>
  </div>;
}
