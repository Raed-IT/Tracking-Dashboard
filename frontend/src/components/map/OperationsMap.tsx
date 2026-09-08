"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { Map as MlMap } from "maplibre-gl";
import { useEffect, useRef } from "react";

import { fetchTracks } from "@/services/api";
import { connectTracking } from "@/services/realtime";
import { useTrackingStore } from "@/stores/tracking-store";
import { AircraftLayer } from "./layers";

export function OperationsMap() {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const replace = useTrackingStore((state) => state.replace);

  useEffect(() => {
    if (!el.current) return;

    const disconnect = connectTracking();

    const instance = new maplibregl.Map({
      container: el.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 20],
      zoom: 2.1,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });

    map.current = instance;

    instance.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
        visualizePitch: false,
      }),
      "bottom-right",
    );

    const load = () => {
      const bounds = instance.getBounds();

      fetchTracks(
        `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
      )
        .then(replace)
        .catch(() => undefined);
    };

    instance.on("load", load);
    instance.on("moveend", load);

    return () => {
      disconnect();
      instance.remove();
      map.current = null;
    };
  }, [replace]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <div ref={el} className="h-full w-full" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_35%,rgba(2,6,23,.16)_100%)]" />

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-[9px] uppercase tracking-wider text-slate-400 shadow-xl backdrop-blur-xl">
        <span className="text-cyan-300">●</span> Aircraft
        <span className="ml-3 text-amber-300">●</span> Alerts
      </div>

      <AircraftLayer map={map} />
    </div>
  );
}
