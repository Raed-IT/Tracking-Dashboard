"use client";

import { useEffect, type ReactNode } from "react";

import { connectTracking, playAlertSound } from "@/services/realtime";
import { useRealtimeStore } from "@/stores/realtime-store";
import { useRealtimeAlertStore } from "@/stores/realtime-alert-store";
import { useNoticeStore } from "@/stores/notice-store";
import { useAppPreferences } from "@/components/providers/AppPreferences";

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const setStatus = useRealtimeStore((state) => state.setStatus);
  const addAlert = useRealtimeAlertStore((state) => state.add);
  const showNotice = useNoticeStore((state) => state.show);
  const alertVolume = useAppPreferences().alertVolume;

  useEffect(() => {
    const disconnect = connectTracking({
      onStatus: setStatus,
      onAlert: ({ alert }) => {
        addAlert(alert);
        playAlertSound(alertVolume);
        showNotice("error", alert.title);
      },
    });

    return disconnect;
  }, [addAlert, alertVolume, setStatus, showNotice]);

  return <>{children}</>;
}
