"use client";

import type {
  GeoJSONSource,
  Map as MlMap,
  MapLayerMouseEvent,
} from "maplibre-gl";

import { useEffect, useRef } from "react";

import { useTrackingStore } from "@/stores/tracking-store";

type LayerProps = {
  map: MlMap;
};

const MAX_TRAIL_POINTS = 50;

/**
 * Store aircraft trail positions in browser memory.
 *
 * key   = track ID
 * value = [longitude, latitude][]
 */
const aircraftTrails = new Map<
  string,
  [number, number][]
>();

/**
 * Last known position for every aircraft.
 */
const previousPositions = new Map<
  string,
  [number, number]
>();

/**
 * Empty GeoJSON collection.
 */
function emptyCollection(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

/**
 * Escape values before inserting them into popup HTML.
 */
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format numbers nicely.
 */
function formatNumber(
  value: unknown,
  decimals = 0,
): string {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "N/A";
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

/**
 * Create airplane SVG icon.
 */
function createAircraftIcon(): HTMLImageElement {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
    >
      <path
        d="
          M32 2
          C29.5 2 28 5 27.5 9
          L25.5 25
          L7 34
          C5.5 35 5.5 37.5 7 39
          L25 36.5
          L27 56
          L32 62
          L37 56
          L39 36.5
          L57 39
          C58.5 37.5 58.5 35 57 34
          L38.5 25
          L36.5 9
          C36 5 34.5 2 32 2
          Z
        "
        fill="#22d3ee"
        stroke="#020617"
        stroke-width="2"
      />
    </svg>
  `;

  const image = new Image();

  image.src =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(svg);

  return image;
}

/**
 * Add the airplane image to MapLibre.
 */
function ensureAircraftIcon(
  map: MlMap,
  callback: () => void,
): void {
  if (map.hasImage("aircraft-icon")) {
    callback();
    return;
  }

  const image = createAircraftIcon();

  image.onload = () => {
    if (!map.hasImage("aircraft-icon")) {
      map.addImage("aircraft-icon", image, {
        pixelRatio: 2,
      });
    }

    callback();
  };

  image.onerror = () => {
    console.error(
      "Failed to load aircraft icon.",
    );
  };
}

/**
 * Create hover popup.
 *
 * MapLibre is dynamically imported here so this file does not
 * execute MapLibre runtime code during Next.js module evaluation.
 */
async function createHoverPopup(
  coordinates: [number, number],
  properties: Record<string, unknown>,
) {
  const { default: maplibregl } =
    await import("maplibre-gl");

  const callsign =
    properties.callsign ||
    "Unknown aircraft";

  const aircraftType =
    properties.classification ||
    "Aircraft";

  const altitude = formatNumber(
    properties.altitude,
    0,
  );

  const speed = formatNumber(
    properties.speed,
    0,
  );

  return new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    offset: 18,
    maxWidth: "240px",
    className: "aircraft-hover-popup",
  })
    .setLngLat(coordinates)
    .setHTML(`
      <div style="
        min-width:180px;
        padding:4px;
        font-family:Inter,system-ui,sans-serif;
      ">
        <div style="
          display:flex;
          align-items:center;
          gap:8px;
          margin-bottom:7px;
        ">
          <span style="
            font-size:22px;
          ">✈</span>

          <div>
            <div style="
              font-size:14px;
              font-weight:700;
              color:#0f172a;
            ">
              ${escapeHtml(callsign)}
            </div>

            <div style="
              font-size:10px;
              color:#64748b;
            ">
              ${escapeHtml(aircraftType)}
            </div>
          </div>
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:5px;
          font-size:11px;
        ">
          <div>
            <span style="color:#64748b;">
              Altitude
            </span>
            <br />
            <strong>
              ${altitude} ft
            </strong>
          </div>

          <div>
            <span style="color:#64748b;">
              Speed
            </span>
            <br />
            <strong>
              ${speed} kt
            </strong>
          </div>
        </div>
      </div>
    `);
}

/**
 * Create detailed aircraft popup.
 */
async function createAircraftPopup(
  coordinates: [number, number],
  properties: Record<string, unknown>,
) {
  const { default: maplibregl } =
    await import("maplibre-gl");

  const callsign =
    properties.callsign ||
    "Unknown";

  const registration =
    properties.registration ||
    "N/A";

  const aircraftType =
    properties.classification ||
    properties.aircraftType ||
    "N/A";

  const altitude = formatNumber(
    properties.altitude,
    0,
  );

  const speed = formatNumber(
    properties.speed,
    0,
  );

  const heading = formatNumber(
    properties.heading,
    0,
  );

  const verticalRate = formatNumber(
    properties.verticalRate,
    0,
  );

  const latitude = formatNumber(
    properties.latitude,
    5,
  );

  const longitude = formatNumber(
    properties.longitude,
    5,
  );

  const trackId =
    properties.id ||
    "N/A";

  const fr24Id =
    properties.fr24Id ||
    properties.sourceTrackId ||
    "N/A";

  return new maplibregl.Popup({
    closeButton: true,
    closeOnClick: true,
    offset: 24,
    maxWidth: "340px",
    className: "aircraft-detail-popup",
  })
    .setLngLat(coordinates)
    .setHTML(`
      <div style="
        width:290px;
        padding:4px;
        font-family:Inter,system-ui,sans-serif;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:12px;
          padding-bottom:12px;
          margin-bottom:12px;
          border-bottom:1px solid #e2e8f0;
        ">

          <div style="
            width:42px;
            height:42px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:10px;
            background:#cffafe;
            color:#0891b2;
            font-size:25px;
          ">
            ✈
          </div>

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
              color:#0f172a;
            ">
              ${escapeHtml(callsign)}
            </div>

            <div style="
              margin-top:2px;
              font-size:11px;
              color:#64748b;
            ">
              ${escapeHtml(aircraftType)}
            </div>
          </div>

        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
        ">

          <div>
            <div style="
              font-size:10px;
              color:#64748b;
            ">
              Registration
            </div>

            <div style="
              font-size:13px;
              font-weight:700;
              color:#0f172a;
            ">
              ${escapeHtml(registration)}
            </div>
          </div>

          <div>
            <div style="
              font-size:10px;
              color:#64748b;
            ">
              Aircraft Type
            </div>

            <div style="
              font-size:13px;
              font-weight:700;
              color:#0f172a;
            ">
              ${escapeHtml(aircraftType)}
            </div>
          </div>

          <div>
            <div style="
              font-size:10px;
              color:#64748b;
            ">
              Altitude
            </div>

            <div style="
              font-size:13px;
              font-weight:700;
              color:#0f172a;
            ">
              ${altitude} ft
            </div>
          </div>

          <div>
            <div style="
              font-size:10px;
              color:#64748b;
            ">
              Speed
            </div>

            <div style="
              font-size:13px;
              font-weight:700;
              color:#0f172a;
            ">
              ${speed} kt
            </div>
          </div>

          <div>
            <div style="
              font-size:10px;
              color:#64748b;
            ">
              Heading
            </div>

            <div style="
              font-size:13px;
              font-weight:700;
              color:#0f172a;
            ">
              ${heading}°
            </div>
          </div>

          <div>
            <div style="
              font-size:10px;
              color:#64748b;
            ">
              Vertical Rate
            </div>

            <div style="
              font-size:13px;
              font-weight:700;
              color:#0f172a;
            ">
              ${verticalRate}
            </div>
          </div>

        </div>

        <div style="
          margin-top:12px;
          padding-top:10px;
          border-top:1px solid #e2e8f0;
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            gap:12px;
            font-size:10px;
            color:#64748b;
          ">
            <span>Position</span>

            <span>
              ${latitude}, ${longitude}
            </span>
          </div>

          <div style="
            display:flex;
            justify-content:space-between;
            gap:12px;
            margin-top:6px;
            font-size:10px;
            color:#64748b;
          ">
            <span>Track ID</span>

            <span>
              ${escapeHtml(trackId)}
            </span>
          </div>

          <div style="
            display:flex;
            justify-content:space-between;
            gap:12px;
            margin-top:6px;
            font-size:10px;
            color:#64748b;
          ">
            <span>FR24 ID</span>

            <span>
              ${escapeHtml(fr24Id)}
            </span>
          </div>

        </div>

      </div>
    `);
}

/**
 * AIRCRAFT
 */
export function AircraftLayer({
  map,
}: LayerProps) {
  const tracks =
    useTrackingStore(
      (state) => state.tracks,
    );

  const select =
    useTrackingStore(
      (state) => state.select,
    );

  const hoverPopup =
    useRef<maplibregl.Popup | null>(null);

  /**
   * Create/update aircraft sources and layers.
   */
  useEffect(() => {
    const m = map;

    if (!m || !m.isStyleLoaded()) {
      return;
    }

    /**
     * Only aircraft tracks.
     */
    const aircraft = [
      ...tracks.values(),
    ].filter(
      (track) =>
        track.type === "aircraft",
    );

    /**
     * Update trails.
     */
    for (const track of aircraft) {
      const id = String(track.id);

      const longitude =
        Number(track.longitude);

      const latitude =
        Number(track.latitude);

      if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude)
      ) {
        continue;
      }

      const position: [
        number,
        number,
      ] = [
        longitude,
        latitude,
      ];

      const previous =
        previousPositions.get(id);

      if (
        !previous ||
        previous[0] !== position[0] ||
        previous[1] !== position[1]
      ) {
        const trail =
          aircraftTrails.get(id) ??
          [];

        trail.push(position);

        while (
          trail.length >
          MAX_TRAIL_POINTS
        ) {
          trail.shift();
        }

        aircraftTrails.set(
          id,
          trail,
        );

        previousPositions.set(
          id,
          position,
        );
      }
    }

    /**
     * Remove stale trails.
     */
    const activeIds =
      new Set(
        aircraft.map((track) =>
          String(track.id),
        ),
      );

    for (
      const id of aircraftTrails.keys()
    ) {
      if (!activeIds.has(id)) {
        aircraftTrails.delete(id);
        previousPositions.delete(id);
      }
    }

    /**
     * Aircraft GeoJSON.
     */
    const aircraftData:
      GeoJSON.FeatureCollection = {
      type: "FeatureCollection",

      features: aircraft
        .map((track) => {
          const longitude =
            Number(track.longitude);

          const latitude =
            Number(track.latitude);

          if (
            !Number.isFinite(
              longitude,
            ) ||
            !Number.isFinite(
              latitude,
            )
          ) {
            return null;
          }

          return {
            type: "Feature" as const,

            geometry: {
              type: "Point" as const,

              coordinates: [
                longitude,
                latitude,
              ],
            },

            properties: {
              id: String(track.id),

              callsign:
                track.callsign ??
                "",

              registration:
                track.registration ??
                "",

              classification:
                track.classification ??
                "",

              altitude:
                Number(
                  track.altitude ??
                    0,
                ),

              speed:
                Number(
                  track.speed ??
                    0,
                ),

              heading:
                Number(
                  track.heading ??
                    0,
                ),

              verticalRate:
                Number(
                  track.vertical_rate ??
                    0,
                ),

              latitude,

              longitude,

              /**
               * These fields are intentionally left
               * empty because your Track type does not
               * currently define external_identifiers.
               */
              fr24Id: "",

              sourceTrackId: "",
            },
          };
        })
        .filter(
          (
            feature,
          ): feature is GeoJSON.Feature<GeoJSON.Point> =>
            feature !== null,
        ),
    };

    /**
     * Aircraft trail GeoJSON.
     */
    const trailData:
      GeoJSON.FeatureCollection = {
      type: "FeatureCollection",

      features: aircraft
        .map((track) => {
          const id = String(track.id);

          const trail =
            aircraftTrails.get(id) ??
            [];

          if (trail.length < 2) {
            return null;
          }

          return {
            type: "Feature" as const,

            geometry: {
              type: "LineString" as const,

              coordinates: trail,
            },

            properties: {
              id,
            },
          };
        })
        .filter(
          (
            feature,
          ): feature is GeoJSON.Feature<GeoJSON.LineString> =>
            feature !== null,
        ),
    };

    /**
     * Aircraft source.
     */
    const aircraftSource =
      m.getSource(
        "aircraft",
      ) as
        | GeoJSONSource
        | undefined;

    if (aircraftSource) {
      aircraftSource.setData(
        aircraftData,
      );
    } else {
      m.addSource("aircraft", {
        type: "geojson",
        data: aircraftData,
      });
    }

    /**
     * Trail source.
     */
    const trailSource =
      m.getSource(
        "aircraft-trails",
      ) as
        | GeoJSONSource
        | undefined;

    if (trailSource) {
      trailSource.setData(
        trailData,
      );
    } else {
      m.addSource(
        "aircraft-trails",
        {
          type: "geojson",
          data: trailData,
        },
      );
    }

    /**
     * Trail layer.
     */
    if (
      !m.getLayer(
        "aircraft-trails",
      )
    ) {
      m.addLayer({
        id: "aircraft-trails",

        type: "line",

        source:
          "aircraft-trails",

        layout: {
          "line-cap": "round",

          "line-join": "round",
        },

        paint: {
          "line-color":
            "#22d3ee",

          "line-width": 2,

          "line-opacity": 0.65,
        },
      });
    }

    /**
     * Aircraft icon.
     */
    ensureAircraftIcon(
      m,
      () => {
        if (
          !m.getLayer(
            "aircraft",
          )
        ) {
          m.addLayer({
            id: "aircraft",

            type: "symbol",

            source: "aircraft",

            layout: {
              "icon-image":
                "aircraft-icon",

              "icon-size": 0.55,

              "icon-allow-overlap":
                true,

              "icon-ignore-placement":
                true,

              "icon-rotate": [
                "coalesce",
                ["get", "heading"],
                0,
              ],

              "icon-rotation-alignment":
                "map",

              "icon-pitch-alignment":
                "map",
            },
          });
        }
      },
    );
  }, [map, tracks]);

  /**
   * Aircraft mouse/click events.
   */
  useEffect(() => {
    const m = map;

    if (!m || !m.isStyleLoaded()) {
      return;
    }

    if (!m.getLayer("aircraft")) {
      return;
    }

    /**
     * CLICK.
     */
    const handleClick = (
      event: MapLayerMouseEvent,
    ) => {
      const feature =
        event.features?.[0];

      if (!feature) {
        return;
      }

      const properties =
        feature.properties ?? {};

      const id =
        properties.id;

      if (id !== undefined) {
        select(String(id));
      }

      if (
        feature.geometry.type !==
        "Point"
      ) {
        return;
      }

      const coordinates =
        feature.geometry.coordinates
          .slice() as [
          number,
          number,
        ];

      hoverPopup.current?.remove();

      hoverPopup.current =
        null;

      void createAircraftPopup(
        coordinates,
        properties,
      ).then((popup) => {
        popup.addTo(m);
      });
    };

    /**
     * MOUSE ENTER.
     */
    const handleMouseEnter = (
      event: MapLayerMouseEvent,
    ) => {
      m.getCanvas().style.cursor =
        "pointer";

      const feature =
        event.features?.[0];

      if (!feature) {
        return;
      }

      if (
        feature.geometry.type !==
        "Point"
      ) {
        return;
      }

      const properties =
        feature.properties ?? {};

      const coordinates =
        feature.geometry.coordinates
          .slice() as [
          number,
          number,
        ];

      hoverPopup.current?.remove();

      void createHoverPopup(
        coordinates,
        properties,
      ).then((popup) => {
        hoverPopup.current =
          popup;

        popup.addTo(m);
      });
    };

    /**
     * MOUSE MOVE.
     */
    const handleMouseMove = (
      event: MapLayerMouseEvent,
    ) => {
      const feature =
        event.features?.[0];

      if (!feature) {
        return;
      }

      if (
        feature.geometry.type !==
        "Point"
      ) {
        return;
      }

      const coordinates =
        feature.geometry.coordinates
          .slice() as [
          number,
          number,
        ];

      hoverPopup.current?.setLngLat(
        coordinates,
      );
    };

    /**
     * MOUSE LEAVE.
     */
    const handleMouseLeave = () => {
      m.getCanvas().style.cursor =
        "";

      hoverPopup.current?.remove();

      hoverPopup.current =
        null;
    };

    m.on(
      "click",
      "aircraft",
      handleClick,
    );

    m.on(
      "mouseenter",
      "aircraft",
      handleMouseEnter,
    );

    m.on(
      "mousemove",
      "aircraft",
      handleMouseMove,
    );

    m.on(
      "mouseleave",
      "aircraft",
      handleMouseLeave,
    );

    return () => {
      m.off(
        "click",
        "aircraft",
        handleClick,
      );

      m.off(
        "mouseenter",
        "aircraft",
        handleMouseEnter,
      );

      m.off(
        "mousemove",
        "aircraft",
        handleMouseMove,
      );

      m.off(
        "mouseleave",
        "aircraft",
        handleMouseLeave,
      );

      m.getCanvas().style.cursor =
        "";

      hoverPopup.current?.remove();

      hoverPopup.current =
        null;
    };
  }, [map, select]);

  return null;
}

/**
 * ALERTS
 */
export function AlertLayer({
  map,
}: LayerProps) {
  useEffect(() => {
    const m = map;

    if (!m || !m.isStyleLoaded()) {
      return;
    }

    if (!m.getSource("alerts")) {
      m.addSource("alerts", {
        type: "geojson",
        data: emptyCollection(),
      });
    }

    if (!m.getLayer("alerts")) {
      m.addLayer({
        id: "alerts",

        type: "circle",

        source: "alerts",

        paint: {
          "circle-radius": 7,

          "circle-color":
            "#fbbf24",

          "circle-stroke-color":
            "#451a03",

          "circle-stroke-width": 2,
        },
      });
    }

    return () => {
      /**
       * We intentionally do not remove the source/layer
       * here because style changes and map lifecycle are
       * managed by OperationsMap.
       */
    };
  }, [map]);

  return null;
}

/**
 * ROUTES
 */
export function RouteLayer({
  map,
}: LayerProps) {
  useEffect(() => {
    const m = map;

    if (!m || !m.isStyleLoaded()) {
      return;
    }

    if (!m.getSource("routes")) {
      m.addSource("routes", {
        type: "geojson",
        data: emptyCollection(),
      });
    }

    if (!m.getLayer("routes")) {
      m.addLayer({
        id: "routes",

        type: "line",

        source: "routes",

        layout: {
          "line-cap": "round",

          "line-join": "round",
        },

        paint: {
          "line-color":
            "#a78bfa",

          "line-width": 2,

          "line-opacity": 0.7,
        },
      });
    }
  }, [map]);

  return null;
}

/**
 * AIRPORTS
 */
export function AirportLayer({
  map,
}: LayerProps) {
  useEffect(() => {
    const m = map;

    if (!m || !m.isStyleLoaded()) {
      return;
    }

    if (!m.getSource("airports")) {
      m.addSource("airports", {
        type: "geojson",
        data: emptyCollection(),
      });
    }

    if (!m.getLayer("airports")) {
      m.addLayer({
        id: "airports",

        type: "circle",

        source: "airports",

        paint: {
          "circle-radius": 5,

          "circle-color":
            "#34d399",

          "circle-stroke-color":
            "#022c22",

          "circle-stroke-width": 2,
        },
      });
    }
  }, [map]);

  return null;
}

/**
 * Placeholder exports.
 *
 * Keep these if other parts of your application currently import them.
 */
export const DroneLayer = () => null;

export const VehicleLayer = () => null;

export const SensorLayer = () => null;

export const CameraLayer = () => null;