"use client";

import { create } from "zustand";
import type { RealtimeAlert } from "@/services/realtime";

type RealtimeAlertState = {
  alerts: RealtimeAlert[];
  add: (alert: RealtimeAlert) => void;
  clear: () => void;
};

export const useRealtimeAlertStore = create<RealtimeAlertState>((set) => ({
  alerts: [],
  add: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts.filter((item) => item.id !== alert.id)].slice(0, 20),
    })),
  clear: () => set({ alerts: [] }),
}));
