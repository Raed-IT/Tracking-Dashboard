"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { Map as MlMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { fetchTracks } from "@/services/api";
import { connectTracking } from "@/services/realtime";
import { useTrackingStore } from "@/stores/tracking-store";

import {
  AircraftLayer,
  AlertLayer,
  AirportLayer,
  RouteLayer,
} from "./layers";
import { LayerControl } from "./LayerControl";

// Enable proper Arabic/Hebrew shaping and right-to-left map labels.
// MapLibre requires the RTL text plugin for Arabic labels.
maplibregl.setRTLTextPlugin(
  "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js",
  true,
);

type MapStyleOption = {
  id: string;
  label: string;
  url: string;
};

const MAP_STYLES: MapStyleOption[] = [
  {
    id: "operational",
    label: "Operational",
    url: "https://demotiles.maplibre.org/style.json",
  },
  {
    id: "liberty",
    label: "Liberty",
    url: "https://tiles.openfreemap.org/styles/liberty",
  },
  {
    id: "bright",
    label: "Bright",
    url: "https://tiles.openfreemap.org/styles/bright",
  },
];

export function OperationsMap() {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const replace = useTrackingStore((state) => state.replace);
  const [styleId, setStyleId] = useState("operational");
  const [styleVersion, setStyleVersion] = useState(0);

  useEffect(() => {
    if (!el.current) return;

    const disconnect = connectTracking();

    const instance = new maplibregl.Map({
      container: el.current,
      style: MAP_STYLES[0].url,
      center: [38.9968, 35.0],
      zoom: 6.2,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      maxPitch: 0,
    });

    map.current = instance;

    instance.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
        visualizePitch: false,
      }),
      "bottom-right",
    );

    instance.addControl(new maplibregl.FullscreenControl(), "bottom-right");

    const loadTracks = () => {
      const bounds = instance.getBounds();

      fetchTracks(
        `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
      )
        .then(replace)
        .catch(() => undefined);
    };

    instance.on("load", loadTracks);
    instance.on("moveend", loadTracks);

    return () => {
      disconnect();
      instance.remove();
      map.current = null;
    };
  }, [replace]);

  const changeStyle = (nextStyleId: string) => {
    const nextStyle = MAP_STYLES.find((style) => style.id === nextStyleId);
    const instance = map.current;
    if (!nextStyle || !instance || nextStyle.id === styleId) return;

    setStyleId(nextStyle.id);
    instance.setStyle(nextStyle.url);
    instance.once("style.load", () => setStyleVersion((version) => version + 1));
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <div ref={el} className="h-full w-full" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_35%,rgba(2,6,23,.16)_100%)]" />

      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 p-1.5 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-100">
        <label className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Map style
        </label>
        <select
          value={styleId}
          onChange={(event) => changeStyle(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none transition focus:border-cyan-400/50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Map style"
        >
          {MAP_STYLES.map((style) => (
            <option key={style.id} value={style.id}>
              {style.label}
            </option>
          ))}
        </select>
      </div>

      <LayerControl map={map} />

      <div key={styleVersion}>
        <AircraftLayer map={map} />
        <AlertLayer map={map} />
        <RouteLayer map={map} />
        <AirportLayer map={map} />
      </div>

      <OperationsMapThemeStyles />

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 shadow-xl backdrop-blur-xl">
        <span className="text-cyan-300">●</span> Aircraft
        <span className="ml-3 text-amber-300">●</span> Alerts
      </div>
    </div>
  );
}

// Keep MapLibre's native fullscreen/navigation controls synchronized with the
// application's light/dark theme. The controls themselves are rendered by
// MapLibre, so Tailwind classes on the React buttons cannot style them.
export function OperationsMapThemeStyles() {
  return (
    <style jsx global>{`
      .maplibregl-ctrl-group {
        overflow: hidden;
        border: 1px solid rgb(226 232 240 / 0.9);
        border-radius: 0.75rem;
        background: rgb(255 255 255 / 0.9);
        box-shadow: 0 10px 30px rgb(15 23 42 / 0.12);
        backdrop-filter: blur(16px);
      }

      .maplibregl-ctrl-group button {
        background-color: transparent;
        color: rgb(15 23 42);
      }

      .maplibregl-ctrl-group button + button {
        border-top: 1px solid rgb(226 232 240 / 0.9);
      }

      .dark .maplibregl-ctrl-group {
        border-color: rgb(255 255 255 / 0.1);
        background: rgb(2 6 23 / 0.9);
        box-shadow: 0 10px 30px rgb(0 0 0 / 0.35);
      }

      .dark .maplibregl-ctrl-group button {
        color: rgb(226 232 240);
      }

      .dark .maplibregl-ctrl-group button + button {
        border-top-color: rgb(255 255 255 / 0.1);
      }
    `}</style>
  );
}
