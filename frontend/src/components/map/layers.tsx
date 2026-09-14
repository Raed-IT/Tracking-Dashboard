"use client";

import maplibregl, {
  type GeoJSONSource,
  type Map as MlMap,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import { useEffect, useRef } from "react";

import { useTrackingStore } from "@/stores/tracking-store";

type LayerProps = {
  map: React.RefObject<MlMap | null>;
};

const MAX_TRAIL_POINTS = 50;

/*
 * Store aircraft trail positions in browser memory.
 *
 * key   = track ID
 * value = [longitude, latitude][]
 */
const aircraftTrails = new Map<
  string,
  [number, number][]
>();

/*
 * Last known position for every aircraft.
 */
const previousPositions = new Map<
  string,
  [number, number]
>();

function emptyCollection(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

/*
 * Escape values before putting them into popup HTML.
 */
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
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

/*
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
          C5.5 35
          5.5 37.5 7 39
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

/*
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
      map.addImage(
        "aircraft-icon",
        image,
        {
          pixelRatio: 2,
        },
      );
    }

    callback();
  };
}

/*
 * Build small hover tooltip.
 */
function createHoverPopup(
  map: MlMap,
  coordinates: [number, number],
  properties: Record<string, unknown>,
): maplibregl.Popup {
  const callsign =
    properties.callsign ||
    "Unknown aircraft";

  const aircraftType =
    properties.classification ||
    "Aircraft";

  const altitude =
    formatNumber(
      properties.altitude,
      0,
    );

  const speed =
    formatNumber(
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

/*
 * Build detailed click popup.
 */
function createAircraftPopup(
  map: MlMap,
  coordinates: [number, number],
  properties: Record<string, unknown>,
): maplibregl.Popup {
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

  const altitude =
    formatNumber(
      properties.altitude,
      0,
    );

  const speed =
    formatNumber(
      properties.speed,
      0,
    );

  const heading =
    formatNumber(
      properties.heading,
      0,
    );

  const verticalRate =
    formatNumber(
      properties.verticalRate,
      0,
    );

  const latitude =
    formatNumber(
      properties.latitude,
      5,
    );

  const longitude =
    formatNumber(
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

export function AircraftLayer({
  map,
}: LayerProps) {
  const tracks =
    useTrackingStore((s) => s.tracks);

  const select =
    useTrackingStore((s) => s.select);

  const hoverPopup =
    useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    const m = map.current;

    if (!m || !m.isStyleLoaded()) {
      return;
    }

    /*
     * Get aircraft.
     */
    const aircraft = [
      ...tracks.values(),
    ].filter(
      (track) =>
        track.type === "aircraft",
    );

    /*
     * Update aircraft trail history.
     */
    for (const track of aircraft) {
      const id = String(track.id);

      const position: [
        number,
        number,
      ] = [
        Number(track.longitude),
        Number(track.latitude),
      ];

      if (
        !Number.isFinite(position[0]) ||
        !Number.isFinite(position[1])
      ) {
        continue;
      }

      const previous =
        previousPositions.get(id);

      /*
       * Only add a point when aircraft
       * position has changed.
       */
      if (
        !previous ||
        previous[0] !== position[0] ||
        previous[1] !== position[1]
      ) {
        const trail =
          aircraftTrails.get(id) ?? [];

        trail.push(position);

        /*
         * Keep latest 50 points.
         */
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

    /*
     * Remove trails for aircraft
     * that are no longer active.
     */
    const activeIds = new Set(
      aircraft.map((t) =>
        String(t.id),
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

    /*
     * Aircraft GeoJSON.
     */
    const aircraftData:
      GeoJSON.FeatureCollection = {
      type: "FeatureCollection",

      features: aircraft.map(
        (track) => ({
          type: "Feature",

          geometry: {
            type: "Point",

            coordinates: [
              Number(track.longitude),
              Number(track.latitude),
            ],
          },

          properties: {
            id: String(track.id),

            callsign:
              track.callsign ?? "",

            registration:
              track.registration ?? "",

            classification:
              track.classification ?? "",

            altitude:
              Number(
                track.altitude ?? 0,
              ),

            speed:
              Number(
                track.speed ?? 0,
              ),

            heading:
              Number(
                track.heading ?? 0,
              ),

            verticalRate:
              Number(
                track.vertical_rate ?? 0,
              ),

            latitude:
              Number(track.latitude),

            longitude:
              Number(track.longitude),

            fr24Id:
              track.external_identifiers
                ?.fr24_id ?? "",

            sourceTrackId:
              track.external_identifiers
                ?.fr24_id ?? "",
          },
        }),
      ),
    };

    /*
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

    /*
     * Create/update aircraft source.
     */
    const aircraftSource =
      m.getSource("aircraft") as
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

    /*
     * Create/update trail source.
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

    /*
     * Add trail layer.
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

        paint: {
          "line-color":
            "#22d3ee",

          "line-width": 2,

          "line-opacity": 0.65,
        },

        layout: {
          "line-cap":
            "round",

          "line-join":
            "round",
        },
      });
    }

    /*
     * Add airplane icon and layer.
     */
    ensureAircraftIcon(
      m,
      () => {
        if (
          !m.getLayer("aircraft")
        ) {
          m.addLayer({
            id: "aircraft",

            type: "symbol",

            source: "aircraft",

            layout: {
              "icon-image":
                "aircraft-icon",

              "icon-size":
                0.55,

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
  }, [tracks, map]);

  /*
   * Map event handlers.
   *
   * This effect is separate so we don't
   * register duplicate events every 10 seconds.
   */
  useEffect(() => {
    const m = map.current;

    if (
      !m ||
      !m.isStyleLoaded()
    ) {
      return;
    }

    /*
     * Wait until aircraft layer exists.
     */
    if (!m.getLayer("aircraft")) {
      return;
    }

    /*
     * CLICK
     */
    const handleClick = (
      e: MapLayerMouseEvent,
    ) => {
      const feature =
        e.features?.[0];

      if (!feature) {
        return;
      }

      const properties =
        feature.properties ?? {};

      const id =
        properties.id;

      if (id) {
        select(String(id));
      }

      const coordinates =
        (
          feature.geometry as GeoJSON.Point
        ).coordinates
          .slice() as [
          number,
          number,
        ];

      /*
       * Remove hover popup.
       */
      hoverPopup.current?.remove();

      hoverPopup.current =
        null;

      /*
       * Show detailed popup.
       */
      createAircraftPopup(
        m,
        coordinates,
        properties,
      ).addTo(m);
    };

    /*
     * MOUSE ENTER / HOVER
     */
    const handleMouseEnter = (
      e: MapLayerMouseEvent,
    ) => {
      m.getCanvas().style.cursor =
        "pointer";

      const feature =
        e.features?.[0];

      if (!feature) {
        return;
      }

      const properties =
        feature.properties ?? {};

      const coordinates =
        (
          feature.geometry as GeoJSON.Point
        ).coordinates
          .slice() as [
          number,
          number,
        ];

      /*
       * Remove previous tooltip.
       */
      hoverPopup.current?.remove();

      /*
       * Create new tooltip.
       */
      hoverPopup.current =
        createHoverPopup(
          m,
          coordinates,
          properties,
        );

      hoverPopup.current.addTo(m);
    };

    /*
     * Move tooltip with mouse.
     */
    const handleMouseMove = (
      e: MapLayerMouseEvent,
    ) => {
      const feature =
        e.features?.[0];

      if (!feature) {
        return;
      }

      const coordinates =
        (
          feature.geometry as GeoJSON.Point
        ).coordinates
          .slice() as [
          number,
          number,
        ];

      hoverPopup.current?.setLngLat(
        coordinates,
      );
    };

    /*
     * MOUSE LEAVE
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

      hoverPopup.current?.remove();

      hoverPopup.current =
        null;
    };
  }, [map, select, tracks]);

  return null;
}

export function AlertLayer({
  map,
}: LayerProps) {
  useEffect(() => {
    const m = map.current;

    if (
      !m ||
      !m.isStyleLoaded()
    ) {
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
  }, [map]);

  return null;
}

export function RouteLayer({
  map,
}: LayerProps) {
  useEffect(() => {
    const m = map.current;

    if (
      !m ||
      !m.isStyleLoaded()
    ) {
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

export function AirportLayer({
  map,
}: LayerProps) {
  useEffect(() => {
    const m = map.current;

    if (
      !m ||
      !m.isStyleLoaded()
    ) {
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

/*
 * Keep these exports so existing imports
 * do not break.
 */
export const DroneLayer = () => null;

export const VehicleLayer = () => null;

export const SensorLayer = () => null;

export const CameraLayer = () => null;

export const GeofenceLayer = () => null;