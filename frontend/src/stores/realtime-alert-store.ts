"use client";

import { create } from "zustand";
import type { RealtimeAlert } from "@/services/realtime";

type RealtimeAlertState = {
  alerts: RealtimeAlert[];
  unreadIds: string[];
  add: (alert: RealtimeAlert) => void;
  replace: (alerts: RealtimeAlert[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
};

export const useRealtimeAlertStore = create<RealtimeAlertState>((set) => ({
  alerts: [],
  unreadIds: [],
  add: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts.filter((item) => item.id !== alert.id)].slice(0, 20),
      unreadIds: [alert.id, ...state.unreadIds.filter((id) => id !== alert.id)].slice(0, 20),
    })),
  replace: (alerts) =>
    set((state) => {
      const nextAlerts = alerts
        .filter((alert, index, items) => items.findIndex((item) => item.id === alert.id) === index)
        .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
        .slice(0, 20);

      return {
        alerts: nextAlerts,
        unreadIds: state.unreadIds.filter((id) => nextAlerts.some((alert) => alert.id === id)),
      };
    }),
  markRead: (id) => set((state) => ({ unreadIds: state.unreadIds.filter((item) => item !== id) })),
  markAllRead: () => set({ unreadIds: [] }),
  clear: () => set({ alerts: [], unreadIds: [] }),
}));
