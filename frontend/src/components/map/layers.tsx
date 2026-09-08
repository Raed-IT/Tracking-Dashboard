"use client";

import type {
  GeoJSONSource,
  Map as MlMap,
  MapLayerMouseEvent,
} from "maplibre-gl";
import { useEffect } from "react";
import { useTrackingStore } from "@/stores/tracking-store";

type LayerProps = {
  map: React.RefObject<MlMap | null>;
};

function emptyCollection(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

export function AircraftLayer({ map }: LayerProps) {
  const tracks = useTrackingStore((s) => s.tracks);
  const select = useTrackingStore((s) => s.select);

  useEffect(() => {
    const m = map.current;
    if (!m || !m.isStyleLoaded()) return;

    const data: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [...tracks.values()]
        .filter((t) => t.type === "aircraft")
        .map((t) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [t.longitude, t.latitude],
          },
          properties: {
            id: t.id,
            callsign: t.callsign,
            heading: t.heading,
          },
        })),
    };

    const source = m.getSource("aircraft") as GeoJSONSource | undefined;

    if (source) {
      source.setData(data);
      return;
    }

    m.addSource("aircraft", { type: "geojson", data });

    m.addLayer({
      id: "aircraft",
      type: "circle",
      source: "aircraft",
      paint: {
        "circle-radius": 6,
        "circle-color": "#22d3ee",
        "circle-stroke-color": "#020617",
        "circle-stroke-width": 2,
      },
    });

    const handleClick = (e: MapLayerMouseEvent) => {
      const id = e.features?.[0]?.properties?.id as string | undefined;
      if (id) select(id);
    };

    m.on("click", "aircraft", handleClick);

    return () => {
      m.off("click", "aircraft", handleClick);
    };
  }, [tracks, map, select]);

  return null;
}

export function AlertLayer({ map }: LayerProps) {
  useEffect(() => {
    const m = map.current;
    if (!m || !m.isStyleLoaded()) return;

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
          "circle-color": "#fbbf24",
          "circle-stroke-color": "#451a03",
          "circle-stroke-width": 2,
        },
      });
    }
  }, [map]);

  return null;
}

export function RouteLayer({ map }: LayerProps) {
  useEffect(() => {
    const m = map.current;
    if (!m || !m.isStyleLoaded()) return;

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
          "line-color": "#a78bfa",
          "line-width": 2,
          "line-opacity": 0.7,
        },
      });
    }
  }, [map]);

  return null;
}

export function AirportLayer({ map }: LayerProps) {
  useEffect(() => {
    const m = map.current;
    if (!m || !m.isStyleLoaded()) return;

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
          "circle-color": "#34d399",
          "circle-stroke-color": "#022c22",
          "circle-stroke-width": 2,
        },
      });
    }
  }, [map]);

  return null;
}

// Keep these exports so existing imports do not break.
export const DroneLayer = () => null;
export const VehicleLayer = () => null;
export const SensorLayer = () => null;
export const CameraLayer = () => null;
export const GeofenceLayer = () => null;
