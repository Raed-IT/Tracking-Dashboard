"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Map as MlMap } from "maplibre-gl";

import { fetchTracks } from "@/services/api";
import { useTrackingStore } from "@/stores/tracking-store";

import {
  AircraftLayer,
  AlertLayer,
  AirportLayer,
  RouteLayer,
} from "./layers";

import { LayerControl } from "./LayerControl";

/**
 * MapLibre RTL plugin is global.
 *
 * React Strict Mode can execute effects more than once during
 * development. MapLibre does not allow setRTLTextPlugin() to
 * be called multiple times.
 *
 * This flag makes sure we only register it once.
 */
let rtlPluginInitialized = false;

type MapStyleOption = {
  id: string;
  label: string;
  url: string;
};

const MAP_STYLES: MapStyleOption[] = [
  {
    id: "bright",
    label: "Bright",
    url: "https://tiles.openfreemap.org/styles/bright",
  },
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
];

export function OperationsMap() {
  const el = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<MlMap | null>(null);

  const [mapInstance, setMapInstance] =
    useState<MlMap | null>(null);

  const [styleId, setStyleId] = useState("bright");

  const [styleVersion, setStyleVersion] =
    useState(0);

  const [mapLoaded, setMapLoaded] =
    useState(false);

  const replace =
    useTrackingStore((state) => state.replace);

  /**
   * Keep the latest Zustand replace function available
   * without causing the MapLibre initialization effect
   * to rerun whenever the store changes.
   */
  const replaceRef = useRef(replace);

  useEffect(() => {
    replaceRef.current = replace;
  }, [replace]);

  /**
   * Fetch tracks inside the current map viewport.
   */
  const loadTracks = useCallback(
    async (instance: MlMap) => {
      try {
        const bounds = instance.getBounds();

        const bbox = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ].join(",");

        const tracks = await fetchTracks(bbox);

        replaceRef.current(tracks);
      } catch (error) {
        console.error(
          "Failed to load tracks:",
          error,
        );
      }
    },
    [],
  );

  /**
   * Initialize MapLibre.
   */
  useEffect(() => {
    let cancelled = false;

    let cleanupMapListeners:
      | (() => void)
      | undefined;

    let instance: MlMap | null = null;

    async function initializeMap() {
      if (!el.current) {
        return;
      }

      try {
        /**
         * Dynamic browser-only MapLibre import.
         */
        const { default: maplibregl } =
          await import("maplibre-gl");

        /**
         * The component may have been unmounted while
         * MapLibre was loading.
         */
        if (cancelled || !el.current) {
          return;
        }

        /**
         * Register the RTL plugin only once.
         *
         * MapLibre throws:
         *
         * "setRTLTextPlugin cannot be called multiple times."
         *
         * when this is executed more than once.
         */
        if (!rtlPluginInitialized) {
          try {
            maplibregl.setRTLTextPlugin(
              "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js",
              true,
            );

            rtlPluginInitialized = true;
          } catch (error) {
            /**
             * If another component/effect registered the
             * plugin between the check and this call, don't
             * break map initialization.
             */
            console.warn(
              "MapLibre RTL plugin initialization warning:",
              error,
            );
          }
        }

        /**
         * Make sure the component wasn't unmounted while
         * the RTL plugin was being initialized.
         */
        if (cancelled || !el.current) {
          return;
        }

        /**
         * Create MapLibre map.
         */
        instance = new maplibregl.Map({
          container: el.current,

          style: MAP_STYLES[0].url,

          center: [38.9968, 35.0],

          zoom: 6.2,

          attributionControl: false,

          dragRotate: false,

          pitchWithRotate: false,

          maxPitch: 0,
        });

        /**
         * If React unmounted the component while the map
         * was being created, destroy the map immediately.
         */
        if (cancelled) {
          instance.remove();
          instance = null;
          return;
        }

        /**
         * Save map reference.
         */
        mapRef.current = instance;

        /**
         * Store actual map instance in React state.
         */
        setMapInstance(instance);

        /**
         * Navigation controls.
         */
        instance.addControl(
          new maplibregl.NavigationControl({
            showCompass: false,
            visualizePitch: false,
          }),
          "bottom-right",
        );

        /**
         * Fullscreen control.
         */
        instance.addControl(
          new maplibregl.FullscreenControl(),
          "bottom-right",
        );

        /**
         * Map loaded.
         */
        const handleLoad = () => {
          if (cancelled) {
            return;
          }

          setMapLoaded(true);

          void loadTracks(instance!);
        };

        /**
         * Reload aircraft whenever the viewport changes.
         */
        const handleMoveEnd = () => {
          if (cancelled) {
            return;
          }

          void loadTracks(instance!);
        };

        instance.on(
          "load",
          handleLoad,
        );

        instance.on(
          "moveend",
          handleMoveEnd,
        );

        /**
         * Save listener cleanup.
         */
        cleanupMapListeners = () => {
          if (!instance) {
            return;
          }

          instance.off(
            "load",
            handleLoad,
          );

          instance.off(
            "moveend",
            handleMoveEnd,
          );
        };
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to initialize Operations Map:",
            error,
          );
        }
      }
    }

    void initializeMap();

    /**
     * Cleanup.
     */
    return () => {
      cancelled = true;

      /**
       * Remove event listeners.
       */
      cleanupMapListeners?.();

      /**
       * Destroy MapLibre.
       */
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.warn(
            "Failed to remove MapLibre instance:",
            error,
          );
        }
      }

      /**
       * Also handle the local instance in case the
       * asynchronous initialization completed right
       * before cleanup.
       */
      if (
        instance &&
        instance !== mapRef.current
      ) {
        try {
          instance.remove();
        } catch (error) {
          console.warn(
            "Failed to remove local MapLibre instance:",
            error,
          );
        }
      }

      mapRef.current = null;

      setMapInstance(null);

      setMapLoaded(false);
    };
  }, [loadTracks]);

  /**
   * Change MapLibre style.
   */
  const changeStyle = (
    nextStyleId: string,
  ) => {
    const nextStyle =
      MAP_STYLES.find(
        (style) =>
          style.id === nextStyleId,
      );

    const instance =
      mapRef.current;

    if (
      !nextStyle ||
      !instance ||
      nextStyle.id === styleId
    ) {
      return;
    }

    setStyleId(nextStyle.id);

    /**
     * Change MapLibre style.
     */
    instance.setStyle(
      nextStyle.url,
    );

    /**
     * MapLibre removes/rebuilds style
     * sources and layers.
     *
     * Incrementing styleVersion causes
     * our React layer components to
     * remount and recreate their sources
     * and layers.
     */
    instance.once(
      "style.load",
      () => {
        setStyleVersion(
          (version) =>
            version + 1,
        );
      },
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      {/* Map container */}
      <div
        ref={el}
        className="h-full w-full"
      />

      {/* Map visual overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_35%,rgba(2,6,23,.16)_100%)]" />

      {/* Map style selector */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 p-1.5 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-100">
        <label
          htmlFor="operations-map-style"
          className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
        >
          Map style
        </label>

        <select
          id="operations-map-style"
          value={styleId}
          onChange={(event) =>
            changeStyle(
              event.target.value,
            )
          }
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none transition focus:border-cyan-400/50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Map style"
        >
          {MAP_STYLES.map(
            (style) => (
              <option
                key={style.id}
                value={style.id}
              >
                {style.label}
              </option>
            ),
          )}
        </select>
      </div>

      {/* Map controls */}
      <LayerControl
        map={mapInstance}
        mapLoaded={mapLoaded}
      />

      {/* Map layers */}
      {mapInstance && (
        <div
          key={styleVersion}
        >
          <AircraftLayer
            map={mapInstance}
          />

          <AlertLayer
            map={mapInstance}
          />

          <RouteLayer
            map={mapInstance}
          />

          <AirportLayer
            map={mapInstance}
          />
        </div>
      )}

      {/* Theme CSS for MapLibre native controls */}
      <OperationsMapThemeStyles />

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-[9px] uppercase tracking-wider text-slate-500 shadow-xl backdrop-blur-xl dark:text-slate-400">
        <span className="text-cyan-300">
          ●
        </span>{" "}
        Aircraft

        <span className="ml-3 text-amber-300">
          ●
        </span>{" "}
        Alerts
      </div>
    </div>
  );
}

/**
 * Keep MapLibre native controls synchronized
 * with the application's light/dark theme.
 */
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