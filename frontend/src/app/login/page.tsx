"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  Mail,
  Plane,
  RadioTower,
  Radar,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const TRACKS = [
  {
    id: "FUS-2291",
    alt: "34,000 FT",
    top: "18%",
    left: "67%",
    delay: "0s",
    duration: "4.8s",
  },
  {
    id: "FUS-0417",
    alt: "18,400 FT",
    top: "61%",
    left: "27%",
    delay: "1.2s",
    duration: "5.5s",
  },
  {
    id: "FUS-8823",
    alt: "41,000 FT",
    top: "34%",
    left: "16%",
    delay: "2s",
    duration: "4.2s",
  },
  {
    id: "FUS-1550",
    alt: "9,200 FT",
    top: "73%",
    left: "70%",
    delay: ".5s",
    duration: "6s",
  },
  {
    id: "FUS-7312",
    alt: "29,500 FT",
    top: "47%",
    left: "80%",
    delay: "1.8s",
    duration: "5.2s",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const initialize = useAuthStore((s) => s.initialize);
  const login = useAuthStore((s) => s.login);
  const busy = useAuthStore((s) => s.busy);
  const error = useAuthStore((s) => s.error);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (initialized && user) {
      router.replace("/");
    }
  }, [initialized, user, router]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(email, password);
      router.replace("/");
    } catch {}
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* ========================================================= */}
      {/* GLOBAL BACKGROUND */}
      {/* ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute -left-[20%] -top-[25%] h-[700px] w-[700px] rounded-full bg-cyan-500/[0.07] blur-[140px] animate-pulse" />

        <div
          className="absolute -bottom-[30%] -right-[15%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.06] blur-[150px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Scan lines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(34,211,238,0.025)_50%,transparent_100%)] bg-[length:100%_180px] animate-[scan_7s_linear_infinite]" />

        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.025] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%22.35%22/%3E%3C/svg%3E')]" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-[1800px] lg:grid-cols-[1.35fr_.65fr]">
        {/* ========================================================= */}
        {/* LEFT SIDE */}
        {/* ========================================================= */}

        <section className="relative hidden overflow-hidden border-r border-white/[0.06] lg:block">
          {/* Brand */}
          <div className="absolute left-10 top-9 z-30 animate-[fadeDown_.7s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-300">
                <div className="absolute inset-0 rounded-xl bg-cyan-300/10 blur-xl" />
                <RadioTower size={20} className="relative" />
              </div>

              <div>
                <div className="text-sm font-bold tracking-[0.24em]">
                  FUSION
                  <span className="text-cyan-300">OPS</span>
                </div>

                <div className="mt-1 text-[9px] uppercase tracking-[0.24em] text-slate-600">
                  Air Operations Platform
                </div>
              </div>
            </div>
          </div>

          {/* System status */}
          <div className="absolute right-10 top-9 z-30 flex items-center gap-5 animate-[fadeDown_.7s_ease-out_.15s_both]">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Systems online
            </div>

            <div className="h-4 w-px bg-white/[0.08]" />

            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-slate-600">
              <Globe2 size={12} />
              Global network
            </div>
          </div>

          {/* ===================================================== */}
          {/* RADAR */}
          {/* ===================================================== */}

          <div className="absolute inset-0 grid place-items-center">
            <div className="relative h-[600px] w-[600px]">
              {/* Outer glow */}
              <div className="absolute inset-[8%] rounded-full bg-cyan-400/[0.025] blur-3xl" />

              {/* Rings */}
              <div className="absolute inset-0 rounded-full border border-cyan-300/[0.10]" />

              <div className="absolute inset-[11%] rounded-full border border-cyan-300/[0.09]" />

              <div className="absolute inset-[23%] rounded-full border border-cyan-300/[0.08]" />

              <div className="absolute inset-[35%] rounded-full border border-cyan-300/[0.07]" />

              {/* Degree ticks */}
              <div className="absolute inset-[-14px] rounded-full border border-dashed border-cyan-300/[0.07]" />

              {/* Crosshair */}
              <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-300/[0.07]" />

              <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-300/[0.07]" />

              {/* Diagonal */}
              <div className="absolute left-[13%] top-[13%] h-px w-[74%] rotate-45 bg-cyan-300/[0.045]" />

              <div className="absolute left-[13%] top-[13%] h-px w-[74%] -rotate-45 bg-cyan-300/[0.045]" />

              {/* Radar sweep */}
              <div className="absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-top-left overflow-hidden rounded-tr-full">
                <div className="absolute inset-0 origin-bottom-left rotate-[-8deg] border-r border-t border-cyan-300/50 bg-gradient-to-tr from-cyan-300/[0.12] via-cyan-300/[0.035] to-transparent animate-[radar_5s_linear_infinite]" />
              </div>

              {/* Center */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative grid h-16 w-16 place-items-center rounded-full border border-cyan-300/20 bg-slate-950/70 backdrop-blur">
                  <div className="absolute inset-0 rounded-full border border-cyan-300/10 animate-ping" />

                  <div className="grid h-5 w-5 place-items-center rounded-full bg-cyan-300 shadow-[0_0_35px_rgba(34,211,238,.95)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                  </div>
                </div>
              </div>

              {/* Aircraft */}
              {TRACKS.map((track) => (
                <div
                  key={track.id}
                  className="absolute animate-[aircraftFloat_3s_ease-in-out_infinite]"
                  style={{
                    top: track.top,
                    left: track.left,
                    animationDelay: track.delay,
                  }}
                >
                  <div className="relative">
                    {/* Pulse */}
                    <div
                      className="absolute -inset-2 rounded-full bg-cyan-300/20 animate-ping"
                      style={{ animationDelay: track.delay }}
                    />

                    {/* Aircraft point */}
                    <div className="relative h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.95)]" />

                    {/* Trail */}
                    <div
                      className="absolute left-2 top-1/2 h-px w-20 bg-gradient-to-r from-cyan-300/60 to-transparent"
                      style={{
                        transform: "translateY(-50%)",
                      }}
                    />

                    {/* Label */}
                    <div className="absolute left-5 top-4 whitespace-nowrap rounded-md border border-white/[0.07] bg-slate-950/75 px-2.5 py-1.5 font-mono text-[8px] tracking-wider text-cyan-200/75 shadow-xl backdrop-blur-md">
                      <span>{track.id}</span>
                      <span className="mx-1.5 text-slate-700">/</span>
                      <span className="text-slate-500">{track.alt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar label */}
          <div className="absolute bottom-[19%] left-1/2 z-20 -translate-x-1/2 text-center">
            <div className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
              <Radar size={12} />
              Live airspace
            </div>

            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-600">
              Unified situational awareness for aircraft telemetry, source
              health and operational alerts.
            </p>
          </div>

          {/* Bottom telemetry */}
          <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between">
            <div className="flex gap-10">
              <Metric label="Active tracks" value="1,284" />

              <Metric label="Data sources" value="24" />

              <Metric
                label="Telemetry"
                value="98.7%"
                valueClass="text-emerald-300"
              />

              <Metric label="Latency" value="42 ms" />
            </div>

            <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.22em] text-slate-700">
              <Wifi size={11} />
              FUSION / REALTIME
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* RIGHT SIDE */}
        {/* ========================================================= */}

        <section className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
          {/* Connection */}
          <div className="absolute right-7 top-7 flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-slate-700">
            <Activity size={12} />
            Encrypted connection
          </div>

          <div className="w-full max-w-[420px] animate-[fadeUp_.8s_ease-out]">
            {/* Mobile brand */}
            <div className="mb-12 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-300">
                  <RadioTower size={20} />
                </div>

                <div>
                  <div className="text-sm font-bold tracking-[0.24em]">
                    FUSION
                    <span className="text-cyan-300">OPS</span>
                  </div>

                  <div className="mt-1 text-[9px] uppercase tracking-[0.22em] text-slate-600">
                    Air Operations Platform
                  </div>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/[0.045] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                <Plane size={12} />
                Operations center
              </div>

              <h1 className="text-[42px] font-semibold leading-none tracking-[-0.045em] text-white">
                Welcome back.
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
                Sign in to access live flight operations, telemetry and
                situational awareness.
              </p>
            </div>

            {/* ===================================================== */}
            {/* FORM */}
            {/* ===================================================== */}

            <form
              onSubmit={submit}
              className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#07101d]/90 shadow-[0_30px_100px_rgba(0,0,0,.45)]"
            >
              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

              {/* Header */}
              <div className="border-b border-white/[0.06] px-6 py-5 sm:px-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300">
                      <LockKeyhole size={17} />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-white">
                        Operator authentication
                      </div>

                      <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-slate-600">
                        Secure access gateway
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.04] px-2.5 py-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>

                    <span className="text-[8px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Form body */}
              <div className="p-6 sm:p-7">
                {/* Email */}
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Operator email
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center">
                      <Mail
                        size={16}
                        className="text-slate-600 transition-colors duration-200 peer-focus:text-cyan-300"
                      />
                    </div>

                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@example.com"
                      className="peer h-[54px] w-full rounded-xl border border-white/[0.08] bg-[#020817] pl-12 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-700 hover:border-white/[0.12] focus:border-cyan-300/40 focus:bg-[#030b18] focus:shadow-[0_0_0_4px_rgba(34,211,238,.04)]"
                    />

                    <div className="pointer-events-none absolute bottom-0 left-4 right-4 h-px origin-left scale-x-0 bg-gradient-to-r from-cyan-300/70 to-transparent transition-transform duration-300 peer-focus:scale-x-100" />
                  </div>
                </div>

                {/* Password */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Access password
                    </label>

                    <span className="text-[8px] uppercase tracking-[0.14em] text-slate-700">
                      Protected
                    </span>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center">
                      <LockKeyhole size={16} className="text-slate-600" />
                    </div>

                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="peer h-[54px] w-full rounded-xl border border-white/[0.08] bg-[#020817] pl-12 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-700 hover:border-white/[0.12] focus:border-cyan-300/40 focus:bg-[#030b18] focus:shadow-[0_0_0_4px_rgba(34,211,238,.04)]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-slate-600 transition hover:bg-white/[0.04] hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>

                    <div className="pointer-events-none absolute bottom-0 left-4 right-4 h-px origin-left scale-x-0 bg-gradient-to-r from-cyan-300/70 to-transparent transition-transform duration-300 peer-focus:scale-x-100" />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-3 rounded-xl border border-rose-400/15 bg-rose-400/[0.045] px-4 py-3.5"
                  >
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,.7)]" />

                    <div>
                      <div className="text-[10px] font-semibold text-rose-300">
                        Authentication failed
                      </div>

                      <div className="mt-0.5 text-[9px] leading-4 text-rose-300/60">
                        {error}
                      </div>
                    </div>
                  </div>
                )}

                {/* Login button */}
                <button
                  type="submit"
                  disabled={busy}
                  className="group relative mt-6 h-[54px] w-full overflow-hidden rounded-xl bg-cyan-300 text-sm font-semibold text-slate-950 transition-all duration-300 hover:bg-cyan-200 hover:shadow-[0_0_40px_rgba(34,211,238,.16)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {/* Animated background */}
                  <span className="absolute inset-0 -translate-x-full skew-x-[-18deg] bg-white/30 transition-transform duration-700 group-hover:translate-x-[180%]" />

                  <span className="relative flex items-center justify-center gap-2">
                    {busy ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Access operations center</span>

                        <ArrowRight
                          size={16}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </span>
                </button>

                {/* Security info */}
                <div className="mt-6 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-400/[0.06] text-emerald-300">
                      <ShieldCheck size={15} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-400">
                          Secure environment
                        </span>

                        <span className="h-1 w-1 rounded-full bg-emerald-400" />

                        <span className="text-[8px] uppercase tracking-wider text-emerald-400/70">
                          Encrypted
                        </span>
                      </div>

                      <p className="mt-1 text-[9px] leading-4 text-slate-600">
                        Authorized personnel only. Authentication activity is
                        monitored and audited.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom status bar */}
              <div className="flex items-center justify-between border-t border-white/[0.05] bg-black/10 px-6 py-3.5 sm:px-7">
                <div className="flex items-center gap-2">
                  <Activity size={11} className="text-cyan-300/60" />

                  <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-slate-700">
                    AUTH.GATEWAY
                  </span>
                </div>

                <span className="font-mono text-[8px] text-slate-700">
                  TLS / SECURE
                </span>
              </div>
            </form>

            {/* FOOTER */}
            <div className="mt-6 flex items-center justify-between text-[8px] uppercase tracking-[0.18em] text-slate-700">
              <span>FusionOps Platform</span>

              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400/80" />
                All systems operational
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================= */}
      {/* ANIMATIONS */}
      {/* ========================================================= */}

      <style jsx global>{`
        @keyframes radar {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes aircraftFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(5px, -4px, 0);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-180px);
          }

          100% {
            transform: translateY(100vh);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-4px);
          }

          75% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </main>
  );
}

/* =============================================================== */
/* METRIC */
/* =============================================================== */

function Metric({
  label,
  value,
  valueClass = "text-slate-300",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-[8px] uppercase tracking-[0.2em] text-slate-600">
        {label}
      </div>

      <div className={`mt-1 font-mono text-sm ${valueClass}`}>{value}</div>
    </div>
  );
}
