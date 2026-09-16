"use client";

import { useEffect, type ReactNode } from "react";

import { connectTracking, playAlertSound, unlockAlertSound } from "@/services/realtime";
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
    const unlock = () => {
      void unlockAlertSound().then((unlocked) => {
        if (unlocked) {
          window.removeEventListener("pointerdown", unlock);
          window.removeEventListener("keydown", unlock);
          window.removeEventListener("touchstart", unlock);
        }
      }).catch((error: unknown) => {
        console.warn("Alert sound could not be enabled:", error);
      });
    };

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

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
