"use client";

import { useState } from "react";
import type { Map as MlMap } from "maplibre-gl";

type Layer = {
  id: string;
  label: string;
  color: string;
};

const LAYERS: Layer[] = [
  { id: "aircraft", label: "Aircraft", color: "bg-cyan-400 dark:bg-cyan-300" },
  { id: "alerts", label: "Alerts", color: "bg-amber-300" },
  { id: "routes", label: "Routes", color: "bg-violet-300" },
  { id: "airports", label: "Airports", color: "bg-emerald-300" },
];

type LayerControlProps = {
  map: React.RefObject<MlMap | null>;
};

export function LayerControl({ map }: LayerControlProps) {
  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYERS.map((layer) => [layer.id, true])),
  );

  const toggleLayer = (id: string) => {
    const instance = map.current;
    const next = !visible[id];

    setVisible((state) => ({ ...state, [id]: next }));

    if (!instance) return;

    for (const layerId of getMapLayerIds(id)) {
      if (!instance.getLayer(layerId)) continue;

      instance.setLayoutProperty(
        layerId,
        "visibility",
        next ? "visible" : "none",
      );
    }
  };

  return (
    <div className="absolute right-4 top-4 z-20 w-52 rounded-xl border border-slate-200/80 bg-white/90 p-2 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-100">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-900/5 dark:hover:bg-white/5"
        aria-expanded={open}
        aria-controls="map-layer-list"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500 dark:text-slate-400">
          Map layers
        </span>
        <span
          className={`text-xs text-slate-600 dark:text-slate-500 dark:text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && (
        <div id="map-layer-list" className="mt-1 border-t border-slate-200 pt-1 dark:border-white/10">
          {LAYERS.map((layer) => {
            const isVisible = visible[layer.id];

            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => toggleLayer(layer.id)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition hover:bg-slate-900/5 dark:hover:bg-white/5"
                aria-pressed={isVisible}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${layer.color} ${
                      isVisible ? "opacity-100" : "opacity-30"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      isVisible ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-500"
                    }`}
                  >
                    {layer.label}
                  </span>
                </span>

                <span
                  className={`flex h-4 w-7 items-center rounded-full p-0.5 transition ${
                    isVisible ? "bg-cyan-500/30" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <span
                    className={`h-3 w-3 rounded-full transition ${
                      isVisible
                        ? "translate-x-3 bg-cyan-400 dark:bg-cyan-300"
                        : "translate-x-0 bg-slate-500"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getMapLayerIds(layer: string): string[] {
  switch (layer) {
    case "aircraft":
      return ["aircraft"];
    case "alerts":
      return ["alerts"];
    case "routes":
      return ["routes"];
    case "airports":
      return ["airports"];
    default:
      return [];
  }
}
