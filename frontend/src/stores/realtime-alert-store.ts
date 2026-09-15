"use client";

import { create } from "zustand";
import type { RealtimeAlert } from "@/services/realtime";

type RealtimeAlertState = {
  alerts: RealtimeAlert[];
  add: (alert: RealtimeAlert) => void;
  replace: (alerts: RealtimeAlert[]) => void;
  clear: () => void;
};

export const useRealtimeAlertStore = create<RealtimeAlertState>((set) => ({
  alerts: [],
  add: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts.filter((item) => item.id !== alert.id)].slice(0, 20),
    })),
  replace: (alerts) =>
    set(() => ({
      alerts: alerts
        .filter((alert, index, items) => items.findIndex((item) => item.id === alert.id) === index)
        .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
        .slice(0, 20),
    })),
  clear: () => set({ alerts: [] }),
}));
