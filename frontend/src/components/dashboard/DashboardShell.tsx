"use client";

import Link from "next/link";
import {
  Activity,
  Bell,
  Database,
  Layers3,
  Maximize2,
  Minimize2,
  RadioTower,
  ShieldAlert,
  Target,
  Wifi,
  X,
} from "lucide-react";
import { useState } from "react";

import { OperationsMap } from "@/components/map/OperationsMap";
import { AuthGate } from "@/components/auth/AuthGate";
import { OperationsDrawer } from "@/components/navigation/OperationsDrawer";
import { useDashboardController } from "@/controllers/useDashboardController";
import { PageHeader } from "@/components/ui/Page";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useTranslation } from "@/hooks/useTranslation";

function SecuredDashboard() {
  const dashboard = useDashboardController();
  const { t } = useTranslation();
const [fullscreen, setFullscreen] = useState(false);
  const telemetry = dashboard.sources.reduce(
    (sum, source) => sum + source.messages_per_minute,
    0,
  );

  const stats = [
    {
      label: t.dashboard.activeTracks,
      value: dashboard.metrics.tracks,
      detail: t.dashboard.activeTracksDetail,
      icon: RadioTower,
      accent: "text-cyan-500 dark:text-cyan-300",
      bg: "bg-cyan-500/10 dark:bg-cyan-300/10",
    },
    {
      label: t.dashboard.dataSources,
      value: dashboard.sources.length,
      detail: `${dashboard.metrics.sources} ${t.dashboard.dataSourcesDetail}`,
      icon: Wifi,
      accent: "text-emerald-600 dark:text-emerald-300",
      bg: "bg-emerald-500/10 dark:bg-emerald-300/10",
    },
    {
      label: t.dashboard.activeAlerts,
      value: dashboard.metrics.alerts,
      detail: t.dashboard.activeAlertsDetail,
      icon: ShieldAlert,
      accent: "text-amber-600 dark:text-amber-300",
      bg: "bg-amber-500/10 dark:bg-amber-300/10",
    },
    {
      label: t.dashboard.telemetry,
      value: Math.round(telemetry),
      detail: t.dashboard.telemetryDetail,
      icon: Database,
      accent: "text-violet-600 dark:text-violet-300",
      bg: "bg-violet-500/10 dark:bg-violet-300/10",
    },
  ];

  return (
    <main className="mx-auto max-w-[1900px] p-3 sm:p-5 xl:p-7">
      <PageHeader
        eyebrow={t.dashboard.eyebrow}
        title={t.dashboard.title}
        description={t.dashboard.description}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon, accent, bg }) => (
          <article
            key={label}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/[.07] dark:bg-slate-900/70 dark:shadow-black/10"
          >
            <div className={`mb-5 grid h-10 w-10 place-items-center rounded-xl ${bg} ${accent}`}>
              <Icon size={18} />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[.17em] text-slate-500 dark:text-slate-500">
              {label}
            </div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {value.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-600">
              {detail}
            </div>
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border border-slate-200 dark:border-white/[.03]" />
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section
          className={[
            "relative overflow-hidden border shadow-2xl transition-all duration-300",
            "rounded-2xl border-slate-200 bg-white dark:border-white/[.07] dark:bg-slate-900/70",
            fullscreen
              ? "map-fullscreen rounded-none border-0"
              : "h-[min(70vh,680px)] min-h-[520px]",
          ].join(" ")}
        >
          {/* <div className="map-overlay-card absolute left-4 top-4 z-20 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {t.dashboard.liveTheater}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {t.dashboard.globalAirspace}
            </div>
            <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-500">
              {t.dashboard.telemetry} · {dashboard.metrics.tracks.toLocaleString()} {t.dashboard.targets}
            </div>
          </div> */}

          <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white/90 text-slate-600 shadow-lg backdrop-blur-xl transition hover:text-slate-950 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-400 dark:hover:text-white"
              aria-label={t.dashboard.fullscreen}
              title={t.dashboard.fullscreen}
            >
              <Layers3 size={16} />
            </button>

            <button
              type="button"
              onClick={() => setFullscreen((value) => !value)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white/90 text-slate-600 shadow-lg backdrop-blur-xl transition hover:text-slate-950 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-400 dark:hover:text-white"
              aria-label={fullscreen ? t.dashboard.exitFullScreen : t.dashboard.fullscreen}
              title={fullscreen ? t.dashboard.exitFullScreen : t.dashboard.fullscreen}
            >
              {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {fullscreen && (
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-[10px] text-slate-600 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-400">
              <Target size={13} className="text-cyan-500 dark:text-cyan-300" />
              {t.dashboard.fullScreenTactical}
              <button
                type="button"
                onClick={() => setFullscreen((value) => !value)}
                className="ml-2 rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-white/10"
                aria-label={t.dashboard.exitFullScreen}
              >
                <X size={13} />
              </button>
            </div>
          )}

          <div className="map-canvas h-full w-full">
            <OperationsMap />
          </div>
        </section>

        {!fullscreen && (
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[.07] dark:bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/[.06]">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[.18em] text-amber-500 dark:text-amber-300">
                  {t.dashboard.priorityQueue}
                </div>
                <h2 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {t.dashboard.activeIncidents}
                </h2>
              </div>
              <Link
                href="/alerts"
                className="text-[11px] text-cyan-600 hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200"
              >
                {t.dashboard.viewAll}
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[.05]">
              {dashboard.alerts.slice(0, 6).map((alert) => (
                <article
                  className="p-4 transition hover:bg-slate-50 dark:hover:bg-white/[.02]"
                  key={alert.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-sm text-slate-800 dark:text-slate-200">
                      {alert.title}
                    </strong>
                    <StatusBadge status={alert.severity} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                    {alert.message ?? t.dashboard.unlinkedTarget}
                  </p>
                  <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-600">
                    {new Date(alert.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {alert.track?.callsign ?? t.dashboard.unlinkedTarget}
                  </div>
                </article>
              ))}

              {dashboard.alerts.length === 0 && (
                <div className="flex min-h-48 items-center justify-center px-5 text-center text-xs text-slate-500">
                  {t.common.noAlerts}
                </div>
              )}
            </div>
          </aside>
        )}
      </section>

      {!fullscreen && (
        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/[.07] dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Activity size={14} className="text-emerald-500" />
              {t.dashboard.systemStatus}
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              {t.dashboard.feedsOperational}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/[.07] dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Bell size={14} className="text-amber-500" />
              {t.dashboard.alertMonitoring}
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              {dashboard.metrics.alerts.toLocaleString()} {t.dashboard.activeEvents}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/[.07] dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Database size={14} className="text-violet-500" />
              {t.dashboard.dataThroughput}
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              {Math.round(telemetry).toLocaleString()} {t.dashboard.telemetry}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export function DashboardShell() {
  return (
    <AuthGate>
      <OperationsDrawer>
        <SecuredDashboard />
      </OperationsDrawer>
    </AuthGate>
  );
}
