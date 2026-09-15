"use client";

import { create } from "zustand";

import type { RealtimeStatus } from "@/services/realtime";

type RealtimeState = {
  status: RealtimeStatus;
  setStatus: (status: RealtimeStatus) => void;
};

export const useRealtimeStore = create<RealtimeState>((set) => ({
  status: "connecting",
  setStatus: (status) => set({ status }),
}));
