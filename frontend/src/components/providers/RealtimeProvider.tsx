"use client";

import { useEffect, type ReactNode } from "react";

import { connectTracking } from "@/services/realtime";
import { useRealtimeStore } from "@/stores/realtime-store";

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const setStatus = useRealtimeStore((state) => state.setStatus);

  useEffect(() => {
    const disconnect = connectTracking({ onStatus: setStatus });

    return disconnect;
  }, [setStatus]);

  return <>{children}</>;
}
