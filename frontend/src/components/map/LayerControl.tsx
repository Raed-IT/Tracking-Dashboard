"use client";

import { useState } from "react";
import type { Map as MlMap } from "maplibre-gl";

type LayerControlProps = {
  map: MlMap | null;
  mapLoaded?: boolean;
};

export function LayerControl({
  map,
  mapLoaded = false,
}: LayerControlProps) {
  const [open, setOpen] = useState(false);

  if (!map || !mapLoaded) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-medium text-slate-800 shadow-xl backdrop-blur-xl transition hover:bg-white dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-200 dark:hover:bg-slate-900"
      >
        Layers
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Map layers
          </div>

          {/* Put your existing layer controls here */}
        </div>
      )}
    </div>
  );
}