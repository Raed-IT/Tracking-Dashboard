"use client";

import { create } from "zustand";

type Notice = {
  id: number;
  tone: "success" | "error";
  message: string;
};

type NoticeState = {
  notices: Notice[];
  show: (tone: Notice["tone"], message: string) => void;
  dismiss: (id: number) => void;
};

export const useNoticeStore = create<NoticeState>((set) => ({
  notices: [],
  show: (tone, message) => {
    const id = Date.now() + Math.random();
    set((state) => ({ notices: [...state.notices, { id, tone, message }] }));
    window.setTimeout(() => {
      set((state) => ({ notices: state.notices.filter((notice) => notice.id !== id) }));
    }, 4500);
  },
  dismiss: (id) =>
    set((state) => ({ notices: state.notices.filter((notice) => notice.id !== id) })),
}));
