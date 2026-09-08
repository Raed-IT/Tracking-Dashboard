"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LockKeyhole,
  Plane,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const TRACKS = [
  { id: "FUS-2291", alt: "34,000 FT", top: "24%", left: "66%", delay: "0s" },
  { id: "FUS-0417", alt: "18,400 FT", top: "63%", left: "31%", delay: "1.1s" },
  { id: "FUS-8823", alt: "41,000 FT", top: "38%", left: "19%", delay: "2s" },
  { id: "FUS-1550", alt: "9,200 FT", top: "73%", left: "72%", delay: ".55s" },
];

export default function LoginPage() {
  const router = useRouter(),
    user = useAuthStore((s) => s.user),
    initialized = useAuthStore((s) => s.initialized),
    initialize = useAuthStore((s) => s.initialize),
    login = useAuthStore((s) => s.login),
    busy = useAuthStore((s) => s.busy),
    error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  useEffect(() => {
    void initialize();
  }, [initialize]);
  useEffect(() => {
    if (initialized && user) router.replace("/");
  }, [initialized, user, router]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.replace("/");
    } catch {}
  };
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.10),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,.10),transparent_30%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.15fr_.85fr]">
        <section className="relative hidden overflow-hidden border-r border-white/[.06] lg:block">
          <div className="absolute left-10 top-10 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
              <RadioTower size={19} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-[.2em]">
                FUSION<span className="text-cyan-300">OPS</span>
              </div>
              <div className="text-[9px] uppercase tracking-[.2em] text-slate-600">
                Air operations platform
              </div>
            </div>
          </div>
          <div className="absolute inset-0 grid place-items-center pt-10">
            <div className="relative h-[520px] w-[520px] rounded-full border border-cyan-300/10 bg-slate-950/30 shadow-[0_0_100px_rgba(34,211,238,.06)]">
              <div className="absolute inset-[12%] rounded-full border border-cyan-300/10" />
              <div className="absolute inset-[25%] rounded-full border border-cyan-300/10" />
              <div className="absolute inset-[38%] rounded-full border border-cyan-300/10" />
              <div className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom -translate-x-1/2 bg-cyan-300/10" />
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-cyan-300/10" />
              <div className="absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-top-left rounded-tr-full border-r border-t border-cyan-300/40 bg-gradient-to-tr from-cyan-300/10 to-transparent animate-spin" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-3 w-3 place-items-center rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,.9)]">
                <i className="h-1 w-1 rounded-full bg-slate-950" />
              </div>
              {TRACKS.map((t) => (
                <div
                  key={t.id}
                  className="absolute animate-pulse"
                  style={{ top: t.top, left: t.left, animationDelay: t.delay }}
                >
                  <div className="relative h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,.9)]">
                    <div className="absolute left-2 top-1/2 h-px w-10 bg-gradient-to-r from-cyan-300/60 to-transparent" />
                    <div className="absolute left-4 top-2 whitespace-nowrap text-[8px] font-mono tracking-wider text-cyan-200/70">
                      {t.id} · {t.alt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                LIVE AIRSPACE
              </div>
              <p className="mt-2 max-w-sm text-xs leading-5 text-slate-600">
                Unified situational awareness for aircraft telemetry, source
                health and operational alerts.
              </p>
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[.2em] text-slate-700">
              MULTI-SOURCE / REALTIME
            </div>
          </div>
        </section>
        <section className="flex min-h-screen items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
                  <RadioTower size={19} />
                </div>
                <div className="text-sm font-bold tracking-[.2em]">
                  FUSION<span className="text-cyan-300">OPS</span>
                </div>
              </div>
            </div>
            <div className="mb-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-cyan-300">
                <Plane size={12} /> Operations center
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Welcome back.
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in with your assigned organization credentials to access
                live flight operations.
              </p>
            </div>
            <form
              onSubmit={submit}
              className="rounded-2xl border border-white/[.08] bg-white/[.025] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6"
            >
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-400">
                  Email address
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 focus-within:border-cyan-300/40">
                  <input
                    className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-700"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@example.com"
                  />
                </div>
              </label>
              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-medium text-slate-400">
                  Password
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 focus-within:border-cyan-300/40">
                  <LockKeyhole size={15} className="text-slate-600" />
                  <input
                    className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-700"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
              </label>
              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/5 px-3 py-2.5 text-xs text-rose-300"
                >
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={busy}
                className="group mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
              >
                {busy ? "Authenticating…" : "Enter operations center"}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
              <div className="mt-5 flex items-start gap-2 border-t border-white/[.06] pt-4 text-[10px] leading-5 text-slate-600">
                <ShieldCheck
                  size={14}
                  className="mt-0.5 shrink-0 text-emerald-300/70"
                />
                Authorized personnel only. Access activity may be logged and
                audited.
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
