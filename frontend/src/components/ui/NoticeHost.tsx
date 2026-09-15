"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import { useNoticeStore } from "@/stores/notice-store";

export function NoticeHost() {
  const notices = useNoticeStore((state) => state.notices);
  const dismiss = useNoticeStore((state) => state.dismiss);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
      {notices.map((notice) => (
        <div
          key={notice.id}
          role="alert"
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${
            notice.tone === "success"
              ? "border-emerald-400/30 bg-emerald-950/90 text-emerald-100"
              : "border-rose-400/30 bg-rose-950/90 text-rose-100"
          }`}
        >
          {notice.tone === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span className="flex-1 leading-5">{notice.message}</span>
          <button type="button" onClick={() => dismiss(notice.id)} aria-label="Dismiss notification">
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
